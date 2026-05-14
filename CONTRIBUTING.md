# Contributing

Thanks for taking the time to contribute. This template is opinionated on
purpose — the conventions are encoded as lint rules and documented in `docs/`.
If a contribution would relax or remove a rule, lead with the rationale and the
existing rule it replaces.

## Setup

```sh
pnpm install
pnpm dev
```

Playwright browsers only need to be installed once per machine:

```sh
pnpm exec playwright install chromium
```

## Before opening a PR

Run the full local check pipeline:

```sh
pnpm type-check
pnpm lint
pnpm test:unit
```

For UI changes, also exercise the flow manually in `pnpm dev` and run the
component tier:

```sh
pnpm test:browser
```

CI runs `pnpm test:e2e` against the production build (`pnpm build` first).

## What changes are welcome

- Bug fixes (with a failing test that turns green).
- New custom lint rules under `eslint-local-rules/` that encode an existing
  documented convention. Read [`docs/patterns/local-lint-rules.md`](./docs/patterns/local-lint-rules.md)
  first.
- Doc clarifications — especially places where the docs and the code disagree.
- New patterns under `docs/patterns/` that come with a working in-repo example
  (factories, page objects, etc.).

## What changes need a discussion first

Open an issue before sending a PR for any of:

- Removing or weakening an existing lint rule.
- Adding a runtime dependency.
- Changing the layering in `docs/architecture.md`.
- Replacing the reference Todo feature.

## Commit messages

Conventional Commits — `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`,
`ci:`. The `pr-title.yml` workflow checks PR titles for this format.

## Pre-commit hooks

`simple-git-hooks` runs `lint-staged` (oxlint + oxfmt) on changed files. If a
hook fails, fix the underlying issue rather than bypassing it with `--no-verify`.
