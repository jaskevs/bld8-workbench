import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 2,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:3136',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ...devices['Desktop Chrome'],
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
  },
  webServer: {
    command: 'pnpm --filter @bld8/workbench-web start',
    url: 'http://127.0.0.1:3136/api/health',
    reuseExistingServer: false,
    timeout: 60000,
    env: { NEXT_TELEMETRY_DISABLED: '1', AUTH_SECRET: '', AUTH_GITHUB_ID: '', AUTH_GITHUB_SECRET: '', DATABASE_URL: '', OPENAI_API_KEY: '', GROQ_API_KEY: '', WORKBENCH_PROVIDER: 'openai', WORKBENCH_MODEL: 'gpt-6-luna', WORKBENCH_LIVE_ENABLED: 'false' },
  },
});
