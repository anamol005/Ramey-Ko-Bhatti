import {defineConfig} from '@playwright/test';

// The live site and Render's free tier can be slow to wake up,
// so the timeouts are generous.
export default defineConfig({
  testDir: './e2e',
  timeout: 90000,
  retries: 1,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
});
