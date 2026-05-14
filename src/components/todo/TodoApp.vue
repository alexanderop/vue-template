<script setup lang="ts">
import { onMounted } from 'vue'
import { useTodoStore } from '@/stores/todo'
import BaseCard from '@/components/BaseCard.vue'
import BaseBadge from '@/components/BaseBadge.vue'
import TodoForm from '@/components/todo/TodoForm.vue'
import TodoFilters from '@/components/todo/TodoFilters.vue'
import TodoList from '@/components/todo/TodoList.vue'

const store = useTodoStore()

onMounted(() => {
  store.initialize()
})
</script>

<template>
  <BaseCard padding="none">
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-heading">My Todos</h2>
        <BaseBadge variant="primary"> {{ store.activeTodoCount }} active </BaseBadge>
      </div>
    </template>

    <div class="space-y-6 p-6">
      <TodoForm />
      <TodoFilters />
      <TodoList />
    </div>

    <template #footer>
      <p class="text-sm text-muted">
        {{ store.activeTodoCount }} {{ store.activeTodoCount === 1 ? 'item' : 'items' }} left
      </p>
    </template>
  </BaseCard>
</template>
