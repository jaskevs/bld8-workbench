'use client';

import { isValidElement, useEffect, useRef, useState, type ReactNode } from 'react';
import Markdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/bld8/core';

function CopyAction({ text, label }: { text: string; label: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'error'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  async function copy() {
    if (timer.current) clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(text);
      setState('copied');
      timer.current = setTimeout(() => setState('idle'), 2200);
    } catch { setState('error'); }
  }

  return <div className="response-copy-action">
    <Button variant="ghost" size="sm" leadingIcon={state === 'copied' ? Check : Copy} onClick={copy}>
      {state === 'copied' ? 'Copied' : label}
    </Button>
    <span role="status" className={state === 'error' ? 'response-copy-error' : 'sr-only'}>
      {state === 'error' ? 'Copy unavailable. You can select and copy the text.' : state === 'copied' ? `${label === 'Copy code' ? 'Code' : 'Response'} copied to clipboard.` : ''}
    </span>
  </div>;
}

function CodeBlock({ children }: { children?: ReactNode }) {
  const props = isValidElement<{ children?: ReactNode; className?: string }>(children) ? children.props : undefined;
  const text = typeof props?.children === 'string' ? props.children : '';
  const language = props?.className?.match(/language-([\w+-]+)/)?.[1] ?? '';
  return <div className="response-code-block">
    <div className="response-code-toolbar"><span>{language || 'Code'}</span><CopyAction text={text} label="Copy code" /></div>
    <pre tabIndex={0} role="region" aria-label={language ? `${language} code` : 'Code block'}>{children}</pre>
  </div>;
}

// Model text never enables HTML, embedded media, or executable URL schemes.
function responseUrl(url: string, key: string): string {
  if (key !== 'href') return '';
  if (/^#[a-zA-Z][\w:.-]*$/.test(url)) return url;
  try {
    const parsed = new URL(url);
    return ['https:', 'http:'].includes(parsed.protocol) && !parsed.username && !parsed.password ? parsed.href : '';
  } catch { return ''; }
}

const components: Components = {
  h1: ({ children, id, className }) => <h2 id={id} className={className}>{children}</h2>,
  h2: ({ children, id, className }) => <h3 id={id} className={className}>{children}</h3>,
  h3: ({ children, id, className }) => <h4 id={id} className={className}>{children}</h4>,
  h4: ({ children, id, className }) => <h5 id={id} className={className}>{children}</h5>,
  h5: ({ children, id, className }) => <h6 id={id} className={className}>{children}</h6>,
  pre: CodeBlock,
  a: ({ href, title, children, id, 'aria-label': label, 'aria-describedby': description }) => {
    if (!href) return <span>{children}</span>;
    const external = !href.startsWith('#');
    return <a href={href} title={title} id={id} aria-label={label} aria-describedby={description}
      target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>
      {children}{external && <span className="sr-only"> (opens in a new tab)</span>}
    </a>;
  },
  img: ({ alt }) => <span className="response-image-note">{alt ? `[Image: ${alt}]` : '[Image omitted]'}</span>,
  input: ({ checked }) => <span className="response-task-marker" role="img" aria-label={checked ? 'Completed' : 'Not completed'}>{checked ? '✓' : '–'}</span>,
  table: ({ children }) => <div className="response-table-scroll" tabIndex={0} role="region" aria-label="Response table"><table>{children}</table></div>,
};

export function ResponseContent({ text }: { text: string }) {
  return <div className="response-content">
    <div className="response-markdown"><Markdown skipHtml remarkPlugins={[remarkGfm]} urlTransform={responseUrl} components={components}>{text}</Markdown></div>
    <div className="response-tools"><CopyAction text={text} label="Copy response" /></div>
  </div>;
}
