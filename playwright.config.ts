import { defineConfig, devices } from '@playwright/test'

// Smoke suite for the PR pipeline: runs on non-draft PRs (see
// .github/workflows/smoke.yml). Deliberately conservative and offline —
// no AniList calls, no visual baselines, no timing-sensitive assertions.
// The suite serves the built app itself (vite preview on dist/), so it
// tests exactly what a later preview deployment would serve.

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    screenshot: 'off',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
