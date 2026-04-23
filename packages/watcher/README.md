# @obsidian-native-modules/watcher

Build-time Obsidian release watcher. Runs on a daily CI schedule and as a maintainer CLI, checking Obsidian's public release channels for new Electron ABIs and opening PRs that update `tracked-electron-versions.json` and widen the prebuild matrix. Part of the [obsidian-native-modules][monorepo] monorepo.

**Status:** scaffold, nothing built yet. See [the design sketch][sketch] in the sandbox vault for the target API surface.

## License

Released under the [MIT License](../../LICENSE).

[monorepo]: https://github.com/tbhb/obsidian-native-modules
[sketch]: https://github.com/tbhb/obsidian-plugin-sandbox/blob/main/obsidian-native-modules-watcher.md
