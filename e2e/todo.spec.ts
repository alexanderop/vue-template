import { test, expect } from '@playwright/test'

test.describe('Todo App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('renders the todo app', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Todo App')
    await expect(page.getByPlaceholder('What needs to be done?')).toBeVisible()
  })

  test('adds a todo', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?')
    await input.fill('Buy groceries')
    await page.getByRole('button', { name: 'Add' }).click()
    await expect(page.getByText('Buy groceries')).toBeVisible()
  })

  test('completes a todo', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?')
    await input.fill('Walk the dog')
    await page.getByRole('button', { name: 'Add' }).click()
    const row = page.getByRole('listitem').filter({ hasText: 'Walk the dog' })
    await row.getByRole('checkbox', { name: /Toggle 'Walk the dog'/ }).click()
    await expect(page.getByText('Walk the dog')).toHaveClass(/line-through/)
  })

  test('filters todos', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?')

    await input.fill('Active task')
    await page.getByRole('button', { name: 'Add' }).click()

    await input.fill('Completed task')
    await page.getByRole('button', { name: 'Add' }).click()

    const completedRow = page.getByRole('listitem').filter({ hasText: 'Completed task' })
    await completedRow.getByRole('checkbox', { name: /Toggle 'Completed task'/ }).click()

    await page.getByRole('button', { name: 'Active' }).click()
    await expect(page.getByText('Active task')).toBeVisible()
    await expect(page.getByText('Completed task')).not.toBeVisible()

    await page.getByRole('button', { name: 'Completed' }).click()
    await expect(page.getByText('Completed task')).toBeVisible()
    await expect(page.getByText('Active task')).not.toBeVisible()

    await page.getByRole('button', { name: 'All' }).click()
    await expect(page.getByText('Active task')).toBeVisible()
    await expect(page.getByText('Completed task')).toBeVisible()
  })

  test('deletes a todo', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?')
    await input.fill('Delete me')
    await page.getByRole('button', { name: 'Add' }).click()
    await expect(page.getByText('Delete me')).toBeVisible()

    // Hover to reveal delete button
    await page.getByText('Delete me').hover()
    await page.getByRole('button', { name: 'Delete todo' }).click()
    await expect(page.getByText('Delete me')).not.toBeVisible()
  })

  test('clears completed todos', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?')

    await input.fill('Keep me')
    await page.getByRole('button', { name: 'Add' }).click()

    await input.fill('Clear me')
    await page.getByRole('button', { name: 'Add' }).click()

    const clearRow = page.getByRole('listitem').filter({ hasText: 'Clear me' })
    await clearRow.getByRole('checkbox', { name: /Toggle 'Clear me'/ }).click()
    await page.getByRole('button', { name: 'Clear completed' }).click()

    await expect(page.getByText('Keep me')).toBeVisible()
    await expect(page.getByText('Clear me')).not.toBeVisible()
  })
})
