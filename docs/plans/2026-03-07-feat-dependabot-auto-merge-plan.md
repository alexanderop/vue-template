---
title: 'feat: add Dependabot auto-merge for patch and minor updates'
type: feat
status: active
date: 2026-03-07
---

# feat: add Dependabot auto-merge for patch and minor updates

## Overview

Set up Dependabot to automatically create dependency update PRs, and auto-merge patch and minor version bumps when CI passes. Major version bumps remain manual to catch breaking changes.

## Problem Statement

Dependency updates are a maintenance chore that doesn't need human attention for non-breaking (patch/minor) changes. Currently there is no Dependabot configuration, so dependencies go stale unless manually updated.

## Proposed Solution

Three components working together:

1. **`dependabot.yml`** - Configures Dependabot to open weekly PRs for npm and GitHub Actions dependencies
2. **`dependabot-auto-merge.yml`** workflow - Auto-approves and enables auto-merge on patch/minor PRs
3. **Branch protection rules** - Enforces CI must pass before any auto-merge executes

### How the flow works

```
dependabot.yml            Auto-Merge Workflow          Branch Protection
(creates PRs weekly)      (triggers on PR)             (gates the merge)
      |                         |                            |
      v                         v                            v
  PR opened ──> fetch-metadata extracts        CI workflow runs:
                update-type                     lint, type-check,
                     |                          unit-test, e2e-test,
                     v                          knip
                patch or minor?                      |
                 /        \                          v
               yes         no                 All checks pass?
                |           |                  /          \
                v           v                yes           no
          approve PR    do nothing             |             |
          enable                               v             v
          auto-merge                  GitHub merges     PR stays open
                                      automatically     for review
```

## Implementation

### File 1: `.github/dependabot.yml`

```yaml
version: 2
updates:
  # npm ecosystem covers pnpm automatically (detects pnpm-lock.yaml)
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
      day: 'monday'
      time: '06:00'
      timezone: 'Europe/Berlin'
    open-pull-requests-limit: 15
    commit-message:
      prefix: 'chore'
      include: 'scope'
    labels:
      - 'dependencies'
    groups:
      patch-updates:
        update-types:
          - 'patch'
      minor-dev-deps:
        dependency-type: 'development'
        update-types:
          - 'minor'

  # Keep GitHub Actions pinned versions up to date
  - package-ecosystem: 'github-actions'
    directory: '/'
    schedule:
      interval: 'weekly'
      day: 'monday'
      time: '06:00'
      timezone: 'Europe/Berlin'
    commit-message:
      prefix: 'ci'
      include: 'scope'
    labels:
      - 'dependencies'
      - 'github-actions'
```

### File 2: `.github/workflows/dependabot-auto-merge.yml`

```yaml
name: Dependabot Auto-Merge

on: pull_request

permissions:
  contents: write
  pull-requests: write

jobs:
  dependabot:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'
    steps:
      - name: Fetch Dependabot metadata
        id: metadata
        uses: dependabot/fetch-metadata@v2
        with:
          github-token: '${{ secrets.GITHUB_TOKEN }}'

      - name: Approve patch and minor updates
        if: >-
          steps.metadata.outputs.update-type == 'version-update:semver-patch' ||
          steps.metadata.outputs.update-type == 'version-update:semver-minor'
        run: gh pr review --approve "$PR_URL"
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Enable auto-merge for patch and minor updates
        if: >-
          steps.metadata.outputs.update-type == 'version-update:semver-patch' ||
          steps.metadata.outputs.update-type == 'version-update:semver-minor'
        run: gh pr merge --auto --squash "$PR_URL"
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Required Repository Settings (Manual)

These must be configured in GitHub UI before auto-merge will work:

- [ ] **Settings > General > Pull Requests**: Enable "Allow auto-merge"
- [ ] **Settings > Actions > General**: Enable "Allow GitHub Actions to create and approve pull requests"
- [ ] **Settings > Branches > Branch protection rules** for `main`:
  - [x] Require a pull request before merging
  - [x] Require status checks to pass before merging
  - Add required checks: `Lint`, `Type Check`, `Unit Tests`, `E2E Tests`, `Dead Code Detection`

> **Note:** If using GitHub rulesets instead of classic branch protection, also create an empty classic branch protection rule for `main` alongside the ruleset -- auto-merge has known compatibility issues with rulesets-only configurations.

## Acceptance Criteria

- [ ] Dependabot opens weekly PRs for npm and GitHub Actions dependency updates
- [ ] Patch and minor version PRs are auto-approved and auto-merged when all 5 CI jobs pass
- [ ] Major version PRs are NOT auto-merged (require manual review)
- [ ] Failed CI blocks auto-merge and PR stays open for review
- [ ] Patch updates are grouped into a single PR to reduce noise

## Context

### Existing CI Jobs (from `.github/workflows/ci.yml`)

The following jobs must all pass before auto-merge triggers:

| Job          | Name                | What it does                       |
| ------------ | ------------------- | ---------------------------------- |
| `lint`       | Lint                | oxlint + eslint + formatting check |
| `type-check` | Type Check          | `vue-tsc --build`                  |
| `unit-test`  | Unit Tests          | vitest with coverage               |
| `e2e-test`   | E2E Tests           | Playwright chromium                |
| `knip`       | Dead Code Detection | knip                               |

### Key Details

- **pnpm support**: Dependabot uses `package-ecosystem: "npm"` for pnpm -- it detects `pnpm-lock.yaml` automatically
- **`dependabot/fetch-metadata@v2`**: Extracts `update-type` (`semver-patch`, `semver-minor`, `semver-major`) without checking out code
- **`gh pr merge --auto --squash`**: Does NOT merge immediately -- it enables auto-merge, which waits for branch protection requirements before executing
- **Pin action SHA**: The plan uses `@v2` tag for readability. For production, pin to a specific commit SHA consistent with your other workflows (e.g., `@dbb049175f1182e3b7f5f2cd855222b5e5e580c6`)

## References

- [Automating Dependabot with GitHub Actions](https://docs.github.com/en/code-security/dependabot/working-with-dependabot/automating-dependabot-with-github-actions)
- [dependabot/fetch-metadata](https://github.com/dependabot/fetch-metadata)
- [Managing auto-merge](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-auto-merge-for-pull-requests-in-your-repository)
