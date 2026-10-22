'use client';
import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowUpRight, FlaskConical, History, Layers3, MessageSquare, Plus, Settings2 } from 'lucide-react';
import { Button, Field, Icon, Input, Textarea } from '@/components/ui/bld8/core';
import { Dialog, UIProvider } from '@/components/ui/bld8/overlays';
import { MAX_PROMPT_LENGTH, MAX_TITLE_LENGTH, validateDraft, type DraftErrors } from '@/domain/draft';
import { saveDraft, useDraft } from '@/lib/use-draft';
import { WorkbenchMark } from '@/components/brand-mark';

const navigation = [
  { href: '/', label: 'Workspace', shortLabel: 'Work', icon: Layers3 },
  { href: '/runs', label: 'Sample runs', shortLabel: 'Samples', icon: History },
  { href: '/conversations', label: 'Conversations', shortLabel: 'Saved', icon: MessageSquare },
  { href: '/settings', label: 'Setup', shortLabel: 'Setup', icon: Settings2 },
];

function Frame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const liveView = pathname.startsWith('/conversations');
  const router = useRouter();
  const draft = useDraft();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [errors, setErrors] = useState<DraftErrors>({});
  const [storageError, setStorageError] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const newButton = useRef<HTMLButtonElement>(null);

  function openDraft() {
    setTitle(draft?.title ?? '');
    setPrompt(draft?.prompt ?? '');
    setErrors({});
    setStorageError('');
    setOpen(true);
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateDraft(title, prompt);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      (nextErrors.title ? titleRef.current : promptRef.current)?.focus();
      return;
    }
    if (!saveDraft({ version: 1, title: title.trim(), prompt: prompt.trim(), updatedAt: new Date().toISOString() })) {
      setStorageError('This browser could not save the draft. Your text is still here; try again or copy it before closing.');
      return;
    }
    setOpen(false);
    router.push('/?draft=1');
  }

  return <div className="app-shell">
    <a href="#main" className="skip-link">Skip to content</a>
    <aside className="sidebar" aria-label="Workspace sidebar">
      <Link href="/" className="brand"><span className="brand-mark"><WorkbenchMark /></span><span className="brand-wordmark"><strong>Workbench</strong>{' '}<small>by BLD8</small></span></Link>
      <div className="sidebar-caption">YOUR WORKSPACE</div>
      <nav aria-label="Main navigation">{navigation.map(item => <Link key={item.href} href={item.href} aria-current={(pathname === item.href || (item.href === '/conversations' && liveView)) ? 'page' : undefined} className="nav-link"><Icon icon={item.icon} size={18} /><span className="nav-full-label">{item.label}</span><span className="nav-short-label">{item.shortLabel}</span>{(pathname === item.href || (item.href === '/conversations' && liveView)) && <span className="nav-indicator" aria-hidden="true" />}</Link>)}</nav>
      <div className="sidebar-note"><FlaskConical size={18} /><strong>Room to inspect.</strong><p>Requests, responses and the details between them.</p><Link href="https://bld8.dev" className="text-link">Back to BLD8 <ArrowUpRight size={14} /></Link></div>
      <div className="sidebar-bottom"><span className="status-dot" /><span>Development preview</span><span className="version-label">0.1</span></div>
    </aside>
    <div className="app-body"><header className="topbar"><div className="topbar-location"><span>Workbench</span><span aria-hidden="true">/</span><strong>{navigation.find(item => item.href === pathname)?.label ?? (liveView ? 'Conversations' : 'Workspace')}</strong></div><div className="topbar-actions"><span className="quiet-tag desktop-label">{liveView ? 'Private preview' : 'Local preview'}</span><Button ref={newButton} size="sm" leadingIcon={Plus} onClick={liveView ? () => router.push('/conversations/new') : openDraft}>{!liveView && draft ? 'Edit draft' : 'New request'}</Button></div></header><main id="main" tabIndex={-1}>{children}</main><footer className="app-footer"><span>Built with BLD8 UI</span><span>{liveView ? 'Private conversations · Bounded model requests' : 'Sample data · No live model calls'}</span></footer></div>
    <Dialog open={open} onOpenChange={setOpen} title={draft ? 'Edit request draft' : 'New request'} description="Keep one draft in this browser. Open a private request to send it to the selected model." initialFocus={titleRef} finalFocus={newButton}>
      <form onSubmit={submit} noValidate className="draft-form"><Field label="Title" id="draft-title" error={errors.title} required><Input ref={titleRef} value={title} maxLength={MAX_TITLE_LENGTH} onChange={event => setTitle(event.target.value)} autoComplete="off" placeholder="A short, useful name" /></Field><Field label="Request" id="draft-prompt" error={errors.prompt} required hint="Stored locally. Keep credentials and sensitive material out of drafts."><Textarea ref={promptRef} value={prompt} rows={6} maxLength={MAX_PROMPT_LENGTH} onChange={event => setPrompt(event.target.value)} placeholder="What would you like to work through?" /></Field><div className="draft-form-meta"><span>Saving replaces the previous local draft.</span><span>{prompt.length.toLocaleString()} / 4,000</span></div>{storageError && <p className="storage-error" role="alert">{storageError}</p>}<div className="dialog-actions"><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" variant="accent">Save draft</Button></div></form>
    </Dialog>
  </div>;
}

export function AppFrame({ children }: { children: ReactNode }) {
  return <UIProvider><Frame>{children}</Frame></UIProvider>;
}
