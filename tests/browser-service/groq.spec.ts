import { test, expect, type BrowserContext } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createPool } from '../../apps/web/src/server/database';
import { WorkbenchRepository } from '../../apps/web/src/server/repository';
import { executeRequest } from '../../apps/web/src/server/execution';
import { MODELS, type ServiceConfig } from '../../apps/web/src/server/config-core';
import { TEST_SESSION_SECRET } from '../../playwright.services.config';
import { settleVisualState } from '../visual-state';

const appRequire = createRequire(resolve('apps/web/package.json'));
const pool = createPool(process.env.WORKBENCH_TEST_DATABASE_URL!, true);
const repository = new WorkbenchRepository(pool);
const origin = 'http://127.0.0.1:3136';
async function login(context: BrowserContext) {
  const { encode } = await import(pathToFileURL(appRequire.resolve('next-auth/jwt')).href);
  const token = await encode({ secret: TEST_SESSION_SECRET, salt: 'authjs.session-token', token: { sub: 'github:100', name: 'Browser fixture account' }, maxAge: 3600 });
  await context.addCookies([{ name: 'authjs.session-token', value: token, url: origin, httpOnly: true, sameSite: 'Lax' }]);
}
async function submit(context: BrowserContext, prompt = 'Explain keyboard focus return.') {
  const response = await context.request.post('/api/live/request', { headers: { Origin: origin }, data: { title: 'Groq focus return', prompt, requestId: randomUUID() } });
  expect(response.status()).toBe(200);
  return response.json();
}
test.beforeEach(async () => { await pool.query('TRUNCATE wb_runs,wb_conversations,wb_budget_days,wb_user_budget_days'); });
test.afterAll(async () => { await pool.end(); });

test('Groq is identified before sign-in without exposing either provider key', async ({ page }) => {
  await page.goto('/conversations');
  await expect(page.getByText('Groq / GPT-OSS 120B', { exact: true })).toBeVisible();
  expect(await page.content()).not.toContain('fixture-groq-key-not-real');
  await page.goto('/settings');
  await expect(page.getByRole('heading', { name: 'Groq / GPT-OSS 120B' })).toBeVisible();
  await expect(page.getByText(/free-plan charges can differ/i)).toBeVisible();
});

