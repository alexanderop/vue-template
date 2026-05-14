<script setup lang="ts">
type CardPadding = 'lg' | 'md' | 'none' | 'sm'

interface Props {
  padding?: CardPadding
}

const { padding = 'md' } = defineProps<Props>()

const PADDING_CLASSES: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}
</script>

<template>
  <div class="rounded-xl border border-border bg-surface overflow-hidden">
    <div v-if="$slots.header" class="border-b border-border px-6 py-4">
      <slot name="header" />
    </div>
    <div :class="PADDING_CLASSES[padding]">
      <slot />
    </div>
    <div v-if="$slots.footer" class="border-t border-border px-6 py-4">
      <slot name="footer" />
    </div>
  </div>
</template>
