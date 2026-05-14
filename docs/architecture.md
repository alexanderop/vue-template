# Architecture

Four layers, in increasing order of "knows about the framework":

```
View          ←  route-level wrapper, mostly composition
  ↑
Component     ←  presentation; props in, events out
  ↑
Store         ←  Pinia setup-store; owns reactive feature state
  ↑
Composable    ←  reusable reactive helpers (DOM, IndexedDB, …)
  ↑
Utility       ←  framework-agnostic functions (`tryCatch`, …)
```

The Todo feature is the reference implementation of all four.

## Layer 1 — Utilities (`src/utils/`)

Pure TypeScript. No Vue imports. The only utility today is `tryCatch` — it
wraps a promise and returns `Promise<Result<T>>` (`{ data, error }` discriminated
union). Every async path in `src/` flows through it because:

- `local/no-try-statement` bans `try { } catch { }` in `src/`.
- `local/repository-trycatch` requires async store methods to either call
  `tryCatch` or be marked otherwise.

See [patterns/error-handling.md](./patterns/error-handling.md) for the full
rationale.

## Layer 2 — Composables (`src/composables/`)

A composable is a function whose name starts with `use*` and that returns
reactive state and/or operations. The `local/composable-must-use-vue` rule
asserts that the file uses at least one symbol from `vue` / `@vueuse/core` /
`pinia` / `vue-router` — otherwise it isn't really a composable, it's a utility.

`useIndexedDb<T>(opts)` is the canonical example. It owns:

- a `ref<T[]>` of cached items
- an `isReady` flag
- async CRUD methods returning `Promise<Result<T>>`

Stores consume it; components never touch IndexedDB directly.

## Layer 3 — Stores (`src/stores/`)

Pinia, **setup-store style** only:

```ts
export const useTodoStore = defineStore('todo', () => {
  const filter = ref<TodoFilter>('all')
  const db = useIndexedDb<Todo>({
    /* ... */
  })
  // …
  return { filter /* … */ }
})
```

Stores own feature-level state and orchestrate composables. They convert raw
`Result<T>` errors into user-visible side effects (here: `console.error`; in a
real app, a toast composable). Components import stores, never composables
directly for feature data.

## Layer 4 — Components (`src/components/`)

Two flavours:

- **`Base*.vue`** in `src/components/` root — design-system primitives. No
  feature knowledge. Pure props/events. Tailwind for styling. No hardcoded
  hex / `rgb()` colours — `local/no-hardcoded-colors` enforces this; use
  semantic token classes (`text-heading`, `text-muted`, `bg-surface`, …).
- **`<feature>/<Name>.vue`** — feature components. May import the feature store.
  Compose `Base*` primitives.

`<script setup lang="ts">` everywhere. Props use `defineProps` with
**destructuring** (`vue/define-props-destructuring` is set to `error`).

## Layer 5 — Views (`src/views/`)

Route-level entry points. Should stay thin — compose feature components, set
page title, handle route params. `TodoPage.vue` is intentionally small.

## Dataflow: clicking "Add Todo"

```
1. User types + presses Enter in TodoForm.vue
                                   │
                                   ▼
2. TodoForm calls store.addTodo(title)
                                   │
                                   ▼
3. Store builds a Todo, calls db.add(todo)
   (db is useIndexedDb<Todo> — a composable)
                                   │
                                   ▼
4. Composable wraps the IndexedDB request in tryCatch(...)
                                   │
                                   ▼
5. On success: composable refreshes its internal items ref
                                   │
                                   ▼
6. Store's `todos` (= db.items) updates → Vue re-renders TodoList
                                   │
                                   ▼
7. On failure: store logs via console.error; UI continues
```

The router/view layer is not involved at all — that is the point of the
layering.

## Why this shape

- **Components stay dumb.** They take props, render markup, emit events. They
  do not know IndexedDB exists.
- **Composables stay reusable.** `useIndexedDb` is generic over `T extends { id }`
  — swap it for `useLocalStorage` and the store doesn't change shape.
- **Stores stay testable.** Feature logic is exercised without mounting Vue.
  See `test/unit/stores/`.
- **Lint enforces the boundaries.** Bypassing the layering trips a custom
  rule:
  - `local/no-layer-skip` — `Base*.vue` may not import stores or
    composables; composables may not import components or stores.
  - `local/no-prop-callbacks` — components communicate up via `defineEmits`,
    not callback props.
  - `local/no-try-statement` + `local/no-unchecked-result` — every async
    path produces a checked `Result<T>` (see
    [error-handling.md](./patterns/error-handling.md)).
