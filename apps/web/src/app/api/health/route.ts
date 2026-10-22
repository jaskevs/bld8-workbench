import { serviceConfig } from '@/server/config';
export const runtime = 'nodejs';
export function GET() {
  const config = serviceConfig();
  return Response.json({ status: 'ok', scope: config.liveEnabled ? 'private-workspace' : 'application-shell', mode: config.liveEnabled ? 'private-live' : 'sample', capabilities: {
    authentication: config.authReady, database: config.databaseReady, modelExecution: config.liveEnabled, retrieval: false,
  } }, { headers: { 'Cache-Control': 'no-store' } });
}
