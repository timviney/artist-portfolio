import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import {
  useHighlights,
  useMusicianGallery,
  useMusicianPage,
  useProjects,
} from '@/composables/content'
import type {
  MusicianGalleryImage,
  MusicianPageContent,
  VideoEntry,
} from '@/composables/content/types'
import { routes } from '@/router'

import MusicianView from '../MusicianView.vue'

enableAutoUnmount(afterEach)

vi.mock('@/composables/content', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/composables/content')>()
  return {
    ...actual,
    useMusicianPage: vi.fn(actual.useMusicianPage),
    useHighlights: vi.fn(actual.useHighlights),
    useProjects: vi.fn(actual.useProjects),
    useMusicianGallery: vi.fn(actual.useMusicianGallery),
  }
})

const mockedPage = vi.mocked(useMusicianPage)
const mockedHighlights = vi.mocked(useHighlights)
const mockedProjects = vi.mocked(useProjects)
const mockedGallery = vi.mocked(useMusicianGallery)

async function mountMusician() {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push('/musician')
  await router.isReady()
  return mount(MusicianView, { global: { plugins: [router] } })
}

beforeEach(() => {
  mockedPage.mockReset()
  mockedHighlights.mockReset()
  mockedProjects.mockReset()
  mockedGallery.mockReset()
})

