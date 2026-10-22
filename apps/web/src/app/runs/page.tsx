import type { Metadata } from 'next';
import { RunLibrary } from '@/components/run-library';
export const metadata: Metadata = { title: 'Sample runs' };
export default function Page() { return <RunLibrary />; }
