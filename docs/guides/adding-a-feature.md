# Adding a feature

Recipe for "I want a new domain feature like Todos, but for X". Mirror the
Todo feature's shape.

## Reference files (read these first)

The Todo feature is the canonical implementation across every layer. Skim
these in order before writing your own:

| File                                                                       | Layer                               |
| -------------------------------------------------------------------------- | ----------------------------------- |
| `src/types/todo.ts`                                                        | Domain types                        |
| `src/utils/tryCatch.ts`                                                    | `Result<T>` utility                 |
| `src/composables/useIndexedDb.ts`                                          | Reusable IndexedDB composable       |
| `src/stores/todo.ts`                                                       | Pinia setup-store                   |
| `src/components/todo/{TodoApp,TodoForm,TodoFilters,TodoList,TodoItem}.vue` | Feature components                  |
| `src/views/TodoPage.vue`                                                   | Route-level wrapper                 |
| `test/unit/stores/todo.spec.ts`                                            | Store unit test (mocked composable) |
| `test/browser/TodoApp.browser.spec.ts`                                     | Browser component test              |
| `test/browser/a11y.spec.ts`                                                | a11y coverage (axe-core)            |
| `e2e/todo.spec.ts`                                                         | Playwright end-to-end               |

## 1. Domain types — `src/types/<feature>.ts`

```ts
export interface Foo {
  id: string
  // …
  createdAt: number
}

// No `enum` (banned by local/no-enum). Use union literals.
export type FooFilter = 'all' | 'active' | 'archived'
```

The `id: string` shape matters — `useIndexedDb<T extends { id: string }>` keys
off it.

## 2. Store — `src/stores/<feature>.ts`

Setup-store style. Wrap a composable; expose a verb-y API; never expose the
raw composable.

```ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useIndexedDb } from '@/composables/useIndexedDb'
import type { Foo, FooFilter } from '@/types/foo'

export const useFooStore = defineStore('foo', () => {
  const filter = ref<FooFilter>('all')
  const db = useIndexedDb<Foo>({ dbName: 'foo-app', storeName: 'foos' })

  const items = db.items
  const isReady = db.isReady

  // ... computed selectors

  async function addFoo(/* ... */): Promise<void> {
    const result = await db.add(/* ... */)
    if (result.error) {
      console.error('Failed to add foo:', result.error)
    }
  }

  // No `try/catch` here — local/no-try-statement bans it in src/.
  // Use the Result returned by tryCatch-wrapped composable methods.

  return { items, filter, isReady, addFoo /* … */ }
})
```

## 3. Feature components — `src/components/<feature>/`

Group by feature. Each component is a focused unit:

- `FooApp.vue` — the orchestrator; calls `store.initialize()` in `onMounted`.
- `FooForm.vue` — input affordance.
- `FooList.vue` — iterates `store.filtered*` and renders `FooItem`.
- `FooItem.vue` — single item; emits events back up.
- `FooFilters.vue` — calls `store.setFilter(...)`.

All use `<script setup lang="ts">`. Props use destructuring:

```ts
const { title, completed } = defineProps<{ title: string; completed: boolean }>()
```

Styling: Tailwind utility classes, no hardcoded colours.
`local/no-hardcoded-colors` will flag `#ff0000` / `rgb(...)` / `hsl(...)`.
Use semantic tokens (`text-heading`, `bg-surface`, …) defined in the
Tailwind theme.

## 4. View — `src/views/FooPage.vue`

Thin. Renders `<FooApp />`.

## 5. Route — `src/router/index.ts`

```ts
{ path: '/foo', component: () => import('@/views/FooPage.vue') }
```

## 6. Tests — three tiers

| Tier    | Where                          | What it covers                             |
| ------- | ------------------------------ | ------------------------------------------ |
| Unit    | `test/unit/stores/foo.spec.ts` | Pure store logic. Mock `useIndexedDb`.     |
| Browser | `test/browser/FooApp.spec.ts`  | Component behaviour in a real browser DOM. |
| E2E     | `e2e/foo.spec.ts`              | A user-visible flow against the built app. |

See [testing.md](./testing.md) for the why/when of each tier.

**A11y coverage is enforced.** Every new `.vue` under `src/components/` must be
imported in `test/browser/a11y.spec.ts` (a small `describe` block running
`axe.run` is enough) or added to `SKIPPED_COMPONENTS` in
`test/unit/a11y-component-coverage.spec.ts` with a justification. The meta-test
greps `@/components/...` imports and fails `pnpm test:unit` otherwise — so a
new component that ships without an a11y test will fail CI before review.

## 7. Verify before declaring done

```
pnpm type-check
pnpm lint
pnpm test:unit
pnpm test:browser           # if UI changed
pnpm dev                    # manual smoke test
```

For UI features: actually open the browser and walk the golden path plus one
edge case. Typechecks and tests don't catch "the button looks wrong" or
"focus lands on the wrong element".
