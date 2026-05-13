import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';

export interface TodosWorkerEnv {
  readonly JWT_SECRET: string;
  readonly SUPABASE_URL: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string;
}

type JsonFn = (data: unknown, status?: number) => Response;

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

function getSupabase(env: TodosWorkerEnv): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function getAuthContext(
  request: Request,
  env: TodosWorkerEnv,
  json: JsonFn,
): Promise<{ userId: string; role: string } | Response> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return json({ error: 'Not authenticated.' }, 401);
  }
  const token = authHeader.slice(7);
  try {
    const key = new TextEncoder().encode(env.JWT_SECRET);
    const { payload } = await jwtVerify(token, key);
    const userId = payload['userId'];
    const role = payload['role'];
    if (typeof userId !== 'string' || typeof role !== 'string') {
      return json({ error: 'Invalid or expired token.' }, 401);
    }
    return { userId, role };
  } catch {
    return json({ error: 'Invalid or expired token.' }, 401);
  }
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

async function userHasPlanningBrief(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('mock_planning_briefs')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isMissingRelationError(error)) {
      console.warn(
        'mock_planning_briefs: table missing from PostgREST (run schema SQL in Supabase). Treating as no briefs.',
      );
      return false;
    }
    console.error('mock_planning_briefs lookup:', error);
    return false;
  }
  return data !== null;
}

