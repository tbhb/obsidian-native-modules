# obsidian-native-modules

Prebuilt Node native modules for Obsidian plugins, compiled against Obsidian's Electron ABIs. A runtime loader fetches the matching prebuild at plugin load. A build-time CLI produces the prebuilds. A scheduled watcher tracks new Electron versions as Obsidian ships them.

## Why

Obsidian's community plugin catalog and [BRAT] both download exactly three files per plugin release. Those three files always include `main.js`, `manifest.json`, and `styles.css`. Neither channel carries platform-specific native binaries. Plugins depending on Node native modules like `node-pty` or `better-sqlite3` have had to either ship no auto-update path or inline every platform's binary into `main.js` via base64.

This monorepo splits the problem. It builds and attests per-platform natives against each Obsidian Electron ABI, publishes them to GitHub releases, and provides a runtime loader that fetches the matching one at plugin load, verifies its sigstore attestation, and caches in the plugin directory. Plugins stay BRAT- and catalog-distributable for the JS layer.

[brat]: https://tfthacker.com/brat-developers

## Status

Pre-release scaffold. The public API remains under design, and no runtime surface ships yet.

## Packages

- `@obsidian-native-modules/catalog` holds the shared platform matrix, asset-naming rules, and type definitions. Consumed by every other package.
- `@obsidian-native-modules/loader` provides the runtime native-module resolver. Ships in consuming plugin bundles and delegates fetch plus verify to `obsidian-plugin-assets`.
- `@obsidian-native-modules/builder` provides the build-time orchestrator. Compiles each package's upstream native against a target Electron ABI via a CLI and programmatic API.
- `@obsidian-native-modules/watcher` provides the build-time Obsidian release watcher. Opens PRs when a new Electron ABI appears in any Obsidian channel.

Future per-module wrappers: `@obsidian-native-modules/node-pty` and `@obsidian-native-modules/better-sqlite3`.

## Development

See [`DEVELOPMENT.md`](DEVELOPMENT.md) for the contributor guide. [`AGENTS.md`](AGENTS.md) has the condensed version for AI coding agents, and Claude Code imports it automatically via [`CLAUDE.md`](CLAUDE.md).

Release details live in [`RELEASING.md`](RELEASING.md).

## Artificial intelligence disclosure

Claude helped draft code, tests, documentation, and the release pipeline under human direction. See [`AI_DISCLOSURE.md`](AI_DISCLOSURE.md) for the full Artificial Intelligence Disclosure (AID) statement.

## License

Released under the [MIT License](LICENSE).
