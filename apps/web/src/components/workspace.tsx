'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight, Check, CircleDashed, Clock3, FileText, Layers3, Play, RotateCcw, Square, X } from 'lucide-react';
import { Badge, Button, Icon } from '@/components/ui/bld8/core';
import { Tabs } from '@/components/ui/bld8/controls';
import { formatCost, samples, type RunSample } from '@/domain/samples';
import { useDraft } from '@/lib/use-draft';

type Playback = 'ready' | 'playing' | 'cancelled' | 'finished';

function TraceInspector({ sample, visibleEvents, playing }: { sample: RunSample; visibleEvents: number; playing: boolean }) {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const event = sample.events.find(item => item.id === selectedEvent);
  const overview = <div className="inspector-content"><div className="inspector-description"><span className="micro-label">EXECUTION</span><h3>Small details, in view.</h3><p>Illustrative timing and usage for this sample. No provider has been contacted.</p></div><dl className="metric-list"><div><dt>Duration</dt><dd>{playing ? 'Replaying…' : sample.events.reduce((total, item) => total + item.durationMs, 0).toLocaleString() + ' ms'}</dd></div><div><dt>Input tokens</dt><dd>{sample.inputTokens ?? 'Unknown'}</dd></div><div><dt>Output tokens</dt><dd>{sample.outputTokens ?? 'Unknown'}</dd></div><div><dt>Estimated cost</dt><dd>{formatCost(sample.estimatedCostUsd)}{sample.estimatedCostUsd !== null && <span>USD</span>}</dd></div></dl><div className="inspector-note"><Layers3 size={17} /><div><strong>Sources come later.</strong><p>No corpus, retrieval or citations are connected in this version.</p></div></div><p className="footnote">Values are authored examples, not measured usage. Unknown usage stays unknown.</p></div>;
  const events = <div className="inspector-content"><p className="footnote">Select a step to inspect its details. Durations are illustrative.</p><ol className="event-list">{sample.events.map((item, index) => <li key={item.id}><button type="button" className="event-button" disabled={index >= visibleEvents} aria-pressed={selectedEvent === item.id} onClick={() => setSelectedEvent(item.id)}><span className={'event-symbol' + (item.kind === 'error' ? ' event-error' : '')}><Icon icon={item.kind === 'error' ? X : Check} size={13} /></span><span>{item.label}<small>{item.kind}</small></span><time>{item.durationMs} ms</time></button></li>)}</ol>{event && <div className="event-detail"><span className="micro-label">STEP DETAIL</span><h3>{event.label}</h3><p>{event.detail}</p></div>}</div>;
  const input = <div className="inspector-content"><span className="micro-label">SAMPLE INPUT</span><p className="input-preview">{sample.prompt}</p><dl className="metric-list"><div><dt>Execution mode</dt><dd>Sample</dd></div><div><dt>Provider</dt><dd>Not connected</dd></div><div><dt>Tools</dt><dd>None enabled</dd></div></dl><p className="footnote">This input belongs to the selected fixture. Your request draft is stored separately.</p></div>;
  return <aside className="panel inspector" aria-label="Execution inspector"><div className="inspector-heading"><span className="section-icon"><FileText size={18} /></span><h2>Inspect</h2><span className="quiet-tag">Sample</span></div><Tabs label="Execution details" items={[{ value: 'overview', label: 'Overview', content: overview }, { value: 'events', label: 'Events', content: events }, { value: 'input', label: 'Input', content: input }]} /></aside>;
}

