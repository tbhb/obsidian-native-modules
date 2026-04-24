# AGENTS.md

Guidance for AI coding agents working in this monorepo. The repository publishes prebuilt Node native modules for Obsidian plugins, a runtime loader that fetches the matching prebuild at plugin load, and build-time tooling that produces and tracks those prebuilds.

## Quickstart

Run these commands on a fresh clone:

```bash
pnpm install          # install deps across the workspace + init husky hooks
pnpm typecheck        # tsc -b across every package via turbo
pnpm test             # vitest per package via turbo
pnpm build            # tsc -b per package via turbo, emits each package's dist/
```

Run the full gate before pushing:

```bash
pnpm lint:all && pnpm typecheck && pnpm build && pnpm test:coverage && pnpm test:integration && pnpm test:property
```

The pre-commit hook runs `nano-staged`. The pre-push hook runs the full gate: `lint:all`, `typecheck`, `build`, `test:coverage`, `test:integration`, `test:property`, and `danger:local`. Coverage stays scoped to the `unit` project so fuzzed property cases and integration tests can't game the 100% threshold. `test:integration` and `test:property` run their tiers separately. Never bypass with `--no-verify`.

## Repository layout

```text
packages/
├── catalog/                # @obsidian-native-modules/catalog    (shared types + conventions)
├── loader/                 # @obsidian-native-modules/loader     (runtime, ships in plugins)
├── builder/                # @obsidian-native-modules/builder    (build-time CLI)
└── watcher/                # @obsidian-native-modules/watcher    (build-time CLI)
.github/
├── workflows/ci.yml                     # Lint, Build, Test, Documentation jobs
├── workflows/release.yml                # release-please + build + publish to npm
├── release-please-config.json           # monorepo mode, per-package release lines
├── release-please-manifest.json         # per-package versions
└── dependabot.yml
```

