/*
 * Biome handles general lint and formatting — see `biome.json`.
 *
 * ESLint runs typescript-eslint's type-aware rules over every package's
 * `src/` for checks Biome doesn't cover (no-floating-promises,
 * no-misused-promises, and other rules that need the TypeScript type-checker).
 * `eslint-plugin-sonarjs` contributes `sonarjs/cognitive-complexity` so
 * functions that grow hard to reason about fail lint instead of review.
 */

import { globalIgnores } from 'eslint/config';
import sonarjs from 'eslint-plugin-sonarjs';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    files: ['packages/*/src/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        projectService: {
          allowDefaultProject: ['eslint.config.mts'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    extends: [...tseslint.configs.recommendedTypeChecked],
    plugins: { sonarjs },
    rules: {
      'sonarjs/cognitive-complexity': ['error', 15],
    },
  },
  globalIgnores([
    'node_modules',
    '**/dist',
    '**/coverage',
    '**/*.config.ts',
    'commitlint.config.js',
    '**/test',
    '.husky',
    '.turbo',
  ]),
);
