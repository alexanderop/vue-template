# Local lint rules

The rules under `eslint-local-rules/` are the project's style guide expressed
as code. They run inside oxlint as the `local/*` plugin (wired via
`eslint-local-rules/plugin.mjs` and the `jsPlugins` entry in `.oxlintrc.json`).

All `src/**/*.{ts,vue}` rules scope to that override block in `.oxlintrc.json`;
test-only rules scope to the `test/unit/**` override; the rule files
themselves are exempt.

## `local/no-else` (error, src/\*\*)

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

## `local/no-enum` (error, src/\*\*)

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

## `local/no-try-statement` (error, src/\*\*)

Bans `try { } catch { }` blocks.

**Why:** every async path should produce a typed `Result<T>`. `try/catch` is
imperative and easy to misuse (swallow, re-throw, wrap inconsistently). The
`tryCatch` utility yields a discriminated union with `data: T | null` and
`error: Error | null` — see [error-handling.md](./error-handling.md).

## `local/no-unchecked-result` (error, src/\*\*)

The companion to `no-try-statement`. Bans **discarding** the return of
`tryCatch(...)`.

**Why:** banning `try/catch` only helps if the alternative is actually used.
`await tryCatch(x)` as a bare statement silently swallows the error — which
is exactly what `try/catch` was supposed to be replaced _to avoid_. The rule
forces the Result to be consumed.

```ts
// ✗ — error discarded
await tryCatch(db.add(item))

// ✓ — error checked
const { data, error } = await tryCatch(db.add(item))
if (error) console.error(error)

// ✓ — chained
tryCatch(db.add(item)).then(({ error }) => {
  if (error) console.error(error)
})
```

## `local/no-layer-skip` (error, src/\*\*)

Enforces two of the architectural boundaries in
[architecture.md](../architecture.md):

- `src/components/Base*.vue` **may not import** from `@/stores/*` or
  `@/composables/*`. Base components are dumb design-system primitives.
- `src/composables/**` **may not import** from `@/components/*` or
  `@/stores/*`. Composables sit below the component and store layers.

Feature components (`src/components/<feature>/*.vue`) are allowed to import
their feature store — that's the documented path for feature state.

## `local/no-prop-callbacks` (error, src/\*\*)

Bans callback-style props in `defineProps`. Catches both the explicit
`onFoo: () => void` shape and properties named `on[A-Z]...` regardless of
type. Resolves `interface Props` / `type Props =` references in the same
file.

**Why:** components should communicate up via `defineEmits` (or scoped
slots), not callback props. Callbacks bypass DevTools, lose `.once`/`.capture`
listener modifiers, and blur the line between "data props" and "actions".

```ts
// ✗
interface Props {
  label: string
  onClick: () => void
}

// ✓
interface Props {
  label: string
}
const emit = defineEmits<{ click: [] }>()
```

## `local/composable-must-use-vue` (error, src/\*\*)

Files whose basename matches `/^use[A-Z]/` and whose extension is `.ts`,
`.mts`, `.cts`, or `.tsx` must import at least one symbol from `vue`,
`@vueuse/core`, `@vueuse/integrations`, `vue-router`, or `pinia` — or from
another composable (`@/composables/useX`).

**Why:** if a `useFoo` doesn't touch reactivity, it's a utility — move it to
`src/utils/` and stop confusing readers. Composables that don't use Vue lose
the whole point of being composables.

## `local/no-hardcoded-colors` (error, src/\*\*)

Flags two flavours of hardcoded colour:

1. **Tailwind palette utilities** — `bg-red-500`, `text-slate-700`, etc.
   Any `(bg|text|border|ring|outline|shadow|accent|caret|fill|stroke|decoration|divide|placeholder|from|via|to)-<palette>-<NNN>`.
2. **CSS colour literals** — `#abc`, `#aabbcc`, `#aabbccdd`, `rgb(...)`,
   `rgba(...)`, `hsl(...)`, `hsla(...)`.

**Why:** the design system lives in the Tailwind theme. Hardcoded colours
fork it silently. Use semantic tokens (`text-heading`, `text-muted`,
`bg-surface`, …) in classes and CSS variables in `<style>` blocks.

## `local/extract-condition-variable` (warn, src/\*\*)

Suggests extracting complex inline boolean conditions into named consts.

**Why:** `if (todo.title.trim().length > 0 && !todo.completed && todo.dueAt < now)`
parses worse than `if (isOverdueAndActive)`. The lint nudges you toward the
latter.

## `local/no-let-in-describe` (error, test/unit/\*\*)

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
are tiny (~30–100 lines each):

```
eslint-local-rules/
├── no-else.mjs
├── no-enum.mjs
├── no-try-statement.mjs
├── no-unchecked-result.mjs
├── no-layer-skip.mjs
├── no-prop-callbacks.mjs
├── composable-must-use-vue.mjs
├── no-hardcoded-colors.mjs
├── extract-condition-variable.mjs
└── no-let-in-describe.mjs
```

When adding a new rule, register it in `eslint-local-rules/plugin.mjs` and
enable it under the right `overrides` block in `.oxlintrc.json`.

## Disagree with a rule?

These rules are this template's defaults, not a manifesto. Every rule lives
in a ~30–100 line `.mjs` file and a single line in `.oxlintrc.json`. If a
rule doesn't fit your team:

1. Lower it to `"warn"` or `"off"` in `.oxlintrc.json`, **or**
2. Delete the `.mjs` file and the `plugin.mjs` registration.

Update the matching `docs/patterns/*.md` so future contributors know the
convention changed.
