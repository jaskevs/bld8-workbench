import { Workspace } from '@/components/workspace';
import { findSample, samples } from '@/domain/samples';

export default async function Page({ searchParams }: {
  searchParams: Promise<{ sample?: string | string[]; draft?: string | string[] }>;
}) {
  const query = await searchParams;
  const sample = findSample(query.sample) ?? samples[0];
  return <Workspace key={query.draft === '1' ? 'draft' : sample.id} sample={sample} draftMode={query.draft === '1'} />;
}
