import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Three tiers split by directory under test/. `unit` exercises source
    // modules with deterministic cases and owns the 100% coverage gate.
    // `integration` exercises the package against real dependencies (disk,
    // child processes, etc.) as tests land. `property` runs fast-check
    // properties over pure logic and stays out of coverage so fuzzed cases
    // can't game the threshold.
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['test/unit/**/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          environment: 'node',
          include: ['test/integration/**/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'property',
          environment: 'node',
          include: ['test/property/**/*.test.ts'],
        },
      },
    ],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html', 'json'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'test/**', '**/__mocks__/**'],
      // The scaffold ships at 100% across all metrics. Any regression in
      // branches, lines, functions, or statements fails CI.
      thresholds: {
        perFile: true,
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});
