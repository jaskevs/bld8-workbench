import { test, expect, type BrowserContext } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createPool } from '../../apps/web/src/server/database';
import { WorkbenchRepository } from '../../apps/web/src/server/repository';
import { TEST_SESSION_SECRET } from '../../playwright.services.config';
import { settleVisualState } from '../visual-state';

const appRequire = createRequire(resolve('apps/web/package.json'));
const pool = createPool(process.env.WORKBENCH_TEST_DATABASE_URL!, true);
const repository = new WorkbenchRepository(pool);
const origin = 'http://127.0.0.1:3136';
async function login(context: BrowserContext, id = '100') {
  const { encode } = await import(pathToFileURL(appRequire.resolve('next-auth/jwt')).href);
  const token = await encode({ secret: TEST_SESSION_SECRET, salt: 'authjs.session-token', token: { sub: `github:${id}`, name: 'Browser fixture account' }, maxAge: 3600 });
  await context.addCookies([{ name: 'authjs.session-token', value: token, url: origin, httpOnly: true, sameSite: 'Lax' }]);
}
async function submit(context: BrowserContext, prompt = 'Explain keyboard focus return.', title = 'Focus return') {
  const response = await context.request.post('/api/live/request', { headers: { Origin: origin }, data: { title, prompt, requestId: randomUUID() } });
  expect(response.status(), await response.text()).toBe(200);
  return response.json();
}
test.beforeEach(async () => { await pool.query('TRUNCATE wb_runs,wb_conversations,wb_budget_days,wb_user_budget_days'); });
test.afterAll(async () => { await pool.end(); });

test('anonymous requests, forged identities and cross-site mutations are rejected', async ({ context }) => {
  expect((await context.request.get('/api/conversations')).status()).toBe(401);
  expect((await context.request.get('/api/conversations', { headers: { 'x-user-id': 'github:100' } })).status()).toBe(401);
  expect((await context.request.post('/api/live/request', { headers: { Origin: 'https://other.example' }, data: {} })).status()).toBe(403);
  expect((await context.request.post('/api/live/request', { headers: { Origin: origin }, data: {} })).status()).toBe(401);
  await login(context, '999');
  expect((await context.request.get('/api/conversations')).status()).toBe(401);
  await context.clearCookies();
  await context.addCookies([{ name: 'authjs.session-token', value: 'forged-token', url: origin }]);
  expect((await context.request.get('/api/conversations')).status()).toBe(401);
});

test('sign-in hands off to the configured GitHub OAuth app without exposing secrets', async ({ page }) => {
  const providers = await (await page.request.get('/api/auth/providers')).json();
  expect(providers.github.callbackUrl).toBe(origin + '/api/auth/callback/github');
  const { csrfToken } = await (await page.request.get('/api/auth/csrf')).json();
  const directSignIn = await page.request.post('/api/auth/signin/github', {
    headers: { Origin: origin, 'X-Auth-Return-Redirect': '1' },
    form: { csrfToken, callbackUrl: origin + '/conversations' },
    maxRedirects: 0,
  });
  expect(directSignIn.status()).toBe(200);
  const directUrl = new URL((await directSignIn.json()).url);
  expect(directUrl.origin).toBe('https://github.com');
  expect(directUrl.searchParams.get('redirect_uri')).toBe(origin + '/api/auth/callback/github');
  expect(directUrl.searchParams.get('client_id')).toBe('fixture-client');
  expect(directUrl.toString()).not.toContain('fixture-secret');
  await page.route('https://github.com/**', route => route.fulfill({ status: 200, body: 'OAuth handoff intercepted by the test.' }));
  await page.goto('/conversations');
  await expect(page.getByRole('button', { name: 'Sign in with GitHub' })).toBeVisible();
  const handoff = page.waitForRequest(request => new URL(request.url()).hostname === 'github.com');
  await page.getByRole('button', { name: 'Sign in with GitHub' }).click();
  const url = new URL((await handoff).url());
  expect(url.pathname).toBe('/login/oauth/authorize');
  expect(url.searchParams.get('client_id')).toBe('fixture-client');
  expect(url.searchParams.get('redirect_uri')).toBe(origin + '/api/auth/callback/github');
  expect(url.searchParams.get('scope')).toBe('read:user');
  expect(url.toString()).not.toContain('fixture-secret');
});

