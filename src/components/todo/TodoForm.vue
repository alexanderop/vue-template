<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { useFocus } from '@vueuse/core'
import BaseInput from '@/components/BaseInput.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import { useTodoStore } from '@/stores/todo'

const store = useTodoStore()
const newTodoTitle = ref('')
const inputRef = useTemplateRef<HTMLInputElement>('inputRef')
const { focused } = useFocus(inputRef, { initialValue: true })

function handleSubmit(): void {
  if (!newTodoTitle.value.trim()) {
    return
  }
  store.addTodo(newTodoTitle.value).then(() => {
    newTodoTitle.value = ''
    focused.value = true
  })
}
</script>

<template>
  <form class="flex gap-3" @submit.prevent="handleSubmit">
    <div class="flex-1">
      <BaseInput ref="inputRef" v-model="newTodoTitle" placeholder="What needs to be done?" />
    </div>
    <BaseButton type="submit" :disabled="!newTodoTitle.trim()">
      <BaseIcon name="plus" size="sm" />
      Add
    </BaseButton>
  </form>
</template>
