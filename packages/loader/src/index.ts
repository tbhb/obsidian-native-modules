/**
 * @obsidian-native-modules/loader
 *
 * Runtime native-module resolver for Obsidian plugins. Given a per-module
 * `PackageSpec` from `@obsidian-native-modules/catalog`, resolves to on-disk
 * `.node` paths — checking `node_modules` for dev builds, then plugin-dir
 * cache, then delegating fetch + sigstore verification to
 * `obsidian-plugin-assets`.
 *
 * The real implementation lands incrementally.
 */

export const VERSION = '0.0.0';
