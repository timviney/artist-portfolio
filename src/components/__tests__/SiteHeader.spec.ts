import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import { useSiteSettings } from '@/composables/content'
import type { SiteSettings } from '@/composables/content/types'
import { routes } from '@/router'

import SiteHeader from '../SiteHeader.vue'

vi.mock('@/composables/content', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/composables/content')>()
  return {
    ...actual,
    useSiteSettings: vi.fn(actual.useSiteSettings),
  }
})

const mockedSettings = vi.mocked(useSiteSettings)

function fixture(overrides: Partial<SiteSettings> = {}): SiteSettings {
  return {
    name: 'Test Artist',
    tagline: 'A tagline',
    socialLinks: [{ label: 'Instagram', url: 'https://www.instagram.com/testartist/' }],
    cv: undefined,
    ...overrides,
  }
}

async function mountHeader(initialPath = '/') {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(initialPath)
  await router.isReady()
  const wrapper = mount(SiteHeader, { global: { plugins: [router] } })
  return { wrapper, router }
}

beforeEach(() => {
  mockedSettings.mockReturnValue(fixture())
})

describe('SiteHeader', () => {
  it('renders the artist name from site settings', async () => {
    const { wrapper } = await mountHeader()
    expect(wrapper.find('.site-header__name').text()).toBe('Test Artist')
  })

  it('renders only the three nav links', async () => {
    const { wrapper } = await mountHeader()
    const links = wrapper.findAll('.site-nav__link')
    expect(links.map((link) => link.text())).toEqual(['Home', 'About Me', 'Contact'])
    expect(links.map((link) => link.attributes('href'))).toEqual(['/', '/about', '/contact'])
    expect(wrapper.text()).not.toContain('Actor')
    expect(wrapper.text()).not.toContain('Musician')
  })

  it('renders an icon link for each configured social profile', async () => {
    mockedSettings.mockReturnValue(
      fixture({
        socialLinks: [
          { label: 'Instagram', url: 'https://www.instagram.com/testartist/' },
          { label: 'YouTube', url: 'https://www.youtube.com/@testartist' },
        ],
      }),
    )
    const { wrapper } = await mountHeader()
    const socials = wrapper.findAll('.site-nav__social')

    expect(socials.map((social) => social.attributes('aria-label'))).toEqual([
      'Instagram',
      'YouTube',
    ])
    expect(socials.map((social) => social.attributes('href'))).toEqual([
      'https://www.instagram.com/testartist/',
      'https://www.youtube.com/@testartist',
    ])
    for (const social of socials) {
      expect(social.attributes('target')).toBe('_blank')
      expect(social.attributes('rel')).toContain('noopener')
      expect(social.find('svg').exists()).toBe(true)
    }
  })

  it('keeps the social icons inside the nav so they appear in the mobile modal', async () => {
    const { wrapper } = await mountHeader()

    const nav = wrapper.find('.site-nav')
    const socials = nav.find('.site-nav__socials')
    expect(socials.exists()).toBe(true)
    expect(nav.findAll('.site-nav__social')).toHaveLength(1)

    await wrapper.find('.site-header__toggle').trigger('click')
    expect(wrapper.find('.site-nav--open .site-nav__socials').exists()).toBe(true)
  })

  it('hides the CV download button when no CV is set in settings', async () => {
    const { wrapper } = await mountHeader()

    expect(wrapper.find('.site-header__cv').exists()).toBe(false)
  })

  it('renders the configured CV as a download button inside the nav', async () => {
    mockedSettings.mockReturnValue(fixture({ cv: '/images/uploads/test-cv.pdf' }))
    const { wrapper } = await mountHeader()
    const cv = wrapper.find('.site-header__cv')

    expect(cv.exists()).toBe(true)
    expect(cv.attributes('href')).toBe('/images/uploads/test-cv.pdf')
    expect(cv.attributes('download')).toBeDefined()
    expect(cv.text()).toContain('Download CV')

    const actions = wrapper.find('.site-nav .site-nav__actions')
    expect(actions.exists()).toBe(true)
    expect(actions.find('.site-header__cv').exists()).toBe(true)
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
