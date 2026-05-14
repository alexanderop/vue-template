<script setup lang="ts">
import { useId } from 'vue'

interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  hasError?: boolean
  id?: string
}

const { modelValue, label, placeholder, hasError = false, id } = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const generatedId = id ?? useId()

function onInput(event: Event): void {
  const target = event.target
  if (target instanceof HTMLInputElement) {
    emit('update:modelValue', target.value)
  }
}
</script>

<template>
  <div>
    <label v-if="label" :for="generatedId" class="mb-1.5 block text-sm font-medium text-heading">
      {{ label }}
    </label>
    <input
      :id="generatedId"
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
      class="w-full rounded-lg border bg-surface px-4 py-2.5 text-sm text-heading outline-none transition-colors placeholder:text-muted focus:border-primary"
      :class="hasError ? 'border-danger' : 'border-border'"
      @input="onInput"
    />
    <slot name="error" />
  </div>
</template>
