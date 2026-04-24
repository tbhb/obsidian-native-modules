// ESLint runs on every package's src and test trees, with type-aware rules
// applied to both. `eslint-plugin-sonarjs` contributes
// `sonarjs/cognitive-complexity`. Obsidian submission rules
// (`eslint-plugin-obsidianmd`) apply only to forthcoming plugin directories.
//
// Biome owns general-purpose lint + formatting + the type-aware rules it
// already covers (no-floating-promises, no-misused-promises, no-explicit-any,
// no-non-null-assertion, no-ts-ignore). See `biome.json`.

import type { Linter } from 'eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import obsidianmd from 'eslint-plugin-obsidianmd';
import sonarjs from 'eslint-plugin-sonarjs';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// `obsidianmd.configs.recommended` is a hybrid: its own properties are the
// rules map, while `Symbol.iterator` yields a multi-entry flat config that
// also pulls in `tseslint.configs.recommendedTypeChecked`, sdl, import, and
// depend. Configure tseslint ourselves and narrow to the rules map before
// spreading.
const obsidianRecommendedRules = (obsidianmd.configs?.['recommended'] ?? {}) as Linter.RulesRecord;

const typeAwareRules = {
  '@typescript-eslint/no-unsafe-assignment': 'error',
  '@typescript-eslint/no-unsafe-call': 'error',
  '@typescript-eslint/no-unsafe-member-access': 'error',
  '@typescript-eslint/no-unsafe-return': 'error',
  '@typescript-eslint/no-unsafe-argument': 'error',
  '@typescript-eslint/strict-boolean-expressions': 'error',
  '@typescript-eslint/ban-ts-comment': 'error',
  '@typescript-eslint/no-unnecessary-type-assertion': 'error',
  '@typescript-eslint/no-confusing-void-expression': 'error',
  '@typescript-eslint/restrict-plus-operands': 'error',
  '@typescript-eslint/restrict-template-expressions': 'error',
  '@typescript-eslint/require-await': 'error',
  // Biome owns no-explicit-any (see biome.json). Disable the ESLint variant
  // to keep a single source of truth.
  '@typescript-eslint/no-explicit-any': 'off',
} as const;

export default defineConfig(
  {
    files: ['packages/*/src/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      globals: {
        ...globals.node,
      },
      parserOptions: {
        projectService: {
          allowDefaultProject: ['manifest.json'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      sonarjs,
    },
    rules: {
      'sonarjs/cognitive-complexity': ['error', 15],
      ...typeAwareRules,
    },
  },
  {
    files: ['packages/*/test/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      globals: {
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      sonarjs,
    },
    rules: {
      'sonarjs/cognitive-complexity': ['error', 15],
      ...typeAwareRules,
    },
  },
  // Root-level config files run in Node, not the browser, and have no reason
  // to use `obsidianmd` rules. All four sit in the root tsconfig's `include`.
  {
    files: ['.commitlintrc.ts', 'packages/*/vite.config.ts', 'packages/*/vitest.config.ts'],
    languageOptions: {
      parser: tseslint.parser,
      globals: {
        ...globals.node,
      },
      parserOptions: {
        projectService: {
          allowDefaultProject: ['manifest.json'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      sonarjs,
    },
    rules: {
      'sonarjs/cognitive-complexity': ['error', 15],
      ...typeAwareRules,
    },
  },
  // Mirror Biome's test-mock carve-out: mocks intentionally use looser
  // patterns to mirror runtime APIs without pulling in the full type surface.
  {
    files: ['**/test/__mocks__/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  // TODO: when builder/watcher add CLI entry points (src/bin.ts), uncomment.
  // `n/no-process-exit` is the typical ask; argparse-lib rules may follow.
  // Keep the block scoped to bin.ts so the library surface of each package
  // stays under the full rule set.
  // {
  //   files: ['packages/{builder,watcher}/src/bin.ts'],
  //   rules: {
  //     // 'n/no-process-exit': 'off',
  //   },
  // },
  // Obsidian community-plugin submission rules. `files` currently matches
  // zero files on disk; the globs light up when example plugins land under
  // `examples/*/` and fixture plugins land under `test/fixtures/*/`.
  // TODO: adjust globs once example plugin + fixture plugin paths settle.
  {
    files: ['examples/*/src/**/*.ts', 'test/fixtures/*/src/**/*.ts'],
    plugins: { obsidianmd },
    rules: { ...obsidianRecommendedRules },
  },
  // `hardcoded-config-path` substring-matches `.obsidian` and fires on docs
  // URLs (`docs.obsidian.md/...`). That's a false positive in tests that
  // assert against those URLs; the rule stays active on `src/` paths.
  {
    files: ['packages/*/test/**/*.ts'],
    rules: {
      'obsidianmd/hardcoded-config-path': 'off',
    },
  },
  globalIgnores(['node_modules', '**/dist', '**/coverage', '.husky', '.turbo']),
);
