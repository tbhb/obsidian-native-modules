import { defineConfig } from 'vitest/config';

// Stryker-only Vitest config. Scopes execution to the unit project so
// mutation runs skip the property tier's fast-check iteration count and
// any future integration fixtures. Keep in sync with `vitest.config.ts`.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/unit/**/*.test.ts'],
    globals: true,
  },
});
