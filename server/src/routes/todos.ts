import { Router, type Request, type Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';

import { authenticate } from '../middleware/authenticate.js';
import { getSupabase } from '../config/supabase.js';

const DESIGN_PLANNING_KEY = 'design_planning';
const VIRTUAL_DESIGN_PLANNING_ID = `virtual:${DESIGN_PLANNING_KEY}`;
const DESIGN_PLANNING_ROUTE = '/dashboard/onboarding/design-planning-brief';

interface ClientTodoRowDb {
  readonly id: string;
  readonly user_id: string;
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly status: string;
  readonly due_at: string | null;
  readonly sort_order: number;
  readonly source: string;
  readonly source_key: string | null;
  readonly action_route: string | null;
  readonly completed_at: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

interface ClientTodoJson {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly status: string;
  readonly dueAt: string | null;
  readonly source: string;
  readonly sourceKey: string | null;
  readonly actionRoute: string | null;
  readonly sortOrder: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly completedAt: string | null;
}

interface PostgrestErrorLike {
  readonly code?: string;
  readonly message?: string;
}

function isMissingRelationError(error: PostgrestErrorLike | null | undefined): boolean {
  if (!error) {
    return false;
  }
  if (error.code === 'PGRST205') {
    return true;
  }
  const m = error.message;
  return typeof m === 'string' && m.includes('Could not find') && m.includes('schema cache');
}

function handleValidationErrors(req: Request, res: Response): boolean {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: 'Please check the form and try again.' });
    return true;
  }
  return false;
}

function mapRow(row: ClientTodoRowDb): ClientTodoJson {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    status: row.status,
    dueAt: row.due_at,
    source: row.source,
    sourceKey: row.source_key,
    actionRoute: row.action_route,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
  };
}

function virtualDesignPlanningTodo(): ClientTodoJson {
  const now = new Date().toISOString();
  return {
    id: VIRTUAL_DESIGN_PLANNING_ID,
    title: 'Tell us what you want in the first design previews',
    description:
      'Answer a short questionnaire about your goals, who visits your site, and which pages matter most. That is how we shape the first clickable preview—not the live site yet.',
    category: 'planning',
    status: 'open',
    dueAt: null,
    source: 'system',
    sourceKey: DESIGN_PLANNING_KEY,
    actionRoute: DESIGN_PLANNING_ROUTE,
    sortOrder: -1,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  };
}

function sortOpenDbRows(a: ClientTodoRowDb, b: ClientTodoRowDb): number {
  if (a.sort_order !== b.sort_order) {
    return a.sort_order - b.sort_order;
  }
  const ad = a.due_at ? Date.parse(a.due_at) : Number.POSITIVE_INFINITY;
  const bd = b.due_at ? Date.parse(b.due_at) : Number.POSITIVE_INFINITY;
  if (ad !== bd) {
    return ad - bd;
  }
  return Date.parse(b.created_at) - Date.parse(a.created_at);
}

function sortDoneDbRows(a: ClientTodoRowDb, b: ClientTodoRowDb): number {
  const ac = a.completed_at ? Date.parse(a.completed_at) : 0;
  const bc = b.completed_at ? Date.parse(b.completed_at) : 0;
  return bc - ac;
}

async function userHasPlanningBrief(userId: string): Promise<boolean> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('mock_planning_briefs')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isMissingRelationError(error)) {
      console.warn(
        'mock_planning_briefs: table missing from PostgREST (run `server/src/db/schema.sql` in Supabase SQL Editor, then Dashboard → Settings → API → Reload schema if needed). Treating as no briefs.',
      );
      return false;
    }
    console.error('mock_planning_briefs lookup:', error);
    return false;
  }
  return data !== null;
}

async function loadDbTodos(userId: string): Promise<{
  readonly open: readonly ClientTodoRowDb[];
  readonly done: readonly ClientTodoRowDb[];
  readonly error: boolean;
}> {
  const supabase = getSupabase();
  const { data: rows, error } = await supabase
    .from('client_todos')
    .select(
      'id, user_id, title, description, category, status, due_at, sort_order, source, source_key, action_route, completed_at, created_at, updated_at',
    )
    .eq('user_id', userId)
    .in('status', ['open', 'done']);

  if (error || !rows) {
    if (error && isMissingRelationError(error)) {
      console.warn(
        'client_todos: table missing from PostgREST (run `server/src/db/schema.sql` in Supabase, then reload API schema if needed). Returning empty lists.',
      );
      return { open: [], done: [], error: false };
    }
    console.error('client_todos list:', error);
    return { open: [], done: [], error: true };
  }

  const typed = rows as ClientTodoRowDb[];
  const open = typed.filter((r) => r.status === 'open').sort(sortOpenDbRows);
  const done = typed.filter((r) => r.status === 'done').sort(sortDoneDbRows);
  return { open, done, error: false };
}

