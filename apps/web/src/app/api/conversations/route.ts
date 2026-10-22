import { failure, json } from '@/server/http';
import { getRepository, requireCurrentOwner } from '@/server/services';
export const runtime = 'nodejs';
export async function GET() {
  try { const owner = await requireCurrentOwner(); return json(await getRepository().list(owner)); }
  catch (error) { return failure(error); }
}
