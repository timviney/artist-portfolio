import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useContactPage, useSiteSettings } from '@/composables/content'
import type { ContactPageContent } from '@/composables/content/types'

import ContactView from '../ContactView.vue'

enableAutoUnmount(afterEach)

vi.mock('@/composables/content', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/composables/content')>()
  return {
    ...actual,
    useContactPage: vi.fn(actual.useContactPage),
    useSiteSettings: vi.fn(actual.useSiteSettings),
  }
})

const mockedPage = vi.mocked(useContactPage)
const mockedSettings = vi.mocked(useSiteSettings)

beforeEach(() => {
  mockedPage.mockReset()
  mockedSettings.mockReset()
})

describe('ContactView', () => {
  it('renders the heading and a mailto enquiry button for the CMS email', async () => {
    const wrapper = mount(ContactView)

    expect(wrapper.find('.contact-title').text()).toBe('Contact')
    expect(wrapper.find('.contact-button').attributes('href')).toBe(
      'mailto:hello@maxrivera.example',
    )
    expect(wrapper.find('.contact-email').text()).toBe('hello@maxrivera.example')
  })

  it('renders the CMS note when present', async () => {
    const wrapper = mount(ContactView)

    expect(wrapper.find('.contact-note').text()).toContain('reply within two working days')
  })

  it('falls back to the reply copy when no note is set', async () => {
    mockedPage.mockReturnValue({
      contactHeading: 'Contact',
      email: 'me@example.com',
    } satisfies ContactPageContent)

    const wrapper = mount(ContactView)

    expect(wrapper.find('.contact-note').text()).toContain("artist's email")
  })

  it('lists social links that open in a new tab safely', async () => {
    const wrapper = mount(ContactView)
    const links = wrapper.findAll('.contact-socials a')

    expect(links.length).toBeGreaterThan(0)
    for (const link of links) {
      expect(link.attributes('target')).toBe('_blank')
      expect(link.attributes('rel')).toContain('noopener')
    }
  })

  it('renders no social list when the artist has no links', async () => {
    mockedPage.mockReturnValue({
      contactHeading: 'Say Hello',
      email: 'me@example.com',
      note: 'Note.',
    } satisfies ContactPageContent)
    mockedSettings.mockReturnValue({ name: 'Max Rivera', tagline: '', socialLinks: [] })

    const wrapper = mount(ContactView)

    expect(wrapper.find('.contact-title').text()).toBe('Say Hello')
    expect(wrapper.find('.contact-socials').exists()).toBe(false)
  })
})
