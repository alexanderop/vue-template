# Testing

Tests are organised by **kind**, not by speed. The pipeline today is small on
purpose; a roadmap section at the bottom describes where it's headed.

## Today: three tiers, two configs

```
unit     (Vitest, node env)             ← pure logic; fast; many
browser  (Vitest, browser/Playwright)   ← components + a11y in a real browser
e2e      (Playwright, against build)    ← critical user flows; few
```

### Layout

```
test/
├── unit/
│   ├── a11y-component-coverage.spec.ts   # meta-test (see "a11y coverage" below)
│   ├── stores/todo.spec.ts
│   └── utils/tryCatch.spec.ts
└── browser/
    ├── a11y.spec.ts                      # axe-core across every component
    └── TodoApp.browser.spec.ts

e2e/
└── todo.spec.ts                          # Playwright; runs against pnpm build
```

### Vitest projects

`vitest.config.ts` defines two projects with shared `resolve` and `plugins`:

- **`unit`** — `environment: 'node'`, glob `test/unit/**/*.{test,spec}.{js,ts}`.
- **`browser`** — Playwright provider (Chromium, headless),
  `setupFiles: ['vitest-browser-vue']`, glob `test/browser/**/…`.

There is **no `pnpm test` aggregate**. Run the project you need:

```sh
pnpm test:unit              # vitest run --project unit
pnpm test:browser           # vitest run --project browser
pnpm test:unit:coverage     # unit + v8 coverage (used by CI)
pnpm test:e2e               # Playwright; pnpm build must run first on CI
```

## a11y coverage is enforced

Every `.vue` file under `src/components/` must be imported in
`test/browser/a11y.spec.ts` — a `describe` block running `axe.run(container)`
on a render is enough. If you can't (or shouldn't) test a component this way,
add it to `SKIPPED_COMPONENTS` in `test/unit/a11y-component-coverage.spec.ts`
with a justification.

The meta-test greps `@/components/...` imports in `a11y.spec.ts` and fails
`pnpm test:unit` when a new component slips through. So a component that ships
without an a11y test fails CI before review.

## Picking a tier

| You want to test that…                         | Tier    |
| ---------------------------------------------- | ------- |
| `tryCatch` resolves to `{ data, error: null }` | unit    |
| The store filters todos by `completed`         | unit    |
| A pure schema/parser rejects bad input         | unit    |
| Clicking a checkbox toggles its visual state   | browser |
| The "clear completed" button removes only done | browser |
| The component passes axe-core checks           | browser |
| A user can add → toggle → clear end-to-end     | e2e     |

When in doubt: **lowest tier that exercises the real surface**. A unit test
mocking the DOM is worse than a browser test that uses the real thing, and
rarely faster in wall time.

## Conventions enforced by lint

Vitest specs (`test/unit/**`):

- `it` (not `test`) — `vitest-js/consistent-test-it`
- Hooks (`beforeEach` etc.) before tests — `prefer-hooks-on-top`
- Hooks in canonical order — `prefer-hooks-in-order`
- Top-level `describe` is required — `require-top-level-describe`
- Max 2 levels of `describe` nesting — `max-nested-describe`
- No `let` inside `describe` (state lives inside `beforeEach`) —
  `local/no-let-in-describe`

Playwright specs (`e2e/**`):

- No `.only` — `no-focused-test` (error)
- Avoid `.skip` — `no-skipped-test` (warn)
- `expect(...)` requires a real matcher — `valid-expect`
- Avoid `page.waitForTimeout` — `no-wait-for-timeout` (warn)
- Avoid `{ force: true }` on clicks — `no-force-option` (warn)

## Component-testing gotchas

A few patterns that cost real debugging time:

**Don't index into an array of elements** — `page.locator('input[type="checkbox"]').nth(1)`
is brittle. Scope by the row that contains the relevant text instead:

```ts
const row = page.getByRole('listitem').filter({ hasText: 'Walk the dog' })
await row.getByRole('checkbox').click()
```

This pattern lives in `e2e/todo.spec.ts` as the canonical example.

**Exact-name matching.** `getByText('Deadlift')` will match "Romanian
Deadlift". Prefer typing into the search input + clicking an exact result,
or filter by an attribute (`aria-label`) that's unambiguous.

**Form-field presence vs. dialog text.** `getByText(/target reps/i)` will
match the dialog description as well as the label. Use
`getByLabelText(/^target reps$/i)` when asserting an input exists.

## Patterns not yet wired into the repo

Two patterns are documented in `docs/patterns/` but don't have an in-repo
example yet — adopt them the second time you'd duplicate the pattern:

- [`test-factories.md`](../patterns/test-factories.md) — lift inline test
  objects into `src/__tests__/factories/<feature>.factory.ts` builders.
- [`page-objects.md`](../patterns/page-objects.md) — lift repeated browser-
  test rituals into `src/__tests__/helpers/pages/<View>PO.ts` classes.

Each is a self-contained pattern with a worked example in its own doc.
