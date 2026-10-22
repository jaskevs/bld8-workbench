import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ConnectionGate } from '@/components/connection-gate';
import { ConversationDetail } from '@/components/conversation-detail';
import { isUuid, ServiceError } from '@/domain/live';
import { serviceConfig } from '@/server/config';
import { currentOwner, getRepository } from '@/server/services';
export const metadata: Metadata = { title: 'Conversation' };
export const dynamic = 'force-dynamic';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const config = serviceConfig();
  const owner = await currentOwner();
  if (!owner || !config.databaseReady) return <ConnectionGate config={config} signedIn={Boolean(owner)} />;
  const { id } = await params;
  if (!isUuid(id)) notFound();
  let conversation;
  try { conversation = await getRepository().read(owner, id); }
  catch (error) {
    if (error instanceof ServiceError && error.code === 'not_found') notFound();
    return <div className="page-stack"><header className="page-heading"><h1>Saved details are unavailable.</h1><p>The database could not be reached. Your conversation has not been removed; try reloading.</p></header></div>;
  }
  return <ConversationDetail conversation={conversation} />;
}
