<script setup lang="ts">
type ButtonVariant = 'danger' | 'primary' | 'secondary'
type ButtonSize = 'lg' | 'md' | 'sm'

interface Props {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit'
}

const {
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
} = defineProps<Props>()

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-bg hover:opacity-90',
  secondary:
    'border border-border bg-surface text-heading hover:border-border-hover hover:bg-surface-raised',
  danger: 'bg-danger text-white hover:opacity-90',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50"
    :class="[VARIANT_CLASSES[variant], SIZE_CLASSES[size]]"
  >
    <svg
      v-if="loading"
      class="size-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
    <slot />
  </button>
</template>