describe('MusicianView', () => {
  it('renders the fullscreen hero image from the CMS', async () => {
    const wrapper = await mountMusician()
    expect(wrapper.find('.musician-hero img').attributes('src')).toBe(
      '/images/uploads/artwork-harbour-late-summer.svg',
    )
  })

  it('renders the intro text below the Musician hero title from the CMS', async () => {
    const wrapper = await mountMusician()

    expect(wrapper.find('.musician-hero__title').text()).toBe('Musician')
    expect(wrapper.find('.musician-intro__text').text()).toContain('cellist, guitarist and composer')
  })

  it('renders all section titles from the CMS headings', async () => {
    const wrapper = await mountMusician()
    const titles = wrapper.findAll('.musician-section-title').map((title) => title.text())

    expect(titles).toEqual(['Musician', 'Awards', 'Highlights', 'Original Projects', 'Gallery'])
  })

  it('renders the awards text and both pictures from the CMS', async () => {
    const wrapper = await mountMusician()
    const awards = wrapper.find('.musician-awards')

    expect(awards.find('.musician-section-title').text()).toBe('Awards')
    expect(awards.find('.musician-awards__text').text()).toContain('OffCommendation')
    const pictures = awards.findAll('.musician-awards__picture')
    expect(pictures).toHaveLength(2)
    expect(pictures[0].attributes('src')).toBe('/images/uploads/artwork-tide-lines-i.svg')
    expect(pictures[1].attributes('src')).toBe('/images/uploads/artwork-tide-lines-ii.svg')
  })

  it('renders a fallback block when only one award picture slot is filled', async () => {
    mockedPage.mockReturnValue({
      intro: '',
      musicianHeading: 'Musician',
      awardsHeading: 'Awards',
      awardsText: 'One photo only.',
      awardsFirstImage: '/images/uploads/first.jpg',
      highlightsHeading: 'Highlights',
      projectsHeading: 'Original Projects',
      galleryHeading: 'Gallery',
    } satisfies MusicianPageContent)

    const wrapper = await mountMusician()

    expect(wrapper.findAll('.musician-awards__picture')).toHaveLength(1)
    expect(wrapper.find('.musician-awards__fallback').exists()).toBe(true)
  })

  it('hides the awards text and pictures entirely when neither is set', async () => {
    mockedPage.mockReturnValue({
      intro: '',
      musicianHeading: 'Musician',
      awardsHeading: 'Awards',
      highlightsHeading: 'Highlights',
      projectsHeading: 'Original Projects',
      galleryHeading: 'Gallery',
    } satisfies MusicianPageContent)

    const wrapper = await mountMusician()

    expect(wrapper.find('.musician-awards .musician-section-title').text()).toBe('Awards')
    expect(wrapper.find('.musician-awards__text').exists()).toBe(false)
    expect(wrapper.find('.musician-awards__pictures').exists()).toBe(false)
  })

  it('renders highlight videos with descriptions below and no top titles', async () => {
    const wrapper = await mountMusician()
    const videos = wrapper.findAll('.musician-highlights .musician-video')

    expect(videos).toHaveLength(2)
    expect(videos[0].find('iframe').attributes('src')).toBe(
      'https://www.youtube-nocookie.com/embed/L_LUpnjgPso',
    )
    expect(videos[0].find('.musician-video__description').text()).toContain('Harbour Sessions')
  })

  it('renders original project videos with descriptions', async () => {
    const wrapper = await mountMusician()
    const videos = wrapper.findAll('.musician-projects .musician-video')

    expect(videos).toHaveLength(2)
    expect(videos[1].find('.musician-video__description').text()).toContain('second record')
  })

  it('renders gallery images with descriptions below each image', async () => {
    const wrapper = await mountMusician()
    const items = wrapper.findAll('.gallery-grid__item')

    expect(items).toHaveLength(1)
    expect(items[0].find('img').attributes('src')).toBe('/images/uploads/artwork-sea-glass-notes.svg')
    expect(items[0].find('img').attributes('alt')).toContain('Colour studies')
    expect(items[0].find('.gallery-grid__description').text()).toContain('Colour studies')
  })

  it('opens the lightbox showing the clicked gallery image', async () => {
    const wrapper = await mountMusician()

    await wrapper.findAll('.gallery-grid__trigger')[0].trigger('click')

    expect(document.body.querySelector('.image-lightbox')).not.toBeNull()
    expect(document.body.querySelector('.image-lightbox__figure img')?.getAttribute('src')).toBe(
      '/images/uploads/artwork-sea-glass-notes.svg',
    )
    expect(document.body.querySelector('.image-lightbox__caption')?.textContent).toContain(
      'Colour studies',
    )
  })

  it('closes the lightbox from its close button', async () => {
    const wrapper = await mountMusician()

    await wrapper.findAll('.gallery-grid__trigger')[0].trigger('click')
    expect(document.body.querySelector('.image-lightbox')).not.toBeNull()

    ;(document.body.querySelector('.image-lightbox__close') as HTMLElement).click()
    await wrapper.vm.$nextTick()

    expect(document.body.querySelector('.image-lightbox')).toBeNull()
  })

  it('does not render lightbox triggers for gallery entries without an image', async () => {
    mockedGallery.mockReturnValue([
      { slug: 'with', image: '/images/a.svg', description: 'With image', order: 1 },
      { slug: 'without', image: undefined, description: undefined, order: 2 },
    ] satisfies MusicianGalleryImage[])

    const wrapper = await mountMusician()
    const items = wrapper.findAll('.gallery-grid__item')

    expect(items[0].find('.gallery-grid__trigger').exists()).toBe(true)
    expect(items[1].find('.gallery-grid__trigger').exists()).toBe(false)
    expect(items[1].find('.gallery-grid__fallback').exists()).toBe(true)
    expect(items[1].find('.gallery-grid__description').exists()).toBe(false)
    expect(document.body.querySelector('.image-lightbox')).toBeNull()
  })

  it('links back to the actor page', async () => {
    const wrapper = await mountMusician()
    expect(wrapper.find('.musician-next__link').attributes('href')).toBe('/actor')
  })

  it('handles missing hero image and empty sections gracefully', async () => {
    mockedPage.mockReturnValue({
      intro: '',
      musicianHeading: 'Musician',
      awardsHeading: 'Awards',
      highlightsHeading: 'Highlights',
      projectsHeading: 'Original Projects',
      galleryHeading: 'Gallery',
    } satisfies MusicianPageContent)
    mockedHighlights.mockReturnValue([] as VideoEntry[])
    mockedProjects.mockReturnValue([] as VideoEntry[])
    mockedGallery.mockReturnValue([] as MusicianGalleryImage[])

    const wrapper = await mountMusician()

    expect(wrapper.find('.musician-hero img').exists()).toBe(false)
    expect(wrapper.findAll('.musician-section-title').map((title) => title.text())).toEqual([
      'Musician',
      'Awards',
      'Highlights',
      'Original Projects',
      'Gallery',
    ])
    expect(wrapper.find('.musician-awards__text').exists()).toBe(false)
    expect(wrapper.find('.musician-awards__pictures').exists()).toBe(false)
    expect(wrapper.findAll('.musician-video')).toHaveLength(0)
    expect(wrapper.find('.gallery-grid').exists()).toBe(false)
    expect(wrapper.find('.musician-next__link').attributes('href')).toBe('/actor')
    expect(wrapper.text()).toContain('Actor')
  })
})
