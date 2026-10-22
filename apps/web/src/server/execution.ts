import { performance } from 'node:perf_hooks';
import { ServiceError, parseSubmission, type Submission } from '../domain/live';
import { INSTRUCTIONS, MAX_OUTPUT_TOKENS, MODELS, type ModelProfile, type ServiceConfig } from './config-core';
import { redactText, safeProviderId, safeModelId } from './redaction';
import type { WorkbenchRepository } from './repository';

export interface ModelResult {
  text: string;
  modelId: string;
  responseId: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  cacheReadTokens: number | null;
  cacheWriteTokens: number | null;
  finishReason: string;
}
export type ModelCall = (prompt: string) => Promise<ModelResult>;
export function reservationFor(prompt: string, profile: ModelProfile = MODELS.openai): number {
  const PRICING = profile.pricing;
  // A byte bound rather than an English token heuristic; one text message, no history/tools.
  const inputBound = Buffer.byteLength(prompt + INSTRUCTIONS, 'utf8') + 1024;
  return Math.max(1, Math.ceil(inputBound * PRICING.cacheWrite + MAX_OUTPUT_TOKENS * PRICING.output));
}
function knownTokens(value: number | null) { return value !== null && Number.isSafeInteger(value) && value >= 0; }
export function estimateCost(result: ModelResult, profile: ModelProfile = MODELS.openai): number | null {
  const PRICING = profile.pricing;
  const matchesModel = result.modelId === profile.model || (profile.provider === 'openai' && result.modelId.startsWith(profile.model + '-'));
  if (!knownTokens(result.inputTokens) || !knownTokens(result.outputTokens) || !matchesModel) return null;
  const input = result.inputTokens!;
  if (!knownTokens(result.cacheReadTokens) || !knownTokens(result.cacheWriteTokens) || result.cacheReadTokens! + result.cacheWriteTokens! > input) {
    return Math.ceil(input * PRICING.cacheWrite + result.outputTokens! * PRICING.output);
  }
  return Math.ceil((input - result.cacheReadTokens! - result.cacheWriteTokens!) * PRICING.input +
    result.cacheReadTokens! * PRICING.cacheRead + result.cacheWriteTokens! * PRICING.cacheWrite + result.outputTokens! * PRICING.output);
}
export async function executeRequest(owner: string, value: unknown, config: ServiceConfig, repository: WorkbenchRepository, call: ModelCall) {
  if (!config.liveEnabled) throw new ServiceError('not_configured', 503);
  const parsed = parseSubmission(value);
  const submission: Submission = { ...parsed, title: redactText(parsed.title).slice(0, 80), prompt: redactText(parsed.prompt) };
  const reserved = await repository.reserve(owner, submission, reservationFor(submission.prompt, config.modelConfig), config, config.modelConfig);
  if (!reserved.isNew) return reserved.run;
  const started = performance.now();
  let result: ModelResult;
  try { result = await call(submission.prompt); }
  catch (error) {
    return repository.finish(owner, reserved.run.id, { answer: null, status: 'failed', responseModel: null,
      providerResponseId: null, inputTokens: null, outputTokens: null, estimatedCostMicrousd: null,
      durationMs: Math.round(performance.now() - started), finishReason: null,
      errorCode: error instanceof ServiceError && ['provider_quota', 'provider_rate_limited', 'provider_access', 'provider_request_rejected'].includes(error.code)
        ? error.code : error instanceof Error && ['AbortError', 'TimeoutError'].includes(error.name) ? 'provider_timeout' : 'provider_failed'  });
  }
  // Persist only allowlisted metadata and filtered text, never SDK bodies, headers or reasoning.
  const successful = Boolean(result.text.trim()) && ['stop', 'length'].includes(result.finishReason);
  return repository.finish(owner, reserved.run.id, { answer: result.text ? redactText(result.text) : null,
    status: successful ? 'completed' : 'failed', responseModel: safeModelId(result.modelId), providerResponseId: safeProviderId(result.responseId),
    inputTokens: knownTokens(result.inputTokens) ? result.inputTokens : null, outputTokens: knownTokens(result.outputTokens) ? result.outputTokens : null,
    estimatedCostMicrousd: estimateCost(result, config.modelConfig), durationMs: Math.round(performance.now() - started),
    errorCode: successful ? null : 'provider_failed', finishReason: ['stop', 'length', 'content-filter', 'error', 'other'].includes(result.finishReason) ? result.finishReason : 'other' });
}
