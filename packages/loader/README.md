# @obsidian-native-modules/loader

Runtime native-module resolver for Obsidian plugins. Given a per-module `PackageSpec` from [`@obsidian-native-modules/catalog`][catalog], resolves to on-disk `.node` paths by checking `node_modules` for dev builds, then the plugin-dir cache, then delegating fetch and sigstore verification to [`obsidian-plugin-assets`][assets]. Part of the [obsidian-native-modules][monorepo] monorepo.

## Install

```bash
npm install @obsidian-native-modules/loader@beta
```

The `beta` dist-tag currently points at a placeholder that only exports a `VERSION` constant. The real surface lands incrementally.

## License

Released under the [MIT License](../../LICENSE).

[monorepo]: https://github.com/tbhb/obsidian-native-modules
[catalog]: https://github.com/tbhb/obsidian-native-modules/tree/main/packages/catalog
[assets]: https://github.com/tbhb/obsidian-plugin-assets
