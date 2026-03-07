import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import LandingPage from '@/views/LandingPage.vue'

describe('LandingPage', () => {
  it('renders the heading', () => {
    const wrapper = mount(LandingPage)
    expect(wrapper.text()).toContain('Start building,')
  })
})
