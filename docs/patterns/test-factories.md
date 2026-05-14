# Test factories

> _No in-repo example yet — pattern proposal._ The reference Todo test
> (`test/unit/stores/todo.spec.ts`) still uses an inline `makeTodo()` helper.
> When the second feature lands, lift the factory into
> `src/__tests__/factories/todo.factory.ts` following the shape below.

Every shape that appears in more than one test gets a factory in
`src/__tests__/factories/`. Inline ad-hoc objects (`const todo = { id: 1, text: 'x', done: false }`)
are the main source of duplication in test suites — they look harmless until
a domain type gains a field and you have to touch 40 tests.

## The shape

A factory file exports:

1. A **frozen `DEFAULTS`** typed as the domain type.
2. A **`createX(overrides?)`** that spreads `DEFAULTS` then `overrides`.
3. Optionally a **`createRandomX()`** using seeded `faker` for property-style
   coverage.
4. Optionally **specialised variants** (`createCompletedX`, `createEmptyX`)
   when those states recur.

```ts
// src/__tests__/factories/todo.factory.ts
import type { Todo } from '@/features/todo/types'
import { faker } from '@faker-js/faker'

const DEFAULTS: Readonly<Todo> = {
  id: 1,
  text: 'Buy milk',
  done: false,
  createdAt: new Date('2026-01-01T00:00:00Z'),
}

export function createTodo(overrides: Partial<Todo> = {}): Todo {
  return { ...DEFAULTS, ...overrides }
}

export function createCompletedTodo(overrides: Partial<Todo> = {}): Todo {
  return createTodo({ done: true, ...overrides })
}

export function createRandomTodo(overrides: Partial<Todo> = {}): Todo {
  return createTodo({
    id: faker.number.int({ min: 1, max: 10_000 }),
    text: faker.lorem.sentence(),
    ...overrides,
  })
}
```

Rules:

- `DEFAULTS` is `Readonly<T>` so a typo in one test can't mutate the source
  of truth for the next.
- The argument is `Partial<T>`, not `T`. Tests only specify what matters to
  them.
- `faker` is **seeded once** in `src/__tests__/setup.ts` (`faker.seed(12_345)`)
  — random output is reproducible across runs, so a failing test is
  reproducible.
- Re-export every public factory from `factories/index.ts` so callers do one
  import.

## In-memory vs. DB factories

Two flavours, separate files:

- `todo.factory.ts` returns the **in-memory shape** the store/composable
  sees. Use in `unit/` and `components/`.
- `dbTodo.factory.ts` returns the **Dexie row shape** (with whatever IDs,
  timestamps, foreign keys the schema requires). Use in `integration/` when
  seeding the DB before mounting the app.

They diverge once persistence does any transformation. Keeping both lets
you write `await db.todos.add(createDbTodo({ done: true }))` without
mentally reverse-engineering the schema.

## Builders for compound shapes

When a shape has many parts (a workout with N blocks, a form with N fields),
add a builder next to the factory. Builders compose factories — they don't
replace them.

```ts
// src/__tests__/factories/workout.builder.ts
export class WorkoutBuilder {
  private workout: Workout = createWorkout({ blocks: [] })

  withName(name: string): this {
    this.workout.name = name
    return this
  }

  withStrengthBlock(overrides: Partial<StrengthBlock> = {}): this {
    const id = this.workout.blocks.length + 1
    this.workout.blocks.push(createStrengthBlock({ id, ...overrides }))
    return this
  }

  build(): Workout {
    return this.workout
  }
}

export function workoutBuilder(): WorkoutBuilder {
  return new WorkoutBuilder()
}
```

Call sites stay readable:

```ts
const workout = workoutBuilder()
  .withName('Push day')
  .withStrengthBlock({ name: 'Bench' })
  .withStrengthBlock({ name: 'Overhead Press' })
  .build()
```

## When to create a new factory

- The shape appears in two or more tests.
- The shape has more than three fields.
- The shape has a discriminant (`kind: 'strength' | 'amrap' | ...`) — each
  variant gets its own `createXBlock`.

If a test legitimately needs a one-off object (testing a malformed record,
for example), inline it and leave a comment. Factories are for the shapes
the code is supposed to handle.

## When to update a factory

When the domain type gains a field, **update the factory in the same PR**.
A factory that lies about the schema is worse than no factory — tests pass,
prod breaks. The lint rule against unused imports will surface any test
that no longer compiles, which is the prompt to update.

## Index re-export

```ts
// src/__tests__/factories/index.ts
export { createTodo, createCompletedTodo, createRandomTodo } from './todo.factory'
export { createDbTodo } from './dbTodo.factory'
export { WorkoutBuilder, workoutBuilder } from './workout.builder'
```

One import line in any spec:

```ts
import { createTodo, workoutBuilder } from '@/__tests__/factories'
```
