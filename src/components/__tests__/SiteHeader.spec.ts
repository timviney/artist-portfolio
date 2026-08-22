import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import { routes } from '@/router'

import SiteHeader from '../SiteHeader.vue'

async function mountHeader(initialPath = '/') {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(initialPath)
  await router.isReady()
  const wrapper = mount(SiteHeader, { global: { plugins: [router] } })
  return { wrapper, router }
}

describe('SiteHeader', () => {
  it('renders the artist name from site settings', async () => {
    const { wrapper } = await mountHeader()
    expect(wrapper.find('.site-header__name').text()).toBe('Max Rivera')
  })

  it('renders only the three nav links', async () => {
    const { wrapper } = await mountHeader()
    const links = wrapper.findAll('.site-nav__link')
    expect(links.map((link) => link.text())).toEqual(['Home', 'About Me', 'Contact'])
    expect(links.map((link) => link.attributes('href'))).toEqual(['/', '/about', '/contact'])
    expect(wrapper.text()).not.toContain('Actor')
    expect(wrapper.text()).not.toContain('Musician')
  })

  it('marks only the active route as active', async () => {
    const { wrapper } = await mountHeader('/about')
    const links = wrapper.findAll('.site-nav__link')
    expect(links[1].classes()).toContain('router-link-exact-active')
    expect(links[0].classes()).not.toContain('router-link-exact-active')
    expect(links[2].classes()).not.toContain('router-link-exact-active')
  })

  it('starts with the mobile menu collapsed and toggles it', async () => {
    const { wrapper } = await mountHeader()
    const toggle = wrapper.find('.site-header__toggle')
    const nav = wrapper.find('.site-nav')

    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(nav.classes()).not.toContain('site-nav--open')

    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(nav.classes()).toContain('site-nav--open')

    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(nav.classes()).not.toContain('site-nav--open')
  })

  it('collapses the open menu after navigating to another route', async () => {
    const { wrapper, router } = await mountHeader()
    await wrapper.find('.site-header__toggle').trigger('click')
    expect(wrapper.find('.site-nav').classes()).toContain('site-nav--open')

    await router.push('/contact')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.site-header__toggle').attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('.site-nav').classes()).not.toContain('site-nav--open')
  })

  it('closes the menu when a nav link is clicked on the current route', async () => {
    const { wrapper } = await mountHeader()
    await wrapper.find('.site-header__toggle').trigger('click')
    expect(wrapper.find('.site-nav').classes()).toContain('site-nav--open')

    await wrapper.find('.site-nav__link').trigger('click')
    expect(wrapper.find('.site-nav').classes()).not.toContain('site-nav--open')
  })

  it('exposes dialog semantics while the fullscreen menu is open', async () => {
    const { wrapper } = await mountHeader()
    const nav = wrapper.find('.site-nav')

    expect(nav.attributes('role')).toBeUndefined()
    expect(nav.attributes('aria-modal')).toBeUndefined()

    await wrapper.find('.site-header__toggle').trigger('click')
    expect(nav.attributes('role')).toBe('dialog')
    expect(nav.attributes('aria-modal')).toBe('true')

    await wrapper.find('.site-header__toggle').trigger('click')
    expect(nav.attributes('role')).toBeUndefined()
  })

  it('locks body scroll while the menu is open and restores it on close', async () => {
    const { wrapper } = await mountHeader()

    await wrapper.find('.site-header__toggle').trigger('click')
    expect(document.body.style.overflow).toBe('hidden')

    await wrapper.find('.site-header__toggle').trigger('click')
    expect(document.body.style.overflow).toBe('')
  })

  it('closes the menu when Escape is pressed', async () => {
    const { wrapper } = await mountHeader()
    await wrapper.find('.site-header__toggle').trigger('click')
    expect(wrapper.find('.site-nav').classes()).toContain('site-nav--open')

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.site-nav').classes()).not.toContain('site-nav--open')
    expect(document.body.style.overflow).toBe('')
  })
})
