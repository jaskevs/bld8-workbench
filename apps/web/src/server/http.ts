import 'server-only';
import { ServiceError } from '@/domain/live';
import { serviceConfig } from './config';
export function assertSameOrigin(request: Request) {
  const config = serviceConfig();
  if (!config.origin || request.headers.get('origin') !== config.origin || request.headers.get('sec-fetch-site') === 'cross-site') throw new ServiceError('not_allowed', 403);
}
export async function readJson(request: Request): Promise<unknown> {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new ServiceError('invalid_input', 415);
  if (Number(request.headers.get('content-length') ?? 0) > 24000 || !request.body) throw new ServiceError('invalid_input', 413);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > 24000) { await reader.cancel(); throw new ServiceError('invalid_input', 413); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch (error) { if (error instanceof ServiceError) throw error; throw new ServiceError('invalid_input'); }
  finally { reader.releaseLock(); }
}
export function json(value: unknown, status = 200) {
  return Response.json(value, { status, headers: { 'Cache-Control': 'no-store, private', 'Vary': 'Cookie', 'X-Content-Type-Options': 'nosniff' } });
}
export function failure(error: unknown) {
  const safe = error instanceof ServiceError ? error : new ServiceError('storage_unavailable', 503);
  return json({ error: { code: safe.code, message: safe.message } }, safe.status);
}
