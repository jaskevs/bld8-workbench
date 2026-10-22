export type SampleStatus = 'completed' | 'failed';
export interface SampleEvent {
  id: string;
  label: string;
  detail: string;
  kind: 'input' | 'model' | 'output' | 'error';
  durationMs: number;
}
export interface RunSample {
  id: string;
  title: string;
  summary: string;
  prompt: string;
  answer: string | null;
  status: SampleStatus;
  error?: string;
  inputTokens: number | null;
  outputTokens: number | null;
  estimatedCostUsd: number | null;
  events: readonly SampleEvent[];
}

// Authored fixtures exercise the shell. They are not model output or recorded runs.
export const samples: readonly RunSample[] = [
  {
    id: 'component-choice', title: 'Choose an interaction',
    summary: 'A short response with the execution details alongside it.',
    prompt: 'When would a dialog be a better choice than a drawer?',
    answer: 'Use a dialog for a focused task that needs an explicit decision before continuing. A drawer is useful when the surrounding page remains part of the task.\n\nFor a destructive confirmation, choose a dialog. For editing a record while checking the table beside it, consider a drawer.\n\nThis is an authored example. It has not been checked against a documentation corpus.',
    status: 'completed', inputTokens: 86, outputTokens: 112, estimatedCostUsd: 0.0004,
    events: [
      { id: 'input', label: 'Request received', detail: 'The sample input passes the example length check.', kind: 'input', durationMs: 12 },
      { id: 'model', label: 'Response prepared', detail: 'Illustrative model step. No provider was contacted.', kind: 'model', durationMs: 824 },
      { id: 'output', label: 'Result returned', detail: 'The authored response is ready to inspect.', kind: 'output', durationMs: 8 },
    ],
  },
  {
    id: 'keyboard-review', title: 'Review keyboard behaviour',
    summary: 'A second sample for inspecting input and response details.',
    prompt: 'What should I check when reviewing keyboard behaviour in a dialog?',
    answer: 'Check where focus lands when the dialog opens, whether Tab and Shift+Tab stay within it, how Escape behaves, and where focus returns when it closes.\n\nMake sure the title is announced and every action has an understandable label. Review the result with a screen reader as well as a keyboard.\n\nThis example has no retrieved sources attached.',
    status: 'completed', inputTokens: 94, outputTokens: 106, estimatedCostUsd: 0.0004,
    events: [
      { id: 'input', label: 'Request received', detail: 'The sample input passes the example length check.', kind: 'input', durationMs: 10 },
      { id: 'model', label: 'Response prepared', detail: 'Illustrative model step. No provider was contacted.', kind: 'model', durationMs: 1024 },
      { id: 'output', label: 'Result returned', detail: 'The authored response is ready to inspect.', kind: 'output', durationMs: 9 },
    ],
  },
  {
    id: 'provider-unavailable', title: 'Handle an unavailable provider',
    summary: 'An explicit failure, with the input kept in view.',
    prompt: 'Summarise the component usage guidance.',
    answer: null, status: 'failed', error: 'The example provider is unavailable. No response was returned. You can replay this failure or inspect another sample.',
    inputTokens: null, outputTokens: null, estimatedCostUsd: null,
    events: [
      { id: 'input', label: 'Request received', detail: 'The input is retained when execution fails.', kind: 'input', durationMs: 11 },
      { id: 'error', label: 'Provider unavailable', detail: 'An authored error fixture. No provider was contacted and usage is unknown.', kind: 'error', durationMs: 1500 },
    ],
  },
];

export function findSample(id: unknown): RunSample | undefined {
  return typeof id === 'string' ? samples.find(sample => sample.id === id) : undefined;
}

export function filterSamples(query: string, status: 'all' | SampleStatus): RunSample[] {
  const search = query.trim().toLocaleLowerCase();
  return samples.filter(sample => (status === 'all' || sample.status === status)
    && `${sample.title} ${sample.prompt}`.toLocaleLowerCase().includes(search));
}

export function formatCost(value: number | null): string {
  return value === null ? 'Unknown' : '$' + value.toFixed(4);
}
