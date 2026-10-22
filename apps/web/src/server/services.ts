import 'server-only';
import { auth } from '@/auth';
import { ServiceError } from '@/domain/live';
import { serviceConfig } from './config';
import { createPool } from './database';
import { WorkbenchRepository } from './repository';
import { createModelCall } from './provider';
import type { ModelCall } from './execution';

let repository: WorkbenchRepository | undefined;
export function getRepository() {
  const config = serviceConfig();
  if (!config.databaseReady) throw new ServiceError('not_configured', 503);
  return repository ??= new WorkbenchRepository(createPool(config.databaseUrl));
}
export async function currentOwner(): Promise<string | null> {
  const config = serviceConfig();
  if (!config.authReady) return null;
  const session = await auth();
  const id = session?.user?.id;
  return id && /^github:\d+$/.test(id) && config.allowedGitHubIds.includes(id.slice(7)) ? id : null;
}
export async function requireCurrentOwner() {
  const owner = await currentOwner();
  if (!owner) throw new ServiceError('sign_in_required', 401);
  return owner;
}
export const callModel: ModelCall = async prompt => {
  const config = serviceConfig();
  if (!config.liveEnabled) throw new ServiceError('not_configured', 503);
  return createModelCall(config.modelConfig.provider === 'groq' ? config.groqKey : config.openaiKey, undefined, config.modelConfig)(prompt);
};
