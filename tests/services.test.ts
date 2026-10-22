import { after, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { createPool } from '../apps/web/src/server/database';
import { WorkbenchRepository, type Completion } from '../apps/web/src/server/repository';
import { executeRequest, estimateCost, reservationFor, type ModelResult } from '../apps/web/src/server/execution';
import { MODEL, MODELS, parseServiceConfig, type ServiceConfig } from '../apps/web/src/server/config-core';
import { createModelCall } from '../apps/web/src/server/provider';
import { redactText } from '../apps/web/src/server/redaction';
import { parseSubmission, ServiceError, type Submission } from '../apps/web/src/domain/live';

const url = process.env.WORKBENCH_TEST_DATABASE_URL;
if (!url) throw new Error('WORKBENCH_TEST_DATABASE_URL must target a disposable loopback database ending in _test.');
const pool = createPool(url, true);
const repository = new WorkbenchRepository(pool);
const limits = { dailyUserMicrousd: 1_000_000, dailyAppMicrousd: 5_000_000 };
const config: ServiceConfig = { ...limits, origin: 'http://127.0.0.1:3135', allowedGitHubIds: ['100', '200'],
  authReady: true, databaseReady: true, modelReady: true, liveEnabled: true, databaseUrl: url, openaiKey: '', groqKey: '', modelConfig: MODELS.openai };
function submission(overrides: Partial<Submission> = {}): Submission {
  return { title: 'Keyboard focus', prompt: 'Explain focus return after a dialog closes.', requestId: randomUUID(), ...overrides };
}
function result(overrides: Partial<ModelResult> = {}): ModelResult {
  return { text: 'Return focus to the opening control.', modelId: MODEL, responseId: 'resp_fixture',
    inputTokens: 100, outputTokens: 20, cacheReadTokens: 0, cacheWriteTokens: 0, finishReason: 'stop', ...overrides };
}
function completion(cost: number | null): Completion {
  return { answer: 'A fixture response.', status: 'completed', responseModel: MODEL, providerResponseId: 'resp_fixture',
    inputTokens: cost === null ? null : 100, outputTokens: cost === null ? null : 20, estimatedCostMicrousd: cost,
    durationMs: 10, errorCode: null, finishReason: 'stop' };
}
function hasCode(code: string) { return (error: unknown) => error instanceof ServiceError && error.code === code; }
async function accounted() { return Number((await pool.query('SELECT COALESCE(sum(accounted_microusd),0)::text AS value FROM wb_budget_days')).rows[0].value); }

before(async () => {
  const existing = await pool.query("SELECT to_regclass('public.wb_schema_version') AS name");
  if (!existing.rows[0].name) await pool.query(await readFile(new URL('../apps/web/migrations/001_conversations.sql', import.meta.url), 'utf8'));
  assert.equal((await pool.query('SELECT version FROM wb_schema_version')).rows[0].version, 1);
});
beforeEach(async () => { await pool.query('TRUNCATE wb_runs,wb_conversations,wb_budget_days,wb_user_budget_days'); });
after(async () => { await pool.end(); });

test('configuration fails closed and accepts only lowered approved budgets', () => {
  assert.equal(parseServiceConfig({}).liveEnabled, false);
  const env = { AUTH_SECRET: 'x'.repeat(48), AUTH_GITHUB_ID: 'client', AUTH_GITHUB_SECRET: 'secret',
    AUTH_URL: 'http://127.0.0.1:3135', WORKBENCH_ALLOWED_GITHUB_IDS: '100', DATABASE_URL: url,
    OPENAI_API_KEY: 'test-key-not-sent', WORKBENCH_LIVE_ENABLED: 'true' };
  const ready = parseServiceConfig(env);
  assert.equal(ready.liveEnabled, true);
  assert.equal(ready.dailyUserMicrousd, 1_000_000);
  assert.equal(ready.dailyAppMicrousd, 5_000_000);
  for (const change of [{ WORKBENCH_DAILY_USER_USD: '2' }, { WORKBENCH_DAILY_APP_USD: '6' }, { WORKBENCH_DAILY_USER_USD: '-1' },
    { WORKBENCH_MODEL: 'unreviewed-model' }, { WORKBENCH_ALLOWED_GITHUB_IDS: '' }, { AUTH_URL: 'http://public.example' }]) {
    assert.equal(parseServiceConfig({ ...env, ...change }).liveEnabled, false);
  }
});

test('server validation rejects owner, model and tool overrides and bounds Unicode text', () => {
  for (const value of [{ ...submission(), owner: 'github:200' }, { ...submission(), model: 'other' }, { ...submission(), tools: [] },
    { ...submission(), prompt: 'x'.repeat(4001) }, { ...submission(), title: '\0' }, { ...submission(), requestId: 'invalid' }]) {
    assert.throws(() => parseSubmission(value), hasCode('invalid_input'));
  }
  assert.equal(parseSubmission(submission({ prompt: '🎨'.repeat(1000) })).prompt.length, 2000);
  assert.ok(reservationFor('🎨'.repeat(1000)) > reservationFor('x'.repeat(1000)));
});

test('all reads, renames and deletes enforce owner identity, including guessed IDs', async () => {
  const stored = await executeRequest('github:100', submission(), config, repository, async () => result());
  assert.equal((await repository.list('github:100')).length, 1);
  assert.deepEqual(await repository.list('github:200'), []);
  await assert.rejects(repository.read('github:200', stored.conversationId!), hasCode('not_found'));
  await assert.rejects(repository.rename('github:200', stored.conversationId!, 'Stolen'), hasCode('not_found'));
  await assert.rejects(repository.remove('github:200', stored.conversationId!), hasCode('not_found'));
  await assert.rejects(repository.list(''), hasCode('sign_in_required'));
  const renamed = await repository.rename('github:100', stored.conversationId!, 'Reviewed');
  assert.equal(renamed.title, 'Reviewed');
  const read = await repository.read('github:100', stored.conversationId!);
  assert.equal(read.runs[0].answer, result().text);
  await assert.rejects(pool.query('UPDATE wb_runs SET owner_id=$1 WHERE id=$2', ['github:200', stored.id]));
});

test('parallel duplicate submissions call the provider once and reconcile once', async () => {
  let calls = 0;
  const input = submission();
  const model = async () => { calls++; await delay(30); return result(); };
  const results = await Promise.all([executeRequest('github:100', input, config, repository, model), executeRequest('github:100', input, config, repository, model)]);
  assert.equal(calls, 1);
  assert.equal(results[0].id, results[1].id);
  const saved = await repository.read('github:100', results[0].conversationId!);
  assert.equal(saved.runs.length, 1);
  assert.equal(saved.runs[0].status, 'completed');
  assert.equal(await accounted(), estimateCost(result()));
  await repository.finish('github:100', saved.runs[0].id, completion(0));
  assert.equal(await accounted(), estimateCost(result()));
  await assert.rejects(executeRequest('github:100', { ...input, prompt: 'Different content' }, config, repository, model), hasCode('request_conflict'));
  assert.equal(calls, 1);
});

test('simultaneous users cannot spend the same remaining global allowance', async () => {
  const outcomes = await Promise.allSettled([100, 200, 300].map(owner => repository.reserve(`github:${owner}`, submission(), 600,
    { dailyUserMicrousd: 1000, dailyAppMicrousd: 1000 })));
  assert.equal(outcomes.filter(item => item.status === 'fulfilled').length, 1);
  for (const item of outcomes) if (item.status === 'rejected') assert.ok(hasCode('budget_exceeded')(item.reason));
  assert.equal(await accounted(), 600);
});

test('per-user allowance rejects a call before starting the model', async () => {
  const reserved = await repository.reserve('github:100', submission(), 900, { dailyUserMicrousd: 1000, dailyAppMicrousd: 10000 });
  await repository.finish('github:100', reserved.run.id, completion(900));
  let calls = 0;
  await assert.rejects(executeRequest('github:100', submission(), { ...config, dailyUserMicrousd: 1000 }, repository, async () => { calls++; return result(); }), hasCode('budget_exceeded'));
  assert.equal(calls, 0);
  assert.equal(await accounted(), 900);
});

test('one active request per user and four overall are enforced transactionally', async () => {
  for (const owner of [100, 200, 300, 400]) await repository.reserve(`github:${owner}`, submission(), 100, limits);
  await assert.rejects(repository.reserve('github:100', submission(), 100, limits), hasCode('run_in_progress'));
  await assert.rejects(repository.reserve('github:500', submission(), 100, limits), hasCode('run_in_progress'));
  assert.equal(await accounted(), 400);
});

test('six starts per minute limit also counts completed requests', async () => {
  for (let index = 0; index < 6; index++) {
    const reserved = await repository.reserve('github:100', submission(), 100, limits);
    await repository.finish('github:100', reserved.run.id, completion(10));
  }
  await assert.rejects(repository.reserve('github:100', submission(), 100, limits), hasCode('rate_limited'));
  assert.equal(await accounted(), 60);
});

test('provider failures retain unknown charges and never persist raw error bodies', async () => {
  const input = submission();
  const run = await executeRequest('github:100', input, config, repository, async () => { throw new Error('Bearer test-secret-provider-body'); });
  assert.equal(run.status, 'failed');
  assert.equal(run.errorCode, 'provider_failed');
  assert.equal(run.inputTokens, null);
  assert.equal(run.estimatedCostMicrousd, null);
  assert.equal(await accounted(), reservationFor(input.prompt));
  assert.ok(!JSON.stringify((await pool.query('SELECT * FROM wb_runs')).rows).includes('test-secret-provider-body'));
});

test('timeouts and missing usage remain unknown instead of becoming zero', async () => {
  const failure = await executeRequest('github:100', submission(), config, repository, async () => { throw new DOMException('private provider detail', 'TimeoutError'); });
  assert.equal(failure.errorCode, 'provider_timeout');
  const success = await executeRequest('github:200', submission(), config, repository, async () => result({ inputTokens: null, outputTokens: null }));
  assert.equal(success.status, 'completed');
  assert.equal(success.estimatedCostMicrousd, null);
  assert.ok(success.accountedMicrousd > 0);
});

test('lost workers become interrupted and retain their original reservation', async () => {
  const reserved = await repository.reserve('github:100', submission(), 900, limits);
  await pool.query("UPDATE wb_runs SET created_at=now()-interval '3 minutes' WHERE id=$1", [reserved.run.id]);
  const recovered = await repository.read('github:100', reserved.run.conversationId!);
  assert.equal(recovered.runs[0].status, 'interrupted');
  assert.equal(recovered.runs[0].estimatedCostMicrousd, null);
  await repository.reserve('github:100', submission(), 500, limits);
  assert.equal(await accounted(), 1400);
  await repository.finish('github:100', reserved.run.id, completion(0));
  assert.equal(await accounted(), 1400);
});

test('deleting content preserves accounting and prevents idempotent replay after deletion', async () => {
  const input = submission();
  const run = await executeRequest('github:100', input, config, repository, async () => result());
  const before = await accounted();
  await repository.remove('github:100', run.conversationId!);
  assert.equal(await accounted(), before);
  assert.deepEqual(await repository.list('github:100'), []);
  const tombstone = (await pool.query('SELECT * FROM wb_runs WHERE id=$1', [run.id])).rows[0];
  assert.equal(tombstone.prompt, ''); assert.equal(tombstone.answer, null); assert.equal(tombstone.provider_response_id, null);
  let calls = 0;
  await assert.rejects(executeRequest('github:100', input, config, repository, async () => { calls++; return result(); }), hasCode('not_found'));
  assert.equal(calls, 0);
});

test('settlement after a UTC day boundary reconciles the reservation day', async () => {
  const reserved = await repository.reserve('github:100', submission(), 900, limits);
  const oldDay = (await pool.query("SELECT to_char((now() AT TIME ZONE 'UTC')::date-1,'YYYY-MM-DD') AS day")).rows[0].day;
  await pool.query('INSERT INTO wb_budget_days(day,accounted_microusd) VALUES($1,900)', [oldDay]);
  await pool.query('INSERT INTO wb_user_budget_days(day,owner_id,accounted_microusd) VALUES($1,$2,900)', [oldDay, 'github:100']);
  await pool.query('UPDATE wb_runs SET budget_day=$2 WHERE id=$1', [reserved.run.id, oldDay]);
  await pool.query('UPDATE wb_budget_days SET accounted_microusd=0 WHERE day<>$1', [oldDay]);
  await pool.query('UPDATE wb_user_budget_days SET accounted_microusd=0 WHERE day<>$1', [oldDay]);
  await repository.finish('github:100', reserved.run.id, completion(20));
  assert.equal(await accounted(), 20);
  assert.equal(await repository.ownAllowance('github:100'), 0);
});

test('credential patterns are filtered before the model receives them and before persistence', async () => {
  const input = submission({ prompt: 'api_key=example-secret Bearer token-value sk-proj-abcdefghijklmnop postgres://user:password@db.example/app' });
  let received = '';
  const run = await executeRequest('github:100', input, config, repository, async prompt => { received = prompt; return result({ text: 'password=returned-secret' }); });
  assert.ok(!received.includes('example-secret'));
  assert.ok(!received.includes('abcdefghijklmnop'));
  assert.ok(!received.includes('user:password'));
  assert.equal(run.answer, 'password=[redacted]');
  assert.equal(run.prompt, received);
  assert.ok(redactText('-----BEGIN PRIVATE KEY-----\nsecret\n-----END PRIVATE KEY-----').includes('[redacted]'));
});

test('the actual AI SDK adapter sends one bounded, non-stored Responses request', async () => {
  let calls = 0;
  const model = createModelCall('test-api-key-not-real', async (input, init) => {
    calls++;
    assert.equal(String(input), 'https://api.openai.com/v1/responses');
    const body = JSON.parse(String(init?.body));
    assert.equal(body.model, MODEL); assert.equal(body.store, false); assert.equal(body.max_output_tokens, 1024);
    assert.equal(body.service_tier, 'default'); assert.equal(body.reasoning.effort, 'none');
    assert.ok(!body.tools?.length); assert.ok(!body.previous_response_id);
    return Response.json({ id: 'resp_fixture', object: 'response', created_at: 1792377600, model: MODEL, status: 'completed',
      output: [{ id: 'msg_fixture', type: 'message', role: 'assistant', status: 'completed', content: [{ type: 'output_text', text: 'An HTTP fixture response.', annotations: [] }] }],
      usage: { input_tokens: 100, output_tokens: 20, total_tokens: 120, input_tokens_details: { cached_tokens: 0 }, output_tokens_details: { reasoning_tokens: 0 } } });
  });
  const response = await model('A bounded fixture question.');
  assert.equal(calls, 1); assert.equal(response.text, 'An HTTP fixture response.');
  assert.equal(response.inputTokens, 100); assert.equal(response.outputTokens, 20);
  assert.equal(response.responseId, 'resp_fixture');
});

test('the SDK adapter does not retry failed HTTP requests', async () => {
  let calls = 0;
  const model = createModelCall('test-api-key-not-real', async () => { calls++; return Response.json({ error: { message: 'fixture failure', type: 'server_error' } }, { status: 500 }); });
  await assert.rejects(model('A fixture question.'));
  assert.equal(calls, 1);
});

test('Groq configuration requires only its own key and never falls back to OpenAI', () => {
  const env = { AUTH_SECRET: 'x'.repeat(48), AUTH_GITHUB_ID: 'client', AUTH_GITHUB_SECRET: 'secret',
    AUTH_URL: 'http://127.0.0.1:3135', WORKBENCH_ALLOWED_GITHUB_IDS: '100', DATABASE_URL: url,
    WORKBENCH_PROVIDER: 'groq', GROQ_API_KEY: 'test-groq-key', WORKBENCH_LIVE_ENABLED: 'true' };
  const selected = parseServiceConfig(env);
  assert.equal(selected.liveEnabled, true);
  assert.equal(selected.modelConfig.provider, 'groq');
  assert.equal(selected.modelConfig.model, 'openai/gpt-oss-120b');
  assert.equal(selected.openaiKey, '');
  for (const change of [{ GROQ_API_KEY: '', OPENAI_API_KEY: 'other-key' }, { WORKBENCH_PROVIDER: 'grok' },
    { WORKBENCH_MODEL: MODEL }, { WORKBENCH_PROVIDER: 'groq;openai' }]) {
    assert.equal(parseServiceConfig({ ...env, ...change }).liveEnabled, false);
  }
});

test('Groq runs retain their provider and slash-qualified model with separate list-rate accounting', async () => {
  const selected = { ...config, modelConfig: MODELS.groq, groqKey: 'fixture-groq-key' };
  const stored = await executeRequest('github:100', submission(), selected, repository,
    async () => result({ modelId: MODELS.groq.model }));
  assert.equal(stored.provider, 'Groq');
  assert.equal(stored.model, MODELS.groq.model);
  assert.equal(stored.responseModel, MODELS.groq.model);
  assert.equal(stored.estimatedCostMicrousd, 27);
  assert.equal(stored.accountedMicrousd, 27);
  assert.equal(await accounted(), 27);
  assert.equal((await repository.read('github:100', stored.conversationId!)).runs[0].provider, 'Groq');
  assert.equal(estimateCost(result({ modelId: 'some-other-model' }), MODELS.groq), null);
});

test('changing provider cannot replay an existing intent or relabel its saved history', async () => {
  const input = submission();
  const original = await executeRequest('github:100', input, config, repository, async () => result());
  let calls = 0;
  await assert.rejects(executeRequest('github:100', input, { ...config, modelConfig: MODELS.groq }, repository,
    async () => { calls++; return result({ modelId: MODELS.groq.model }); }), hasCode('request_conflict'));
  assert.equal(calls, 0);
  const reopened = await repository.read('github:100', original.conversationId!);
  assert.equal(reopened.runs[0].provider, 'OpenAI');
  assert.equal(reopened.runs[0].model, MODEL);
});

test('the native Groq SDK uses only the selected key and bounded hidden-reasoning requests', async () => {
  let calls = 0;
  const model = createModelCall('test-groq-key-not-real', async (input, init) => {
    calls++;
    assert.equal(String(input), 'https://api.groq.com/openai/v1/chat/completions');
    assert.equal(new Headers(init?.headers).get('authorization'), 'Bearer test-groq-key-not-real');
    const body = JSON.parse(String(init?.body));
    assert.equal(body.model, MODELS.groq.model);
    assert.equal(body.max_completion_tokens ?? body.max_tokens, 1024);
    assert.equal(body.reasoning_format, 'hidden');
    assert.equal(body.reasoning_effort, 'low');
    assert.equal(body.service_tier, 'on_demand');
    assert.ok(!body.tools?.length);
    assert.ok(!body.previous_response_id);
    assert.equal(body.messages[0].role, 'system');
    return Response.json({ id: 'chatcmpl_fixture', object: 'chat.completion', created: 1792627200, model: MODELS.groq.model,
      choices: [{ index: 0, message: { role: 'assistant', content: 'A Groq HTTP fixture response.', reasoning: 'private-reasoning-must-not-be-saved' }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 100, completion_tokens: 20, total_tokens: 120 } });
  }, MODELS.groq);
  const response = await model('A bounded fixture question.');
  assert.equal(calls, 1);
  assert.equal(response.text, 'A Groq HTTP fixture response.');
  assert.equal(response.modelId, MODELS.groq.model);
  assert.equal(response.inputTokens, 100);
  assert.equal(response.outputTokens, 20);
  assert.ok(!JSON.stringify(response).includes('private-reasoning'));
});

test('provider access, quota and request errors are actionable without storing raw payloads or retrying', async () => {
  const selected = { ...config, modelConfig: MODELS.groq, groqKey: 'fixture-groq-key' };
  for (const [status, code, type, expected] of [
    [429, 'rate_limit_exceeded', 'tokens', 'provider_rate_limited'],
    [429, 'credit_balance_exhausted', 'insufficient_quota', 'provider_quota'],
    [401, 'invalid_api_key', 'invalid_request_error', 'provider_access'],
    [400, 'unsupported_parameter', 'invalid_request_error', 'provider_request_rejected'],
  ] as const) {
    let calls = 0;
    const model = createModelCall('fixture-groq-key', async () => {
      calls++;
      return Response.json({ error: { message: 'private-provider-payload-do-not-store', code, type } }, { status });
    }, MODELS.groq);
    const run = await executeRequest('github:100', submission(), selected, repository, model);
    assert.equal(run.status, 'failed');
    assert.equal(run.errorCode, expected);
    assert.equal(run.estimatedCostMicrousd, null);
    assert.ok(run.accountedMicrousd > 0);
    assert.equal(calls, 1);
  }
  assert.ok(!JSON.stringify((await pool.query('SELECT * FROM wb_runs')).rows).includes('private-provider-payload'));
});

test('Groq tokens are filtered even when pasted without a credential label', () => {
  assert.equal(redactText('gsk_abcdefghijklmnopqrstuvwxyz0123456789'), '[redacted]');
});