function mergeOpenWithVirtual(
  hasBrief: boolean,
  dbOpen: readonly ClientTodoRowDb[],
): readonly ClientTodoJson[] {
  const blocksVirtual = dbOpen.some((r) => r.source_key === DESIGN_PLANNING_KEY);
  const mapped = dbOpen.map(mapRow);
  if (hasBrief || blocksVirtual) {
    return mapped;
  }
  return [virtualDesignPlanningTodo(), ...mapped];
}

function countOpen(hasBrief: boolean, dbOpen: readonly ClientTodoRowDb[]): number {
  return mergeOpenWithVirtual(hasBrief, dbOpen).length;
}

export const clientTodosRouter = Router();

clientTodosRouter.get(
  '/todos/summary',
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }

    const hasBrief = await userHasPlanningBrief(userId);
    const { open, error } = await loadDbTodos(userId);
    if (error) {
      res.status(500).json({ error: 'Could not load tasks.' });
      return;
    }

    res.json({ openCount: countOpen(hasBrief, open) });
  },
);

clientTodosRouter.get(
  '/todos',
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }

    const hasBrief = await userHasPlanningBrief(userId);
    const { open, done, error } = await loadDbTodos(userId);
    if (error) {
      res.status(500).json({ error: 'Could not load tasks.' });
      return;
    }

    const openOut = mergeOpenWithVirtual(hasBrief, open);
    const completedOut = done.map(mapRow);

    res.json({ open: openOut, completed: completedOut });
  },
);

const clientPatchValidation = [
  param('id').trim().notEmpty(),
  body('status').isIn(['done', 'open']).withMessage('Status must be done or open.'),
];

clientTodosRouter.patch(
  '/todos/:id',
  authenticate,
  clientPatchValidation,
  async (req: Request, res: Response): Promise<void> => {
    if (handleValidationErrors(req, res)) {
      return;
    }

    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }

    const id = req.params['id'] as string;
    if (id.startsWith('virtual:')) {
      res.status(400).json({
        error:
          'This step clears itself when you finish Design planning from the link on your task list.',
      });
      return;
    }

    const status = (req.body as { status: string }).status as 'done' | 'open';
    const supabase = getSupabase();
    const completedAt = status === 'done' ? new Date().toISOString() : null;

    const { data: row, error } = await supabase
      .from('client_todos')
      .update({ status, completed_at: completedAt })
      .eq('id', id)
      .eq('user_id', userId)
      .in('status', ['open', 'done'])
      .select(
        'id, user_id, title, description, category, status, due_at, sort_order, source, source_key, action_route, completed_at, created_at, updated_at',
      )
      .maybeSingle();

    if (error) {
      console.error('client_todos patch:', error);
      res.status(500).json({ error: 'Could not update that task.' });
      return;
    }

    if (!row) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }

    res.json({ todo: mapRow(row as ClientTodoRowDb) });
  },
);

export const adminTodosRouter = Router();

const adminListValidation = [
  query('email').optional().trim().isEmail().withMessage('A valid email is required.'),
  query('userId').optional().trim().isUUID().withMessage('userId must be a UUID.'),
];

adminTodosRouter.get(
  '/todos',
  authenticate,
  adminListValidation,
  async (req: Request, res: Response): Promise<void> => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'You do not have access to this list.' });
      return;
    }

    if (handleValidationErrors(req, res)) {
      return;
    }

    const emailRaw = req.query['email'];
    const userIdRaw = req.query['userId'];
    const email = typeof emailRaw === 'string' ? emailRaw : '';
    const userIdParam = typeof userIdRaw === 'string' ? userIdRaw : '';

    if (!email && !userIdParam) {
      res.status(400).json({ error: 'Provide email or userId.' });
      return;
    }

    const supabase = getSupabase();
    let targetUserId = userIdParam;

    if (!targetUserId && email) {
      const { data: userRow, error: userErr } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (userErr || !userRow) {
        res.status(404).json({ error: 'No user found for that email.' });
        return;
      }
      targetUserId = userRow.id as string;
    }

    const { data: rows, error } = await supabase
      .from('client_todos')
      .select(
        'id, user_id, title, description, category, status, due_at, sort_order, source, source_key, action_route, completed_at, created_at, updated_at',
      )
      .eq('user_id', targetUserId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(500);

    if (error || !rows) {
      if (error && isMissingRelationError(error)) {
        console.warn(
          'admin client_todos: table missing from PostgREST (run `server/src/db/schema.sql` in Supabase). Returning empty list.',
        );
        res.json({ userId: targetUserId, todos: [] });
        return;
      }
      console.error('admin client_todos list:', error);
      res.status(500).json({ error: 'Could not load tasks.' });
      return;
    }

    res.json({
      userId: targetUserId,
      todos: (rows as ClientTodoRowDb[]).map(mapRow),
    });
  },
);

