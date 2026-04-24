/*
 * Fixture plugin used by integration tests.
 *
 * Extends Obsidian's `Plugin` base class and consumes
 * `@obsidian-native-modules/loader` via the package's source tree.
 * Integration tests drive this fixture against the copied vault to confirm
 * the harness, the library, and the plugin wire together end-to-end.
 */

import { Plugin } from 'obsidian';
import { VERSION } from '../../../../src/index.js';

export class LoaderFixturePlugin extends Plugin {
  override onload(): void {
    // No real side effects yet. The library ships no runtime behavior, so
    // onload just marks the lifecycle hook as reachable under test.
  }

  getLoaderVersion(): string {
    return VERSION;
  }
}
