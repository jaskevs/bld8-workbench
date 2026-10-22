'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Check, CircleDashed, FileText, Pencil, Trash2, X } from 'lucide-react';
import { ResponseContent } from '@/components/response-content';
import { Badge, Button, Field, Input } from '@/components/ui/bld8/core';
import { Tabs } from '@/components/ui/bld8/controls';
import { Dialog } from '@/components/ui/bld8/overlays';
import { usd, liveErrorMessage, type Conversation, type LiveRun } from '@/domain/live';

export function ConversationDetail({ conversation }: { conversation: Conversation & { runs: LiveRun[] } }) {
  const router = useRouter();
  const run = conversation.runs[0];
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [title, setTitle] = useState(conversation.title);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const renameButton = useRef<HTMLButtonElement>(null);
  const deleteButton = useRef<HTMLButtonElement>(null);
  const titleInput = useRef<HTMLInputElement>(null);
  const running = run?.status === 'running';
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => router.refresh(), 2000);
    return () => clearInterval(timer);
  }, [running, router]);

  async function mutate(method: 'PATCH' | 'DELETE', event?: FormEvent) {
    event?.preventDefault();
    if (busy) return;
    setBusy(true); setError('');
    try {
      const response = await fetch(`/api/conversations/${conversation.id}`, { method,
        headers: method === 'PATCH' ? { 'Content-Type': 'application/json' } : {},
        body: method === 'PATCH' ? JSON.stringify({ title }) : undefined });
      const data = await response.json();
      if (!response.ok) { setError(data.error?.message ?? 'The change could not be saved. Try again.'); return; }
      if (method === 'DELETE') router.push('/conversations');
      else { setEditing(false); router.refresh(); }
    } catch { setError('The change could not be confirmed. Reload before trying again.'); }
    finally { setBusy(false); }
  }
  if (!run) return <div className="page-stack"><h1>No execution is available.</h1><Link href="/conversations" className="text-link">Saved conversations <ArrowUpRight size={16} /></Link></div>;
  const unknown = run.estimatedCostMicrousd === null;
  const overview = <div className="inspector-content"><div className="inspector-description"><span className="micro-label">MEASURED EXECUTION</span><h3>The details of this request.</h3><p>Usage is reported by the provider. Timing is measured by Workbench.</p></div>
    <dl className="metric-list"><div><dt>Provider</dt><dd>{run.provider}</dd></div><div><dt>Requested model</dt><dd>{run.model}</dd></div><div><dt>Reported model</dt><dd>{run.responseModel ?? 'Not reported'}</dd></div><div><dt>Model duration</dt><dd>{run.durationMs === null ? 'Unknown' : `${run.durationMs.toLocaleString()} ms`}</dd></div><div><dt>Input tokens</dt><dd>{run.inputTokens ?? 'Unknown'}</dd></div><div><dt>Output tokens</dt><dd>{run.outputTokens ?? 'Unknown'}</dd></div><div><dt>List-rate estimate</dt><dd>{usd(run.estimatedCostMicrousd)}</dd></div>{unknown && <div><dt>Budget held</dt><dd>{usd(run.accountedMicrousd)}</dd></div>}</dl>
    <p className="footnote">USD estimates use reviewed provider list rates, with conservative accounting when cache details are unavailable. Free-plan charges may be zero within provider quotas. These amounts are not an invoice.</p>
    {unknown && <p className="footnote">Unknown usage stays unknown. Its reservation remains counted toward your daily allowance.</p>}
  </div>;
  const events = <div className="inspector-content"><p className="footnote">Application steps only. No retrieval, tools or private model reasoning are recorded.</p><ol className="event-list">
    <li><div className="event-button"><span className="event-symbol"><Check size={13} /></span><span>Request saved and budget reserved<small>{run.createdAt.replace('T', ' ').slice(0, 19)} UTC</small></span></div></li>
    <li><div className="event-button"><span className={'event-symbol' + (run.status === 'failed' || run.status === 'interrupted' ? ' event-error' : '')}>{running ? <CircleDashed size={13} /> : run.status === 'completed' ? <Check size={13} /> : <X size={13} />}</span><span>{running ? 'Waiting for provider' : run.status === 'completed' ? 'Response saved' : 'Execution did not complete'}<small>{run.finishReason ?? run.errorCode ?? 'No final usage yet'}</small></span></div></li>
  </ol><dl className="metric-list"><div><dt>Run ID</dt><dd className="trace-id">{run.id}</dd></div><div><dt>Response ID</dt><dd className="trace-id">{run.providerResponseId ?? 'Not reported'}</dd></div></dl></div>;
  return <div className="page-stack"><header className="page-heading"><p className="eyebrow">WORKSPACE / SAVED CONVERSATION</p><h1 className="conversation-title">{conversation.title}</h1><p>One request and its response. Private to your account.</p></header>
    <div className="workspace-grid"><section className="panel request-panel live-response"><div className="card-topline"><span className="micro-label">YOUR REQUEST</span><Badge tone={run.status === 'completed' ? 'success' : run.status === 'running' ? 'neutral' : 'warning'}>{run.status === 'completed' ? 'Completed' : run.status === 'running' ? 'Running' : run.status === 'interrupted' ? 'Interrupted' : 'Failed'}</Badge></div>
      <p className="request-text">{run.prompt}</p><div className="request-divider"><span className="fine-rule" />RESPONSE<span className="fine-rule" /></div>
      {running ? <div className="live-pending" role="status"><span className="live-pending-bar" aria-hidden="true" /><p>Waiting for the provider. This page checks for the saved result.</p></div> : <div className="response-area">{run.answer && <ResponseContent text={run.answer} />}{run.status !== 'completed' && <div className="live-failure" role="alert"><h2>{run.status === 'interrupted' ? 'Execution was interrupted.' : 'The model request did not complete.'}</h2><p>{liveErrorMessage(run.errorCode)}</p><p>The saved request is still here. Usage may be unknown; its reservation stays accounted.</p></div>}{run.finishReason === 'length' && <p className="footnote">The response reached the output limit and may be incomplete.</p>}</div>}
      <div className="response-footer"><span className="status-dot" /><span>Model response · No documentation retrieval · Text filtered before sending and saving</span></div>
      <div className="conversation-actions"><Button ref={renameButton} variant="secondary" size="sm" leadingIcon={Pencil} onClick={() => { setTitle(conversation.title); setError(''); setEditing(true); }}>Rename</Button><Button ref={deleteButton} variant="ghost" size="sm" leadingIcon={Trash2} disabled={running} onClick={() => { setError(''); setDeleting(true); }}>Delete</Button><Link className="text-link" href="/conversations">Saved conversations <ArrowUpRight size={15} /></Link></div>
    </section><aside className="panel inspector" aria-label="Live execution inspector"><div className="inspector-heading"><FileText size={18} /><h2>Inspect</h2><span className="quiet-tag">Live request</span></div><Tabs label="Live execution details" items={[{ value: 'overview', label: 'Overview', content: overview }, { value: 'events', label: 'Events', content: events }]} /></aside></div>
    <Dialog open={editing} onOpenChange={value => { if (!busy) setEditing(value); }} title="Rename conversation" description="Use a short name that will be easy to find later." initialFocus={titleInput} finalFocus={renameButton}><form className="draft-form" onSubmit={event => mutate('PATCH', event)}><Field id="conversation-title" label="Title" required><Input ref={titleInput} value={title} onChange={event => setTitle(event.target.value)} maxLength={80} required disabled={busy} /></Field>{error && <p role="alert" className="storage-error">{error}</p>}<div className="dialog-actions"><Button variant="secondary" disabled={busy} onClick={() => setEditing(false)}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save name'}</Button></div></form></Dialog>
    <Dialog open={deleting} onOpenChange={value => { if (!busy) setDeleting(value); }} title="Delete this conversation?" description="This removes the saved request and response. Its usage still counts toward the daily allowance." finalFocus={deleteButton}>{error && <p role="alert" className="storage-error">{error}</p>}<div className="dialog-actions"><Button variant="secondary" disabled={busy} onClick={() => setDeleting(false)}>Keep conversation</Button><Button disabled={busy} onClick={() => mutate('DELETE')}>{busy ? 'Deleting…' : 'Delete conversation'}</Button></div></Dialog>
  </div>;
}
