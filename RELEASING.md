# Releasing

Releases run through [release-please][release-please] in monorepo mode. Each package has its own release line and its own GitHub release PR.

[release-please]: https://github.com/googleapis/release-please-action

## Channels

- **Stable channel.** Push [conventional commits][conventional-commits] to `main`. release-please opens one release PR per affected package. Each PR bumps that package's `package.json` version and updates its `CHANGELOG.md`. Merging cuts a tag like `loader-v1.2.3` (component-prefixed) and a GitHub release. The publish job runs the monorepo build, attests the artifact via sigstore, and publishes to npm via trusted publishing under the `@obsidian-native-modules` org.
- **Beta channel.** Push to the `beta` branch. Same flow driven by `.github/release-please-config.beta.json`. Produces `loader-v1.2.3-beta.1`-style tags marked as pre-releases and publishes to npm under the `beta` dist-tag so `npm install` keeps resolving to the latest stable.

Only `feat:`, `fix:`, and commits with breaking changes trigger a release PR. Scope the header (`feat(loader): ...`) to route the release to the right package. `chore:`, `docs:`, `refactor:`, `style:`, `test:`, `ci:`, and `build:` commits land without opening one.

[conventional-commits]: https://www.conventionalcommits.org/

## Trust model

- **npm trusted publishing.** The `release` workflow runs under the `release` GitHub environment. The OIDC token carries an `environment: release` claim. Each package's trusted publisher configuration on npm pins that claim plus the repo and workflow file. No `NPM_TOKEN` secret enters the flow.
- **sigstore provenance.** `pnpm publish --provenance` emits an npm provenance statement on each published version. Consumers verifying via `npm audit signatures` or sigstore's verify tooling can confirm the package came from this repo's `release` environment.
- **Build attestation.** The workflow also emits a `actions/attest-build-provenance` statement attached to the GitHub release. Consumers of the prebuild assets (not the npm packages) verify against that attestation.

## What not to hand-edit

release-please owns the following files. Don't edit them by hand and don't create tags manually.

- Every `packages/*/package.json` `version` field
- Every `packages/*/CHANGELOG.md`
- `.github/release-please-manifest.json`
- Git tags

## Verifying a package release

```bash
npm install -g @obsidian-native-modules/loader
npm audit signatures @obsidian-native-modules/loader
```

Clean output means sigstore confirms the package provenance matches the expected workflow identity.

## Verifying a prebuild asset

Native-module release assets carry a separate sigstore attestation via `actions/attest-build-provenance`. Verify with `gh`:

```bash
gh release download loader-v1.0.0 -R tbhb/obsidian-native-modules -p 'pty-darwin-arm64.node'
gh attestation verify pty-darwin-arm64.node --repo tbhb/obsidian-native-modules
```

Clean exit means sigstore confirms the asset matches the one the release workflow signed, with the OIDC identity tracing back to this repo's `release` environment on a GitHub-hosted runner.

## The prebuild matrix

Builder produces prebuild assets per `(package × platform × electron ABI)` tuple. See [`obsidian-native-modules-builder.md`][builder-sketch] in the sandbox vault for the matrix shape and the per-platform quirks. Watcher opens PRs to widen the matrix when new Electron ABIs appear in Obsidian releases. See [`obsidian-native-modules-watcher.md`][watcher-sketch] for that flow.

[builder-sketch]: https://github.com/tbhb/obsidian-plugin-sandbox/blob/main/obsidian-native-modules-builder.md
[watcher-sketch]: https://github.com/tbhb/obsidian-plugin-sandbox/blob/main/obsidian-native-modules-watcher.md
