/**
 * @obsidian-native-modules/watcher
 *
 * Watches Obsidian's public release channels for new Electron ABIs, opens
 * PRs that update `tracked-electron-versions.json` and widen the build
 * matrix. Runs on a daily schedule in CI and exposes a CLI for ad-hoc
 * maintainer checks.
 *
 * The real implementation lands incrementally.
 */

export const VERSION = '0.0.0';
