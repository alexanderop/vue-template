import { describe, it, expect } from 'vitest'
import { render } from 'vitest-browser-vue'
import axe from 'axe-core'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import TodoPage from '@/views/TodoPage.vue'

describe('TodoPage accessibility', () => {
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
    const results = await axe.run(screen.container)
    const violations = results.violations
    expect(violations).toEqual([])
  })
})
