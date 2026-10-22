import Link from 'next/link';
import { ArrowUpRight, Check, CircleDashed, LogIn, LockKeyhole } from 'lucide-react';
import { login, logout } from '@/app/conversations/actions';
import type { ServiceConfig } from '@/server/config-core';
import { Button } from '@/components/ui/bld8/core';
export function ConnectionGate({ config, signedIn, error = false }: {
  config: Pick<ServiceConfig, 'authReady' | 'databaseReady' | 'modelReady' | 'liveEnabled' | 'modelConfig'>;
  signedIn: boolean; error?: boolean;
}) {
  return <div className="page-stack"><header className="page-heading"><p className="eyebrow">WORKSPACE / CONVERSATIONS</p><h1>Your work, kept together.</h1><p>Sign in to send a request and reopen its answer, usage and execution details.</p></header>
    <section className="panel connection-gate"><span className="empty-inspector-mark"><LockKeyhole size={25} /></span><h2>{signedIn ? 'Finish connecting the workspace.' : 'A private place to work.'}</h2><p>Saved conversations belong to your GitHub account. Sample runs remain available without signing in.</p>
      {error && <p className="storage-error" role="alert">Sign-in was not completed. Check that you used an account enabled for this preview, then try again.</p>}
      <ul className="connection-checklist">{[
        ['GitHub sign-in', config.authReady], ['Saved conversations', config.databaseReady], [`${config.modelConfig.providerLabel} / ${config.modelConfig.label}`, config.modelReady], ['Live requests enabled', config.liveEnabled],
      ].map(([label, ready]) => <li key={String(label)}>{ready ? <Check size={16} /> : <CircleDashed size={16} />}<span>{label}</span><small>{ready ? 'Configured' : 'Not configured'}</small></li>)}</ul>
      <div className="gate-actions">{!signedIn && config.authReady && <form action={login}><Button type="submit"><LogIn size={17} />Sign in with GitHub</Button></form>}{signedIn && <form action={logout}><Button variant="secondary" type="submit">Sign out</Button></form>}<Link href="/" className="text-link">Explore sample runs <ArrowUpRight size={16} /></Link><Link href="/settings" className="text-link">View setup <ArrowUpRight size={16} /></Link></div>
      <p className="footnote">Configuration status is not a connection test. No model request is sent from this screen.</p>
    </section></div>;
}
