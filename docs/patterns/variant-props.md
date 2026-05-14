# Variant props

> _No in-repo example yet — pattern proposal._ `BaseButton` and `BaseBadge`
> use a simpler `Record<Variant, string>` lookup, which is fine when all
> variants accept the same props. Reach for the discriminated-union shape
> below when a variant introduces _new required props_ that don't apply to
> the others.

A pattern for components whose props are **conditionally valid** — i.e. prop B
is only meaningful (or required) when prop A has a specific value.

## When to reach for it

- An icon button takes `iconName` only when `variant === 'icon'`.
- A link takes `href` only when `as === 'a'`; a button takes `onClick` only
  when `as === 'button'`.
- You currently document "if you pass X you must also pass Y" in a comment.

If a JSDoc warning is the only mechanism keeping callers honest, the type
system can do better.

## Shape

A discriminated union as the `defineProps` generic. The discriminant is
usually a string literal prop (`variant`, `as`, `type`).

```vue
<script setup lang="ts">
type Props =
  | { variant: 'text'; label: string }
  | { variant: 'icon'; iconName: string; ariaLabel: string }

// `vue/define-props-destructuring` requires destructuring. With a
// discriminated union, narrow on the discriminant first via a const so
// TypeScript can refine the rest of the props.
const props = defineProps<Props>()
</script>

<template>
  <button v-if="props.variant === 'text'">{{ props.label }}</button>
  <button v-else :aria-label="props.ariaLabel">
    <BaseIcon :name="props.iconName" />
  </button>
</template>
```

Inside the template, `props.variant === 'text'` narrows the union the same way
it would in a `.ts` file — `props.iconName` is unreachable in the text branch.

> **Why `props` instead of destructured fields?** Vue's
> `vue/define-props-destructuring` rule is `error` in this repo, but
> destructuring a discriminated union collapses it — once you write
> `const { iconName } = defineProps<Props>()`, the type system can't tell
> which variant you're in. The conventional workaround is to alias the
> non-destructured `props` (as above), or split into two components.

## Why not just optional props?

Optional props (`iconName?: string`) tell the caller "this is allowed but not
required". They don't tell the caller "this is invalid unless variant is
'icon'". Variant props make the invalid combinations **unrepresentable** —
the wrong combination doesn't typecheck.

## Caveats

- `vue/define-props-destructuring` is `error` in this repo. You can still use
  the discriminated-union shape; destructure after narrowing if needed.
- Don't combine more than 3–4 variants in one component. At that point, you
  probably want multiple components or the [compound pattern](./compound-components.md).

## Background

Full walk-through with type-safety internals at
<https://alexop.dev/posts/vue-typescript-variant-props-type-safe-props>.
