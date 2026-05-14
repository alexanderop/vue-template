# Testing

Tests are organised by **kind**, not by speed. Each kind is a separate Vitest
project with its own include glob and (where it matters) its own
`environment`. One config file, one command (`pnpm test`), five projects.

```
unit     (Vitest, node env)         ← pure logic; fast; many
default  (Vitest, browser/Playwright) ← components + integration; the bulk
a11y     (Vitest, browser)          ← axe-core on real DOM
visual   (Vitest, browser)          ← screenshot diffs
arch     (Vitest, node env)         ← architecture rules (no cycles, etc.)
e2e      (Playwright, against build) ← critical user flows; few
```

> **Status (2026-05-14):** `unit` and `default` exist today; `a11y` lives
> inside the browser project (one spec); `visual` and `arch` are not wired up
> yet. Layout below is the target — new tests should follow it.

## Layout

```
src/__tests__/
├── setup.ts                  # browser-project setup (faker seed, fake-indexeddb, vitest-browser-vue)
├── unit/                     # pure-logic tests (node env)
├── components/               # single-component browser tests
├── integration/              # full-flow tests via createTestApp
├── a11y/                     # axe-core specs
├── visual/                   # toMatchScreenshot specs
├── architecture/             # ArchUnitTS rules
├── factories/                # test data builders
└── helpers/
    ├── createTestApp.ts      # mounts App.vue with router + Pinia
    ├── resetDatabase.ts      # wipes IndexedDB + resets stores; called in beforeEach
    ├── a11y.ts               # assertNoViolations() wrapper
    └── pages/                # Page Objects, added lazily
```

E2E lives in `e2e/` (Playwright, independent of Vitest).

## Vitest projects

Single `vitest.config.ts`. Shared bits (resolve, plugins) at the top; per-
project `environment` and `include` overrides. The important shape:

```ts
const browserConfig = {
  browser: {
    enabled: true,
    provider: playwright(),
    instances: [{ browser: 'chromium' as const }],
    headless: true,
  },
  setupFiles: ['./src/__tests__/setup.ts'],
  fileParallelism: true,
}

projects: [
  { test: { name: 'unit', environment: 'node', include: ['src/__tests__/unit/**/*.spec.ts'] } },
  {
    test: {
      name: 'default',
      ...browserConfig,
      include: ['src/__tests__/**/*.spec.ts', '!src/__tests__/{unit,a11y,visual,architecture}/**'],
    },
  },
  { test: { name: 'a11y', ...browserConfig, include: ['src/__tests__/a11y/**/*.spec.ts'] } },
  { test: { name: 'visual', ...browserConfig, include: ['src/__tests__/visual/**/*.spec.ts'] } },
  {
    test: {
      name: 'arch',
      environment: 'node',
      include: ['src/__tests__/architecture/**/*.test.ts'],
    },
  },
]
```

Per-project `environment` is the load-bearing line: `unit` and `arch` run in
Node, the rest in a real Chromium via Playwright. No jsdom anywhere.

## Setup file

`src/__tests__/setup.ts` is small on purpose:

```ts
import { faker } from '@faker-js/faker'
import 'fake-indexeddb/auto'
import '@/style.css'
import 'vitest-browser-vue'

faker.seed(12_345)
export { resetDatabase } from './helpers/resetDatabase'
```

- `fake-indexeddb/auto` shims IndexedDB inside the browser test context.
- `faker.seed(12_345)` makes factory output reproducible across runs.
- The `unit` project doesn't need this file; if pure logic ever depends on a
  shimmed global, add a smaller node-env setup.

## resetDatabase — the parallelism contract

Every browser test calls `resetDatabase()` in `beforeEach`. It is the only
reason `fileParallelism: true` is safe.

```ts
import { resetDatabase } from '@/__tests__/setup'

beforeEach(async () => {
  await resetDatabase()
})
```

The helper wipes every IndexedDB table, clears any seed markers in
`localStorage`, and `$reset()`s every Pinia/global store. When a new store or
singleton is added, the reset line goes in here — that's the contract.

## Factories, not inline fixtures

Test data comes from `src/__tests__/factories/`. In-memory factories for
state shapes; DB factories for Dexie-shaped rows; builders for compound
shapes. The convention — `Readonly<DEFAULTS>`, `createX(overrides?)`,
seeded `faker` — and the rules for when to add or update one live in
[`docs/patterns/test-factories.md`](../patterns/test-factories.md).

## createTestApp + Page Objects

`src/__tests__/helpers/createTestApp.ts` mounts `App.vue` with the real
router and Pinia and hands back `{ container, navigateTo, cleanup, ... }`
plus every Page Object pre-wired. Integration and a11y tests both go
through it. The PO shape (class per view, `CommonPO` for shared primitives,
when to add a method, gotchas worth wrapping) lives in
[`docs/patterns/page-objects.md`](../patterns/page-objects.md).

## a11y

A separate project so failures are easy to triage. Each spec drives a flow
and then asserts:

```ts
import { assertNoViolations } from '../helpers/a11y'
const { container, cleanup } = await createTestApp()
await assertNoViolations(container)
cleanup()
```

