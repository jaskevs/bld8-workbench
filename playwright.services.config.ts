import { defineConfig, devices } from '@playwright/test';
import { resolve } from 'node:path';
const testUrl = process.env.WORKBENCH_TEST_DATABASE_URL;
if (!testUrl) throw new Error('Set WORKBENCH_TEST_DATABASE_URL to the disposable loopback test database.');
export const TEST_SESSION_SECRET = 'workbench-browser-fixture-session-secret-not-for-real-accounts';
export function serviceBrowserConfig(provider: 'openai' | 'groq') {
  const groq = provider === 'groq';
  return defineConfig({
    testDir: './tests/browser-service', testMatch: groq ? 'groq.spec.ts' : 'conversations.spec.ts',
    fullyParallel: false, workers: 1, retries: 0,
    forbidOnly: Boolean(process.env.CI), reporter: [['list'], ['html', { open: 'never' }]],
    use: { baseURL: 'http://127.0.0.1:3136', ...devices['Desktop Chrome'], channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
      trace: 'retain-on-failure', screenshot: 'only-on-failure' },
    webServer: { command: 'pnpm --filter @bld8/workbench-web start', url: 'http://127.0.0.1:3136/api/health',
      reuseExistingServer: false, timeout: 60000, env: {
        NEXT_TELEMETRY_DISABLED: '1', AUTH_URL: 'http://127.0.0.1:3136', AUTH_SECRET: TEST_SESSION_SECRET,
        AUTH_GITHUB_ID: 'fixture-client', AUTH_GITHUB_SECRET: 'fixture-secret', WORKBENCH_ALLOWED_GITHUB_IDS: '100,200',
        DATABASE_URL: testUrl!, WORKBENCH_PROVIDER: provider,
        OPENAI_API_KEY: groq ? '' : 'fixture-key-not-a-real-api-key', GROQ_API_KEY: groq ? 'fixture-groq-key-not-real' : '',
        WORKBENCH_MODEL: groq ? 'openai/gpt-oss-120b' : 'gpt-6-luna',
        WORKBENCH_LIVE_ENABLED: 'true', WORKBENCH_DAILY_USER_USD: '1', WORKBENCH_DAILY_APP_USD: '5',
        WORKBENCH_HTTP_FIXTURE: '1', NODE_OPTIONS: `--require=${JSON.stringify(resolve('tests/fixtures/model-http.cjs'))}`,
      } },
  });
}
export default serviceBrowserConfig('openai');
