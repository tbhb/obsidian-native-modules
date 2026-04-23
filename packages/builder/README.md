# @obsidian-native-modules/builder

Build-time orchestrator for compiling Node native modules against Obsidian's Electron ABIs. Offers a CLI plus programmatic API. Wraps `@electron/rebuild` with cached Electron headers, platform-suffixed output naming from [`@obsidian-native-modules/catalog`][catalog], and post-build validation against each package's `PackageSpec`. Consumed by CI matrix jobs and maintainer machines. Part of the [obsidian-native-modules][monorepo] monorepo.

**Status:** scaffold, nothing built yet. See [the design sketch][sketch] in the sandbox vault for the target API surface.

## License

Released under the [MIT License](../../LICENSE).

[monorepo]: https://github.com/tbhb/obsidian-native-modules
[catalog]: https://github.com/tbhb/obsidian-native-modules/tree/main/packages/catalog
[sketch]: https://github.com/tbhb/obsidian-plugin-sandbox/blob/main/obsidian-native-modules-builder.md