Root config: `package.json` (workspaces + hoisted dev deps), `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `tsconfig.json` (project references), `biome.json`, `eslint.config.mts`, `.dependency-cruiser.cjs`, `.jscpd.json`, `.knip.json`, `.cspell.json` + `cspell-words.txt`, `.rumdl.toml`, `.vale.ini` + `.vale/`, `.yamllint.yaml` + `.yamllintignore`, `.commitlintrc.ts`.

Future packages: `node-pty/`, `better-sqlite3/`, and other upstream-wrapper packages.

## Commands reference

```bash
pnpm dev              # turbo run dev (persistent)
pnpm build            # turbo run build (tsc -b per package)
pnpm test             # turbo run test (all projects per package)
pnpm test:unit        # turbo run test:unit (deterministic unit tier per package)
pnpm test:integration # turbo run test:integration (fixture-driven integration tier per package)
pnpm test:property    # turbo run test:property (fast-check property tier per package)
pnpm test:coverage    # turbo run test:coverage (unit project only, 100% gate)
pnpm typecheck        # turbo run typecheck
pnpm format           # biome format --write
pnpm format:markdown  # rumdl fmt .
pnpm lint             # biome lint + eslint
pnpm lint:deps        # dependency-cruiser on packages/*/src and packages/*/test
pnpm lint:jscpd       # jscpd copy-paste detector on packages/*/src and packages/*/test
pnpm lint:knip        # knip, unused files, exports, deps
pnpm lint:markdown    # rumdl check
pnpm lint:prose       # vale
pnpm lint:spelling    # cspell
pnpm lint:yaml        # yamllint --strict
pnpm lint:actions     # actionlint
pnpm lint:all         # every lint above, one command
pnpm depcruise:graph  # mermaid module graph -> dependency-graph.mmd
pnpm vale:sync        # download vale style packages
```

Filter to a specific package: `pnpm --filter @obsidian-native-modules/loader run build`.

## Code style

- Two-space indentation everywhere, enforced by Biome. Single quotes, semicolons, trailing commas, 100-char line width. See `biome.json`.
- ESLint runs on `packages/*/src/**/*.ts` and `packages/*/test/**/*.ts`, with type-aware rules applied to both.
- `eslint-plugin-sonarjs` contributes `sonarjs/cognitive-complexity` at the default threshold of 15. Prefer extracting helper functions over raising the threshold.
- [dependency-cruiser][depcruise] guards each package's module graph via `.dependency-cruiser.cjs`. It forbids runtime circular dependencies, orphan modules, unresolvable imports, dev-dependency imports from any `packages/*/src/`, duplicate dependency-type declarations, and `packages/*/src/` depending on `packages/*/test/`. Cycles composed only of `import type` edges pass, since those edges vanish after tsc emits. The rule exempts `obsidian` from the dev-dep check so plugin sources under forthcoming `examples/` or `test/fixtures/` directories can import it once they land.
- [Knip][knip] catches unused files, exports, and dependencies via `.knip.json`. It runs workspace-aware with one entry per package, so per-package project globs and ignore lists stay edit-in-place as packages diverge. External binaries called from npm scripts sit in `ignoreBinaries` so knip skips them; the list covers `actionlint`, `rumdl`, `vale`, and `yamllint`.
- [jscpd][jscpd] detects copy-paste duplication across every package's `src/` and `test/` via `.jscpd.json`. The config sets `threshold: 0` so any clone fails the lint, honors `.gitignore`, and uses the default `mode: mild` with `minTokens: 50` and `minLines: 5`. Prefer extracting a shared helper into `@obsidian-native-modules/catalog` or an in-package helpers directory over silencing a clone. The on-demand `html` reporter writes to `./report/`, which `.gitignore` excludes.
- Strict TypeScript with ES2022 target and the full suite of strict flags: `noUncheckedIndexedAccess`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, plus `allowUnreachableCode: false` and `allowUnusedLabels: false`. Base options in `tsconfig.base.json`; each package's `tsconfig.json` extends it and includes both `src/**/*.ts` and `test/**/*.ts` in one pass.
- Avoid default exports.

[depcruise]: https://github.com/sverweij/dependency-cruiser
[jscpd]: https://github.com/kucherenko/jscpd
[knip]: https://knip.dev/

## Build shape

Every package builds with Vite 8 / Rolldown library mode plus `vite-plugin-dts` for rolled-up declarations. Vite emits ECMAScript modules with source maps. One config shape across every repo in the ecosystem. Type-checking runs through `tsc --noEmit`. Vite owns `dist/` emission.

Runtime packages like `catalog`, `loader`, and future per-module wrappers ship into plugin bundles, so size budgets matter. Build-time CLIs `builder` and `watcher` ship with a `bin` entry pointing at their Vite-emitted bundle.

Every runtime dependency stays external so consuming bundlers can tree-shake.

## Testing

- Vitest 4. Projects run on `node` unless they drive plugin code, in which case they run on `jsdom` with a per-package `obsidian` mock aliased through `resolve.alias`.
- Each package's `vitest.config.ts` declares three projects split by directory under `test/`. `unit` covers source modules with deterministic cases under `test/unit/**`. `integration` drives the package against real dependencies under `test/integration/**`. The loader integration tier copies a checked-in vault fixture to a tmpdir, installs the fixture plugin manifest, and runs assertions through a filesystem-backed `Vault` from `test/__mocks__/obsidian.ts`. `property` runs [fast-check][fast-check] properties over pure logic under `test/property/**` via [`@fast-check/vitest`][fast-check-vitest], which exposes `test.prop` and `it.prop` helpers. The default seed policy stays in place; fast-check prints the seed on failure, so reproducing a counterexample takes a single rerun with the printed seed.
- Coverage thresholds per package: 100% for the loader and future catalog; per-package shape-dependent elsewhere. `pnpm test:coverage` scopes collection to the `unit` project so integration and property cases can't game the gate. Save integration suites under `test/integration/` and property suites under `test/property/` rather than `test/unit/` so coverage metrics stay tied to deterministic cases.
- Each package runs tests independently via `turbo run test` or `pnpm --filter <pkg> test`. Per-package scripts mirror the root: `test:unit`, `test:integration`, `test:property`, `test:coverage`.

[fast-check]: https://fast-check.dev/
[fast-check-vitest]: https://github.com/dubzzz/fast-check/tree/main/packages/vitest

## Documentation linting

Every markdown, YAML, and workflow file ships through a gate before landing:

- `rumdl` for markdown structure
- `vale` for prose style (sentence case, active voice, contractions, short parentheticals, concrete word choice)
- `cspell` for spelling, backed by `cspell-words.txt`
- `yamllint` for YAML
- `actionlint` for GitHub Actions workflows

Add new technical terms to `cspell-words.txt` and `.vale/config/vocabularies/obsidian-native-modules/accept.txt` when Vale flags them. Avoid em-dashes entirely. Keep parentheticals short. Write paragraphs on a single line. Use reference-style links with definitions at the bottom of their containing paragraph.

## Git workflow

- [Conventional commits][conventional-commits] via commitlint. Header under 100 characters. Body and footer under 120 characters per line.
- Scope the header to the affected package where practical: `feat(loader): ...`, `fix(builder): ...`, `chore(deps): ...`.
- husky hooks installed automatically by `pnpm install`:
  - `pre-commit` runs `nano-staged` across the staged files
  - `commit-msg` runs commitlint
  - `pre-push` runs `pnpm lint:all && pnpm typecheck && pnpm build && pnpm test:coverage && pnpm test:integration && pnpm test:property && pnpm danger:local`
- Never use `--no-verify`. Fix the underlying failure.
- Work on a feature branch, open a PR, and merge via squash.

[conventional-commits]: https://www.conventionalcommits.org/

## Release process

release-please runs in monorepo mode on a single branch (`main`). See [`RELEASING.md`](RELEASING.md) for the full guide: the single-branch prerelease flow, trust model, sigstore verification, and the prebuild matrix.

- Only `feat:`, `fix:`, and commits with breaking changes trigger a release PR. File paths under `packages/<name>/**` determine which package gets bumped.
- `chore:`, `docs:`, `refactor:`, `style:`, `test:`, `ci:`, and `build:` commits don't open release PRs.
- To cut a beta release, add a `Release-As: x.y.z-beta.N` footer to a qualifying commit. The version string drives both the GitHub `prerelease: true` flag and the npm `--tag beta` dist-tag in the publish workflow.
- Don't hand-edit `packages/*/package.json` `version`, `packages/*/CHANGELOG.md`, `.github/release-please-manifest.json`. Don't create tags manually.

## Rules at a glance

- Run the full gate before pushing.
- Add new technical terms to `cspell-words.txt` and the Vale vocabulary.
- Write reference-style markdown links with definitions at the bottom of the paragraph.
- Avoid em-dashes, passive voice, and italicized copulas in prose.
- Keep paragraphs on one line. No hard wrap.
- Don't force-push to `main`.
- Don't bypass hooks.
- Don't hand-edit release-managed files.

## Further reading

- `README.md` for the user-facing overview
- `DEVELOPMENT.md` for the human developer guide
- `RELEASING.md` for the release pipeline and verification
- `AI_DISCLOSURE.md` for the AI disclosure statement
- `CHANGELOG.md` for release history
