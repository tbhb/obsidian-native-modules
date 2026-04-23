/**
 * @obsidian-native-modules/builder
 *
 * Build-time orchestrator. Compiles a per-module package's upstream native
 * against a target Electron ABI, produces platform-suffixed asset files
 * per `@obsidian-native-modules/catalog` naming, and validates output
 * against the package's `PackageSpec`. Consumed by CI matrix jobs and
 * maintainers via a CLI.
 *
 * The real implementation lands incrementally.
 */

export const VERSION = '0.0.0';
