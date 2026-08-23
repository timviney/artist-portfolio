import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useSiteSettings } from '@/composables/content'
import type { SiteSettings } from '@/composables/content/types'

import SiteFooter from '../SiteFooter.vue'

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

beforeEach(() => {
  mockedSettings.mockReturnValue(fixture())
})

describe('SiteFooter', () => {
  it('renders the configured social links as labelled icons', () => {
    const wrapper = mount(SiteFooter)
    const links = wrapper.findAll('.site-footer__social a')

    expect(links.map((link) => link.attributes('aria-label'))).toEqual(['Instagram'])
    expect(links[0].attributes('href')).toBe('https://www.instagram.com/testartist/')
    for (const link of links) {
      expect(link.find('svg').exists()).toBe(true)
    }
  })

  it('renders no social links when none are configured', () => {
    mockedSettings.mockReturnValue(fixture({ socialLinks: [] }))
    const wrapper = mount(SiteFooter)
    expect(wrapper.findAll('.site-footer__social')).toHaveLength(0)
  })

  it('renders the copyright line with the artist name and current year', () => {
    const wrapper = mount(SiteFooter)
    expect(wrapper.find('.site-footer__copyright').text()).toBe(
      `© ${new Date().getFullYear()} Test Artist`,
    )
  })
})
