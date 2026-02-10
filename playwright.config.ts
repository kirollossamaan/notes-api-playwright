/**
 * Playwright test runner config for Notes API tests.
 * Runs tests from src/tests, uses HTML report with response attachments, single worker for stable API order.
 */

import { defineConfig } from '@playwright/test';
import { BASE_URL } from './src/config/env';

export default defineConfig({
  testDir: './src/tests',
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL: BASE_URL,
    extraHTTPHeaders: { Accept: 'application/json' },
  },
  timeout: 30000,
});
