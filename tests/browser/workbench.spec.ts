import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { settleVisualState } from '../visual-state';

test('inspect a sample and navigate its detail tabs with the keyboard', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Follow the request.Keep the details.');
  await expect(page.getByText('Authored sample · Source retrieval is not connected')).toBeVisible();
  const inspector = page.getByRole('complementary', { name: 'Execution inspector' });
  const overview = inspector.getByRole('tab', { name: 'Overview' });
  await overview.focus();
  await page.keyboard.press('ArrowRight');
  await expect(inspector.getByRole('tab', { name: 'Events' })).toBeFocused();
  await page.keyboard.press('Enter');
  await inspector.getByRole('button', { name: /Response prepared/ }).click();
  await expect(inspector.getByText('Illustrative model step. No provider was contacted.')).toBeVisible();
  await inspector.getByRole('tab', { name: 'Input', exact: true }).click();
  await expect(inspector.getByText('Not connected', { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('replay can be stopped and restarted without losing its input', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Replay sample', exact: true }).click();
  await page.getByRole('button', { name: 'Stop replay', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Replay stopped.' })).toBeVisible();
  await expect(page.getByText('When would a dialog be a better choice than a drawer?', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Replay again', exact: true }).click();
  await expect(page.getByText('Complete sample', { exact: true })).toBeVisible();
  await expect(page.getByText(/Use a dialog for a focused task/)).toBeVisible();
});

test('failed execution is explicit and unknown usage stays unknown', async ({ page }) => {
  await page.goto('/?sample=provider-unavailable');
  const failure = page.getByRole('region', { name: 'Handle an unavailable provider' }).getByRole('alert');
  await expect(failure).toContainText('No response returned.');
  await expect(page.getByRole('complementary', { name: 'Execution inspector' }).getByText('Unknown', { exact: true })).toHaveCount(3);
  await page.getByRole('button', { name: 'Replay sample', exact: true }).click();
  await expect(failure).toContainText('No response returned.');
});

test('validate a draft, save it locally, reopen it and return focus from its editor', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'New request', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByLabel('Title', { exact: false })).toBeFocused();
  await dialog.getByRole('button', { name: 'Save draft' }).click();
  await expect(dialog.getByText('Give this request a short title.')).toBeVisible();
  await expect(dialog.getByLabel('Title', { exact: false })).toBeFocused();
  await dialog.getByLabel('Title', { exact: false }).fill('A saved request');
  await dialog.getByLabel('Request', { exact: false }).fill('Review focus return after a dialog closes.');
  await dialog.getByRole('button', { name: 'Save draft' }).click();
  await expect(page).toHaveURL(/draft=1/);
  await expect(page.getByRole('heading', { name: 'A saved request', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('Review focus return after a dialog closes.', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'No execution yet.' })).toBeVisible();
  await page.getByRole('button', { name: 'Edit draft', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Edit draft', exact: true })).toBeFocused();
});

test('storage failure keeps the draft text and reports the problem', async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException('Storage unavailable', 'QuotaExceededError'); }; });
  await page.goto('/');
  await page.getByRole('button', { name: 'New request', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Title', { exact: false }).fill('Keep this text');
  await dialog.getByLabel('Request', { exact: false }).fill('A draft that must remain available after a failed save.');
  await dialog.getByRole('button', { name: 'Save draft' }).click();
  await expect(dialog.getByRole('alert')).toContainText('Your text is still here');
  await expect(dialog.getByLabel('Request', { exact: false })).toHaveValue('A draft that must remain available after a failed save.');
});

test('sample library filters, recovers from empty results and opens a selected run', async ({ page }) => {
  await page.goto('/runs');
  await page.getByRole('combobox', { name: 'Sample status' }).click();
  await page.getByRole('option', { name: 'Failed', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('1 result');
  await page.getByRole('textbox', { name: 'Search sample runs' }).fill('nothing matches');
  await expect(page.getByRole('heading', { name: 'No samples match.' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.getByRole('status')).toHaveText('3 results');
  await page.getByRole('link', { name: 'Inspect handle an unavailable provider' }).click();
  await expect(page).toHaveURL(/sample=provider-unavailable/);
  await expect(page.getByRole('region', { name: 'Handle an unavailable provider' }).getByRole('alert')).toBeVisible();
});

test('health identifies only the shell and exposes no enabled model or storage capability', async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.status()).toBe(200);
  expect(response.headers()['cache-control']).toBe('no-store');
  expect(await response.json()).toEqual({ status: 'ok', scope: 'application-shell', mode: 'sample', capabilities: { authentication: false, database: false, modelExecution: false, retrieval: false } });
  expect((await request.post('/api/health')).status()).toBe(405);
});

for (const width of [320, 390, 820, 1440]) {
  test(`routes remain contained and accessible at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of ['/', '/runs', '/settings', '/?draft=1', '/conversations', '/conversations/new']) {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      await settleVisualState(page);
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(result.violations.map(item => ({ id: item.id, targets: item.nodes.map(node => node.target) }))).toEqual([]);
    }
  });
}

test('reduced motion, skip navigation and unknown routes remain usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?sample=unknown');
  await expect(page.getByRole('heading', { name: 'Choose an interaction', level: 2 })).toBeVisible();
  await expect(page.locator('.page-stack')).toHaveCSS('animation-name', 'none');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  const response = await page.goto('/not-a-real-page');
  expect(response?.status()).toBe(404);
  await page.getByRole('link', { name: 'Open workspace →' }).click();
  await expect(page.getByRole('heading', { name: /Follow the request/ })).toBeVisible();
});

test('private routes stay closed without configured personal services', async ({ page, request }) => {
  await page.goto('/conversations');
  await expect(page.getByRole('heading', { name: 'A private place to work.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in with GitHub' })).toHaveCount(0);
  expect((await request.get('/api/conversations')).status()).toBe(401);
  expect((await request.get('/api/auth/providers')).status()).toBe(503);
  expect((await request.post('/api/live/request', { headers: { Origin: 'http://127.0.0.1:3135' }, data: {} })).status()).toBe(401);
  await page.getByRole('link', { name: 'Explore sample runs' }).click();
  await expect(page.getByRole('button', { name: 'Replay sample', exact: true })).toBeVisible();
});