const adminPostValidation = [
  body('userId').trim().isUUID().withMessage('userId is required.'),
  body('title').trim().isLength({ min: 1, max: 500 }).withMessage('Title is required.'),
  body('description').optional().trim().isLength({ max: 20000 }),
  body('category')
    .optional()
    .trim()
    .isIn(['general', 'planning', 'content', 'access'])
    .withMessage('Invalid category.'),
  body('dueAt').optional({ checkFalsy: true }).trim().isISO8601().withMessage('dueAt must be ISO-8601.'),
  body('sortOrder').optional().isInt({ min: -100000, max: 100000 }),
];

adminTodosRouter.post(
  '/todos',
  authenticate,
  adminPostValidation,
  async (req: Request, res: Response): Promise<void> => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'You do not have access.' });
      return;
    }

    if (handleValidationErrors(req, res)) {
      return;
    }

    const body = req.body as {
      userId: string;
      title: string;
      description?: string;
      category?: string;
      dueAt?: string;
      sortOrder?: number;
    };

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('client_todos')
      .insert({
        user_id: body.userId,
        title: body.title,
        description: body.description ?? '',
        category: body.category ?? 'general',
        due_at: body.dueAt ?? null,
        sort_order: body.sortOrder ?? 0,
        source: 'staff',
        source_key: null,
        action_route: null,
        status: 'open',
      })
      .select(
        'id, user_id, title, description, category, status, due_at, sort_order, source, source_key, action_route, completed_at, created_at, updated_at',
      )
      .single();

    if (error || !data) {
      console.error('client_todos insert:', error);
      res.status(500).json({ error: 'Could not create that task.' });
      return;
    }

    res.status(201).json({ todo: mapRow(data as ClientTodoRowDb) });
  },
);

const adminPatchValidation = [
  param('id').trim().isUUID(),
  body('title').optional().trim().isLength({ min: 1, max: 500 }),
  body('description').optional().trim().isLength({ max: 20000 }),
  body('category').optional().trim().isIn(['general', 'planning', 'content', 'access']),
  body('dueAt').optional({ checkFalsy: true }).trim().isISO8601(),
  body('sortOrder').optional().isInt({ min: -100000, max: 100000 }),
  body('status').optional().trim().isIn(['open', 'done', 'cancelled']),
];

adminTodosRouter.patch(
  '/todos/:id',
  authenticate,
  adminPatchValidation,
  async (req: Request, res: Response): Promise<void> => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'You do not have access.' });
      return;
    }

    if (handleValidationErrors(req, res)) {
      return;
    }

    const id = req.params['id'] as string;
    const patch: Record<string, string | number | null> = {};

    const b = req.body as {
      title?: string;
      description?: string;
      category?: string;
      dueAt?: string | null;
      sortOrder?: number;
      status?: string;
    };

    if (b.title !== undefined) {
      patch['title'] = b.title;
    }
    if (b.description !== undefined) {
      patch['description'] = b.description;
    }
    if (b.category !== undefined) {
      patch['category'] = b.category;
    }
    if (b.dueAt !== undefined) {
      patch['due_at'] = b.dueAt === null || b.dueAt === '' ? null : b.dueAt;
    }
    if (b.sortOrder !== undefined) {
      patch['sort_order'] = b.sortOrder;
    }
    if (b.status !== undefined) {
      patch['status'] = b.status;
      if (b.status === 'done') {
        patch['completed_at'] = new Date().toISOString();
      }
      if (b.status === 'open') {
        patch['completed_at'] = null;
      }
    }

    if (Object.keys(patch).length === 0) {
      res.status(400).json({ error: 'Nothing to update.' });
      return;
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('client_todos')
      .update(patch)
      .eq('id', id)
      .select(
        'id, user_id, title, description, category, status, due_at, sort_order, source, source_key, action_route, completed_at, created_at, updated_at',
      )
      .maybeSingle();

    if (error) {
      console.error('admin client_todos patch:', error);
      res.status(500).json({ error: 'Could not update that task.' });
      return;
    }

    if (!data) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }

    res.json({ todo: mapRow(data as ClientTodoRowDb) });
  },
);

adminTodosRouter.delete(
  '/todos/:id',
  authenticate,
  param('id').trim().isUUID(),
  async (req: Request, res: Response): Promise<void> => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'You do not have access.' });
      return;
    }

    if (handleValidationErrors(req, res)) {
      return;
    }

    const id = req.params['id'] as string;
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('client_todos')
      .update({ status: 'cancelled', completed_at: null })
      .eq('id', id)
      .select('id')
      .maybeSingle();

    if (error) {
      console.error('admin client_todos delete:', error);
      res.status(500).json({ error: 'Could not remove that task.' });
      return;
    }

    if (!data) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }

    res.status(204).send();
  },
);
