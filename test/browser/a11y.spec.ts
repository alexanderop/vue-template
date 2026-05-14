import { defineComponent } from 'vue'
import { describe, it, expect } from 'vitest'
import { render } from 'vitest-browser-vue'
import axe from 'axe-core'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import BaseBadge from '@/components/BaseBadge.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import BaseCheckbox from '@/components/BaseCheckbox.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import BaseInput from '@/components/BaseInput.vue'
import TodoApp from '@/components/todo/TodoApp.vue'
import TodoFilters from '@/components/todo/TodoFilters.vue'
import TodoForm from '@/components/todo/TodoForm.vue'
import TodoItem from '@/components/todo/TodoItem.vue'
import TodoList from '@/components/todo/TodoList.vue'
import TodoPage from '@/views/TodoPage.vue'
import type { Todo } from '@/types/todo'

const SAMPLE_TODO: Todo = {
  id: '1',
  title: 'Write a11y tests',
  completed: false,
  createdAt: 0,
}

async function runAxe(container: Element): Promise<axe.AxeResults> {
  return axe.run(container, { resultTypes: ['violations'] })
}

describe('BaseBadge a11y', () => {
  it('has no accessibility violations', async () => {
    const screen = render(BaseBadge, {
      props: { variant: 'primary' },
      slots: { default: 'Badge label' },
    })
    const { violations } = await runAxe(screen.container)
    expect(violations).toEqual([])
  })
})

describe('BaseButton a11y', () => {
  it('has no accessibility violations', async () => {
    const screen = render(BaseButton, {
      slots: { default: 'Click me' },
    })
    const { violations } = await runAxe(screen.container)
    expect(violations).toEqual([])
  })
})

describe('BaseCard a11y', () => {
  it('has no accessibility violations', async () => {
    const screen = render(BaseCard, {
      slots: { default: '<p>Body content</p>' },
    })
    const { violations } = await runAxe(screen.container)
    expect(violations).toEqual([])
  })
})

describe('BaseCheckbox a11y', () => {
  it('has no accessibility violations', async () => {
    const screen = render(BaseCheckbox, {
      props: { modelValue: false, label: 'Subscribe to updates' },
    })
    const { violations } = await runAxe(screen.container)
    expect(violations).toEqual([])
  })
})

describe('BaseIcon a11y', () => {
  it('has no accessibility violations', async () => {
    const screen = render(BaseIcon, {
      props: { name: 'check' },
    })
    const { violations } = await runAxe(screen.container)
    expect(violations).toEqual([])
  })
})

describe('BaseInput a11y', () => {
  it('has no accessibility violations', async () => {
    const screen = render(BaseInput, {
      props: { modelValue: '', label: 'Your name', placeholder: 'Jane Doe' },
    })
    const { violations } = await runAxe(screen.container)
    expect(violations).toEqual([])
  })
})

describe('TodoApp a11y', () => {
  it('has no accessibility violations', async () => {
    const screen = render(TodoApp, {
      global: { plugins: [createPinia()] },
    })
    const { violations } = await runAxe(screen.container)
    expect(violations).toEqual([])
  })
})

describe('TodoFilters a11y', () => {
  it('has no accessibility violations', async () => {
    const screen = render(TodoFilters, {
      global: { plugins: [createPinia()] },
    })
    const { violations } = await runAxe(screen.container)
    expect(violations).toEqual([])
  })
})

describe('TodoForm a11y', () => {
  it('has no accessibility violations', async () => {
    const screen = render(TodoForm, {
      global: { plugins: [createPinia()] },
    })
    const { violations } = await runAxe(screen.container)
    expect(violations).toEqual([])
  })
})

describe('TodoItem a11y', () => {
  it('has no accessibility violations', async () => {
    const TodoItemWrapper = defineComponent({
      components: { TodoItem },
      props: { todo: { type: Object, required: true } },
      template: '<ul><TodoItem :todo="todo" /></ul>',
    })
    const screen = render(TodoItemWrapper, {
      props: { todo: SAMPLE_TODO },
      global: { plugins: [createPinia()] },
    })
    const { violations } = await runAxe(screen.container)
    expect(violations).toEqual([])
  })
})

describe('TodoList a11y', () => {
  it('has no accessibility violations', async () => {
    const screen = render(TodoList, {
      global: { plugins: [createPinia()] },
    })
    const { violations } = await runAxe(screen.container)
    expect(violations).toEqual([])
  })
})

describe('TodoPage a11y', () => {
  it('has no accessibility violations', async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [{ path: '/', component: TodoPage }],
    })
    await router.push('/')
    await router.isReady()

    const screen = render(TodoPage, {
      global: { plugins: [createPinia(), router] },
    })
    const { violations } = await runAxe(screen.container)
    expect(violations).toEqual([])
  })
})
