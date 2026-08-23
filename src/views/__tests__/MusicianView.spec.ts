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
    useMusicianPage: vi.fn(),
    useHighlights: vi.fn(),
    useProjects: vi.fn(),
    useMusicianGallery: vi.fn(),
  }
})

const mockedPage = vi.mocked(useMusicianPage)
const mockedHighlights = vi.mocked(useHighlights)
const mockedProjects = vi.mocked(useProjects)
const mockedGallery = vi.mocked(useMusicianGallery)

function pageFixture(overrides: Partial<MusicianPageContent> = {}): MusicianPageContent {
  return {
    heroImage: '/images/uploads/hero.jpg',
    heroFocus: undefined,
    intro: 'A self-made intro paragraph.',
    musicianHeading: 'Musician',
    heroCaption: 'Cello · Guitar · Song',
    awardsHeading: 'Awards',
    awardsText: 'Won a fictional award.',
    awardsFirstImage: '/images/uploads/awards-1.jpg',
    awardsFirstImageFocus: undefined,
    awardsSecondImage: '/images/uploads/awards-2.jpg',
    awardsSecondImageFocus: undefined,
    highlightsHeading: 'Highlights',
    projectsHeading: 'Original Projects',
    galleryHeading: 'Gallery',
    ...overrides,
  }
}

function videosFixture(count: number, overrides: Partial<VideoEntry>[] = []): VideoEntry[] {
  return Array.from({ length: count }, (_, index) => ({
    slug: `video-${index + 1}`,
    title: `Video ${index + 1}`,
    videoUrl: 'https://www.youtube.com/watch?v=abc123',
    description: undefined,
    dateAdded: `2026-05-01T09:00:0${index}Z`,
    ...overrides[index],
  }))
}

function galleryFixture(
  overrides: Partial<MusicianGalleryImage>[] = [{}, {}, {}],
): MusicianGalleryImage[] {
  return overrides.map((override, index) => ({
    slug: override.slug ?? `gallery-${index + 1}`,
    image: '/images/uploads/gallery.jpg',
    description: `Description ${index + 1}`,
    dateAdded: `2026-05-0${index + 1}T09:00:00Z`,
    ...override,
  }))
}

async function mountMusician() {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push('/musician')
  await router.isReady()
  return mount(MusicianView, { global: { plugins: [router] } })
}

beforeEach(() => {
  mockedPage.mockReturnValue(pageFixture())
  mockedHighlights.mockReturnValue([])
  mockedProjects.mockReturnValue(videosFixture(2))
  mockedGallery.mockReturnValue(galleryFixture())
})

