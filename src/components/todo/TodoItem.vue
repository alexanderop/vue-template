<script setup lang="ts">
import { ref, useTemplateRef, nextTick } from 'vue'
import { onClickOutside } from '@vueuse/core'
import type { Todo } from '@/types/todo'
import BaseCheckbox from '@/components/BaseCheckbox.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import { useTodoStore } from '@/stores/todo'

interface Props {
  todo: Todo
}

const { todo } = defineProps<Props>()

const store = useTodoStore()
const isEditing = ref(false)
const editTitle = ref('')
const editInputRef = useTemplateRef<HTMLInputElement>('editInputRef')
const itemRef = useTemplateRef<HTMLElement>('itemRef')

function startEdit(): void {
  isEditing.value = true
  editTitle.value = todo.title
  nextTick(() => {
    const el = editInputRef.value
    if (el instanceof HTMLInputElement) {
      el.focus()
    }
  })
}

function saveEdit(): void {
  if (!isEditing.value) {
    return
  }
  isEditing.value = false
  if (!editTitle.value.trim() || editTitle.value.trim() === todo.title) {
    return
  }
  store.updateTodo(todo.id, editTitle.value)
}

function cancelEdit(): void {
  isEditing.value = false
  editTitle.value = todo.title
}

function handleToggle(): void {
  store.toggleTodo(todo.id)
}

function handleDelete(): void {
  store.removeTodo(todo.id)
}

onClickOutside(itemRef, () => {
  if (isEditing.value) {
    saveEdit()
  }
})
</script>

<template>
  <li
    ref="itemRef"
    class="group flex items-center gap-3 rounded-lg border border-border bg-surface-raised px-4 py-3 transition-colors hover:border-border-hover"
  >
    <BaseCheckbox
      :model-value="todo.completed"
      :aria-label="`Toggle '${todo.title}'`"
      @update:model-value="handleToggle"
    />

    <div v-if="isEditing" class="flex-1">
      <input
        ref="editInputRef"
        v-model="editTitle"
        type="text"
        class="w-full rounded border border-primary bg-surface px-2 py-1 text-sm text-heading outline-none"
        @keydown.enter="saveEdit"
        @keydown.escape="cancelEdit"
      />
    </div>
    <span
      v-else
      class="flex-1 text-sm transition-colors"
      :class="todo.completed ? 'text-muted line-through' : 'text-heading'"
      @dblclick="startEdit"
    >
      {{ todo.title }}
    </span>

    <div class="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
      <button
        class="rounded p-1 text-muted transition-colors hover:bg-surface-overlay hover:text-heading"
        aria-label="Edit todo"
        @click="startEdit"
      >
        <BaseIcon name="edit" size="sm" />
      </button>
      <button
        class="rounded p-1 text-muted transition-colors hover:bg-danger-dim hover:text-danger"
        aria-label="Delete todo"
        @click="handleDelete"
      >
        <BaseIcon name="trash" size="sm" />
      </button>
    </div>
  </li>
</template>
