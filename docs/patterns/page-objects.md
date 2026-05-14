# Page Objects for browser tests

> _No in-repo example yet — pattern proposal._ Browser tests today
> (`test/browser/*.spec.ts`) drive the DOM inline. Lift to a Page Object the
> second time two tests want the same flow, following the shape below.

A Page Object (PO) is a class that wraps the awkward bits of driving a view
— dialog waits, exact-name selection, single-visible-element navigation —
so spec files read like English and the awkward bits live in one place.

Without POs, the same `await page.getByRole('dialog').waitFor(); const btn = …`
ritual ends up copy-pasted into every integration test. The first time it
breaks, you touch 20 files. POs eliminate that class of duplication.

## File layout

```
src/__tests__/helpers/pages/
├── index.ts          # re-exports every PO
├── CommonPO.ts       # primitives: dialogs, nav, form fields
├── TodoPO.ts         # per-view PO
└── ...
```

Naming: `<View>PO.ts`, exporting class `<View>PO`. Plural for collection
views (`TodosPO`), singular for a single-record view (`TodoDetailPO`).

## The shape

A PO is a class with:

1. A **constructor** that receives the shared `CommonPO` (and any other
   context it needs).
2. **Methods named after user intents**, not DOM operations — `addTodo()`,
   not `clickAddButton()`. The whole point is that callers don't think in
   terms of DOM.
3. **Awaits** on every interaction; never return mid-flow if state is still
   settling.

```ts
// src/__tests__/helpers/pages/TodoPO.ts
import { page, userEvent } from 'vitest/browser'
import { expect } from 'vitest'
import type { CommonPO } from './CommonPO'

export class TodoPO {
  constructor(private common: CommonPO) {}

  async addTodo(text: string): Promise<void> {
    const input = page.getByPlaceholder('What needs to be done?')
    await userEvent.fill(input, text)
    await userEvent.keyboard('{Enter}')
    await expect.element(page.getByText(text)).toBeVisible()
  }

  async toggleTodo(text: string): Promise<void> {
    const row = page.getByRole('listitem').filter({ hasText: text })
    const checkbox = row.getByRole('checkbox')
    await userEvent.click(checkbox)
  }

  async clearCompleted(): Promise<void> {
    await userEvent.click(page.getByRole('button', { name: 'Clear completed' }))
  }

  async filterBy(name: 'All' | 'Active' | 'Completed'): Promise<void> {
    await userEvent.click(page.getByRole('button', { name }))
  }

  todoCount(): number {
    return page.getByRole('listitem').elements().length
  }
}
```

## CommonPO — the shared primitives

`CommonPO` owns the cross-view rituals that every other PO needs: dialog
waits, navigation, form-field queries. Other POs receive it in their
constructor, so they call `this.common.waitForDialog()` instead of
reimplementing the wait.

```ts
export class CommonPO {
  async waitForDialog(): Promise<void> {
    await expect.element(page.getByRole('dialog')).toBeVisible()
  }

  async waitForDialogClose(): Promise<void> {
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument()
    await flushPromises()
  }

  getDialogButton(text: string): HTMLElement {
    /* … */
  }

  async navigateTo(path: string): Promise<void> {
    /* … */
  }
}
```

If a query is non-trivial and used in more than one PO, it belongs in
`CommonPO`.

## createTestApp wires it together

`src/__tests__/helpers/createTestApp.ts` mounts `App.vue` with the real
router and Pinia, then constructs every PO and hands them back pre-wired:

```ts
export async function createTestApp(options: CreateTestAppOptions = {}): Promise<TestApp> {
  const { container, router /* … */ } = await mountApp(options)

  const common = new CommonPO({ router })
  const todo = new TodoPO(common)

  return {
    container,
    router,
    common,
    todo,
    navigateTo: (path) => common.navigateTo(path),
    cleanup: () => unmountApp(),
  }
}
```

Tests destructure what they need:

```ts
it('clears completed todos', async () => {
  const { todo, cleanup } = await createTestApp()

  await todo.addTodo('Buy milk')
  await todo.addTodo('Walk dog')
  await todo.toggleTodo('Buy milk')
  await todo.clearCompleted()

  expect(todo.todoCount()).toBe(1)
  cleanup()
})
```

No `page.getByRole(...)` in the spec — that's the goal.

## When to add a PO

**The second time** two tests want the same flow. Not the first — premature
POs are abstractions over a sample size of one.

Concretely:

- If you find yourself copy-pasting more than two lines of `page.getBy*`
  setup between specs, that's a PO method waiting to be born.
- If a single user intent takes more than three DOM operations to express
  (search, wait, scope, click), wrap it — that's where the gotchas hide.

**Do not** add a PO method that has one caller and is one line long. It
trades real duplication for indirection cost.

## When to add a method to CommonPO vs. a per-view PO

- Cross-view ritual (dialog, toast, nav, scroll) → `CommonPO`.
- View-specific intent (`startWorkout`, `addTodo`) → that view's PO.

A per-view PO can compose `CommonPO`: `await this.common.waitForDialog()`
inside `TodoPO.openEditDialog()`.

## Gotchas to encode in PO methods

These are the patterns that cost real debugging time. The moment a test
hits one, the fix is "wrap it in a PO method" so the next test doesn't.

- **Single-visible-element pattern.** When the UI shows one item at a time
  (tabs, carousels), navigate to the target first, then query the one
  visible element. Don't index into an array of elements that aren't all
  in the DOM.

- **Exact-name selection.** `getByText('Deadlift')` may match "Romanian
  Deadlift". A `selectExercise()` method types into the search input and
  clicks the exact match.

- **`getByLabelText` for form-field presence.** Dialog descriptions often
  contain the same words as field labels. `getByLabelText(/^target reps$/i)`
  matches only the input.

- **Dialog close is async.** `waitForDialogClose()` must wait for both the
  dialog element _and_ its overlay to leave the DOM, plus a `flushPromises()`
  for Vue's microtasks. Skipping this causes flaky "element not clickable"
  errors on the next interaction.

- **shadcn-vue DropdownMenu uses `@select`, not `@click`.** And it renders
  with `role="menu"`, not `role="dialog"` — wait for the right role.

## Index re-export

```ts
// src/__tests__/helpers/pages/index.ts
export { CommonPO } from './CommonPO'
export { TodoPO } from './TodoPO'
```

Then `createTestApp` imports from the index and tests never import PO
classes directly — they go through the `createTestApp` return value, so
the PO surface is a single source of truth.
