import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useIndexedDb } from '@/composables/useIndexedDb'
import type { Todo, TodoFilter } from '@/types/todo'

export const useTodoStore = defineStore('todo', () => {
  const filter = ref<TodoFilter>('all')

  const db = useIndexedDb<Todo>({
    dbName: 'todo-app',
    storeName: 'todos',
    version: 1,
  })

  const todos = db.items
  const isReady = db.isReady

  const filteredTodos = computed(() => {
    if (filter.value === 'active') return todos.value.filter((t) => !t.completed)
    if (filter.value === 'completed') return todos.value.filter((t) => t.completed)
    return todos.value
  })

  const activeTodoCount = computed(() => todos.value.filter((t) => !t.completed).length)

  const completedTodoCount = computed(() => todos.value.filter((t) => t.completed).length)

  function initialize(): Promise<void> {
    return db.getAll().then((result) => {
      if (result.error) {
        console.error('Failed to load todos:', result.error)
      }
    })
  }

  function addTodo(title: string): Promise<void> {
    const trimmed = title.trim()
    if (!trimmed) {
      return Promise.resolve()
    }
    const todo: Todo = {
      id: crypto.randomUUID(),
      title: trimmed,
      completed: false,
      createdAt: Date.now(),
    }
    return db.add(todo).then((result) => {
      if (result.error) {
        console.error('Failed to add todo:', result.error)
      }
    })
  }

  function removeTodo(id: string): Promise<void> {
    return db.remove(id).then((result) => {
      if (result.error) {
        console.error('Failed to remove todo:', result.error)
      }
    })
  }

  function toggleTodo(id: string): Promise<void> {
    const todo = todos.value.find((t) => t.id === id)
    if (!todo) {
      return Promise.resolve()
    }
    const updated: Todo = { ...todo, completed: !todo.completed }
    return db.update(updated).then((result) => {
      if (result.error) {
        console.error('Failed to toggle todo:', result.error)
      }
    })
  }

  function updateTodo(id: string, title: string): Promise<void> {
    const trimmed = title.trim()
    if (!trimmed) {
      return Promise.resolve()
    }
    const todo = todos.value.find((t) => t.id === id)
    if (!todo) {
      return Promise.resolve()
    }
    const updated: Todo = { ...todo, title: trimmed }
    return db.update(updated).then((result) => {
      if (result.error) {
        console.error('Failed to update todo:', result.error)
      }
    })
  }

  function clearCompleted(): Promise<void> {
    const completedIds = todos.value.filter((t) => t.completed).map((t) => t.id)
    const removals = completedIds.map((id) => db.remove(id))
    return Promise.all(removals).then((results) => {
      const errors = results.filter((r) => r.error)
      for (const failed of errors) {
        console.error('Failed to clear completed:', failed.error)
      }
    })
  }

  function setFilter(newFilter: TodoFilter): void {
    filter.value = newFilter
  }

  return {
    todos,
    filter,
    isReady,
    filteredTodos,
    activeTodoCount,
    completedTodoCount,
    initialize,
    addTodo,
    removeTodo,
    toggleTodo,
    updateTodo,
    clearCompleted,
    setFilter,
  }
})
