# Compound components

> _No in-repo example yet — pattern proposal._ `BaseCard` uses named slots
> (`#header`, `#footer`); none of the `Base*` components use the
> `provide`/`inject` compound shape below. Reach for this pattern when a
> flat component's surface starts collecting flags or fork-by-variant
> templates.

A pattern for components whose internal structure the caller needs to control —
without exposing a wall of boolean / slot-name props.

## When to reach for it

You should consider the compound pattern when **any** of these are true for a
component:

- You're about to add the 5th boolean prop (`hasHeader`, `hasFooter`,
  `showClose`, `dismissable`, `withDivider`, …).
- You're juggling named slots (`#header`, `#body`, `#footer`, `#actions`) and
  the caller often wants to swap or reorder them.
- You catch yourself writing `v-if="variant === 'with-icon'"` in the template
  to fork layout.

If a component has 2 props and one slot, **don't** use this pattern — it's
overkill.

## Shape

A "root" component owns shared state via `provide`. Sub-components consume it
via `inject`. The caller composes the parts:

```vue
<!-- BaseDialog/Root.vue -->
<script setup lang="ts">
import { provide, ref } from 'vue'
import { dialogKey } from './context'

const open = ref(false)
provide(dialogKey, { open, close: () => (open.value = false) })
</script>

<template>
  <slot />
</template>
```

```vue
<!-- usage -->
<BaseDialog.Root>
  <BaseDialog.Trigger>Open</BaseDialog.Trigger>
  <BaseDialog.Content>
    <BaseDialog.Title>Confirm</BaseDialog.Title>
    <BaseDialog.Description>Really?</BaseDialog.Description>
    <BaseDialog.Close>Cancel</BaseDialog.Close>
  </BaseDialog.Content>
</BaseDialog.Root>
```

Sub-components stay small and have no idea where they sit in the tree — they
only know what the injected context lets them do.

## Trade-offs

- **Wins:** no flag soup, callers control layout, each part is independently
  reusable, and TypeScript on the injected context catches misuse.
- **Costs:** more files (5–8 vs. 1), discoverability suffers — a reader has
  to know the family exists. Worth it once the flat version exceeds ~4 flags;
  not worth it before.

## Background

Full rationale and a complete Dialog walk-through (the pattern behind Reka UI
and shadcn-vue) lives at
<https://alexop.dev/posts/compound-components-in-vue-shadcn>.
