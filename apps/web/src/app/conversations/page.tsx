import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, MessageSquare, Plus } from 'lucide-react';
import { ConnectionGate } from '@/components/connection-gate';
import { serviceConfig } from '@/server/config';
import { currentOwner, getRepository } from '@/server/services';
import { usd, type Conversation } from '@/domain/live';
import { logout } from './actions';
export const metadata: Metadata = { title: 'Conversations' };
export const dynamic = 'force-dynamic';
export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const config = serviceConfig();
  const owner = await currentOwner();
  const query = await searchParams;
  if (!owner || !config.databaseReady) return <ConnectionGate config={config} signedIn={Boolean(owner)} error={Boolean(query.error)} />;
  let saved: [Conversation[], number] | undefined;
  try {
    const repository = getRepository();
    saved = await Promise.all([repository.list(owner), repository.ownAllowance(owner)]);
  } catch { /* Keep storage failures out of the render path and omit connection details. */ }
  if (!saved) return <div className="page-stack"><header className="page-heading"><p className="eyebrow">WORKSPACE / CONVERSATIONS</p><h1>A moment to reconnect.</h1><p>Saved conversations are temporarily unavailable. Check the database connection and migration, then reload.</p></header><Link href="/settings" className="text-link">View setup <ArrowUpRight size={16} /></Link></div>;
  const [conversations, accounted] = saved;
  return <div className="page-stack"><header className="page-heading"><p className="eyebrow">WORKSPACE / CONVERSATIONS</p><h1>Pick up where you left off.</h1><p>Your saved requests and responses, with their execution details.</p></header>
      <section className="panel conversation-library"><div className="section-heading"><div><h2>Saved conversations</h2><p>{conversations.length} saved · Private to your account</p></div><form action={logout}><button className="text-link" type="submit">Sign out</button></form></div>
        <div className="allowance-summary"><span>Today: {usd(accounted)} / {usd(config.dailyUserMicrousd)} USD list-rate allowance</span><span>Includes pending and unknown usage · Resets at 00:00 UTC</span></div>
        {!config.liveEnabled && <p className="footnote">Live requests are disabled. You can still review saved conversations. <Link className="text-link" href="/settings">View setup <ArrowUpRight size={14} /></Link></p>}
        {conversations.length ? <ul className="conversation-list">{conversations.map(conversation => <li key={conversation.id}><Link href={`/conversations/${conversation.id}`}><MessageSquare size={18} /><div><strong>{conversation.title}</strong><time dateTime={conversation.updatedAt}>{new Date(conversation.updatedAt).toISOString().slice(0, 10)}</time></div><ArrowUpRight size={17} /></Link></li>)}</ul> : <div className="no-results"><MessageSquare size={26} /><h3>Your first conversation starts here.</h3><p>Ask one question, then inspect the response and its usage.</p></div>}
        <Link className="text-link" href="/conversations/new"><Plus size={17} />New request</Link>
      </section></div>;
}
