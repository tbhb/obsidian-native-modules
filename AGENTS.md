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
pnpm lint:all && pnpm typecheck && pnpm build && pnpm test
```

The pre-commit hook runs `nano-staged`. The pre-push hook runs typecheck and tests. Never bypass with `--no-verify`.

## Design source

Authoritative design sketches live in the [`obsidian-plugin-sandbox`][sandbox] vault. Consult before adding surface area:

- `obsidian-native-modules.md` covers the monorepo overview.
- `obsidian-native-modules-catalog.md` covers shared types, the platform matrix, and asset naming.
- `obsidian-native-modules-loader.md` covers the runtime resolver.
- `obsidian-native-modules-builder.md` covers the build CLI.
- `obsidian-native-modules-watcher.md` covers the Obsidian release watcher.
- `obsidian-plugin-assets.md` covers the fetch + verify + cache layer the loader delegates to.

Update the sketches if the design shifts in code.

[sandbox]: https://github.com/tbhb/obsidian-plugin-sandbox

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

Root config: `package.json` (workspaces + hoisted dev deps), `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `tsconfig.json` (project references), `biome.json`, `eslint.config.mts`, `cspell.json` + `cspell-words.txt`, `.rumdl.toml`, `.vale.ini` + `.vale/`, `.yamllint.yaml` + `.yamllintignore`, `commitlint.config.js`.

Future packages: `node-pty/`, `better-sqlite3/`. See design sketches.

## Commands reference

```bash
pnpm dev              # turbo run dev (persistent)
pnpm build            # turbo run build (tsc -b per package)
pnpm test             # turbo run test
pnpm test:coverage    # turbo run test:coverage
pnpm typecheck        # turbo run typecheck
pnpm format           # biome format --write
pnpm format:markdown  # rumdl fmt .
pnpm lint             # biome lint + eslint
pnpm lint:markdown    # rumdl check
pnpm lint:prose       # vale
pnpm lint:spelling    # cspell
pnpm lint:yaml        # yamllint --strict
pnpm lint:actions     # actionlint
pnpm lint:all         # every lint above, one command
pnpm vale:sync        # download vale style packages
```

Filter to a specific package: `pnpm --filter @obsidian-native-modules/loader run build`.

## Code style

- Two-space indentation everywhere, enforced by Biome. Single quotes, semicolons, trailing commas, 100-char line width. See `biome.json`.
- ESLint runs `typescript-eslint`'s type-aware rules over `packages/*/src/**/*.ts` for checks Biome doesn't cover.
- Strict TypeScript with ES2022 target, `noUncheckedIndexedAccess`, and `isolatedModules`. Base options in `tsconfig.base.json`; each package extends it with `composite: true` and its own `rootDir` / `outDir`.
- Avoid default exports.

## Build shape

Every package builds with Vite 8 / Rolldown library mode plus `vite-plugin-dts` for rolled-up declarations. Vite emits ECMAScript modules with source maps. One config shape across every repo in the ecosystem. Type-checking runs through `tsc --noEmit`. Vite owns `dist/` emission.

Runtime packages like `catalog`, `loader`, and future per-module wrappers ship into plugin bundles, so size budgets matter. Build-time CLIs `builder` and `watcher` ship with a `bin` entry pointing at their Vite-emitted bundle.

Every runtime dependency stays external so consuming bundlers can tree-shake.

## Testing

- Vitest 4 with the `node` environment.
- Coverage thresholds per package: 100% for the loader and future catalog; per-package shape-dependent elsewhere.
- Each package runs tests independently via `turbo run test` or `pnpm --filter <pkg> test`.

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
  - `pre-push` runs `pnpm typecheck && pnpm test`
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
- Consult the design sketches before adding public surface.
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