test('the live form saves a response and reopens the measured inspector', async ({ page, context }) => {
  await login(context);
  await page.goto('/');
  await page.getByRole('button', { name: 'New request', exact: true }).click();
  const draftEditor = page.getByRole('dialog');
  await draftEditor.getByLabel('Title', { exact: false }).fill('Focus return');
  await draftEditor.getByLabel('Request', { exact: false }).fill('Explain keyboard focus return.');
  await draftEditor.getByRole('button', { name: 'Save draft', exact: true }).click();
  await page.getByRole('link', { name: 'Open a private request' }).click();
  await page.getByRole('button', { name: 'Use local draft', exact: true }).click();
  await expect(page.getByLabel('Question', { exact: false })).toHaveValue('Explain keyboard focus return.');
  await page.getByRole('button', { name: 'Send request', exact: true }).click();
  await expect(page).toHaveURL(/\/conversations\/[0-9a-f-]+$/);
  await expect(page.getByRole('heading', { name: 'Focus return', exact: true })).toBeVisible();
  await expect(page.getByText(/Restore focus to the opening control/)).toBeVisible();
  const inspector = page.getByRole('complementary', { name: 'Live execution inspector' });
  await expect(inspector.getByText('100', { exact: true })).toBeVisible();
  await expect(inspector.getByText('20', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText(/Restore focus to the opening control/)).toBeVisible();
  await inspector.getByRole('tab', { name: 'Events', exact: true }).click();
  await expect(inspector.getByText('Request saved and budget reserved')).toBeVisible();
  expect((await repository.list('github:100')).length).toBe(1);
});

test('two encrypted sessions cannot read, rename or delete one another\'s conversation', async ({ browser, context, page }) => {
  await login(context);
  const own = await submit(context);
  const other = await browser.newContext({ baseURL: origin });
  try {
    await login(other, '200');
    expect(await (await other.request.get('/api/conversations')).json()).toEqual([]);
    expect((await other.request.get(`/api/conversations/${own.conversationId}`)).status()).toBe(404);
    expect((await other.request.patch(`/api/conversations/${own.conversationId}`, { headers: { Origin: origin }, data: { title: 'Stolen' } })).status()).toBe(404);
    expect((await other.request.delete(`/api/conversations/${own.conversationId}`, { headers: { Origin: origin } })).status()).toBe(404);
    await page.goto(`/conversations/${own.conversationId}`);
    await expect(page.getByRole('heading', { name: 'Focus return', exact: true })).toBeVisible();
  } finally { await other.close(); }
});

test('rename and delete dialogs preserve focus and deletion does not refund usage', async ({ page, context }) => {
  await login(context);
  const run = await submit(context);
  await page.goto(`/conversations/${run.conversationId}`);
  await page.getByRole('button', { name: 'Rename', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByLabel('Title', { exact: false })).toBeFocused();
  await dialog.getByLabel('Title', { exact: false }).fill('Reviewed focus');
  await dialog.getByRole('button', { name: 'Save name', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Reviewed focus', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Rename', exact: true })).toBeFocused();
  const before = await repository.ownAllowance('github:100');
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await dialog.getByRole('button', { name: 'Keep conversation', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Delete', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await dialog.getByRole('button', { name: 'Delete conversation', exact: true }).click();
  await expect(page).toHaveURL('/conversations');
  await expect(page.getByRole('heading', { name: 'Your first conversation starts here.' })).toBeVisible();
  expect(await repository.ownAllowance('github:100')).toBe(before);
});

test('failure and unknown-usage responses preserve honest accounting', async ({ page, context }) => {
  await login(context);
  const run = await submit(context, 'fixture-failure');
  expect(run.status).toBe('failed');
  expect(run.estimatedCostMicrousd).toBeNull();
  await page.goto(`/conversations/${run.conversationId}`);
  await expect(page.locator('.live-failure')).toContainText('The model request did not complete.');
  await expect(page.getByText('test-only-provider-secret')).toHaveCount(0);
  const unknown = await submit(context, 'fixture-unknown', 'Unknown usage');
  expect(unknown.status).toBe('completed');
  expect(unknown.inputTokens).toBeNull();
  expect(unknown.estimatedCostMicrousd).toBeNull();
  expect(unknown.accountedMicrousd).toBeGreaterThan(0);
});

test('input bounds, duplicate intent and same-origin enforcement hold on real routes', async ({ context }) => {
  await login(context);
  const data = { title: 'Bounded', prompt: 'A bounded question.', requestId: randomUUID() };
  const send = () => context.request.post('/api/live/request', { headers: { Origin: origin }, data });
  const first = await send(); expect(first.status()).toBe(200);
  const second = await send(); expect(second.status()).toBe(200);
  expect((await second.json()).id).toBe((await first.json()).id);
  expect((await context.request.post('/api/live/request', { headers: { Origin: origin }, data: { ...data, prompt: 'Changed' } })).status()).toBe(409);
  expect((await context.request.post('/api/live/request', { headers: { Origin: origin }, data: { ...data, requestId: randomUUID(), owner: 'github:200' } })).status()).toBe(400);
  expect((await context.request.post('/api/live/request', { headers: { Origin: origin }, data: { ...data, prompt: 'x'.repeat(25000) } })).status()).toBe(413);
  expect((await context.request.delete(`/api/conversations/${(await first.json()).conversationId}`, { headers: { Origin: 'https://other.example' } })).status()).toBe(403);
});

test('spending exhaustion rejects execution through the route before a provider call', async ({ context }) => {
  await login(context);
  const first = await submit(context);
  await pool.query('UPDATE wb_user_budget_days SET accounted_microusd=1000000 WHERE owner_id=$1', ['github:100']);
  const response = await context.request.post('/api/live/request', { headers: { Origin: origin }, data: { title: 'Blocked', prompt: 'A question.', requestId: randomUUID() } });
  expect(response.status()).toBe(429);
  expect((await response.json()).error.code).toBe('budget_exceeded');
  expect((await repository.read('github:100', first.conversationId)).runs.length).toBe(1);
  expect((await repository.list('github:100')).length).toBe(1);
});

for (const width of [320, 390, 820, 1440]) {
  test(`saved, compose and inspection views remain accessible at ${width}px`, async ({ page, context }) => {
    await login(context);
    const run = await submit(context);
    await page.setViewportSize({ width, height: 1000 });
    for (const path of ['/conversations', '/conversations/new', `/conversations/${run.conversationId}`]) {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      await settleVisualState(page);
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(result.violations.map(item => ({ id: item.id, targets: item.nodes.map(node => node.target) }))).toEqual([]);
    }
  });
}
