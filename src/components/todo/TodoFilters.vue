<script setup lang="ts">
import type { TodoFilter } from '@/types/todo'
import BaseButton from '@/components/BaseButton.vue'
import { useTodoStore } from '@/stores/todo'

const store = useTodoStore()

const FILTERS: TodoFilter[] = ['all', 'active', 'completed']

const FILTER_LABELS: Record<TodoFilter, string> = {
  all: 'All',
  active: 'Active',
  completed: 'Completed',
}

function getVariant(f: TodoFilter): 'primary' | 'secondary' {
  return store.filter === f ? 'primary' : 'secondary'
}
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-3">
    <div class="flex gap-2">
      <BaseButton
        v-for="f in FILTERS"
        :key="f"
        size="sm"
        :variant="getVariant(f)"
        @click="store.setFilter(f)"
      >
        {{ FILTER_LABELS[f] }}
      </BaseButton>
    </div>
    <BaseButton
      v-if="store.completedTodoCount > 0"
      size="sm"
      variant="danger"
      @click="store.clearCompleted()"
    >
      Clear completed
    </BaseButton>
  </div>
</template>
