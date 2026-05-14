<script setup lang="ts">
import { useTodoStore } from '@/stores/todo'
import TodoItem from '@/components/todo/TodoItem.vue'

const store = useTodoStore()
</script>

<template>
  <div>
    <TransitionGroup
      v-if="store.filteredTodos.length > 0"
      tag="ul"
      name="todo-list"
      class="space-y-2"
    >
      <TodoItem v-for="todo in store.filteredTodos" :key="todo.id" :todo="todo" />
    </TransitionGroup>
    <p v-else class="py-8 text-center text-sm text-muted">No todos match the current filter.</p>
  </div>
</template>

<style scoped>
.todo-list-enter-active,
.todo-list-leave-active {
  transition: all 0.3s ease;
}

.todo-list-enter-from,
.todo-list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.todo-list-move {
  transition: transform 0.3s ease;
}
</style>
