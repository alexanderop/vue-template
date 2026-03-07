import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTodoStore } from '@/stores/todo'
import type { Result } from '@/utils/tryCatch'
import type { Todo } from '@/types/todo'

const mockItems = { value: [] as Todo[] }
const mockIsReady = { value: true }

const mockGetAll = vi.fn<() => Promise<Result<Todo[]>>>()
const mockAdd = vi.fn<(item: Todo) => Promise<Result<Todo>>>()
const mockUpdate = vi.fn<(item: Todo) => Promise<Result<Todo>>>()
const mockRemove = vi.fn<(id: string) => Promise<Result<void>>>()
const mockClear = vi.fn<() => Promise<Result<void>>>()

vi.mock('@/composables/useIndexedDb', () => ({
  useIndexedDb: () => ({
    items: mockItems,
    isReady: mockIsReady,
    getAll: mockGetAll,
    add: mockAdd,
    update: mockUpdate,
    remove: mockRemove,
    clear: mockClear,
  }),
}))

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: crypto.randomUUID(),
    title: 'Test todo',
    completed: false,
    createdAt: Date.now(),
    ...overrides,
  }
}

describe('useTodoStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockItems.value = []
    vi.clearAllMocks()
    mockGetAll.mockResolvedValue({ data: [], error: null })
    mockAdd.mockImplementation((item) => {
      mockItems.value = [...mockItems.value, item]
      return Promise.resolve({ data: item, error: null })
    })
    mockUpdate.mockImplementation((item) => {
      mockItems.value = mockItems.value.map((t) => (t.id === item.id ? item : t))
      return Promise.resolve({ data: item, error: null })
    })
    mockRemove.mockImplementation((id) => {
      mockItems.value = mockItems.value.filter((t) => t.id !== id)
      return Promise.resolve({ data: undefined, error: null })
    })
  })

  it('initializes by calling getAll', async () => {
    const store = useTodoStore()
    await store.initialize()
    expect(mockGetAll).toHaveBeenCalledOnce()
  })

  it('adds a todo', async () => {
    const store = useTodoStore()
    await store.addTodo('Buy milk')
    expect(mockAdd).toHaveBeenCalledOnce()
    expect(mockItems.value).toHaveLength(1)
    expect(mockItems.value[0]?.title).toBe('Buy milk')
  })

  it('rejects empty title', async () => {
    const store = useTodoStore()
    await store.addTodo('   ')
    expect(mockAdd).not.toHaveBeenCalled()
  })

  it('removes a todo', async () => {
    const todo = makeTodo()
    mockItems.value = [todo]
    const store = useTodoStore()
    await store.removeTodo(todo.id)
    expect(mockRemove).toHaveBeenCalledWith(todo.id)
  })

  it('toggles a todo', async () => {
    const todo = makeTodo({ completed: false })
    mockItems.value = [todo]
    const store = useTodoStore()
    await store.toggleTodo(todo.id)
    expect(mockUpdate).toHaveBeenCalledOnce()
    const updated = mockUpdate.mock.calls[0]?.[0]
    expect(updated?.completed).toBe(true)
  })

  it('updates a todo title', async () => {
    const todo = makeTodo({ title: 'Old' })
    mockItems.value = [todo]
    const store = useTodoStore()
    await store.updateTodo(todo.id, 'New')
    expect(mockUpdate).toHaveBeenCalledOnce()
    const updated = mockUpdate.mock.calls[0]?.[0]
    expect(updated?.title).toBe('New')
  })

  it('filters active todos', () => {
    const active = makeTodo({ completed: false })
    const completed = makeTodo({ completed: true })
    mockItems.value = [active, completed]
    const store = useTodoStore()
    store.setFilter('active')
    expect(store.filteredTodos).toHaveLength(1)
    expect(store.filteredTodos[0]?.completed).toBe(false)
  })

  it('filters completed todos', () => {
    const active = makeTodo({ completed: false })
    const completed = makeTodo({ completed: true })
    mockItems.value = [active, completed]
    const store = useTodoStore()
    store.setFilter('completed')
    expect(store.filteredTodos).toHaveLength(1)
    expect(store.filteredTodos[0]?.completed).toBe(true)
  })

  it('clears completed todos', async () => {
    const active = makeTodo({ completed: false })
    const completed = makeTodo({ completed: true })
    mockItems.value = [active, completed]
    const store = useTodoStore()
    await store.clearCompleted()
    expect(mockRemove).toHaveBeenCalledWith(completed.id)
    expect(mockRemove).toHaveBeenCalledOnce()
  })

  it('counts active and completed todos', () => {
    mockItems.value = [
      makeTodo({ completed: false }),
      makeTodo({ completed: false }),
      makeTodo({ completed: true }),
    ]
    const store = useTodoStore()
    expect(store.activeTodoCount).toBe(2)
    expect(store.completedTodoCount).toBe(1)
  })
})
