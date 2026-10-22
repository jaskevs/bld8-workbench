export type ModelProvider = 'openai' | 'groq';
export interface ModelProfile {
  provider: ModelProvider;
  providerLabel: string;
  model: string;
  label: string;
  pricing: { input: number; cacheRead: number; cacheWrite: number; output: number; reviewedOn: string };
}
export const MODELS: Record<ModelProvider, ModelProfile> = {
  openai: {
    provider: 'openai', providerLabel: 'OpenAI', model: 'gpt-6-luna', label: 'GPT-6 Luna',
    // Standard short-context USD per million tokens.
    // https://developers.openai.com/api/docs/models/gpt-6-luna
    pricing: { input: 0.10, cacheRead: 0.01, cacheWrite: 0.125, output: 0.50, reviewedOn: '2026-10-19' },
  },
  groq: {
    provider: 'groq', providerLabel: 'Groq', model: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B',
    // Published on-demand list rates; Free plan charges differ within its quota.
    // https://console.groq.com/docs/model/openai/gpt-oss-120b
    pricing: { input: 0.15, cacheRead: 0.075, cacheWrite: 0.15, output: 0.60, reviewedOn: '2026-10-22' },
  },
};
export const MODEL = MODELS.openai.model;
export const MODEL_LABEL = MODELS.openai.label;
export const PRICING = MODELS.openai.pricing;
export const MAX_OUTPUT_TOKENS = 1024;
export const INSTRUCTIONS = 'You help developers reason about interface components and application engineering. Be concise and distinguish facts from assumptions. No documentation retrieval or tools are connected. Do not invent citations, claim to have inspected files, or claim to have run actions. State when source material is needed.';
export interface ServiceConfig {
  origin: string;
  allowedGitHubIds: string[];
  authReady: boolean;
  databaseReady: boolean;
  modelReady: boolean;
  liveEnabled: boolean;
  dailyUserMicrousd: number;
  dailyAppMicrousd: number;
  databaseUrl: string;
  openaiKey: string;
  groqKey: string;
  modelConfig: ModelProfile;
}
function dollars(value: string | undefined, fallback: number, ceiling: number) {
  const parsed = value === undefined || value === '' ? fallback : Number(value);
  return Number.isFinite(parsed) && parsed > 0 && parsed <= ceiling ? Math.floor(parsed * 1_000_000) : 0;
}
export function parseServiceConfig(env: Record<string, string | undefined>): ServiceConfig {
  const allowedGitHubIds = (env.WORKBENCH_ALLOWED_GITHUB_IDS ?? '').split(',').map(id => id.trim()).filter(id => /^\d+$/.test(id));
  const authReady = Boolean(env.AUTH_SECRET && env.AUTH_SECRET.length >= 32 && env.AUTH_GITHUB_ID && env.AUTH_GITHUB_SECRET && allowedGitHubIds.length);
  const databaseUrl = env.DATABASE_URL ?? '';
  let databaseReady = false;
  try { const url = new URL(databaseUrl); databaseReady = ['postgres:', 'postgresql:'].includes(url.protocol) && Boolean(url.hostname && url.pathname !== '/'); } catch {}
  let origin = '';
  try { const url = new URL(env.AUTH_URL ?? 'http://127.0.0.1:3135');
    if ((url.protocol === 'https:' || (url.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(url.hostname))) && url.pathname === '/' && !url.username && !url.password) origin = url.origin;
  } catch {}
  const dailyUserMicrousd = dollars(env.WORKBENCH_DAILY_USER_USD, 1, 1);
  const dailyAppMicrousd = dollars(env.WORKBENCH_DAILY_APP_USD, 5, 5);
  const selected = env.WORKBENCH_PROVIDER ?? 'openai';
  const validProvider = selected === 'openai' || selected === 'groq';
  const modelConfig = MODELS[selected === 'groq' ? 'groq' : 'openai'];
  const pricingAge = (Date.now() - Date.parse(modelConfig.pricing.reviewedOn)) / 86_400_000;
  const selectedKey = selected === 'groq' ? env.GROQ_API_KEY : env.OPENAI_API_KEY;
  const modelReady = Boolean(validProvider && selectedKey && (env.WORKBENCH_MODEL ?? modelConfig.model) === modelConfig.model && pricingAge >= 0 && pricingAge <= 30);
  return { origin, allowedGitHubIds, authReady, databaseReady, modelReady, modelConfig,
    liveEnabled: env.WORKBENCH_LIVE_ENABLED === 'true' && authReady && databaseReady && modelReady && Boolean(origin && dailyUserMicrousd && dailyAppMicrousd),
    dailyUserMicrousd, dailyAppMicrousd, databaseUrl, openaiKey: env.OPENAI_API_KEY ?? '', groqKey: env.GROQ_API_KEY ?? '' };
}
