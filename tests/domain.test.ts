import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDraft, validateDraft, MAX_PROMPT_LENGTH } from '../apps/web/src/domain/draft';
import { filterSamples, findSample, formatCost, samples } from '../apps/web/src/domain/samples';

test('drafts validate before storage and normalise only the supported fields', () => {
  const raw = JSON.stringify({ version: 1, title: '  Dialog review  ', prompt: ' Check focus return. ', updatedAt: '2026-10-19T00:00:00.000Z', ignored: 'not retained' });
  assert.deepEqual(parseDraft(raw), { version: 1, title: 'Dialog review', prompt: 'Check focus return.', updatedAt: '2026-10-19T00:00:00.000Z' });
  assert.deepEqual(Object.keys(validateDraft(' ', ' ')).sort(), ['prompt', 'title']);
  assert.ok(validateDraft('Valid', 'x'.repeat(MAX_PROMPT_LENGTH + 1)).prompt);
});
test('malformed, oversized and incompatible stored data is ignored safely', () => {
  for (const raw of [null, '', '{', 'null', '[]', '{}', 'x'.repeat(20001), JSON.stringify({ version: 2, title: 'Future', prompt: 'Text', updatedAt: new Date().toISOString() }), JSON.stringify({ version: 1, title: {}, prompt: 'Text', updatedAt: 'not-a-date' })]) {
    assert.equal(parseDraft(raw), null);
  }
});
test('sample IDs and lookups are bounded to the authored fixtures', () => {
  assert.equal(new Set(samples.map(item => item.id)).size, samples.length);
  assert.equal(findSample('component-choice')?.title, 'Choose an interaction');
  for (const id of ['unknown', '../settings', ['component-choice'], undefined, {}]) assert.equal(findSample(id), undefined);
});
test('search and status filters compose without changing the source catalogue', () => {
  assert.equal(filterSamples('  KEYBOARD  ', 'all').length, 1);
  assert.equal(filterSamples('keyboard', 'failed').length, 0);
  assert.equal(filterSamples('', 'failed')[0]?.id, 'provider-unavailable');
  assert.equal(filterSamples('', 'all').length, 3);
});
test('a failed sample does not invent zero usage or a response', () => {
  const failed = findSample('provider-unavailable')!;
  assert.equal(failed.answer, null);
  assert.equal(failed.inputTokens, null);
  assert.equal(failed.outputTokens, null);
  assert.equal(failed.estimatedCostUsd, null);
  assert.equal(formatCost(null), 'Unknown');
  assert.equal(formatCost(0), '$0.0000');
});
