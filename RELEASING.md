# Releasing

Releases run through [release-please][release-please] in monorepo mode on a single branch (`main`). Each package has its own release line and its own tag. Both stable and beta releases ship from the same branch. The dist-tag and the GitHub-release prerelease flag come from the version string.

[release-please]: https://github.com/googleapis/release-please-action

## Single-branch prerelease flow

Push [conventional commits][conventional-commits] to `main`. release-please opens a grouped release PR bumping every affected package. Merging cuts one tag per package (like `loader-1.2.3`) and a GitHub release. The publish job builds, attests via sigstore, and publishes each released package to npm via trusted publishing under the `@obsidian-native-modules` org.

Only `feat:`, `fix:`, and commits with breaking changes trigger a release PR. `chore:`, `docs:`, `refactor:`, `style:`, `test:`, `ci:`, and `build:` commits land without opening one. release-please attributes commits to packages by path: any commit touching `packages/<name>/**` releases that package on the next cycle.

[conventional-commits]: https://www.conventionalcommits.org/

### Stable vs beta

Version string alone determines the channel:

- **Stable release.** Normal `feat` or `fix` bumps under `bump-minor-pre-major: true` and `bump-patch-for-minor-pre-major: true`. Published to npm under the default `latest` dist-tag. The GitHub release stays unmarked.
- **Beta release.** Version carries a prerelease qualifier such as `0.1.0-beta.2`. Trigger via a `Release-As: 0.1.0-beta.2` footer on any qualifying commit that touches at least one `packages/<name>/**` path. release-please's `prerelease` config option, once enabled, stays on for every release regardless of the version qualifier, so `release.yml` flips the GitHub prerelease flag itself. It edits each released `<component>-<version>` tag to `prerelease=true` when the version carries a qualifier and leaves stable tags unflagged. The publish job also detects the `-` in the version string and passes `--tag beta` to `npm publish`, so `npm install` keeps resolving to the highest stable version.

BRAT honors GitHub's `prerelease` flag for beta-testers, which covers the user-visible staging channel without a separate branch.

## Trust model

- **Release-bot token.** The `release-please` job runs under a token minted from the `tbhb-releases` GitHub App. The workflow reads `RELEASE_BOT_APP_ID` as a repo variable and `RELEASE_BOT_PRIVATE_KEY` as a repo secret. An App-issued token bypasses GitHub's recursion-prevention rule so the release PR push triggers CI. It also bypasses the first-time-contributor workflow-approval gate.
- **npm trusted publishing.** The `release` workflow runs under the `npm` GitHub environment. The OIDC token carries an `environment: npm` claim. Each package's trusted-publisher configuration on npm pins that claim plus the repo and workflow filename. No `NPM_TOKEN` secret enters the flow.
- **sigstore provenance.** `npm publish --provenance` emits an npm provenance statement on each published version. Consumers verifying via `npm audit signatures` or sigstore's verify tooling can confirm the package came from this repo's `npm` environment.
- **Build attestation.** The workflow also emits an `actions/attest-build-provenance` statement covering every `packages/*/dist/index.js`. Consumers of the prebuild assets (not the npm packages) verify against that attestation.

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
gh release download loader-1.0.0 -R tbhb/obsidian-native-modules -p 'pty-darwin-arm64.node'
gh attestation verify pty-darwin-arm64.node --repo tbhb/obsidian-native-modules
```

Clean exit means sigstore confirms the asset matches the one the release workflow signed, with the OIDC identity tracing back to this repo's `npm` environment on a GitHub-hosted runner.

## The prebuild matrix

Builder produces prebuild assets per `(package × platform × electron ABI)` tuple. Watcher opens PRs to widen the matrix when new Electron ABIs appear in Obsidian releases.
