/**
 * Run with: npm run migrate --prefix server
 *
 * Applies `schema.sql` to your Supabase Postgres database when **DATABASE_URL** is set
 * (Supabase Dashboard → Project Settings → Database → **Connection string** → URI; prefer **Direct** or **Session**).
 *
 * Supabase does **not** ship `public.exec_sql` — this script no longer depends on it.
 * Without DATABASE_URL, prints the path to `schema.sql` and exits with code 1 (use SQL Editor).
 *
 * DNS: `pg` uses `dns.lookup` → OS resolver (stub on 127.0.0.x often breaks). This script sets
 * `dns.setServers` and resolves the DB host with `dns.resolve4` / `dns.resolve6`, then connects
 * by IP with TLS SNI (`servername`) so certs still match.
 */
import dns from 'node:dns';
import { readFileSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseIntoClientConfig } from 'pg-connection-string';
import pg from 'pg';
import type { ClientConfig } from 'pg';

import '../config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Default resolvers when DATABASE_DNS_SERVERS is unset (does not change OS-wide DNS). */
const DEFAULT_MIGRATE_DNS_SERVERS: readonly string[] = ['8.8.8.8', '1.1.1.1'];

function tlsSkipVerify(): boolean {
  const raw = (process.env['SUPABASE_TLS_SKIP_VERIFY'] ?? '').trim().toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes';
}

/** `dns.setServers` applies to resolve4/resolve6, not to `dns.lookup` (used by `pg`). */
function configureMigrateDns(): void {
  const raw = process.env['DATABASE_DNS_SERVERS'];
  if (raw !== undefined) {
    const parts: string[] = raw
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);
    if (parts.length > 0) {
      dns.setServers(parts);
    }
    return;
  }
  dns.setServers([...DEFAULT_MIGRATE_DNS_SERVERS]);
  console.warn(
    `[migrate] DNS: using ${DEFAULT_MIGRATE_DNS_SERVERS.join(', ')} for resolve4/resolve6 this run. ` +
      'Set DATABASE_DNS_SERVERS= for system resolvers, or DATABASE_DNS_SERVERS=a,b to customize.',
  );
}

async function resolveHostToAddress(hostname: string): Promise<string> {
  try {
    const v4: string[] = await dns.promises.resolve4(hostname);
    const first4: string | undefined = v4[0];
    if (first4 !== undefined) {
      return first4;
    }
  } catch {
    /* try AAAA */
  }
  try {
    const v6: string[] = await dns.promises.resolve6(hostname);
    const first6: string | undefined = v6[0];
    if (first6 !== undefined) {
      console.warn(
        '[migrate] Host has IPv6 only (no A record). If connect fails with ENETUNREACH, set DATABASE_URL to Supabase → Connect → **Session pooler** (IPv4).',
      );
      return first6;
    }
  } catch {
    /* fall through */
  }
  throw new Error(
    `Could not resolve "${hostname}" via configured DNS. Try DATABASE_DNS_SERVERS= or Session pooler URI (Supabase → Connect).`,
  );
}

