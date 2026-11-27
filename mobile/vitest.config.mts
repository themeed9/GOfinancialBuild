import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/__tests__/**/*.test.ts'],
    environment: 'node',
    // Run in a timezone with daylight saving so date bugs surface in CI.
    globalSetup: ['./vitest.setup.ts'],
  },
});
