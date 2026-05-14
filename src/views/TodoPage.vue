<script setup lang="ts">
import { useOnline } from '@vueuse/core'
import TodoApp from '@/components/todo/TodoApp.vue'

const isOnline = useOnline()
</script>

<template>
  <div class="min-h-screen bg-bg">
    <header class="border-b border-border bg-surface/80 backdrop-blur-xl">
      <div class="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
        <h1 class="font-mono text-sm font-medium text-heading">Todo App</h1>
        <span
          class="inline-flex items-center gap-1.5 text-xs"
          :class="isOnline ? 'text-success' : 'text-danger'"
        >
          <span class="size-2 rounded-full" :class="isOnline ? 'bg-success' : 'bg-danger'" />
          {{ isOnline ? 'Online' : 'Offline' }}
        </span>
      </div>
    </header>

    <main class="mx-auto max-w-2xl px-6 py-8">
      <TodoApp />
    </main>
  </div>
</template>
