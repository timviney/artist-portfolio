import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PrimeVue from 'primevue/config'

import { useContactPage, useSiteSettings } from '@/composables/content'
import type { ContactPageContent } from '@/composables/content/types'
import { InkAmberPreset } from '@/composables/theme/primePreset'

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

function mountContact() {
  return mount(ContactView, {
    global: {
      plugins: [[PrimeVue, { theme: { preset: InkAmberPreset }, ripple: false }]],
    },
  })
}

beforeEach(() => {
  mockedPage.mockReset()
  mockedSettings.mockReset()
})

describe('ContactView', () => {
  it('renders the heading and a mailto enquiry button for the CMS email', () => {
    const wrapper = mountContact()

    expect(wrapper.find('.eyebrow').text()).toBe('Bookings & enquiries')
    expect(wrapper.find('.contact-title').text()).toBe('Contact')
    expect(wrapper.find('.contact-button').attributes('href')).toBe(
      'mailto:agents@mntalent.co.uk',
    )
    expect(wrapper.find('.contact-button').text()).toContain('Enquire by email')
    expect(wrapper.find('.contact-email').text()).toBe('agents@mntalent.co.uk')
  })

  it('renders the contact image from the CMS', () => {
    const wrapper = mountContact()

    expect(wrapper.find('.contact-portrait img').attributes('src')).toBe(
      '/images/uploads/contact-hospital-lights.jpg',
    )
  })

  it('omits the portrait block when no contact image is set', () => {
    mockedPage.mockReturnValue({
      contactEyebrow: 'Bookings & enquiries',
      contactHeading: 'Contact',
      enquiryButtonLabel: 'Enquire by email',
      email: 'me@example.com',
    } satisfies ContactPageContent)

    const wrapper = mountContact()

    expect(wrapper.find('.contact-portrait').exists()).toBe(false)
  })

  it('renders a tel link for the CMS phone number', () => {
    const wrapper = mountContact()

    expect(wrapper.find('.contact-phone').exists()).toBe(true)
    expect(wrapper.find('.contact-phone').text()).toBe('02033940079')
    expect(wrapper.find('.contact-phone').attributes('href')).toBe('tel:02033940079')
  })

  it('omits the phone link when no number is set', () => {
    mockedPage.mockReturnValue({
      contactEyebrow: 'Bookings & enquiries',
      contactHeading: 'Contact',
      enquiryButtonLabel: 'Enquire by email',
      email: 'me@example.com',
    } satisfies ContactPageContent)

    const wrapper = mountContact()

    expect(wrapper.find('.contact-phone').exists()).toBe(false)
  })

  it('renders the CMS note when present', () => {
    const wrapper = mountContact()

    expect(wrapper.find('.contact-note').text()).toContain('Middleweek Newton Talent Management')
  })

  it('falls back to the reply copy when no note is set', () => {
    mockedPage.mockReturnValue({
      contactEyebrow: 'Bookings & enquiries',
      contactHeading: 'Contact',
      enquiryButtonLabel: 'Enquire by email',
      email: 'me@example.com',
    } satisfies ContactPageContent)

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
    mockedPage.mockReturnValue({
      contactEyebrow: 'Bookings & enquiries',
      contactHeading: 'Say Hello',
      enquiryButtonLabel: 'Enquire by email',
      email: 'me@example.com',
      note: 'Note.',
    } satisfies ContactPageContent)
    mockedSettings.mockReturnValue({ name: 'Max Pavlovsky', tagline: '', socialLinks: [] })

    const wrapper = mountContact()

    expect(wrapper.find('.contact-title').text()).toBe('Say Hello')
    expect(wrapper.find('.contact-socials').exists()).toBe(false)
  })
})
