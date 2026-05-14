<script setup lang="ts">
type BadgeVariant = 'danger' | 'default' | 'primary' | 'success'

interface Props {
  variant?: BadgeVariant
}

const { variant = 'default' } = defineProps<Props>()

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: 'bg-surface-overlay text-body',
  primary: 'bg-primary-dim text-primary',
  success: 'bg-success-dim text-success',
  danger: 'bg-danger-dim text-danger',
}
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
    :class="VARIANT_CLASSES[variant]"
  >
    <slot />
  </span>
</template>
