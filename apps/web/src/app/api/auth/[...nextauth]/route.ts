import { handlers } from '@/auth';
import { serviceConfig } from '@/server/config';
import type { NextRequest } from 'next/server';
export const runtime = 'nodejs';
async function handle(request: NextRequest) {
  if (!serviceConfig().authReady) return Response.json({ error: 'Sign-in is not configured.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  return request.method === 'GET' ? handlers.GET(request) : handlers.POST(request);
}
export { handle as GET, handle as POST };
