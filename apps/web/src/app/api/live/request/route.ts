import { executeRequest } from '@/server/execution';
import { serviceConfig } from '@/server/config';
import { assertSameOrigin, failure, json, readJson } from '@/server/http';
import { callModel, getRepository, requireCurrentOwner } from '@/server/services';
export const runtime = 'nodejs';
export const maxDuration = 60;
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const owner = await requireCurrentOwner();
    return json(await executeRequest(owner, await readJson(request), serviceConfig(), getRepository(), callModel));
  } catch (error) { return failure(error); }
}