async function loadDbTodos(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ readonly open: readonly ClientTodoRowDb[]; readonly done: readonly ClientTodoRowDb[]; readonly error: boolean }> {
  const { data: rows, error } = await supabase
    .from('client_todos')
    .select(
      'id, user_id, title, description, category, status, due_at, sort_order, source, source_key, action_route, completed_at, created_at, updated_at',
    )
    .eq('user_id', userId)
    .in('status', ['open', 'done']);

  if (error || !rows) {
    if (error && isMissingRelationError(error)) {
      console.warn('client_todos: table missing from PostgREST. Returning empty lists.');
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

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

export async function routeTodos(request: Request, env: TodosWorkerEnv, json: JsonFn): Promise<Response | null> {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/api/client/todos/summary' && request.method === 'GET') {
    const auth = await getAuthContext(request, env, json);
    if (auth instanceof Response) {
      return auth;
    }
    const supabase = getSupabase(env);
    const hasBrief = await userHasPlanningBrief(supabase, auth.userId);
    const { open, error } = await loadDbTodos(supabase, auth.userId);
    if (error) {
      return json({ error: 'Could not load tasks.' }, 500);
    }
    return json({ openCount: countOpen(hasBrief, open) });
  }

  if (path === '/api/client/todos' && request.method === 'GET') {
    const auth = await getAuthContext(request, env, json);
    if (auth instanceof Response) {
      return auth;
    }
    const supabase = getSupabase(env);
    const hasBrief = await userHasPlanningBrief(supabase, auth.userId);
    const { open, done, error } = await loadDbTodos(supabase, auth.userId);
    if (error) {
      return json({ error: 'Could not load tasks.' }, 500);
    }
    return json({
      open: mergeOpenWithVirtual(hasBrief, open),
      completed: done.map(mapRow),
    });
  }

  const patchClient = path.match(/^\/api\/client\/todos\/([^/]+)$/);
  if (patchClient && request.method === 'PATCH') {
    const auth = await getAuthContext(request, env, json);
    if (auth instanceof Response) {
      return auth;
    }
    const id = patchClient[1] ?? '';
    if (id.startsWith('virtual:')) {
      return json(
        {
          error:
            'This step clears itself when you finish Design planning from the link on your task list.',
        },
        400,
      );
    }
    let body: { status?: string };
    try {
      body = (await request.json()) as { status?: string };
    } catch {
      return json({ error: 'Invalid JSON body.' }, 400);
    }
    if (body.status !== 'done' && body.status !== 'open') {
      return json({ error: 'Please check the form and try again.' }, 400);
    }
    const status = body.status;
    const completedAt = status === 'done' ? new Date().toISOString() : null;
    const supabase = getSupabase(env);
    const { data: row, error } = await supabase
      .from('client_todos')
      .update({ status, completed_at: completedAt })
      .eq('id', id)
      .eq('user_id', auth.userId)
      .in('status', ['open', 'done'])
      .select(
        'id, user_id, title, description, category, status, due_at, sort_order, source, source_key, action_route, completed_at, created_at, updated_at',
      )
      .maybeSingle();

    if (error) {
      console.error('client_todos patch:', error);
      return json({ error: 'Could not update that task.' }, 500);
    }
    if (!row) {
      return json({ error: 'Task not found.' }, 404);
    }
    return json({ todo: mapRow(row as ClientTodoRowDb) });
  }

  if (path === '/api/admin/todos' && request.method === 'GET') {
    const auth = await getAuthContext(request, env, json);
    if (auth instanceof Response) {
      return auth;
    }
    if (auth.role !== 'admin') {
      return json({ error: 'You do not have access to this list.' }, 403);
    }
    const email = url.searchParams.get('email')?.trim() ?? '';
    const userIdParam = url.searchParams.get('userId')?.trim() ?? '';
    if (!email && !userIdParam) {
      return json({ error: 'Provide email or userId.' }, 400);
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: 'Please check the form and try again.' }, 400);
    }
    if (userIdParam && !isUuid(userIdParam)) {
      return json({ error: 'Please check the form and try again.' }, 400);
    }
    const supabase = getSupabase(env);
    let targetUserId = userIdParam;
    if (!targetUserId && email) {
      const { data: userRow, error: userErr } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      if (userErr || !userRow) {
        return json({ error: 'No user found for that email.' }, 404);
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
        console.warn('admin client_todos: table missing from PostgREST. Returning empty list.');
        return json({ userId: targetUserId, todos: [] });
      }
      console.error('admin client_todos list:', error);
      return json({ error: 'Could not load tasks.' }, 500);
    }
    return json({
      userId: targetUserId,
      todos: (rows as ClientTodoRowDb[]).map(mapRow),
    });
  }

  if (path === '/api/admin/todos' && request.method === 'POST') {
    const auth = await getAuthContext(request, env, json);
    if (auth instanceof Response) {
      return auth;
    }
    if (auth.role !== 'admin') {
      return json({ error: 'You do not have access.' }, 403);
    }
    let body: {
      userId?: string;
      title?: string;
      description?: string;
      category?: string;
      dueAt?: string;
      sortOrder?: number;
    };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return json({ error: 'Invalid JSON body.' }, 400);
    }
    const userId = typeof body.userId === 'string' ? body.userId.trim() : '';
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!isUuid(userId) || title.length < 1 || title.length > 500) {
      return json({ error: 'Please check the form and try again.' }, 400);
    }
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    if (description.length > 20000) {
      return json({ error: 'Please check the form and try again.' }, 400);
    }
    const cat = typeof body.category === 'string' ? body.category : 'general';
    if (!['general', 'planning', 'content', 'access'].includes(cat)) {
      return json({ error: 'Please check the form and try again.' }, 400);
    }
    const dueAt = typeof body.dueAt === 'string' && body.dueAt.trim().length > 0 ? body.dueAt.trim() : null;
    if (dueAt !== null && Number.isNaN(Date.parse(dueAt))) {
      return json({ error: 'Please check the form and try again.' }, 400);
    }
    const sortOrder = typeof body.sortOrder === 'number' ? body.sortOrder : 0;
    const supabase = getSupabase(env);
    const { data, error } = await supabase
      .from('client_todos')
      .insert({
        user_id: userId,
        title,
        description,
        category: cat,
        due_at: dueAt,
        sort_order: sortOrder,
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
      return json({ error: 'Could not create that task.' }, 500);
    }
    return json({ todo: mapRow(data as ClientTodoRowDb) }, 201);
  }

  const adminIdMatch = path.match(/^\/api\/admin\/todos\/([^/]+)$/);
  if (adminIdMatch && request.method === 'PATCH') {
    const auth = await getAuthContext(request, env, json);
    if (auth instanceof Response) {
      return auth;
    }
    if (auth.role !== 'admin') {
      return json({ error: 'You do not have access.' }, 403);
    }
    const id = adminIdMatch[1] ?? '';
    if (!isUuid(id)) {
      return json({ error: 'Please check the form and try again.' }, 400);
    }
    let body: {
      title?: string;
      description?: string;
      category?: string;
      dueAt?: string | null;
      sortOrder?: number;
      status?: string;
    };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return json({ error: 'Invalid JSON body.' }, 400);
    }
    const patch: Record<string, string | number | null> = {};
    if (body.title !== undefined) {
      const t = body.title.trim();
      if (t.length < 1 || t.length > 500) {
        return json({ error: 'Please check the form and try again.' }, 400);
      }
      patch['title'] = t;
    }
    if (body.description !== undefined) {
      const d = body.description.trim();
      if (d.length > 20000) {
        return json({ error: 'Please check the form and try again.' }, 400);
      }
      patch['description'] = d;
    }
    if (body.category !== undefined) {
      if (!['general', 'planning', 'content', 'access'].includes(body.category)) {
        return json({ error: 'Please check the form and try again.' }, 400);
      }
      patch['category'] = body.category;
    }
    if (body.dueAt !== undefined) {
      const d = body.dueAt === null || body.dueAt === '' ? null : body.dueAt;
      if (d !== null && Number.isNaN(Date.parse(d))) {
        return json({ error: 'Please check the form and try again.' }, 400);
      }
      patch['due_at'] = d;
    }
    if (body.sortOrder !== undefined) {
      patch['sort_order'] = body.sortOrder;
    }
    if (body.status !== undefined) {
      if (!['open', 'done', 'cancelled'].includes(body.status)) {
        return json({ error: 'Please check the form and try again.' }, 400);
      }
      patch['status'] = body.status;
      if (body.status === 'done') {
        patch['completed_at'] = new Date().toISOString();
      }
      if (body.status === 'open') {
        patch['completed_at'] = null;
      }
    }
    if (Object.keys(patch).length === 0) {
      return json({ error: 'Nothing to update.' }, 400);
    }
    const supabase = getSupabase(env);
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
      return json({ error: 'Could not update that task.' }, 500);
    }
    if (!data) {
      return json({ error: 'Task not found.' }, 404);
    }
    return json({ todo: mapRow(data as ClientTodoRowDb) });
  }

  if (adminIdMatch && request.method === 'DELETE') {
    const auth = await getAuthContext(request, env, json);
    if (auth instanceof Response) {
      return auth;
    }
    if (auth.role !== 'admin') {
      return json({ error: 'You do not have access.' }, 403);
    }
    const id = adminIdMatch[1] ?? '';
    if (!isUuid(id)) {
      return json({ error: 'Please check the form and try again.' }, 400);
    }
    const supabase = getSupabase(env);
    const { data, error } = await supabase
      .from('client_todos')
      .update({ status: 'cancelled', completed_at: null })
      .eq('id', id)
      .select('id')
      .maybeSingle();
    if (error) {
      console.error('admin client_todos delete:', error);
      return json({ error: 'Could not remove that task.' }, 500);
    }
    if (!data) {
      return json({ error: 'Task not found.' }, 404);
    }
    return new Response(null, { status: 204 });
  }

  return null;
}
