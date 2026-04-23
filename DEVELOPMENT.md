# Development guide

Contributor guide for `obsidian-native-modules`. For the condensed AI-coding-agent version, see [`AGENTS.md`](AGENTS.md).

## Prerequisites

- [Node.js][nodejs] 22.22.0, pinned in `.node-version`. Any tool that reads `.node-version` ([mise][mise], `fnm`, `nvm`) picks it up automatically.
- [pnpm][pnpm] 10.32.1, pinned via the `packageManager` field and resolved by [Corepack][corepack].
- A shell capable of running POSIX scripts. macOS, Linux, or WSL all work.

Linters outside npm that install before `pnpm lint:all`:

- [rumdl][rumdl] for markdown. `cargo install rumdl` or Homebrew.
- [vale][vale] for prose. Homebrew or a release binary.
- [actionlint][actionlint] for GitHub Actions. Homebrew.

`yamllint` runs via `uvx` in CI, so it doesn't need a local install. Homebrew works if you prefer the raw binary.

[nodejs]: https://nodejs.org/
[mise]: https://mise.jdx.dev/
[pnpm]: https://pnpm.io/
[corepack]: https://nodejs.org/api/corepack.html
[rumdl]: https://github.com/rvben/rumdl
[vale]: https://vale.sh/
[actionlint]: https://github.com/rhysd/actionlint

## First-time setup

```bash
git clone https://github.com/tbhb/obsidian-native-modules.git
cd obsidian-native-modules
pnpm install
pnpm build
```

`pnpm install` runs the `prepare` script, which invokes husky and wires git hooks into `.husky/_`.

Before the first markdown-lint run, sync Vale's style packages:

```bash
pnpm vale:sync
```

That downloads Google, write-good, proselint, and the AI-tells packages into `.vale/`. The downloads go into gitignored subdirectories. The project-specific style under `.vale/obsidian-native-modules/` and the vocabulary under `.vale/config/vocabularies/obsidian-native-modules/` stay committed.

## Monorepo layout

pnpm workspaces manages the package graph. Turborepo orchestrates tasks across packages. TypeScript project references make incremental type-checking graph-aware.

Each package lives under `packages/<name>/` with its own `package.json`, `tsconfig.json`, and `src/`. The root `tsconfig.json` carries references. `tsconfig.base.json` holds the shared compiler options.

## Development loop

Working on one package at a time covers the common case:

```bash
pnpm --filter @obsidian-native-modules/loader run dev
pnpm --filter @obsidian-native-modules/loader run test
```

Turbo-wide tasks:

```bash
pnpm build         # builds every package in topo order
pnpm test          # runs every package's tests
pnpm typecheck     # tsc -b across the project graph
```

Turbo caches outputs locally at `.turbo/`. Cache invalidates when `src/`, `tsconfig.json`, or `package.json` changes per its `inputs` declarations in `turbo.json`.

## Linting

| Tool | Domain | Config |
| --- | --- | --- |
| Biome | TypeScript, JavaScript, JSON, CSS. Format, lint, import sort. | `biome.json` |
| ESLint | Type-aware rules Biome doesn't cover, like `no-floating-promises` | `eslint.config.mts` |
| rumdl | Markdown structure | `.rumdl.toml` |
| vale | Prose style and sentence case | `.vale.ini` + `.vale/` |
| cspell | Spelling across all text files | `cspell.json` + `cspell-words.txt` |
| yamllint | YAML structure and line length | `.yamllint.yaml` + `.yamllintignore` |
| actionlint | GitHub Actions workflow correctness | runs on `.github/workflows/*.yml` |

Run every linter with:

```bash
pnpm lint:all
```

Each `lint:*` script runs a single tool. Check `package.json` for the full list.

### Fixing common lint failures

- **Biome complains about formatting.** Run `pnpm format`.
- **ESLint flags a rule.** Read the rule, fix in the source file. `pnpm check:fix` auto-fixes where possible.
- **rumdl reports `MD040` missing language.** Add a language hint after the opening triple backticks.
- **vale reports unknown words.** Add the term to `.vale/config/vocabularies/obsidian-native-modules/accept.txt`.
- **cspell reports unknown words.** Add them to `cspell-words.txt`, one per line.
- **yamllint reports a long line.** Break with a folded scalar, or add `# yamllint disable-line rule:line-length`.

## Testing

Vitest 4 per package. Turbo runs `turbo run test` across packages in parallel where the graph permits.

Coverage thresholds live per package. The loader and future catalog target 100%. Other packages carry shape-dependent thresholds. Builder and watcher won't reach 100% without mocking large sub-process boundaries.

## Commit conventions

Conventional commits enforced by commitlint. Scope the header to the package where practical:

```text
feat(loader): implement ensureNative resolution order
fix(builder): propagate validation exit code
chore(deps): bump typescript to 5.8.3
```

Header under 100 characters. Body and footer under 120 characters per line.

## Release process

Release-please runs in monorepo mode, opening separate PRs per package. See [`RELEASING.md`](RELEASING.md) for the full guide.

## Troubleshooting

### `pnpm install` warns about peer dependencies

Expected while packages cross-reference `workspace:*` before their first publish. The override lives in the root `package.json` if new warnings show up.

### Turbo cache doesn't pick up a change

Check the `inputs` array for the task in `turbo.json`. If the file you edited doesn't appear in any `inputs` entry, Turbo can't know to invalidate. Either add it to `inputs` or edit a file already listed in the array.

### A hook refuses to run

Run `pnpm run prepare` to regenerate the `.husky/_` wrapper directory.

### Vale complains about unknown words

Extend `.vale/config/vocabularies/obsidian-native-modules/accept.txt`. The file takes one regular expression per line. Prefer spelling out proper names in full and reach for broad patterns like `[A-Z]{2,}` only as a last resort.

### CI fails on a rumdl rule for `CHANGELOG.md`

release-please owns the changelog format and emits `*` list markers plus leading blank lines that clash with the rumdl style. Mirror the exclusion pattern from obsidian-shell's `.rumdl.toml` if it lands here too.

## See also

- [`README.md`](README.md) for the user-facing overview
- [`AGENTS.md`](AGENTS.md) for the condensed agent guide
- [`RELEASING.md`](RELEASING.md) for the release pipeline
- [`AI_DISCLOSURE.md`](AI_DISCLOSURE.md) for the AI disclosure statement
- [`CHANGELOG.md`](CHANGELOG.md) for release history
