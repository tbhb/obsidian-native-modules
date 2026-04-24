/*
 * Integration wiring test.
 *
 * The loader has no runtime behavior yet, so this test only verifies that
 * the fixtures, the obsidian mock, and the plugin fixture wire together:
 *
 * - the vault fixture copies into a tmpdir and cleans up,
 * - the plugin manifest lands in `<tmpdir>/.obsidian/plugins/<id>/`,
 * - the fixture plugin instantiates against a filesystem-backed vault,
 * - the loader is reachable from the fixture plugin's module graph.
 *
 * Future integration tests can lean on the same scaffolding once resolve,
 * cache, and fetch land in `src/`.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { __resetObsidianMocks, App, createFilesystemVault, TFile } from 'obsidian';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { VERSION } from '../../src/index.js';
import { LoaderFixturePlugin } from '../fixtures/plugin/src/main.js';
import { copyFixtureToTmp, type VaultFixture } from './fixture';

describe('integration wiring', () => {
  let fixture: VaultFixture;

  beforeEach(() => {
    __resetObsidianMocks();
    fixture = copyFixtureToTmp();
  });

  afterEach(() => {
    fixture.cleanup();
    expect(existsSync(fixture.path)).toBe(false);
  });

  describe('vault fixture copy', () => {
    it('creates a tmpdir containing the checked-in vault tree', () => {
      expect(existsSync(fixture.path)).toBe(true);
      expect(existsSync(join(fixture.path, '.obsidian', 'app.json'))).toBe(true);
      expect(existsSync(join(fixture.path, 'Notes', 'hello.md'))).toBe(true);
    });

    it('exposes fixture files through a filesystem-backed Vault', async () => {
      const vault = createFilesystemVault(fixture.path);

      const file = vault.getFileByPath('Notes/hello.md');
      if (!(file instanceof TFile)) {
        throw new Error('expected Notes/hello.md to resolve to a TFile');
      }
      const contents = await vault.read(file);
      expect(contents).toContain('# Hello');
    });
  });

  describe('plugin fixture install', () => {
    it('places the canonical manifest under .obsidian/plugins/<id>/', () => {
      const manifestOnDisk = JSON.parse(
        readFileSync(join(fixture.pluginDir, 'manifest.json'), 'utf8'),
      ) as { id: string; version: string };

      expect(fixture.manifest.id).toBe('obsidian-native-modules-loader-fixture');
      expect(manifestOnDisk.id).toBe(fixture.manifest.id);
      expect(manifestOnDisk.version).toBe(fixture.manifest.version);
    });
  });

  describe('plugin fixture instantiation', () => {
    it('constructs against a filesystem-backed vault and loads without throwing', () => {
      const app = new App();
      app.vault = createFilesystemVault(fixture.path);

      const plugin = new LoaderFixturePlugin(app, fixture.manifest);
      plugin.onload();

      expect(plugin.manifest.id).toBe(fixture.manifest.id);
      expect(plugin.app.vault.adapter).toBeDefined();
    });

    it('persists plugin data through the filesystem adapter', async () => {
      const app = new App();
      app.vault = createFilesystemVault(fixture.path);
      const plugin = new LoaderFixturePlugin(app, fixture.manifest);

      await plugin.saveData({ probe: true });

      const dataPath = join(fixture.pluginDir, 'data.json');
      expect(existsSync(dataPath)).toBe(true);
      expect(JSON.parse(readFileSync(dataPath, 'utf8'))).toEqual({ probe: true });

      const reloaded = await plugin.loadData();
      expect(reloaded).toEqual({ probe: true });
    });
  });

  describe('loader reachability', () => {
    it('shares module identity for VERSION across the fixture plugin and tests', () => {
      const app = new App();
      app.vault = createFilesystemVault(fixture.path);
      const plugin = new LoaderFixturePlugin(app, fixture.manifest);

      expect(plugin.getLoaderVersion()).toBe(VERSION);
    });
  });
});
