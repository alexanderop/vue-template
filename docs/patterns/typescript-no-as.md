# No `as` casts in `src/`

Type assertions (`value as Type`, `<Type>value`) are **banned** in `src/`.
This is enforced by upstream oxlint rule
`typescript/consistent-type-assertions` with `assertionStyle: "never"`
(see `.oxlintrc.json` under the `src/**/*.{ts,vue}` override).

## Why

`as` is a one-way trust-me to the compiler — it disables checking without
producing any runtime guard. The two practical failure modes:

- **Future drift.** You cast `x as User` today; the `User` shape grows a
  `roles: Role[]` field next month; your cast site silently produces a `User`
  with `roles === undefined`. No type error, runtime explosion.
- **Hiding real bugs.** `as unknown as Foo` and `as any` are how unsound code
  enters a "strict" codebase. Once one exists, more accrue — there's no
  lint-shaped fence around the second occurrence.

## What to do instead

In rough order of preference:

### 1. Type the value at the point of declaration

```ts
// ✗
const filter = 'all' as TodoFilter

// ✓
const filter: TodoFilter = 'all'
```

### 2. Use `satisfies` when you want both inference and a constraint

```ts
// ✗
const VARIANTS = { primary: '...', danger: '...' } as Record<Variant, string>

// ✓
const VARIANTS = { primary: '...', danger: '...' } satisfies Record<Variant, string>
// type is { primary: string; danger: string } — keys still inferred
```

### 3. Use a type guard for narrowing

```ts
// ✗
const error = e as Error

// ✓
function isError(e: unknown): e is Error {
  return e instanceof Error
}
if (isError(e)) {
  /* narrowed */
}
```

For async failures, [`tryCatch`](./error-handling.md) does this for you — the
returned `error` is already typed as `Error`.

### 4. Use a discriminated union and narrow on the tag

See [variant-props](./variant-props.md) and the `Result<T>` shape in
[error-handling](./error-handling.md). Narrowing replaces casting.

### 5. As a last resort: zod / valibot / a parser at the boundary

For data crossing a system boundary (HTTP, IndexedDB read, `localStorage`),
parse with a schema library and let the schema produce a typed value. No
cast required, and you get a real runtime check.

## Where casts are still allowed

The rule scope is `src/**/*.{ts,vue}`. Casts are allowed in:

- `test/**` — sometimes needed to coerce a mock into an interface.
- `eslint-local-rules/**` — pure JS.
- `*.config.{ts,js}` — config files.

If you genuinely need a cast in `src/` (vendor types missing a field,
brand-stripping for an internal helper), prefer a single dedicated utility
with a `// eslint-disable-next-line` so the exception is visible and grep-able
rather than diffused across the codebase.

## Background

Full rationale at
<https://alexop.dev/posts/the-problem-with-as-in-typescript-why-its-a-shortcut-we-should-avoid>.
