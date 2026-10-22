import { createOpenAI } from '@ai-sdk/openai';
import { createGroq } from '@ai-sdk/groq';
import { APICallError, generateText } from 'ai';
import { INSTRUCTIONS, MAX_OUTPUT_TOKENS, MODELS, type ModelProfile } from './config-core';
import { ServiceError } from '../domain/live';
import { safeProviderId } from './redaction';
import type { ModelCall } from './execution';

function providerFailure(error: unknown): never {
  if (APICallError.isInstance(error)) {
    const detail = error.data as { error?: { code?: unknown; type?: unknown } } | undefined;
    const code = detail?.error?.code;
    const type = detail?.error?.type;
    if (['insufficient_quota', 'credit_balance_exhausted', 'organization_spend_limit_exceeded', 'project_spend_limit_exceeded', 'organization_usage_limit_exceeded'].includes(String(code)) || type === 'insufficient_quota') throw new ServiceError('provider_quota', 503);
    if (error.statusCode === 429) throw new ServiceError('provider_rate_limited', 429);
    if (error.statusCode === 401 || error.statusCode === 403) throw new ServiceError('provider_access', 503);
    if (error.statusCode === 400 || error.statusCode === 404) throw new ServiceError('provider_request_rejected', 503);
  }
  throw error;
}
export function createModelCall(apiKey: string, transport?: typeof fetch, profile: ModelProfile = MODELS.openai): ModelCall {
  const connection = { apiKey, ...(transport ? { fetch: transport } : {}) };
  // Construct only the chosen provider. Neither path can fall back to another account.
  const model = profile.provider === 'groq'
    ? createGroq({ ...connection, baseURL: 'https://api.groq.com/openai/v1' })(profile.model)
    : createOpenAI({ ...connection, baseURL: 'https://api.openai.com/v1' }).responses(profile.model);
  return async prompt => {
    try {
      const result = await generateText({
        model, instructions: INSTRUCTIONS, prompt,
        maxOutputTokens: MAX_OUTPUT_TOKENS, maxRetries: 0, abortSignal: AbortSignal.timeout(30_000),
        providerOptions: profile.provider === 'groq'
          ? { groq: { reasoningFormat: 'hidden', reasoningEffort: 'low', serviceTier: 'on_demand' } }
          : { openai: { store: false, serviceTier: 'default', reasoningEffort: 'none' } },
      });
      return { text: result.text, modelId: result.response.modelId, responseId: safeProviderId(result.response.id),
        inputTokens: result.usage.inputTokens ?? null, outputTokens: result.usage.outputTokens ?? null,
        cacheReadTokens: result.usage.inputTokenDetails.cacheReadTokens ?? null,
        cacheWriteTokens: result.usage.inputTokenDetails.cacheWriteTokens ?? null,
        finishReason: result.finishReason };
    } catch (error) { return providerFailure(error); }
  };
}