`assertNoViolations` runs `axe.run(container)` and logs any violations with
the `helpUrl` so the next agent has a fix path without leaving the terminal.
For known false positives, use `assertNoViolationsWithoutContrast()`.

## visual

`toMatchScreenshot` from `vitest/browser`, scoped to the `visual` project so
the threshold tolerances live in one place:

```ts
expect: {
  toMatchScreenshot: {
    comparatorOptions: { threshold: 0.2, allowedMismatchedPixelRatio: 0.02 },
  },
}
```

Update baselines with `pnpm test:visual:update`. Keep the set small — one
screenshot per top-level view is usually enough; more = flake surface.

## arch

ArchUnitTS rules in `src/__tests__/architecture/`. Runs in Node because it
walks the filesystem. Asserts the boundaries that `eslint-local-rules/`
prefers to enforce statically — they're the safety net, not the source of
truth.

```ts
const rule = projectFiles().inFolder('src/features/**').should().haveNoCycles()
await expect(rule).toPassAsync()
```

Categories worth having from day one: no cycles in `src/features/**` and
`src/composables/**`, no cross-feature imports under `src/features/*`,
shared layers (`components/`, `composables/`, `lib/`, `db/`) don't depend
on `features/` or `views/`.

## e2e

`e2e/` is Playwright against a built artifact. Reserved for the handful of
flows that, if broken, break the product. On CI, `pnpm build` runs first so
e2e hits the production bundle (PWA registration, base-path correctness,
prod-only optimisations).

```
npx playwright install   # first time only
pnpm test:e2e
```

Conventions enforced by `playwright/*` lint rules:

- No `.only` — `no-focused-test` (error)
- Avoid `.skip` — `no-skipped-test` (warn)
- `expect(...)` requires a real matcher — `valid-expect`
- Avoid `page.waitForTimeout` — `no-wait-for-timeout` (warn). Use a real
  assertion that retries.
- Avoid `{ force: true }` on clicks — `no-force-option` (warn). If the
  element isn't clickable, the test is finding a real bug.

## Conventions in Vitest specs

Enforced by `vitest-js/*` lint rules:

- `it` (not `test`) — `consistent-test-it`
- Hooks (`beforeEach` etc.) before tests — `prefer-hooks-on-top`
- Hooks in canonical order — `prefer-hooks-in-order`
- Top-level `describe` is required — `require-top-level-describe`
- Max 2 levels of `describe` nesting — `max-nested-describe`
- No `let` inside `describe` (state lives inside `beforeEach`) —
  `local/no-let-in-describe`

## Commands

```
pnpm test                # vitest run (all projects)
pnpm test:unit           # vitest run --project=unit
pnpm test:browser        # vitest run --project=default
pnpm test:a11y           # vitest run --project=a11y
pnpm test:visual         # vitest run --project=visual
pnpm test:visual:update  # refresh screenshot baselines
pnpm test:arch           # vitest run --project=arch
pnpm test:coverage       # default + v8 coverage
pnpm test:e2e            # Playwright against the built app
```

## Picking a project

| You want to test that…                               | Project |
| ---------------------------------------------------- | ------- |
| `tryCatch` resolves to `{ data, error: null }`       | unit    |
| The store filters todos by `completed`               | unit    |
| A pure schema/parser rejects bad input               | unit    |
| Clicking a checkbox toggles its visual state         | default |
| The "clear completed" button removes only done       | default |
| Adding then editing then deleting a todo works       | default |
| The page passes axe-core checks                      | a11y    |
| The settings page looks unchanged                    | visual  |
| `src/features/foo` doesn't import `src/features/bar` | arch    |
| A user can add → toggle → clear a todo end-to-end    | e2e     |

When in doubt: **lowest project that exercises the real surface**. A node-env
component test mocking the DOM is worse than a browser test that uses the
real thing, and rarely faster in wall time.

## Component-testing gotchas

A few patterns that have cost real debugging time and belong in Page Objects
when they recur:

**Single-visible-element pattern.** When the UI shows one item at a time
(tabs, carousels, paged lists), don't index into an array of elements —
they aren't all in the DOM. Navigate first, then query the single visible
one.

**Regex collisions.** Headers like `Round 1/3` and tabs like `R1` need
distinct patterns. Use `/round \d+\/\d+/i` for the header and a tab role
query with `new RegExp(`^R${index + 1}$`)` for the tab.

**Exact name matching.** `getByText('Deadlift')` may match "Romanian
Deadlift". Prefer typing into the search input and clicking the exact
result (wrap this in a `selectExercise()` PO method).

**Form-field presence vs. dialog text.** `getByText(/target reps/i)` will
match the dialog description as well as the label. Use `getByLabelText(/^target reps$/i)`
when asserting an input exists.

**shadcn-vue DropdownMenu uses `@select`, not `@click`.** And when waiting
for it, `page.getByRole('menu')`, not `getByRole('dialog')`.

**Factory ↔ schema drift.** When a domain type gains a field, update every
factory that returns that shape. Tests that build inline ad-hoc objects
become liabilities — that's why factories exist.
