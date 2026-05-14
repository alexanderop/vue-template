# Local lint rules

The rules under `eslint-local-rules/` are the project's style guide expressed
as code. They run inside oxlint as the `local/*` plugin (wired via
`eslint-local-rules/plugin.mjs` and the `jsPlugins` entry in `.oxlintrc.json`).

All of them scope to `src/**/*.{ts,vue}` via the `overrides` block — tests and
`eslint-local-rules/*` itself are exempt.

## `local/no-else` (error)

Bans `else` and `else if`.

**Why:** flat code is easier to read than pyramids. Use early returns, guard
clauses, ternaries for simple assignments, or a lookup map for dispatch.

```ts
// ✗
if (cond) {
  doX()
} else {
  doY()
}

// ✓
if (cond) {
  doX()
  return
}
doY()
```

## `local/no-enum` (error)

Bans TypeScript `enum`.

**Why:** TS enums emit runtime objects, don't tree-shake well, and have
surprising bidirectional mappings for numeric variants. Union literal types
cover 95% of use cases with zero runtime cost.

```ts
// ✗
enum Status {
  Active,
  Archived,
}

// ✓
type Status = 'active' | 'archived'
```

## `local/no-try-statement` (error)

Bans `try { } catch { }` blocks in `src/`.

**Why:** every async path should produce a typed `Result<T>`. `try/catch` is
imperative and easy to misuse (swallow, re-throw, wrap inconsistently). The
`tryCatch` utility yields a discriminated union with `data: T | null` and
`error: Error | null` — see [error-handling.md](./error-handling.md).

## `local/repository-trycatch` (error)

Async methods in store-like code must route through `tryCatch` (or otherwise
explicitly handle Promise rejections). Pairs with `no-try-statement` —
together they keep error handling uniform.

## `local/composable-must-use-vue` (error)

Files matching the composable shape (`use*`) must import at least one symbol
from `vue`, `@vueuse/core`, `pinia`, or `vue-router`.

**Why:** if a `useFoo` doesn't touch reactivity, it's a utility — move it to
`src/utils/` and stop confusing readers. Composables that don't use Vue lose
the whole point of being composables.

## `local/no-hardcoded-colors` (warn)

Flags `#rrggbb`, `rgb(...)`, `rgba(...)`, `hsl(...)`, `hsla(...)` literals in
styles.

**Why:** the design system lives in the Tailwind theme. Hardcoded colours
fork it silently. Use semantic tokens (`text-heading`, `text-muted`,
`bg-surface`, …).

## `local/extract-condition-variable` (warn)

Suggests extracting complex inline boolean conditions into named consts.

**Why:** `if (todo.title.trim().length > 0 && !todo.completed && todo.dueAt < now)`
parses worse than `if (isOverdueAndActive)`. The lint nudges you toward the
latter.

## `local/no-let-in-describe` (error, tests only)

Bans `let` declared at the top of a `describe` block.

**Why:** test state declared with `let` survives between tests. Move it
inside `beforeEach` so each `it` starts from a clean slate.

```ts
// ✗
describe('store', () => {
  let store
  beforeEach(() => {
    store = createStore()
  })
  // ...
})

// ✓
describe('store', () => {
  beforeEach(() => {
    const store = createStore()
    // use here
  })
})
```

## Adjacent non-local rules worth knowing

These aren't in `eslint-local-rules/` but they enforce conventions documented
elsewhere in `docs/patterns/`. Listed here so future-you doesn't write a
duplicate local rule.

- **`typescript/consistent-type-assertions`** (`assertionStyle: "never"`,
  error, `src/**`) — bans `value as Type` and `<Type>value`. See
  [typescript-no-as.md](./typescript-no-as.md).
- **`vue/define-props-destructuring`** (error) — `defineProps` must use
  destructuring with defaults. See `docs/architecture.md` §Layer 4.
- **`vue/max-props`** (warn, 6) — a soft cap. Once a component approaches
  it, consider [compound-components.md](./compound-components.md) or
  [variant-props.md](./variant-props.md) instead of adding the 7th prop.

## Reading the rules

If you want to know exactly what a rule catches, read the source — the rules
are tiny (~30 lines each):

```
eslint-local-rules/
├── no-else.mjs
├── no-enum.mjs
├── no-try-statement.mjs
├── repository-trycatch.mjs
├── composable-must-use-vue.mjs
├── no-hardcoded-colors.mjs
├── extract-condition-variable.mjs
└── no-let-in-describe.mjs
```

When adding a new rule, register it in `eslint-local-rules/plugin.mjs` and
enable it under the right `overrides` block in `.oxlintrc.json`.
