import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Stryker-only Vitest config. Scopes execution to the unit project so
// mutation runs skip the integration tier's on-disk vault fixture and
// the property tier's fast-check iteration count. Keep the obsidian
// alias and jsdom environment in sync with `vitest.config.ts`.
const obsidianMockPath = fileURLToPath(new URL('./test/__mocks__/obsidian.ts', import.meta.url));

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['test/unit/**/*.test.ts'],
    setupFiles: ['test/unit/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      obsidian: obsidianMockPath,
    },
  },
});
