import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PrimeVue from 'primevue/config'

import { useContactPage, useSiteSettings } from '@/composables/content'
import type {
  ContactPageContent,
  ImageFocus,
  SiteSettings,
} from '@/composables/content/types'
import { InkAmberPreset } from '@/composables/theme/primePreset'

import ContactView from '../ContactView.vue'

enableAutoUnmount(afterEach)

vi.mock('@/composables/content', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/composables/content')>()
  return {
    ...actual,
    useContactPage: vi.fn(),
    useSiteSettings: vi.fn(),
  }
})

const mockedPage = vi.mocked(useContactPage)
const mockedSettings = vi.mocked(useSiteSettings)

function pageFixture(overrides: Partial<ContactPageContent> = {}): ContactPageContent {
  return {
    contactEyebrow: 'Bookings & enquiries',
    contactHeading: 'Contact',
    enquiryButtonLabel: 'Enquire by email',
    email: 'me@example.com',
    ...overrides,
  }
}

function settingsFixture(overrides: Partial<SiteSettings> = {}): SiteSettings {
  return {
    name: 'Test Artist',
    tagline: '',
    socialLinks: [{ label: 'Instagram', url: 'https://www.instagram.com/testartist/' }],
    cv: undefined,
    ...overrides,
  }
}

function mountContact() {
  return mount(ContactView, {
    global: {
      plugins: [[PrimeVue, { theme: { preset: InkAmberPreset }, ripple: false }]],
    },
  })
}

beforeEach(() => {
  mockedPage.mockReturnValue(pageFixture())
  mockedSettings.mockReturnValue(settingsFixture())
})

describe('ContactView', () => {
  it('renders the eyebrow, heading and a mailto enquiry button for the CMS email', () => {
    const wrapper = mountContact()

    expect(wrapper.find('.eyebrow').text()).toBe('Bookings & enquiries')
    expect(wrapper.find('.contact-title').text()).toBe('Contact')
    expect(wrapper.find('.contact-button').attributes('href')).toBe('mailto:me@example.com')
    expect(wrapper.find('.contact-button').text()).toContain('Enquire by email')
    expect(wrapper.find('.contact-email').text()).toBe('me@example.com')
  })

  it('renders the contact image from the CMS with its crop focus', () => {
    const focus: ImageFocus = { x: 35, y: 70 }
    mockedPage.mockReturnValue(pageFixture({
      contactImage: '/images/uploads/contact.jpg',
      contactImageFocus: focus,
    }))

    const wrapper = mountContact()

    expect(wrapper.find('.contact-portrait img').attributes('src')).toBe(
      '/images/uploads/contact.jpg',
    )
    expect(wrapper.find('.contact-portrait img').attributes('style')).toContain(
      'object-position: 35% 70%',
    )
  })

  it('omits the portrait block when no contact image is set', () => {
    const wrapper = mountContact()

    expect(wrapper.find('.contact-portrait').exists()).toBe(false)
  })

  it('renders a tel link for the CMS phone number', () => {
    mockedPage.mockReturnValue(pageFixture({ phone: '+44 7700 900123' }))
    const wrapper = mountContact()

    expect(wrapper.find('.contact-phone').exists()).toBe(true)
    expect(wrapper.find('.contact-phone').text()).toBe('+44 7700 900123')
    expect(wrapper.find('.contact-phone').attributes('href')).toBe('tel:+447700900123')
  })

  it('omits the phone link when no number is set', () => {
    const wrapper = mountContact()

    expect(wrapper.find('.contact-phone').exists()).toBe(false)
  })

  it('renders the CMS note when present', () => {
    mockedPage.mockReturnValue(pageFixture({ note: 'Enquiries go to the agency.' }))
    const wrapper = mountContact()

    expect(wrapper.find('.contact-note').text()).toContain('Enquiries go to the agency.')
  })

  it('falls back to the reply copy when no note is set', () => {
    const wrapper = mountContact()

    expect(wrapper.find('.contact-note').text()).toContain("artist's email")
  })

  it('lists social links that open in a new tab safely', () => {
    const wrapper = mountContact()
    const links = wrapper.findAll('.contact-socials a')

    expect(links.length).toBeGreaterThan(0)
    for (const link of links) {
      expect(link.attributes('target')).toBe('_blank')
      expect(link.attributes('rel')).toContain('noopener')
      expect(link.find('svg').exists()).toBe(true)
    }
  })

  it('renders no social list when the artist has no links', () => {
    mockedSettings.mockReturnValue(settingsFixture({ socialLinks: [] }))
    mockedPage.mockReturnValue(pageFixture({ contactHeading: 'Say Hello', note: 'Note.' }))

    const wrapper = mountContact()

    expect(wrapper.find('.contact-title').text()).toBe('Say Hello')
    expect(wrapper.find('.contact-socials').exists()).toBe(false)
  })
})