test('a Groq request saves the actual provider, reported model and usage then reopens', async ({ page, context }) => {
  await login(context);
  await page.goto('/conversations/new');
  await expect(page.getByText('Groq / GPT-OSS 120B', { exact: true })).toBeVisible();
  await page.getByLabel('Title', { exact: false }).fill('Groq focus return');
  await page.getByLabel('Question', { exact: false }).fill('Explain keyboard focus return.');
  await page.getByRole('button', { name: 'Send request', exact: true }).click();
  await expect(page).toHaveURL(/\/conversations\/[0-9a-f-]+$/);
  const inspector = page.getByRole('complementary', { name: 'Live execution inspector' });
  await expect(inspector.getByText('Groq', { exact: true })).toBeVisible();
  await expect(inspector.getByText('openai/gpt-oss-120b', { exact: true })).toHaveCount(2);
  await expect(inspector.getByText('100', { exact: true })).toBeVisible();
  await expect(inspector.getByText('20', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText(/Groq HTTP test fixture/)).toBeVisible();
  const saved = (await repository.read('github:100', (await repository.list('github:100'))[0].id)).runs[0];
  expect(saved.provider).toBe('Groq');
  expect(saved.responseModel).toBe('openai/gpt-oss-120b');
  expect(JSON.stringify(saved)).not.toContain('private-fixture-reasoning');
  await page.setViewportSize({ width: 320, height: 900 });
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Saved', exact: true })).toBeVisible();
  await settleVisualState(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations).toEqual([]);
});

test('Groq quota failures remain saved with a useful message and unknown cost', async ({ page, context }) => {
  await login(context);
  const run = await submit(context, 'fixture-quota');
  expect(run.errorCode).toBe('provider_rate_limited');
  await page.goto('/conversations/' + run.conversationId);
  await expect(page.locator('.live-failure')).toContainText('Wait for its quota to reset');
  expect(run.estimatedCostMicrousd).toBeNull();
  expect(run.accountedMicrousd).toBeGreaterThan(0);
  expect(JSON.stringify(await repository.read('github:100', run.conversationId))).not.toContain('private-provider-fixture-body');
});

test('OpenAI history keeps its original identity when Groq is selected', async ({ page, context }) => {
  await login(context);
  const oldConfig: ServiceConfig = { origin, allowedGitHubIds: ['100'], authReady: true, databaseReady: true,
    modelReady: true, liveEnabled: true, dailyUserMicrousd: 1_000_000, dailyAppMicrousd: 5_000_000,
    databaseUrl: process.env.WORKBENCH_TEST_DATABASE_URL!, openaiKey: '', groqKey: '', modelConfig: MODELS.openai };
  const old = await executeRequest('github:100', { title: 'Earlier OpenAI fixture', prompt: 'A fixture question.', requestId: randomUUID() }, oldConfig, repository,
    async () => ({ text: 'An earlier OpenAI fixture answer.', modelId: MODELS.openai.model, responseId: 'resp_old_fixture',
      inputTokens: 100, outputTokens: 20, cacheReadTokens: 0, cacheWriteTokens: 0, finishReason: 'stop' }));
  await page.goto('/conversations/' + old.conversationId);
  const inspector = page.getByRole('complementary', { name: 'Live execution inspector' });
  await expect(inspector.getByText('OpenAI', { exact: true })).toBeVisible();
  await expect(inspector.getByText('gpt-6-luna', { exact: true })).toHaveCount(2);
  await page.goto('/conversations/new');
  await expect(page.getByText('Groq / GPT-OSS 120B', { exact: true })).toBeVisible();
});

test('formatted responses remain readable, safe, copyable and contained after reload', async ({ page, context }, testInfo) => {
  await login(context);
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const externalRequests: string[] = [];
  page.on('request', request => { if (!request.url().startsWith(origin)) externalRequests.push(request.url()); });
  const run = await submit(context, 'fixture-format');
  await page.goto('/conversations/' + run.conversationId);
  const response = page.locator('.response-content');
  await expect(response.getByRole('heading', { name: 'Focus checklist', level: 2 })).toBeVisible();
  await expect(response.locator('strong')).toHaveText('HTTP test fixture');
  await expect(response.locator('.response-markdown>ol>li')).toHaveCount(3);
  await expect(response.getByRole('table')).toBeVisible();
  await expect(response.getByRole('img', { name: 'Completed', exact: true })).toBeVisible();
  await expect(response.locator('pre code')).toContainText('<strong>Focus stays visible</strong>');
  await expect(response.locator('script,iframe,img,object,embed,style')).toHaveCount(0);
  await expect(response.getByRole('link', { name: /Unsafe/ })).toHaveCount(0);
  await expect(response.getByText('Unsafe script link', { exact: true })).toBeVisible();
  await expect(response.getByText('[Image: Illustrative diagram]', { exact: true })).toBeVisible();
  const reference = response.getByRole('link', { name: /Reference/ });
  await expect(reference).toHaveAttribute('href', 'https://example.com/dialogs');
  await expect(reference).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(response.locator('a[href="#user-content-fn-review"]')).toHaveAttribute('aria-describedby', 'footnote-label');
  await expect(response.locator('#footnote-label')).toHaveCount(1);
  await expect(response.locator('#user-content-fn-review')).toHaveCount(1);
  expect(await page.evaluate(() => '__responseExecuted' in globalThis)).toBe(false);
  expect(externalRequests).toEqual([]);

  await response.getByRole('button', { name: 'Copy code', exact: true }).click();
  await expect(response.getByRole('status').filter({ hasText: 'Code copied' })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('openingControl?.focus();');
  await response.getByRole('button', { name: 'Copy response', exact: true }).click();
  expect((await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n?/g, '\n')).toBe(run.answer.replace(/\r\n?/g, '\n'));

  await page.reload();
  await expect(response.getByRole('heading', { name: 'Focus checklist', level: 2 })).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await settleVisualState(page);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations).toEqual([]);
  await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); window.scrollTo({ top: 0, behavior: 'instant' }); });
  await page.screenshot({ path: testInfo.outputPath('formatted-response-desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 900 });
  await settleVisualState(page);
  await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); window.scrollTo({ top: 0, behavior: 'instant' }); });
  await page.screenshot({ path: testInfo.outputPath('formatted-response-mobile.png'), fullPage: true });
  await page.setViewportSize({ width: 320, height: 900 });
  await settleVisualState(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const table = response.getByRole('region', { name: 'Response table' });
  await table.focus();
  await expect(table).toBeFocused();
  expect(await table.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true);
  const code = response.getByRole('region', { name: 'tsx code' });
  await code.focus();
  await expect(code).toBeFocused();
  expect(await code.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations).toEqual([]);
});

test('copy failure preserves the answer and offers a manual alternative', async ({ page, context }) => {
  await login(context);
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => { throw new DOMException('Clipboard unavailable', 'NotAllowedError'); } } }));
  const run = await submit(context);
  await page.goto('/conversations/' + run.conversationId);
  const response = page.locator('.response-content');
  await response.getByRole('button', { name: 'Copy response', exact: true }).click();
  await expect(response.getByRole('status')).toHaveText('Copy unavailable. You can select and copy the text.');
  await expect(response.locator('.response-markdown')).toHaveText(run.answer);
});
