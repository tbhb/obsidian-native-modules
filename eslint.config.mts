// ESLint runs on every package's src and test trees, with type-aware rules
// applied to both. `eslint-plugin-sonarjs` contributes
// `sonarjs/cognitive-complexity`.
//
// Obsidian community-plugin submission rules live with the package that
// hosts the lint targets: `eslint-plugin-obsidianmd` is a devDep of
// `@obsidian-native-modules/loader` (where integration-test plugin and
// vault fixtures will land). When those fixtures or standalone example
// plugins appear, each such package grows its own `eslint.config.mts`
// that extends this root config and registers obsidianmd scoped to its
// own plugin directories.
//
// Biome owns general-purpose lint + formatting + the type-aware rules it
// already covers (no-floating-promises, no-misused-promises, no-explicit-any,
// no-non-null-assertion, no-ts-ignore). See `biome.json`.

import { defineConfig, globalIgnores } from 'eslint/config';
import sonarjs from 'eslint-plugin-sonarjs';
import globals from 'globals';
import tseslint from 'typescript-eslint';

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
  // Root-level config files run in Node, not the browser. All four sit in
  // the root tsconfig's `include`.
  {
    files: ['.commitlintrc.ts', 'packages/*/vite.config.ts', 'packages/*/vitest.config.ts'],
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
  globalIgnores(['node_modules', '**/dist', '**/coverage', '.husky', '.turbo']),
);
