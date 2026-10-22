import type { Metadata } from 'next';
import { ConnectionGate } from '@/components/connection-gate';
import { RequestComposer } from '@/components/request-composer';
import { serviceConfig } from '@/server/config';
import { currentOwner } from '@/server/services';
export const metadata: Metadata = { title: 'New request' };
export const dynamic = 'force-dynamic';
export default async function Page() {
  const config = serviceConfig();
  const owner = await currentOwner();
  if (!owner || !config.liveEnabled) return <ConnectionGate config={config} signedIn={Boolean(owner)} />;
  return <RequestComposer dailyLimit={config.dailyUserMicrousd} providerLabel={config.modelConfig.providerLabel} modelLabel={config.modelConfig.label} />;
}
