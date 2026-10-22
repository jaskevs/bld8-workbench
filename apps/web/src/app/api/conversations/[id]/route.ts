import { isUuid, ServiceError } from '@/domain/live';
import { assertSameOrigin, failure, json, readJson } from '@/server/http';
import { getRepository, requireCurrentOwner } from '@/server/services';
import { redactText } from '@/server/redaction';
export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };
async function idFrom(context: Context) { const { id } = await context.params; if (!isUuid(id)) throw new ServiceError('not_found', 404); return id; }
export async function GET(_request: Request, context: Context) {
  try { const owner = await requireCurrentOwner(); return json(await getRepository().read(owner, await idFrom(context))); }
  catch (error) { return failure(error); }
}
export async function PATCH(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    const owner = await requireCurrentOwner();
    const body = await readJson(request);
    if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).length !== 1 || !('title' in body) || typeof body.title !== 'string') throw new ServiceError('invalid_input');
    return json(await getRepository().rename(owner, await idFrom(context), redactText(body.title)));
  } catch (error) { return failure(error); }
}
export async function DELETE(request: Request, context: Context) {
  try { assertSameOrigin(request); const owner = await requireCurrentOwner(); await getRepository().remove(owner, await idFrom(context)); return json({ deleted: true }); }
  catch (error) { return failure(error); }
}
