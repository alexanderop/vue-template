import { describe, it, expect } from 'vitest'
import { render } from 'vitest-browser-vue'
import { createPinia } from 'pinia'
import TodoApp from '@/components/todo/TodoApp.vue'

describe('TodoApp', () => {
  it('renders the todo form', async () => {
    const screen = render(TodoApp, {
      global: { plugins: [createPinia()] },
    })
    await expect.element(screen.getByPlaceholder('What needs to be done?')).toBeVisible()
  })

  it('renders the heading', async () => {
    const screen = render(TodoApp, {
      global: { plugins: [createPinia()] },
    })
    await expect.element(screen.getByRole('heading', { name: 'My Todos' })).toBeVisible()
  })

  it('renders filter buttons', async () => {
    const screen = render(TodoApp, {
      global: { plugins: [createPinia()] },
    })
    await expect.element(screen.getByRole('button', { name: 'All' })).toBeVisible()
    await expect.element(screen.getByRole('button', { name: 'Active' })).toBeVisible()
    await expect.element(screen.getByRole('button', { name: 'Completed' })).toBeVisible()
  })

  it('shows empty state message', async () => {
    const screen = render(TodoApp, {
      global: { plugins: [createPinia()] },
    })
    await expect.element(screen.getByText('No todos match the current filter.')).toBeVisible()
  })
})
