import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Check, CircleDashed, ShieldCheck } from 'lucide-react';
import { serviceConfig } from '@/server/config';
export const metadata: Metadata = { title: 'Setup' };
export const dynamic = 'force-dynamic';
export default function Page() {
  const config = serviceConfig();
  const connections = [
    ['GitHub sign-in', 'A separate personal OAuth app, restricted to enabled accounts.', config.authReady],
    ['Application database', 'Private saved requests, responses and their accounting records.', config.databaseReady],
    [`${config.modelConfig.providerLabel} / ${config.modelConfig.label}`, 'One selected model, bounded requests and daily list-rate accounting.', config.modelReady],
  ] as const;
  return <div className="page-stack"><header className="page-heading"><p className="eyebrow">WORKSPACE / SETUP</p><h1>A few connections. Clear boundaries.</h1><p>Samples work locally. Saved conversations use GitHub sign-in, a database and your selected model provider.</p></header>
    <section className="panel setup-panel" aria-labelledby="setup-title"><div className="section-heading"><div><span className="section-icon"><ShieldCheck size={21} /></span><h2 id="setup-title">Configuration status</h2></div><span className="quiet-tag">{config.liveEnabled ? 'Live requests enabled' : 'Live requests disabled'}</span></div>
      <div className="connection-row"><span className="connection-check"><Check size={18} /></span><div><h3>Sample workspace</h3><p>Local drafts, authored traces, filtering and replay.</p></div><span className="state-label">Available</span></div>
      {connections.map(([title, description, configured]) => <div className="connection-row" key={title}>{configured ? <Check size={21} /> : <CircleDashed className="muted" size={21} />}<div><h3>{title}</h3><p>{description}</p></div><span className={'state-label' + (configured ? '' : ' muted')}>{configured ? 'Configured' : 'Not configured'}</span></div>)}
      <p className="footnote">Configured means the application has the required settings. It does not confirm successful sign-in, database connectivity or model access.</p>
    </section>
    <div className="setup-bottom"><section className="panel"><p className="eyebrow">PRIVATE CONVERSATIONS</p><h2>One request, saved with its details.</h2><p>Sign in, ask a question and reopen its answer with reported usage, estimated cost and measured timing. No documentation retrieval or tools are connected.</p><Link href="/conversations" className="text-link">Open conversations <ArrowUpRight size={16} /></Link></section><section className="panel"><p className="eyebrow">BOUNDED BY DEFAULT</p><h2>A small daily allowance.</h2><p>US$1 per user and US$5 overall per UTC day. Pending and unknown usage count toward the allowance. Cost figures use published list rates; free-plan charges can differ. Requests have no automatic retries or provider fallback.</p><p className="footnote">Keep credentials and sensitive material out of requests. Sample values remain illustrative.</p></section></div>
  </div>;
}
