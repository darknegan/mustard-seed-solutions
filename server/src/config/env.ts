import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  jwtSecret: process.env['JWT_SECRET'] ?? '',
  supabaseUrl: process.env['SUPABASE_URL'] ?? '',
  supabaseServiceRoleKey: process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? '',
} as const;

export function validateEnv(): void {
  const required: (keyof typeof env)[] = ['jwtSecret', 'supabaseUrl', 'supabaseServiceRoleKey'];

  const missing = required.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        'Copy server/.env.example to server/.env and fill in your values.',
    );
  }
}
