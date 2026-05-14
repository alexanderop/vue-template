# Vue Starter — Optimized for AI Coding Agents

An opinionated Vue 3 starter built so that AI coding agents (Claude Code, Cursor,
Copilot, etc.) can be productive in it from the first prompt. The stack is
mainstream — Vite, TypeScript, Pinia, Tailwind v4 — but the _scaffolding around
it_ is what makes the difference: every convention is either documented in
`docs/` or enforced by a custom lint rule, so an agent can read the rules,
follow them, and verify its own work without human babysitting.

Ships with a working Todo app (IndexedDB-backed) as the reference feature an
agent can imitate.

## Why "optimized for agents"?

Agents fail in codebases for predictable reasons: ambiguous conventions, hidden
tribal knowledge, slow feedback loops, missing test infrastructure. This
template tries to remove each of those:

- **`CLAUDE.md` / `AGENTS.md`** at the repo root tell an agent where to look
  before editing — they point at `docs/index.md`, the wiki landing page.
- **`docs/` is a real wiki**, not a marketing site. Architecture, patterns,
  guides, and principles all live there in plain Markdown so an agent can grep
  them as context.
- **Conventions are encoded as lint rules**, not just prose. Custom rules in
  `eslint-local-rules/` enforce things like guard clauses, no `try/catch` in
  `src/`, no hardcoded Tailwind colors, no enums — so an agent that drifts from
  the style gets a fast, actionable error instead of a polite code-review nit.
- **Fast, deterministic check loop**: `pnpm type-check && pnpm lint && pnpm test:unit`
  finishes in seconds and is the single command an agent runs to declare a
  change done.
- **Three test tiers** (Vitest jsdom, Vitest browser via Playwright, Playwright
  e2e) so an agent can pick the cheapest level that actually proves the change.

## Stack

- **pnpm** — package manager
- **Vite** — dev server + build
- **Vue 3** + **TypeScript** (strict, via `vue-tsc --build`)
- **Pinia** — state, setup-store style
- **Vue Router** — routing
- **Tailwind CSS v4** — styling (hardcoded colors are lint-banned)
- **VueUse** — composable utilities
- **vite-plugin-pwa** — PWA support
- **oxlint** + **oxfmt** — Rust-based lint and format, with custom local rules
- **Vitest** — unit (jsdom) + browser (Playwright provider) tests
- **Playwright** — e2e tests
- **knip** — unused exports / files / deps

## Commands

| Command             | What it does                              |
| ------------------- | ----------------------------------------- |
| `pnpm install`      | install deps                              |
| `pnpm dev`          | Vite dev server                           |
| `pnpm build`        | typecheck + production build              |
| `pnpm preview`      | serve the production build                |
| `pnpm type-check`   | `vue-tsc --build`                         |
| `pnpm lint`         | `oxlint . --fix`                          |
| `pnpm format`       | `oxfmt src/ test/ e2e/`                   |
| `pnpm test:unit`    | Vitest unit project (jsdom)               |
| `pnpm test:browser` | Vitest browser project (Playwright)       |
| `pnpm test:e2e`     | Playwright e2e — `pnpm build` first on CI |
| `pnpm knip`         | report unused exports / files / deps      |

**Definition of done:** `pnpm type-check && pnpm lint && pnpm test:unit`.
For UI changes, also run the flow in `pnpm dev` and `pnpm test:browser`.

## For humans: where to read next

Open [`docs/index.md`](./docs/index.md). It links to:

- `docs/architecture.md` — feature layering and data flow
- `docs/tooling.md` — what each tool does
- `docs/guides/adding-a-feature.md` — the common recipe
- `docs/guides/testing.md` — when to use which test tier
- `docs/patterns/` — error handling, compound components, variant props, the
  custom lint rules, etc.
- `docs/principles/` — the engineering principles the agent guidance is built on

## For agents

Start with [`CLAUDE.md`](./CLAUDE.md) (or [`AGENTS.md`](./AGENTS.md)). Then read
[`docs/index.md`](./docs/index.md) and follow the links relevant to the task
before touching code.

## Getting started

```sh
pnpm install
pnpm dev
```

For e2e tests, install the Playwright browsers once:

```sh
npx playwright install
pnpm build      # required on CI
pnpm test:e2e
```

## IDE setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar).

## Requirements

- Node.js `^20.19.0 || >=22.12.0`
- [pnpm](https://pnpm.io/) `10.28.2+`
