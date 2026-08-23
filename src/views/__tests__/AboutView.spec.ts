import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useAboutPage } from '@/composables/content'
import type { AboutPageContent } from '@/composables/content/types'

import AboutView from '../AboutView.vue'

enableAutoUnmount(afterEach)

vi.mock('@/composables/content', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/composables/content')>()
  return {
    ...actual,
    useAboutPage: vi.fn(actual.useAboutPage),
  }
})

const mockedPage = vi.mocked(useAboutPage)

beforeEach(() => {
  mockedPage.mockReset()
})

describe('AboutView', () => {
  it('renders the eyebrow, heading and portrait photo from the CMS', async () => {
    mockedPage.mockReturnValue({
      aboutEyebrow: 'Behind the curtain',
      aboutHeading: 'Who Am I?',
      portraitImage: '/images/uploads/about-portrait.jpg',
      bioParagraphs: ['First paragraph.'],
      portraitFocus: { x: 40, y: 60 },
    } satisfies AboutPageContent)

    const wrapper = mount(AboutView)

    expect(wrapper.find('.about-title').text()).toBe('Who Am I?')
    expect(wrapper.find('.eyebrow').text()).toBe('Behind the curtain')
    expect(wrapper.find('.about-portrait img').attributes('src')).toBe(
      '/images/uploads/about-portrait.jpg',
    )
    expect(wrapper.find('.about-portrait img').attributes('style')).toContain(
      'object-position: 40% 60%',
    )
  })

  it('renders every bio paragraph in order', async () => {
    mockedPage.mockReturnValue({
      aboutEyebrow: 'Eyebrow',
      aboutHeading: 'About Me',
      bioParagraphs: ['First.', 'Second.', 'Third.'],
    } satisfies AboutPageContent)

    const wrapper = mount(AboutView)
    const paragraphs = wrapper.findAll('.about-bio p')

    expect(paragraphs).toHaveLength(3)
    expect(paragraphs[0].text()).toBe('First.')
    expect(paragraphs[1].text()).toBe('Second.')
    expect(paragraphs[2].text()).toBe('Third.')
  })

  it('renders a mocked statement as a quote block when the CMS provides one', async () => {
    mockedPage.mockReturnValue({
      aboutEyebrow: 'The person behind the work',
      aboutHeading: 'About Me',
      bioParagraphs: ['One paragraph.'],
      statement: 'stories told quietly but honestly',
    } satisfies AboutPageContent)

    const wrapper = mount(AboutView)
    const statement = wrapper.find('.about-statement')

    expect(statement.exists()).toBe(true)
    expect(statement.text()).toContain('stories told quietly but honestly')
  })

  it('omits the statement block when the CMS has none', async () => {
    mockedPage.mockReturnValue({
      aboutEyebrow: 'The person behind the work',
      aboutHeading: 'About Me',
      bioParagraphs: ['One paragraph.'],
    } satisfies AboutPageContent)

    const wrapper = mount(AboutView)

    expect(wrapper.find('.about-statement').exists()).toBe(false)
  })

  it('renders a fallback block when the portrait is missing', async () => {
    mockedPage.mockReturnValue({
      aboutEyebrow: 'The person behind the work',
      aboutHeading: 'All About Me',
      bioParagraphs: ['First.', 'Second.'],
    } satisfies AboutPageContent)

    const wrapper = mount(AboutView)

    expect(wrapper.find('.about-title').text()).toBe('All About Me')
    expect(wrapper.find('.about-portrait img').exists()).toBe(false)
    expect(wrapper.find('.about-portrait__fallback').exists()).toBe(true)
    expect(wrapper.findAll('.about-bio p')).toHaveLength(2)
  })
})
