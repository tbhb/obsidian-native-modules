# @obsidian-native-modules/watcher

Build-time Obsidian release watcher. Runs on a daily CI schedule and as a maintainer CLI, checking Obsidian's public release channels for new Electron ABIs and opening PRs that update `tracked-electron-versions.json` and widen the prebuild matrix. Part of the [obsidian-native-modules][monorepo] monorepo.

## Install

```bash
npm install --save-dev @obsidian-native-modules/watcher@beta
```

The `beta` dist-tag currently points at a placeholder that only exports a `VERSION` constant. The real surface lands incrementally.

## License

Released under the [MIT License](../../LICENSE).

[monorepo]: https://github.com/tbhb/obsidian-native-modules
