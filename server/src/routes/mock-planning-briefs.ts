import { Router, type Request, type Response } from 'express';
import { body, validationResult } from 'express-validator';

import { authenticate } from '../middleware/authenticate.js';
import { getSupabase } from '../config/supabase.js';

const briefValidation = [
  body('projectName').trim().isLength({ min: 2, max: 500 }).withMessage('Project name is required.'),
  body('primaryGoal').trim().notEmpty().withMessage('Primary goal is required.'),
  body('audience').trim().isLength({ min: 12, max: 20000 }).withMessage('Audience needs more detail.'),
  body('mustHavePages').trim().isLength({ min: 12, max: 20000 }).withMessage('Pages or sections need more detail.'),
  body('brandNotes').optional().trim().isLength({ max: 20000 }),
  body('references').optional().trim().isLength({ max: 20000 }),
  body('deadline').trim().notEmpty().withMessage('Timing is required.'),
];

function handleValidationErrors(req: Request, res: Response): boolean {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: 'Please check the form and try again.' });
    return true;
  }
  return false;
}

export const clientMockPlanningBriefRouter = Router();

clientMockPlanningBriefRouter.post(
  '/mock-planning-brief',
  authenticate,
  briefValidation,
  async (req: Request, res: Response): Promise<void> => {
    if (handleValidationErrors(req, res)) {
      return;
    }

    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }

    const {
      projectName,
      primaryGoal,
      audience,
      mustHavePages,
      brandNotes,
      references,
      deadline,
    } = req.body as {
      projectName: string;
      primaryGoal: string;
      audience: string;
      mustHavePages: string;
      brandNotes?: string;
      references?: string;
      deadline: string;
    };

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('mock_planning_briefs')
      .insert({
        user_id: userId,
        project_name: projectName,
        primary_goal: primaryGoal,
        audience,
        must_have_pages: mustHavePages,
        brand_notes: brandNotes ?? '',
        reference_notes: references ?? '',
        deadline,
      })
      .select('id, created_at')
      .single();

    if (error || !data) {
      console.error('mock_planning_briefs insert:', error);
      res.status(500).json({ error: 'Could not save your brief. Please try again.' });
      return;
    }

    res.status(201).json({
      id: data.id as string,
      createdAt: data.created_at as string,
    });
  },
);

export const adminMockPlanningBriefRouter = Router();

adminMockPlanningBriefRouter.get(
  '/mock-planning-briefs',
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'You do not have access to this list.' });
      return;
    }

    const supabase = getSupabase();

    const { data: rows, error } = await supabase
      .from('mock_planning_briefs')
      .select(
        'id, user_id, project_name, primary_goal, audience, must_have_pages, brand_notes, reference_notes, deadline, created_at',
      )
      .order('created_at', { ascending: false })
      .limit(200);

    if (error || !rows) {
      console.error('mock_planning_briefs list:', error);
      res.status(500).json({ error: 'Could not load briefs.' });
      return;
    }

    const userIds = [...new Set(rows.map((r) => r.user_id as string))];
    const { data: users, error: userErr } = await supabase
      .from('users')
      .select('id, email')
      .in('id', userIds);

    if (userErr || !users) {
      console.error('users lookup for briefs:', userErr);
      res.status(500).json({ error: 'Could not load briefs.' });
      return;
    }

    const emailById = new Map(users.map((u) => [u.id as string, u.email as string]));

    res.json({
      briefs: rows.map((r) => ({
        id: r.id as string,
        userId: r.user_id as string,
        clientEmail: emailById.get(r.user_id as string) ?? '',
        projectName: r.project_name as string,
        primaryGoal: r.primary_goal as string,
        audience: r.audience as string,
        mustHavePages: r.must_have_pages as string,
        brandNotes: r.brand_notes as string,
        references: r.reference_notes as string,
        deadline: r.deadline as string,
        createdAt: r.created_at as string,
      })),
    });
  },
);