function applyTlsAndSni(
  config: ClientConfig,
  options: { readonly skipTlsVerify: boolean; readonly originalHostnameForSni?: string },
): ClientConfig {
  const { skipTlsVerify, originalHostnameForSni } = options;
  const hostStr: string = typeof config.host === 'string' ? config.host : '';
  const connectByIp: boolean = net.isIP(hostStr) !== 0;
  const servername: string | undefined =
    connectByIp &&
    originalHostnameForSni !== undefined &&
    originalHostnameForSni.length > 0 &&
    net.isIP(originalHostnameForSni) === 0
      ? originalHostnameForSni
      : undefined;

  let ssl: ClientConfig['ssl'] = config.ssl;

  const withSni = (base: Record<string, unknown>): Record<string, unknown> =>
    servername === undefined ? base : { ...base, servername };

  if (skipTlsVerify) {
    if (ssl === false) {
      ssl = withSni({ rejectUnauthorized: false }) as ClientConfig['ssl'];
    } else if (ssl === true || ssl === undefined) {
      ssl = withSni({ rejectUnauthorized: false }) as ClientConfig['ssl'];
    } else if (typeof ssl === 'object' && ssl !== null) {
      ssl = withSni({
        ...(ssl as Record<string, unknown>),
        rejectUnauthorized: false,
      }) as ClientConfig['ssl'];
    }
  } else if (servername !== undefined) {
    if (ssl === true || ssl === undefined) {
      ssl = { rejectUnauthorized: true, servername };
    } else if (typeof ssl === 'object' && ssl !== null) {
      const existing: { servername?: string } = ssl as { servername?: string };
      ssl = {
        ...(ssl as Record<string, unknown>),
        servername: existing.servername ?? servername,
      } as ClientConfig['ssl'];
    }
  }

  return { ...config, ssl };
}

async function createPgClient(databaseUrl: string): Promise<pg.Client> {
  let base: ClientConfig;
  try {
    base = parseIntoClientConfig(databaseUrl);
  } catch (e) {
    const m: string = e instanceof Error ? e.message : String(e);
    throw new Error(`Invalid DATABASE_URL: ${m}`);
  }

  const host: string | undefined = typeof base.host === 'string' ? base.host : undefined;
  if (host === undefined || host.length === 0) {
    throw new Error('DATABASE_URL must include a host.');
  }

  const skip: boolean = tlsSkipVerify();

  if (net.isIP(host) !== 0) {
    return new pg.Client(applyTlsAndSni(base, { skipTlsVerify: skip }));
  }

  const address: string = await resolveHostToAddress(host);
  const withAddr: ClientConfig = { ...base, host: address };
  return new pg.Client(applyTlsAndSni(withAddr, { skipTlsVerify: skip, originalHostnameForSni: host }));
}

async function migrate(): Promise<void> {
  const databaseUrl: string = (process.env['DATABASE_URL'] ?? '').trim();

  if (!databaseUrl) {
    const schemaPath = path.resolve(__dirname, 'schema.sql');
    console.error(
      'Missing DATABASE_URL. Add it to server/.env (see server/.env.example), then run migrate again.\n' +
        'Get the URI from Supabase → Project Settings → Database → Connection string (use Direct or Session).\n\n' +
        `Or run the SQL file manually in the Supabase SQL Editor:\n  ${schemaPath}\n`,
    );
    process.exit(1);
  }

  configureMigrateDns();

  const schemaPath: string = path.resolve(__dirname, 'schema.sql');
  let sql: string;
  try {
    sql = readFileSync(schemaPath, 'utf8');
  } catch (e) {
    console.error('Could not read schema file:', schemaPath);
    console.error(e instanceof Error ? e.message : String(e));
    process.exit(1);
  }

  console.log(`Applying ${path.relative(process.cwd(), schemaPath)} via DATABASE_URL…`);

  let client: pg.Client;
  try {
    client = await createPgClient(databaseUrl);
  } catch (e) {
    console.error('Migration failed:', e instanceof Error ? e.message : String(e));
    process.exit(1);
  }

  try {
    await client.connect();
    await client.query(sql);
  } catch (e) {
    const msg: string = e instanceof Error ? e.message : String(e);
    console.error('Migration failed:', msg);
    if (/ENETUNREACH|EHOSTUNREACH|ETIMEDOUT|IPv6/i.test(msg)) {
      console.error(
        'Hint: Direct `db.*.supabase.co` is often IPv6-only. In Supabase → Connect, use the **Session pooler** URI (port 5432) in DATABASE_URL for IPv4.',
      );
    }
    process.exit(1);
  } finally {
    await client.end().catch(() => undefined);
  }

  console.log('Migration complete.');
}

void migrate();
