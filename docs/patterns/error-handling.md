# Error handling with `tryCatch`

`try/catch` is banned in `src/` by `local/no-try-statement`. Every async path
in production code flows through `tryCatch` from `src/utils/tryCatch.ts`.

## The shape

```ts
interface Success<T> {
  data: T
  error: null
}
interface Failure {
  data: null
  error: Error
}

export type Result<T> = Success<T> | Failure

export function tryCatch<T>(promise: Promise<T>): Promise<Result<T>>
```

The discriminant is **the field with a non-null value**. Type-narrow on it:

```ts
const result = await db.add(todo)
if (result.error) {
  console.error('Failed to add todo:', result.error)
  return
}
// here, TypeScript knows result.data: Todo
```

## Why not `try/catch`?

- **Type-erased catch.** `catch (e)` is `unknown`; you re-discover the error
  shape at every call site.
- **Easy to swallow.** A bare `catch {}` is silently allowed by the language;
  a missing `if (result.error)` is loud (`result.data` is `T | null`).
- **Composition.** `Result` returns flow through `.then(...)` and `await`
  unchanged. `try/catch` requires nesting or re-throwing.
- **Consistent contract.** Every async API in this codebase returns
  `Promise<Result<T>>`. You can read any handler without wondering whether
  the next line might throw.

## Where it's enforced

- `local/no-try-statement` — bans the `try { } catch { }` keyword in `src/`.
- `local/no-unchecked-result` — bans **discarding** the return of
  `tryCatch(...)`. Without this, banning `try/catch` only moves the swallow
  one level up (`await tryCatch(x)` with no destructure). Together they
  guarantee every async path produces a checked `Result<T>`.

## Where it's allowed

`try/catch` is fine in:

- `test/**` — tests assert on thrown errors freely.
- `eslint-local-rules/**` — pure JS, not Vue code.
- `*.config.{ts,js}` — config files, not application code.

## Calling `tryCatch`

It accepts a `Promise<T>` — wrap any thenable:

```ts
const result = await tryCatch(fetch('/api/x').then((r) => r.json()))
```

For IndexedDB requests there's an internal `idbRequest()` helper inside
`useIndexedDb` that converts `IDBRequest` → `Promise`; `tryCatch` then wraps
the chain. See `src/composables/useIndexedDb.ts` for the canonical use.

## Logging vs. surfacing

The Todo store currently logs failures with `console.error` and continues:

```ts
const result = await db.add(todo)
if (result.error) {
  console.error('Failed to add todo:', result.error)
}
```

In a real app, swap the `console.error` for a toast composable. The `result.error`
is a real `Error` (the utility normalises `unknown` → `Error`), so it has a
`message` and `stack`.

## What `tryCatch` does NOT do

- It does not retry.
- It does not classify errors (network vs. domain). Wrap it in a higher-level
  helper if your feature needs that.
- It does not turn synchronous throws into `Result` — pass a `Promise`. For
  sync code, prefer expressions that can't throw.
