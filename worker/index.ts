import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

import { routeTodos } from './todos.js';

export interface Env {
  ASSETS: Fetcher;
  JWT_SECRET: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = '7d';

const JSON_HEADERS: HeadersInit = {
  'content-type': 'application/json; charset=utf-8',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

function getSupabase(env: Env): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function createToken(
  env: Env,
  user: { id: string; email: string; role: string },
): Promise<string> {
  const key = new TextEncoder().encode(env.JWT_SECRET);
  return await new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(key);
}

async function signup(request: Request, env: Env): Promise<Response> {
  let body: {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    phone?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const email = typeof body.email === 'string' ? normalizeEmail(body.email) : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : '';
  const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : '';
  const companyName =
    typeof body.companyName === 'string' ? body.companyName.trim() : undefined;
  const phone = typeof body.phone === 'string' ? body.phone.trim() : undefined;

  const errors: { msg: string }[] = [];
  if (!isValidEmail(email)) errors.push({ msg: 'A valid email is required.' });
  if (password.length < 8) errors.push({ msg: 'Password must be at least 8 characters.' });
  if (!firstName) errors.push({ msg: 'First name is required.' });
  if (!lastName) errors.push({ msg: 'Last name is required.' });
  if (errors.length > 0) {
    return json({ errors: errors.map((e) => ({ msg: e.msg })) }, 400);
  }

  const supabase = getSupabase(env);

  const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle();

  if (existing) {
    return json({ error: 'An account with this email already exists.' }, 409);
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
    return json({ error: 'Could not create account. Please try again.' }, 500);
  }

  const token = await createToken(env, {
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
  });

  return json(
    {
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        companyName: newUser.company_name,
        role: newUser.role,
      },
    },
    201,
  );
}

async function login(request: Request, env: Env): Promise<Response> {
  let body: { email?: string; password?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const email = typeof body.email === 'string' ? normalizeEmail(body.email) : '';
  const password = typeof body.password === 'string' ? body.password : '';

  const errors: { msg: string }[] = [];
  if (!isValidEmail(email)) errors.push({ msg: 'A valid email is required.' });
  if (!password) errors.push({ msg: 'Password is required.' });
  if (errors.length > 0) {
    return json({ errors: errors.map((e) => ({ msg: e.msg })) }, 400);
  }

  const supabase = getSupabase(env);

  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, password_hash, role, first_name, last_name, company_name, is_active')
    .eq('email', email)
    .maybeSingle();

  if (error || !user) {
    return json({ error: 'Invalid email or password.' }, 401);
  }

  if (!user.is_active) {
    return json({ error: 'This account has been deactivated.' }, 403);
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatch) {
    return json({ error: 'Invalid email or password.' }, 401);
  }

  const token = await createToken(env, { id: user.id, email: user.email, role: user.role });

  return json({
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
}

async function getAuthContext(request: Request, env: Env): Promise<{ userId: string; role: string } | Response> {
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

interface MockPlanningBriefPayload {
  readonly projectName: string;
  readonly primaryGoal: string;
  readonly audience: string;
  readonly mustHavePages: string;
  readonly brandNotes: string;
  readonly references: string;
  readonly deadline: string;
}

function parseMockPlanningBriefPayload(value: object): MockPlanningBriefPayload | null {
  const read = (key: string): string | undefined => {
    const v = Reflect.get(value, key);
    return typeof v === 'string' ? v : undefined;
  };
  const projectName = read('projectName')?.trim() ?? '';
  if (projectName.length < 2 || projectName.length > 500) {
    return null;
  }
  const primaryGoal = read('primaryGoal')?.trim() ?? '';
  if (primaryGoal.length < 1) {
    return null;
  }
  const audience = read('audience')?.trim() ?? '';
  if (audience.length < 12 || audience.length > 20000) {
    return null;
  }
  const mustHavePages = read('mustHavePages')?.trim() ?? '';
  if (mustHavePages.length < 12 || mustHavePages.length > 20000) {
    return null;
  }
  const brandNotes = read('brandNotes')?.trim() ?? '';
  if (brandNotes.length > 20000) {
    return null;
  }
  const references = read('references')?.trim() ?? '';
  if (references.length > 20000) {
    return null;
  }
  const deadline = read('deadline')?.trim() ?? '';
  if (deadline.length < 1) {
    return null;
  }
  return { projectName, primaryGoal, audience, mustHavePages, brandNotes, references, deadline };
}

async function postMockPlanningBrief(request: Request, env: Env): Promise<Response> {
  const auth = await getAuthContext(request, env);
  if (auth instanceof Response) {
    return auth;
  }

  let body: object;
  try {
    body = (await request.json()) as object;
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const parsed = parseMockPlanningBriefPayload(body);
  if (!parsed) {
    return json({ error: 'Please check the form and try again.' }, 400);
  }

  const supabase = getSupabase(env);

  const { data, error } = await supabase
    .from('mock_planning_briefs')
    .insert({
      user_id: auth.userId,
      project_name: parsed.projectName,
      primary_goal: parsed.primaryGoal,
      audience: parsed.audience,
      must_have_pages: parsed.mustHavePages,
      brand_notes: parsed.brandNotes,
      reference_notes: parsed.references,
      deadline: parsed.deadline,
    })
    .select('id, created_at')
    .single();

  if (error || !data) {
    console.error('mock_planning_briefs insert:', error);
    return json({ error: 'Could not save your brief. Please try again.' }, 500);
  }

  return json(
    {
      id: data.id as string,
      createdAt: data.created_at as string,
    },
    201,
  );
}

async function getAdminMockPlanningBriefs(request: Request, env: Env): Promise<Response> {
  const auth = await getAuthContext(request, env);
  if (auth instanceof Response) {
    return auth;
  }
  if (auth.role !== 'admin') {
    return json({ error: 'You do not have access to this list.' }, 403);
  }

  const supabase = getSupabase(env);

  const { data: rows, error } = await supabase
    .from('mock_planning_briefs')
    .select(
      'id, user_id, project_name, primary_goal, audience, must_have_pages, brand_notes, reference_notes, deadline, created_at',
    )
    .order('created_at', { ascending: false })
    .limit(200);

  if (error || !rows) {
    console.error('mock_planning_briefs list:', error);
    return json({ error: 'Could not load briefs.' }, 500);
  }

  const userIds = [...new Set(rows.map((r) => r.user_id as string))];
  const { data: users, error: userErr } = await supabase.from('users').select('id, email').in('id', userIds);

  if (userErr || !users) {
    console.error('users lookup for briefs:', userErr);
    return json({ error: 'Could not load briefs.' }, 500);
  }

  const emailById = new Map(users.map((u) => [u.id as string, u.email as string]));

  return json({
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
}

async function me(request: Request, env: Env): Promise<Response> {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return json({ error: 'Not authenticated.' }, 401);
  }

  const token = authHeader.slice(7);
  let userId: string;
  try {
    const key = new TextEncoder().encode(env.JWT_SECRET);
    const { payload } = await jwtVerify(token, key);
    const uid = payload['userId'];
    if (typeof uid !== 'string') {
      return json({ error: 'Invalid or expired token.' }, 401);
    }
    userId = uid;
  } catch {
    return json({ error: 'Invalid or expired token.' }, 401);
  }

  const supabase = getSupabase(env);

  const { data: user, error } = await supabase
    .from('users')
    .select(
      'id, email, first_name, last_name, company_name, phone, avatar_url, role, is_active, created_at',
    )
    .eq('id', userId)
    .single();

  if (error || !user) {
    return json({ error: 'User not found.' }, 404);
  }

  return json({
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
}

async function handleAuth(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, '') || '/';

  if (path === '/api/auth/signup' && request.method === 'POST') {
    return signup(request, env);
  }
  if (path === '/api/auth/login' && request.method === 'POST') {
    return login(request, env);
  }
  if (path === '/api/auth/me' && request.method === 'GET') {
    return me(request, env);
  }

  return json({ error: 'Not found' }, 404);
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/health' && request.method === 'GET') {
      return json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    if (url.pathname.startsWith('/api/auth')) {
      return handleAuth(request, env);
    }

    if (url.pathname === '/api/client/mock-planning-brief' && request.method === 'POST') {
      return postMockPlanningBrief(request, env);
    }

    if (url.pathname === '/api/admin/mock-planning-briefs' && request.method === 'GET') {
      return getAdminMockPlanningBriefs(request, env);
    }

    const todosResponse = await routeTodos(request, env, json);
    if (todosResponse !== null) {
      return todosResponse;
    }

    return env.ASSETS.fetch(request);
  },
};
