# vue-template

An opinionated Vue 3 starter — TypeScript, Vite, Pinia, Tailwind v4, PWA, and a
custom oxlint rule set that encodes the project's style. Ships with a working
Todo app (IndexedDB-backed) as the reference feature.

## Stack

- **pnpm** — package manager.
- **Vite** — dev server + build.
- **Vue 3** + **TypeScript** (strict via `vue-tsc --build`).
- **Pinia** — state. Setup-store style (`defineStore('x', () => { ... })`).
- **Vue Router** — routing.
- **Tailwind CSS v4** — styling. No hardcoded colors (enforced).
- **VueUse** — composable utilities.
- **vite-plugin-pwa** — PWA support.
- **oxlint** + **oxfmt** — Rust-based lint and format. Custom local rules live in
  `eslint-local-rules/`.
- **Vitest** — unit (jsdom) + browser (Playwright provider) tests.
- **Playwright** — e2e tests.
- **knip** — unused-code / dependency detection.

## Commands

| Command             | What it does                                    |
| ------------------- | ----------------------------------------------- |
| `pnpm install`      | install deps                                    |
| `pnpm dev`          | Vite dev server                                 |
| `pnpm build`        | typecheck + production build                    |
| `pnpm preview`      | serve the production build                      |
| `pnpm type-check`   | `vue-tsc --build`                               |
| `pnpm lint`         | `oxlint . --fix`                                |
| `pnpm format`       | `oxfmt src/ test/ e2e/`                         |
| `pnpm test:unit`    | Vitest unit project (jsdom)                     |
| `pnpm test:browser` | Vitest browser project (Playwright)             |
| `pnpm test:e2e`     | Playwright e2e — needs `pnpm build` first on CI |
| `pnpm knip`         | report unused exports / files / deps            |

Before declaring a change done: `pnpm type-check && pnpm lint && pnpm test:unit`.
For UI changes, also exercise the flow in `pnpm dev` and run `pnpm test:browser`.

## Before you change anything

Read **`docs/index.md`** first. It is the wiki landing page and links to:

- `docs/architecture.md` — feature layering (components / composables / stores /
  views) and the data flow from UI to IndexedDB.
- `docs/tooling.md` — what each tool does and how the local check pipeline fits
  together.
- `docs/guides/adding-a-feature.md` — recipe for the most common task.
- `docs/guides/testing.md` — the three test tiers (unit / browser / e2e) and
  when to reach for each.
- `docs/patterns/local-lint-rules.md` — the custom rules in `eslint-local-rules/`
  and the conventions they encode (guard clauses, no `try`, no enums, …).
- `docs/patterns/error-handling.md` — the `tryCatch` Result pattern and why
  `try/catch` is banned in `src/`.

Skim `index.md`, identify which docs are relevant to the task in front of you,
then read those before touching code.
