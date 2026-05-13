import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseTlsSkipVerifyRaw = (process.env['SUPABASE_TLS_SKIP_VERIFY'] ?? '').trim().toLowerCase();
const supabaseTlsSkipVerify =
  supabaseTlsSkipVerifyRaw === '1' ||
  supabaseTlsSkipVerifyRaw === 'true' ||
  supabaseTlsSkipVerifyRaw === 'yes';

if (supabaseTlsSkipVerify && process.env['NODE_ENV'] === 'production') {
  throw new Error(
    'SUPABASE_TLS_SKIP_VERIFY cannot be set when NODE_ENV is production. Remove it from the environment.',
  );
}

if (supabaseTlsSkipVerify) {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
  console.warn(
    '[config] SUPABASE_TLS_SKIP_VERIFY: outbound HTTPS will skip TLS certificate verification (local dev only). Prefer NODE_EXTRA_CA_CERTS or fixing the trust store.',
  );
}

export const env = {
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  jwtSecret: process.env['JWT_SECRET'] ?? '',
  supabaseUrl: (process.env['SUPABASE_URL'] ?? '').trim(),
  supabaseServiceRoleKey: (process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? '').trim(),
} as const;

/** Reject dashboard / marketing URLs — those return HTML and break the JS client with opaque errors. */
function validateSupabaseProjectUrl(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(
      'SUPABASE_URL is not a valid URL. Use the Project URL from Supabase → Settings → API ' +
        '(https://YOUR_PROJECT_REF.supabase.co).',
    );
  }

  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname;

  if (path.includes('/dashboard')) {
    throw new Error(
      'SUPABASE_URL must not be a dashboard link. Use "Project URL" (https://xxxx.supabase.co) from Settings → API.',
    );
  }

  if (
    host === 'app.supabase.com' ||
    host === 'supabase.com' ||
    host === 'www.supabase.com'
  ) {
    throw new Error(
      'SUPABASE_URL must be your project API host (https://xxxx.supabase.co), not supabase.com. See Settings → API → Project URL.',
    );
  }
}

export function validateEnv(): void {
  const required: (keyof typeof env)[] = ['jwtSecret', 'supabaseUrl', 'supabaseServiceRoleKey'];

  const missing = required.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        'Copy server/.env.example to server/.env and fill in your values.',
    );
  }

  validateSupabaseProjectUrl(env.supabaseUrl);
}
