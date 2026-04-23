/**
 * @obsidian-native-modules/loader
 *
 * Runtime native-module resolver for Obsidian plugins. Given a per-module
 * `PackageSpec` from `@obsidian-native-modules/catalog`, resolves to on-disk
 * `.node` paths — checking `node_modules` for dev builds, then plugin-dir
 * cache, then delegating fetch + sigstore verification to
 * `obsidian-plugin-assets`.
 *
 * The real implementation lands incrementally; see the design sketch
 * (`obsidian-native-modules-loader.md` in the sandbox vault) for the target
 * API surface.
 */

export const VERSION = '0.0.0';
