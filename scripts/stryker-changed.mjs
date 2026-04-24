#!/usr/bin/env node
// Runs Stryker per package, scoped to packages/<pkg>/src/*.ts files
// changed vs a base ref. Defaults to origin/main; override with
// STRYKER_BASE. Combines with the `incremental: true` setting in each
// package's stryker.config.json, so unchanged mutants inside the changed
// files still reuse prior results when possible.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const base = process.env['STRYKER_BASE'] ?? 'origin/main';

const diff = execFileSync('git', ['diff', '--name-only', `${base}...HEAD`, '--', 'packages/'], {
  encoding: 'utf8',
})
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => /^packages\/[^/]+\/src\/.+\.ts$/.test(line));

if (diff.length === 0) {
  console.log(`No packages/*/src/*.ts changes vs ${base}; nothing to mutate.`);
  process.exit(0);
}

const byPackage = new Map();
for (const file of diff) {
  const parts = file.split('/');
  const pkg = parts[1];
  const rel = parts.slice(2).join('/');
  if (!byPackage.has(pkg)) byPackage.set(pkg, []);
  byPackage.get(pkg).push(rel);
}

let failed = false;
for (const [pkg, files] of byPackage) {
  if (!existsSync(`packages/${pkg}/stryker.config.json`)) {
    console.log(`\n→ Skipping ${pkg} (no stryker.config.json)`);
    continue;
  }
  console.log(`\n→ Mutating ${pkg} (${files.length} file(s))`);
  const result = spawnSync(
    'pnpm',
    [
      '--filter',
      `@obsidian-native-modules/${pkg}`,
      'exec',
      'stryker',
      'run',
      '--mutate',
      files.join(','),
    ],
    { stdio: 'inherit', shell: false },
  );
  if (result.status !== 0) failed = true;
}

process.exit(failed ? 1 : 0);
