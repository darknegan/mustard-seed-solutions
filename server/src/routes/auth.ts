import { Router, type Request, type Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import { getSupabase } from '../config/supabase.js';

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = '7d';

export const authRouter = Router();

// ── Validation chains ──────────────────────────────────────

const signupValidation = [
  body('email').isEmail().normalizeEmail().withMessage('A valid email is required.'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters.'),
  body('firstName').trim().notEmpty().withMessage('First name is required.'),
  body('lastName').trim().notEmpty().withMessage('Last name is required.'),
  body('companyName').optional().trim(),
  body('phone').optional().trim(),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('A valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

// ── Helpers ────────────────────────────────────────────────

function createToken(user: { id: string; email: string; role: string }): string {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    env.jwtSecret,
    { expiresIn: TOKEN_EXPIRY },
  );
}

function handleValidationErrors(req: Request, res: Response): boolean {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
}

// ── POST /api/auth/signup ──────────────────────────────────

authRouter.post('/signup', signupValidation, async (req: Request, res: Response): Promise<void> => {
  if (handleValidationErrors(req, res)) return;

  const { email, password, firstName, lastName, companyName, phone } = req.body as {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    companyName?: string;
    phone?: string;
  };

  const supabase = getSupabase();

  // Check if user already exists
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists.' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      email,
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      company_name: companyName ?? '',
      phone: phone ?? '',
    })
    .select('id, email, role, first_name, last_name, company_name')
    .single();

  if (error || !newUser) {
    console.error('Supabase insert error:', error);
    res.status(500).json({ error: 'Could not create account. Please try again.' });
    return;
  }

  const token = createToken({ id: newUser.id, email: newUser.email, role: newUser.role });

  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      companyName: newUser.company_name,
      role: newUser.role,
    },
  });
});

// ── POST /api/auth/login ───────────────────────────────────

authRouter.post('/login', loginValidation, async (req: Request, res: Response): Promise<void> => {
  if (handleValidationErrors(req, res)) return;

  const { email, password } = req.body as { email: string; password: string };

  const supabase = getSupabase();

  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, password_hash, role, first_name, last_name, company_name, is_active')
    .eq('email', email)
    .maybeSingle();

  if (error || !user) {
    const isProd = process.env['NODE_ENV'] === 'production';
    if (error) {
      console.error('[auth/login] Supabase:', error.message, error.code, error.details ?? '');
    } else {
      console.warn(
        '[auth/login] No user row for this email' +
          (isProd ? '.' : ` (normalized): ${email}`),
      );
    }
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  if (!user.is_active) {
    res.status(403).json({ error: 'This account has been deactivated.' });
    return;
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatch) {
    console.warn('[auth/login] Password does not match stored hash for user id:', user.id);
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const token = createToken({ id: user.id, email: user.email, role: user.role });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      companyName: user.company_name,
      role: user.role,
    },
  });
});

// ── GET /api/auth/me (protected) ───────────────────────────

authRouter.get('/me', async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers['authorization'];

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Not authenticated.' });
    return;
  }

  let payload: { userId: string };
  try {
    payload = jwt.verify(authHeader.slice(7), env.jwtSecret) as { userId: string };
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
    return;
  }

  const supabase = getSupabase();

  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, company_name, phone, avatar_url, role, is_active, created_at')
    .eq('id', payload.userId)
    .single();

  if (error || !user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      companyName: user.company_name,
      phone: user.phone,
      avatarUrl: user.avatar_url,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at,
    },
  });
});
