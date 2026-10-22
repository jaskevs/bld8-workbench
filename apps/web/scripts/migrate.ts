import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createPool, transaction } from '../src/server/database';

// The application directory only; never load the parent workspace environment.
if (existsSync('.env.local')) process.loadEnvFile('.env.local');
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) { console.error('Set DATABASE_URL in apps/web/.env.local before migrating.'); process.exit(1); }
const pool = createPool(databaseUrl);
try {
  await transaction(pool, async client => {
    await client.query('SELECT pg_advisory_xact_lock(4828, 2)');
    await client.query('CREATE TABLE IF NOT EXISTS wb_schema_version (version integer PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
    const existing = await client.query('SELECT version FROM wb_schema_version WHERE version=1');
    if (!existing.rowCount) await client.query(await readFile(new URL('../migrations/001_conversations.sql', import.meta.url), 'utf8'));
  });
  console.log('Workbench database schema is up to date (version 1).');
} catch { console.error('Migration failed. Verify the database URL, TLS and database permissions. No connection details were logged.'); process.exitCode = 1; }
finally { await pool.end(); }