export function Workspace({ sample, draftMode }: { sample: RunSample; draftMode: boolean }) {
  const [playback, setPlayback] = useState<Playback>('ready');
  const [visibleEvents, setVisibleEvents] = useState(sample.events.length);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const draft = useDraft();
  const playing = playback === 'playing';
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function clearTimers() { timers.current.forEach(clearTimeout); timers.current = []; }
  function replay() {
    clearTimers();
    setPlayback('playing');
    setVisibleEvents(0);
    sample.events.forEach((_, index) => timers.current.push(setTimeout(() => setVisibleEvents(index + 1), 250 + index * 350)));
    timers.current.push(setTimeout(() => { setPlayback('finished'); timers.current = []; }, 350 + sample.events.length * 350));
  }
  function cancel() { clearTimers(); setPlayback('cancelled'); }

  if (draftMode) return <div className="page-stack"><header className="page-heading"><p className="eyebrow">WORKSPACE / REQUEST DRAFT</p><h1>{draft?.title ?? 'Your next request.'}</h1><p>A draft saved only in this browser.</p></header><div className="workspace-grid"><section className="panel draft-view"><div className="card-topline"><span className="micro-label">REQUEST</span><Badge>Browser only</Badge></div>{draft ? <><p className="request-text">{draft.prompt}</p><div className="draft-saved"><Check size={16} /><span>Saved in this browser. Use Edit draft to make changes.</span></div></> : <div className="empty-draft"><CircleDashed size={30} /><h2>No saved draft here.</h2><p>Use New request to keep a draft in this browser, or explore a sample.</p></div>}<div className="draft-next"><h2>Run it as a private request.</h2><p>Your draft stays in this browser until you open a private request, select Use local draft and send it.</p><Link href="/conversations/new" className="text-link">Open a private request <ArrowUpRight size={16} /></Link></div></section><aside className="panel inspector inspector-empty" aria-label="Execution inspector"><span className="empty-inspector-mark"><Layers3 size={26} /></span><h2>No execution yet.</h2><p>A saved draft has no trace, usage or response. Explore an authored sample to see the inspection layout.</p><Link href="/" className="text-link">Inspect a sample <ArrowUpRight size={16} /></Link></aside></div></div>;

  const responseVisible = !playing && playback !== 'cancelled';
  const statusLabel = playing ? 'Replaying' : playback === 'cancelled' ? 'Stopped' : sample.status === 'failed' ? 'Failed sample' : 'Complete sample';
  return <div className="page-stack"><header className="page-heading"><div className="heading-topline"><p className="eyebrow">WORKSPACE / OVERVIEW</p><span className="index-mark">01 — INSPECT</span></div><h1>Follow the request.<br /><span className="heading-muted">Keep the details.</span></h1><p>Inspect an AI request, its response, the steps taken and the cost. This preview uses authored samples.</p></header>
    <div className="workspace-grid"><section className="panel request-panel" aria-labelledby="request-title"><div className="card-topline"><span className="micro-label">SAMPLE REQUEST</span><Badge tone={sample.status === 'failed' && !playing ? 'warning' : 'neutral'}>{statusLabel}</Badge></div><h2 id="request-title">{sample.title}</h2><p className="request-text">{sample.prompt}</p><div className="request-meta"><span><Clock3 size={14} />Illustrative execution</span><span>No live model calls</span></div><div className="request-actions">{playing ? <Button variant="secondary" leadingIcon={Square} onClick={cancel}>Stop replay</Button> : <Button leadingIcon={playback === 'ready' ? Play : RotateCcw} onClick={replay}>{playback === 'ready' ? 'Replay sample' : 'Replay again'}</Button>}<Link href="/runs" className="text-link">All samples <ArrowUpRight size={15} /></Link></div><div className="request-divider"><ArrowDown size={15} /><span>RESPONSE</span><span className="fine-rule" /></div>
      <div className="response-area" aria-busy={playing}><p className="playback-status sr-only" role="status">{playing ? `Replaying step ${visibleEvents} of ${sample.events.length}` : playback === 'cancelled' ? 'Replay stopped. The sample input is unchanged.' : playback === 'finished' ? 'Replay finished.' : 'Sample ready to inspect.'}</p>{playing ? <div className="replay-progress"><div className="replay-bar" style={{ '--replay-progress': `${visibleEvents / sample.events.length * 100}%` } as React.CSSProperties} /><span>{sample.events[Math.max(0, visibleEvents - 1)].label}</span><p>The authored fixture is replaying locally.</p></div> : playback === 'cancelled' ? <div className="replay-stopped"><Square size={23} /><h3>Replay stopped.</h3><p>The input is unchanged. Replay again when you’re ready.</p></div> : sample.status === 'failed' ? <div className="sample-error" role="alert"><span className="event-symbol event-error"><X size={15} /></span><div><h3>No response returned.</h3><p>{sample.error}</p></div></div> : responseVisible && <div className="sample-answer">{sample.answer?.split('\n\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>}</div><div className="response-footer"><span className="status-dot" /><span>Authored sample · Source retrieval is not connected</span></div></section><TraceInspector sample={sample} visibleEvents={visibleEvents} playing={playing} /></div>
    <section className="sample-section" aria-labelledby="explore-title"><div className="sample-section-heading"><h2 id="explore-title">A few paths to explore.</h2><span>Small examples. Different states.</span></div><div className="sample-grid">{samples.map((item, index) => <Link href={`/?sample=${item.id}`} key={item.id} className="sample-card" aria-current={item.id === sample.id ? 'true' : undefined}><span className="micro-label">0{index + 1} / {item.status === 'failed' ? 'RECOVERY' : 'INSPECTION'}</span><div><h3>{item.title}</h3><ArrowUpRight size={17} /></div><p>{item.summary}</p></Link>)}</div></section>
  </div>;
}
