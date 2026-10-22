export type LiveStatus = 'running' | 'completed' | 'failed' | 'interrupted';
export interface LiveRun {
  id: string;
  conversationId: string | null;
  prompt: string;
  answer: string | null;
  status: LiveStatus;
  model: string;
  responseModel: string | null;
  provider: string;
  inputTokens: number | null;
  outputTokens: number | null;
  estimatedCostMicrousd: number | null;
  accountedMicrousd: number;
  durationMs: number | null;
  providerResponseId: string | null;
  errorCode: string | null;
  finishReason: string | null;
  createdAt: string;
}
export interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}
export interface Submission {
  title: string;
  prompt: string;
  requestId: string;
}
export type ServiceErrorCode = 'invalid_input' | 'sign_in_required' | 'not_allowed' |
  'not_configured' | 'not_found' | 'budget_exceeded' | 'rate_limited' | 'run_in_progress' |
  'request_conflict' | 'provider_failed' | 'provider_timeout' | 'provider_quota' | 'provider_rate_limited' |
  'provider_access' | 'provider_request_rejected' | 'storage_unavailable';
const messages: Record<ServiceErrorCode, string> = {
  invalid_input: 'Check the title and request, then try again.',
  sign_in_required: 'Sign in with GitHub to use saved conversations.',
  not_allowed: 'This account is not enabled for the private preview.',
  not_configured: 'Live requests are not enabled. Review the connection setup.',
  not_found: 'This conversation could not be found.',
  budget_exceeded: 'The daily allowance is reached. No model request was sent.',
  rate_limited: 'Too many requests. Wait a minute and try again.',
  run_in_progress: 'A request is already running. Open it before starting another.',
  request_conflict: 'This request was already submitted with different content.',
  provider_failed: 'The model could not complete this request. Its usage may be unknown.',
  provider_timeout: 'The model request timed out. Its usage may be unknown.',
  provider_quota: 'The provider has no available credits or quota. Check the selected provider account before retrying.',
  provider_rate_limited: 'The provider request or token limit was reached. Wait for its quota to reset before retrying.',
  provider_access: 'The provider did not accept this API key or its permissions. Review the connection setup.',
  provider_request_rejected: 'The provider rejected the configured model request. Review model access and the connection setup.',
  storage_unavailable: 'Saved conversations are temporarily unavailable. Your draft is still here.',
};
export function liveErrorMessage(code: string | null): string {
  return code && Object.hasOwn(messages, code) ? messages[code as ServiceErrorCode] : messages.provider_failed;
}
export class ServiceError extends Error {
  constructor(public code: ServiceErrorCode, public status = 400) { super(messages[code]); }
}
export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
export function parseSubmission(value: unknown): Submission {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ServiceError('invalid_input');
  const record = value as Record<string, unknown>;
  if (Object.keys(record).some(key => !['title', 'prompt', 'requestId'].includes(key))) throw new ServiceError('invalid_input');
  const { title, prompt, requestId } = record;
  if (typeof title !== 'string' || !title.trim() || title.trim().length > 80 ||
      typeof prompt !== 'string' || !prompt.trim() || prompt.length > 4000 || /\u0000/.test(title + prompt) ||
      !isUuid(requestId)) throw new ServiceError('invalid_input');
  return { title: title.trim(), prompt: prompt.trim(), requestId };
}
export function usd(microusd: number | null): string {
  if (microusd === null) return 'Unknown';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4, maximumFractionDigits: 6 }).format(microusd / 1_000_000);
}
