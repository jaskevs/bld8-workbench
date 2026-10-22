'use client';
import { useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpRight, ArrowUp, FileText } from 'lucide-react';
import { Button, Field, Input, Textarea } from '@/components/ui/bld8/core';
import { useDraft } from '@/lib/use-draft';
import { usd, type LiveRun } from '@/domain/live';

export function RequestComposer({ dailyLimit, providerLabel, modelLabel }: { dailyLimit: number; providerLabel: string; modelLabel: string }) {
  const router = useRouter();
  const draft = useDraft();
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const requestId = useRef<string | null>(null);
  function updateTitle(value: string) { setTitle(value); requestId.current = null; }
  function updatePrompt(value: string) { setPrompt(value); requestId.current = null; }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    setError(''); setPending(true);
    requestId.current ??= crypto.randomUUID();
    try {
      const response = await fetch('/api/live/request', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, prompt, requestId: requestId.current }) });
      const body = await response.json();
      if (!response.ok) { setError(body.error?.message ?? 'The request could not be started. Your text is still here.'); return; }
      const run = body as LiveRun;
      if (!run.conversationId) throw new Error('Missing saved conversation');
      router.push(`/conversations/${run.conversationId}`);
    } catch { setError('We could not confirm the result. Check saved conversations before trying again. Your text is still here.'); }
    finally { setPending(false); }
  }
  return <div className="page-stack"><header className="page-heading"><p className="eyebrow">WORKSPACE / NEW REQUEST</p><h1>One question. A clear trail.</h1><p>Send a bounded request to {providerLabel}. The answer and execution details are saved to your account.</p></header>
    <div className="workspace-grid"><section className="panel live-composer"><div className="card-topline"><span className="micro-label">NEW CONVERSATION</span><span className="quiet-tag">{providerLabel} / {modelLabel}</span></div>
      <form onSubmit={submit} className="draft-form" aria-busy={pending}>
        <Field id="live-title" label="Title" required><Input value={title} onChange={event => updateTitle(event.target.value)} maxLength={80} required disabled={pending} placeholder="A short, useful name" /></Field>
        <Field id="live-prompt" label="Question" required hint="No documentation search or tools are connected. Keep credentials and private material out of requests."><Textarea value={prompt} onChange={event => updatePrompt(event.target.value)} maxLength={4000} rows={8} required disabled={pending} placeholder="How should a dialog handle keyboard focus?" /></Field>
        <div className="draft-form-meta"><span>One question and answer per conversation.</span><span>{prompt.length.toLocaleString()} / 4,000</span></div>
        {error && <p role="alert" className="storage-error">{error}</p>}
        {pending && <div className="live-pending" role="status"><span className="live-pending-bar" aria-hidden="true" /><p>Waiting for the model. Your request has a spending reservation.</p></div>}
        <div className="request-actions">{draft && <Button variant="secondary" leadingIcon={FileText} disabled={pending} onClick={() => { updateTitle(draft.title); updatePrompt(draft.prompt); }}>Use local draft</Button>}<Button type="submit" leadingIcon={ArrowUp} disabled={pending}>{pending ? 'Running request…' : 'Send request'}</Button></div>
      </form>
      <Link href="/conversations" className="text-link">Saved conversations <ArrowUpRight size={16} /></Link>
    </section><aside className="panel inspector inspector-empty" aria-label="Request limits"><h2>Small, bounded requests.</h2><p>Your daily allowance is {usd(dailyLimit)} USD. Pending and unknown usage count toward it. The workspace limit is US$5 per day.</p><p>Responses are capped at 1,024 output tokens. Requests time out after 30 seconds and are not automatically retried. Free-plan quotas still apply; cost estimates use published list rates.</p><p>Daily allowances reset at 00:00 UTC. A model response may be incorrect; supporting documentation comes later.</p></aside></div></div>;
}
