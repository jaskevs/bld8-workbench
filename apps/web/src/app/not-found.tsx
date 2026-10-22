import Link from 'next/link';
export default function NotFound() {
  return <section className="panel not-found"><p className="eyebrow">404</p><h1>This page isn’t here.</h1><p>Return to the workspace to inspect a sample or keep working on your draft.</p><Link href="/" className="text-link">Open workspace →</Link></section>;
}
