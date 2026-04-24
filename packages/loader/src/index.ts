/**
 * @obsidian-native-modules/loader
 *
 * Runtime native-module resolver for Obsidian plugins. Given a per-module
 * `PackageSpec` from `@obsidian-native-modules/catalog`, resolves to on-disk
 * `.node` paths: checks `node_modules` for dev builds, then the plugin-dir
 * cache, then delegates fetch and sigstore verification to
 * `obsidian-plugin-assets`.
 *
 * The real code lands incrementally.
 */

export const VERSION = '0.0.0';