describe('MusicianView', () => {
  it('renders the fullscreen hero image and caption from the CMS', async () => {
    const wrapper = await mountMusician()

    expect(wrapper.find('.musician-hero img').attributes('src')).toBe('/images/uploads/hero.jpg')
    expect(wrapper.find('.musician-hero__title').text()).toBe('Musician')
    expect(wrapper.find('.musician-hero__caption').text()).toBe('Cello · Guitar · Song')
    expect(wrapper.find('.musician-intro__text').text()).toContain('self-made intro')
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
    expect(awards.find('.musician-awards__text').text()).toContain('fictional award')
    const pictures = awards.findAll('.musician-awards__picture')
    expect(pictures).toHaveLength(2)
    expect(pictures[0].attributes('src')).toBe('/images/uploads/awards-1.jpg')
    expect(pictures[1].attributes('src')).toBe('/images/uploads/awards-2.jpg')
  })

  it('renders a fallback block when only one award picture slot is filled', async () => {
    mockedPage.mockReturnValue(pageFixture({
      awardsText: 'One photo only.',
      awardsSecondImage: undefined,
    }))

    const wrapper = await mountMusician()

    expect(wrapper.findAll('.musician-awards__picture')).toHaveLength(1)
    expect(wrapper.find('.musician-awards__fallback').exists()).toBe(true)
  })

  it('applies crop focus to the hero and awards pictures as object-position', async () => {
    mockedPage.mockReturnValue(pageFixture({
      heroFocus: { y: 30 },
      awardsFirstImageFocus: { x: 40, y: 60 },
    }))

    const wrapper = await mountMusician()

    expect(wrapper.find('.musician-hero img').attributes('style')).toContain(
      'object-position: 50% 30%',
    )
    const pictures = wrapper.findAll('.musician-awards__picture')
    expect(pictures[0].attributes('style')).toContain('object-position: 40% 60%')
    expect((pictures[1].attributes('style') ?? '')).not.toContain('object-position')
  })

  it('hides the awards text and pictures entirely when neither is set', async () => {
    mockedPage.mockReturnValue(pageFixture({
      awardsText: undefined,
      awardsFirstImage: undefined,
      awardsSecondImage: undefined,
    }))

    const wrapper = await mountMusician()

    expect(wrapper.find('.musician-awards .musician-section-title').text()).toBe('Awards')
    expect(wrapper.find('.musician-awards__text').exists()).toBe(false)
    expect(wrapper.find('.musician-awards__pictures').exists()).toBe(false)
  })

  it('renders no highlight articles while the highlights list is empty', async () => {
    const wrapper = await mountMusician()

    expect(wrapper.find('.musician-highlights .musician-section-title').text()).toBe('Highlights')
    expect(wrapper.findAll('.musician-highlights .musician-video')).toHaveLength(0)
  })

  it('renders original project videos with descriptions only where present', async () => {
    const wrapper = await mountMusician()
    const videos = wrapper.findAll('.musician-projects .musician-video')

    expect(videos).toHaveLength(2)
    expect(videos[0].find('iframe').attributes('src')).toBe(
      'https://www.youtube-nocookie.com/embed/abc123',
    )
    expect(videos[0].find('.musician-video__description').exists()).toBe(false)
  })

  it('renders video descriptions with inline links when provided', async () => {
    mockedProjects.mockReturnValue(videosFixture(1, [
      { description: 'With [Vianne Furey](https://example.com).' },
    ]))

    const wrapper = await mountMusician()
    const description = wrapper.find('.musician-video__description')

    expect(description.text()).toContain('Vianne Furey')
    expect(description.find('a').attributes('href')).toBe('https://example.com')
  })

  it('renders gallery images with descriptions below each image', async () => {
    const wrapper = await mountMusician()
    const items = wrapper.findAll('.gallery-grid__item')

    expect(items).toHaveLength(3)
    expect(items[0].find('img').attributes('src')).toBe('/images/uploads/gallery.jpg')
    expect(items[0].find('.gallery-grid__description').text()).toBe('Description 1')
  })

  it('renders photographer-credit links inside gallery descriptions', async () => {
    mockedGallery.mockReturnValue(galleryFixture([
      { slug: 'credited', description: 'Photo by [Ana Silva](https://example.com)' },
    ]))

    const wrapper = await mountMusician()
    const anchor = wrapper.find('.gallery-grid__description a')

    expect(anchor.attributes('href')).toBe('https://example.com')
    expect(anchor.attributes('target')).toBe('_blank')
    expect(anchor.text()).toBe('Ana Silva')
  })

  it('opens the lightbox showing the clicked gallery image', async () => {
    const wrapper = await mountMusician()

    await wrapper.findAll('.gallery-grid__trigger')[0].trigger('click')

    expect(document.body.querySelector('.image-lightbox')).not.toBeNull()
    expect(document.body.querySelector('.image-lightbox__figure img')?.getAttribute('src')).toBe(
      '/images/uploads/gallery.jpg',
    )
    expect(document.body.querySelector('.image-lightbox__caption')?.textContent).toContain(
      'Description 1',
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
    mockedGallery.mockReturnValue(galleryFixture([
      { slug: 'with', image: '/images/a.svg', description: 'With image' },
      { slug: 'without', image: undefined, description: undefined },
    ]))

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
    mockedPage.mockReturnValue(pageFixture({
      heroImage: undefined,
      awardsText: undefined,
      awardsFirstImage: undefined,
      awardsSecondImage: undefined,
    }))
    mockedHighlights.mockReturnValue([])
    mockedProjects.mockReturnValue([])
    mockedGallery.mockReturnValue([])

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
