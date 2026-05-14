<script setup lang="ts">
import { useId } from 'vue'

interface Props {
  modelValue: boolean
  label?: string
  ariaLabel?: string
  id?: string
}

const { modelValue, label, ariaLabel, id } = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const generatedId = id ?? useId()

function onChange(): void {
  emit('update:modelValue', !modelValue)
}
</script>

<template>
  <div class="flex items-center gap-2">
    <input
      :id="generatedId"
      type="checkbox"
      :checked="modelValue"
      :aria-label="ariaLabel"
      class="size-4 rounded border-border accent-primary"
      @change="onChange"
    />
    <label v-if="label" :for="generatedId" class="text-sm text-body cursor-pointer select-none">
      {{ label }}
    </label>
  </div>
</template>
