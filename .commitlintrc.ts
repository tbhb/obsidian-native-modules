import type { UserConfig } from '@commitlint/types';

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Subject line no longer than 100 chars. Body and footer up to 120.
    'header-max-length': [2, 'always', 100],
    'body-max-line-length': [2, 'always', 120],
    'footer-max-line-length': [2, 'always', 120],
    // config-conventional sets these at warning. Escalate so the pre-push
    // and commit-msg hooks actually block malformed commits.
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always'],
    // Reject near-empty subjects. 15 chars leaves room for the shortest
    // release-please commit (`release 0.1.0 (#2)` = 18) without being tight.
    'subject-min-length': [2, 'always', 15],
    // Allow-list the scopes used by packages, automation, and ad-hoc
    // tooling commits. Empty scope stays allowed, so scope-less commits
    // like `feat: ...` pass. Extend this list when a new package lands.
    //
    //   - `builder`, `catalog`, `loader`, `watcher`
    //                         package scopes. Add wrapper packages
    //                         (`node-pty`, `better-sqlite3`, and others)
    //                         when they land.
    //   - `ci`                automated pipeline edits and manual CI tweaks
    //   - `deps`              dependabot npm and github-actions updates
    //   - `deps-dev`          dependabot devDependency bumps
    //   - `dev-dependencies`  dependabot grouped bumps (group name in
    //                         `.github/dependabot.yml`)
    //   - `main`              release-please release PRs
    //   - `release`           manual edits to release scripts or workflows
    'scope-enum': [
      2,
      'always',
      [
        'builder',
        'catalog',
        'loader',
        'watcher',
        'ci',
        'deps',
        'deps-dev',
        'dev-dependencies',
        'main',
        'release',
      ],
    ],
  },
};

export default config;
