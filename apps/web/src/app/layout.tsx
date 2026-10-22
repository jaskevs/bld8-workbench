import type { Metadata } from 'next';
import '@fontsource-variable/dm-sans';
import '@fontsource-variable/manrope';
import '@/components/ui/bld8/styles.css';
import './theme.css';
import './globals.css';
import { AppFrame } from '@/components/app-frame';

export const metadata: Metadata = {
  title: { default: 'Workbench — BLD8', template: '%s — BLD8 Workbench' },
  description: 'A developer workspace for inspecting AI requests, responses and execution details.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" data-ui-theme="light" data-workbench-theme="cobalt" data-scroll-behavior="smooth"><body><AppFrame>{children}</AppFrame></body></html>;
}
