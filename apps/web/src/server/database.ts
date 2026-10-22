import { Pool, type PoolClient } from 'pg';

export function createPool(databaseUrl: string, test = false) {
  const url = new URL(databaseUrl);
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error('Invalid database protocol');
  const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (test && (!loopback || !url.pathname.endsWith('_test'))) throw new Error('Tests require a loopback database ending in _test');
  // Enforce certificate validation remotely; do not let URL SSL flags override it.
  for (const key of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert']) url.searchParams.delete(key);
  const pool = new Pool({ connectionString: url.toString(), max: 5, idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000, statement_timeout: 15_000, ssl: loopback ? false : { rejectUnauthorized: true } });
  pool.on('error', () => { /* The checked-out request reports a safe storage error; never log connection details. */ });
  return pool;
}
export async function transaction<T>(pool: Pool, action: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try { await client.query('BEGIN'); const value = await action(client); await client.query('COMMIT'); return value; }
  catch (error) { try { await client.query('ROLLBACK'); } catch {} throw error; }
  finally { client.release(); }
}
