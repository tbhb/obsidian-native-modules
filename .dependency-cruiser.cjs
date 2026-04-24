/** @type {import('dependency-cruiser').IConfiguration} */

// Single root config covers every package under `packages/*/`. Once a wrapper
// package needs module-graph rules the root config can't express cleanly
// (e.g. `node-pty`'s conditional native path imports on darwin/win32 that
// static resolvers can't follow), split to per-package `.dependency-cruiser.cjs`
// files and fan out via turbo.

module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment:
        'Circular dependencies make a module graph hard to reason about and often ' +
        'indicate a responsibility that should live in a third module. Break the cycle ' +
        'by extracting shared types, inverting a dependency, or moving the import site.',
      from: {},
      to: {
        circular: true,
        // Ignore cycles that are only held together by `import type` edges;
        // those disappear after tsc emits and do not exist at runtime.
        viaOnly: { dependencyTypesNot: ['type-only'] },
      },
    },
    {
      name: 'no-orphans',
      severity: 'error',
      comment:
        'An orphan module is reachable from no other module. Either import it, make it ' +
        'a package entry, or delete it. Add a pathNot exception below for intentional ' +
        'orphans such as config files.',
      from: {
        orphan: true,
        pathNot: [
          '(^|/)[.][^/]+[.](?:js|cjs|mjs|ts|cts|mts|json)$',
          '[.]d[.]ts$',
          '(^|/)tsconfig[.]json$',
          // Plugin entry. The bundler is the only thing that imports it.
          // Dormant until example and fixture plugins land outside packages/.
          '(^|/)src/main[.]ts$',
          // Vitest test files are entry points registered by the runner.
          '(^|/)test/.*[.]test[.]ts$',
          // Vitest setup files and mocks, wired in through vitest.config.ts
          // setupFiles and resolve.alias string paths (no direct import edge).
          '(^|/)test/setup-dom[.]ts$',
          '(^|/)test/(?:unit|integration)/setup[.]ts$',
          '(^|/)test/__mocks__/.*[.]ts$',
        ],
      },
      to: {},
    },
    {
      name: 'not-to-unresolvable',
      severity: 'error',
      comment:
        "A module imports something that cannot be resolved on disk. If it's an npm " +
        'package, add it to package.json; otherwise fix the path.',
      from: {},
      to: { couldNotResolve: true },
    },
    {
      name: 'no-duplicate-dep-types',
      severity: 'error',
      comment:
        'An npm package is declared more than once in package.json (e.g. both in ' +
        'dependencies and devDependencies). Pick one section.',
      from: {},
      to: {
        moreThanOneDependencyType: true,
        dependencyTypesNot: ['type-only'],
      },
    },
    {
      name: 'not-to-deprecated',
      severity: 'error',
      comment: 'A module depends on a deprecated npm package. Upgrade or replace it.',
      from: {},
      to: { dependencyTypes: ['deprecated'] },
    },
    {
      name: 'no-non-package-json',
      severity: 'error',
      comment:
        "A module depends on an npm package that isn't declared in package.json. " +
        'Add it, or fix the import path.',
      from: {},
      to: { dependencyTypes: ['npm-no-pkg', 'npm-unknown'] },
    },
    {
      name: 'not-to-test',
      severity: 'error',
      comment:
        "Production source under a package's src/ must not depend on its test/. Move " +
        'shared fixtures to a non-test location. Exception: typecheck-time obsidian mock.',
      from: { path: '^packages/[^/]+/src' },
      to: {
        path: '^packages/[^/]+/test',
        pathNot: '(^|/)test/__mocks__/obsidian\\.ts$',
      },
    },
    {
      name: 'not-to-spec',
      severity: 'error',
      comment:
        'Production source must not depend on a spec file. Factor shared helpers ' +
        'out of the spec and into a utility module.',
      from: { pathNot: '[.](?:spec|test)[.](?:js|mjs|cjs|jsx|ts|mts|cts|tsx)$' },
      to: { path: '[.](?:spec|test)[.](?:js|mjs|cjs|jsx|ts|mts|cts|tsx)$' },
    },
    {
      name: 'not-to-dev-dep',
      severity: 'error',
      comment:
        "Production source under a package's src/ must not import a devDependency. " +
        "Move the package to 'dependencies', or add a pathNot exception for bundler-only " +
        "shims. Exception: 'obsidian' is provided at runtime by the host app.",
      from: {
        path: '^packages/[^/]+/src',
        pathNot: '[.](?:spec|test)[.](?:js|mjs|cjs|jsx|ts|mts|cts|tsx)$',
      },
      to: {
        dependencyTypes: ['npm-dev'],
        dependencyTypesNot: ['type-only'],
        pathNot: ['node_modules/@types/', '^node_modules/obsidian/'],
      },
    },
  ],
  options: {
    doNotFollow: { path: ['node_modules'] },
    includeOnly: '^packages/[^/]+/(src|test)/',
    // 'specify' tags each edge with 'type-only' when appropriate so rules can
    // differentiate runtime imports from compile-time type imports.
    tsPreCompilationDeps: 'specify',
    // No `tsConfig` option: packages have their own tsconfigs with no paths
    // aliases, so depcruise resolves imports via node module resolution plus
    // the pnpm workspace symlinks.
    detectProcessBuiltinModuleCalls: true,
    skipAnalysisNotInRules: true,
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      extensions: ['.ts', '.css'],
      mainFields: ['module', 'main', 'types', 'typings'],
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/(?:@[^/]+/[^/]+|[^/]+)',
      },
      archi: {
        collapsePattern:
          '^(?:packages|src|lib(s?)|app(s?)|bin|test(s?)|spec(s?))/[^/]+|node_modules/(?:@[^/]+/[^/]+|[^/]+)',
      },
      text: { highlightFocused: true },
    },
  },
};
