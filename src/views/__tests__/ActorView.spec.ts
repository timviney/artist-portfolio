import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import { useActorGallery, useActorPage, useActorVideos, useHeadshots } from '@/composables/content'
import type {
  ActorGalleryImage,
  ActorPageContent,
  HeadshotEntry,
  VideoEntry,
} from '@/composables/content/types'
import { routes } from '@/router'

import ActorView from '../ActorView.vue'

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal('ResizeObserver', ResizeObserverStub)

enableAutoUnmount(afterEach)

vi.mock('@/composables/content', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/composables/content')>()
  return {
    ...actual,
    useActorPage: vi.fn(),
    useActorVideos: vi.fn(),
    useHeadshots: vi.fn(),
    useActorGallery: vi.fn(),
  }
})

const mockedPage = vi.mocked(useActorPage)
const mockedVideos = vi.mocked(useActorVideos)
const mockedHeadshots = vi.mocked(useHeadshots)
const mockedGallery = vi.mocked(useActorGallery)

function pageFixture(overrides: Partial<ActorPageContent> = {}): ActorPageContent {
  return {
    heroImage: '/images/uploads/hero.jpg',
    heroFocus: undefined,
    actorHeading: 'Actor',
    heroCaption: 'Stage & screen',
    galleryHeading: 'Gallery',
    headshotCaption: 'Headshots',
    ...overrides,
  }
}

function videosFixture(entries: Partial<VideoEntry>[] = [{}]): VideoEntry[] {
  return entries.map((entry, index) => ({
    slug: `video-${index + 1}`,
    title: `Video ${index + 1}`,
    videoUrl: 'https://www.youtube.com/watch?v=abc123',
    description: undefined,
    dateAdded: `2026-05-0${index + 1}T09:00:00Z`,
    ...entry,
  }))
}

function headshotsFixture(count = 3): HeadshotEntry[] {
  return Array.from({ length: count }, (_, index) => ({
    slug: `headshot-${index + 1}`,
    image: `/images/uploads/headshot-${index + 1}.jpg`,
    alt: `Headshot ${index + 1}`,
    dateAdded: `2026-05-0${index + 1}T09:00:00Z`,
  }))
}

function galleryFixture(overrides: Partial<ActorGalleryImage>[] = [{}]): ActorGalleryImage[] {
  return overrides.map((override, index) => ({
    slug: override.slug ?? `gallery-${index + 1}`,
    image: '/images/uploads/gallery.jpg',
    title: `Production ${index + 1}`,
    dateAdded: `2026-05-0${index + 1}T09:00:00Z`,
    ...override,
  }))
}

async function mountActor() {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push('/actor')
  await router.isReady()
  return mount(ActorView, { global: { plugins: [router] } })
}

beforeEach(() => {
  mockedPage.mockReturnValue(pageFixture())
  mockedVideos.mockReturnValue(videosFixture([{}, {}]))
  mockedHeadshots.mockReturnValue(headshotsFixture())
  mockedGallery.mockReturnValue(galleryFixture([{}, {}, {}]))
})

describe('ActorView', () => {
  it('renders the fullscreen hero image and caption from the CMS', async () => {
    const wrapper = await mountActor()
    expect(wrapper.find('.actor-hero img').attributes('src')).toBe('/images/uploads/hero.jpg')
    expect(wrapper.find('.actor-hero__caption').text()).toBe('Stage & screen')
  })

  it('applies hero crop focus as object-position when set', async () => {
    mockedPage.mockReturnValue(pageFixture({ heroFocus: { x: 20, y: 80 } }))

    const wrapper = await mountActor()

    expect(wrapper.find('.actor-hero img').attributes('style')).toContain(
      'object-position: 20% 80%',
    )
  })

  it('renders central section titles from the CMS headings', async () => {
    const wrapper = await mountActor()
    const titles = wrapper.findAll('.actor-section-title').map((title) => title.text())

    expect(titles).toEqual(['Actor', 'Gallery'])
    expect(wrapper.find('.headshot-swiper').attributes('aria-label')).toBe('Headshots')
  })

  it('renders video embeds without top titles and only renders descriptions when present', async () => {
    const wrapper = await mountActor()
    const videos = wrapper.findAll('.actor-video')

    expect(videos).toHaveLength(2)
    expect(videos[0].find('iframe').attributes('src')).toBe(
      'https://www.youtube-nocookie.com/embed/abc123',
    )
    expect(videos[0].find('.actor-video__title').exists()).toBe(false)
    expect(videos[0].find('.actor-video__description').exists()).toBe(false)
  })

  it('renders video descriptions when the CMS provides them', async () => {
    mockedVideos.mockReturnValue(videosFixture([{ description: 'A credit. [Photographer](https://example.com)' }]))

    const wrapper = await mountActor()
    const description = wrapper.find('.actor-video__description')

    expect(description.text()).toContain('A credit.')
    expect(description.find('a').attributes('href')).toBe('https://example.com')
  })

  it('renders gallery grid titles below each image', async () => {
    const wrapper = await mountActor()
    const items = wrapper.findAll('.gallery-grid__item')

    expect(items[0].find('.gallery-grid__title').text()).toBe('Production 1')
    expect(items[0].find('img').attributes('alt')).toBe('Production 1')
  })

  it('renders photographer-credit links inside gallery titles and keeps alt plain', async () => {
    mockedGallery.mockReturnValue(galleryFixture([
      { slug: 'credited', image: '/images/uploads/hamlet-laertes.jpg', title: "Photo by [Ana Silva](https://example.com)" },
    ]))

    const wrapper = await mountActor()
    const anchor = wrapper.find('.gallery-grid__title a')

    expect(anchor.attributes('href')).toBe('https://example.com')
    expect(anchor.attributes('rel')).toBe('noopener noreferrer')
    expect(anchor.text()).toBe('Ana Silva')
    expect(wrapper.find('.gallery-grid__item img').attributes('alt')).toBe('Photo by Ana Silva')
  })

  it('applies entry crop focus as object-position on gallery images', async () => {
    mockedGallery.mockReturnValue(galleryFixture([
      { slug: 'focused', image: '/images/uploads/hamlet-laertes.jpg', focus: { x: 35, y: 25 }, title: 'Focused' },
      { slug: 'centred', image: '/images/uploads/hamlet-laertes.jpg', title: 'Centred' },
    ]))

    const wrapper = await mountActor()
    const images = wrapper.findAll('.gallery-grid__item img')

    expect(images[0].attributes('style')).toContain('object-position: 35% 25%')
    expect((images[1].attributes('style') ?? '')).not.toContain('object-position')
  })

  it('renders all configured headshots as swiper slides', async () => {
    const wrapper = await mountActor()

    expect(wrapper.findAll('.headshot-slide')).toHaveLength(3)
    expect(wrapper.find('.headshot-slide img').attributes('src')).toBe(
      '/images/uploads/headshot-1.jpg',
    )
  })

  it('hides navigation arrows when there is only one headshot', async () => {
    mockedHeadshots.mockReturnValue(headshotsFixture(1))

    const wrapper = await mountActor()

    expect(wrapper.findAll('.headshot-slide')).toHaveLength(1)
    expect(wrapper.find('.swiper-button-next').exists()).toBe(false)
    expect(wrapper.find('.swiper-button-prev').exists()).toBe(false)
  })

  it('enables navigation arrows when there are multiple headshots', async () => {
    mockedHeadshots.mockReturnValue([
      { slug: 'one', image: '/images/a.svg', alt: 'First', dateAdded: '2026-05-01T09:00:00Z' },
      { slug: 'two', image: '/images/b.svg', alt: 'Second', dateAdded: '2026-04-01T09:00:00Z' },
      { slug: 'three', image: undefined, alt: undefined, dateAdded: '2026-03-01T09:00:00Z' },
    ])

    const wrapper = await mountActor()

    expect(wrapper.findAll('.headshot-slide')).toHaveLength(3)
    expect(wrapper.find('.swiper-button-next').exists()).toBe(true)
    expect(wrapper.find('.swiper-button-prev').exists()).toBe(true)
    expect(wrapper.find('.headshot-slide:last-child img').exists()).toBe(false)
  })

  it('links to the musician page', async () => {
    const wrapper = await mountActor()
    expect(wrapper.find('.actor-next__link').attributes('href')).toBe('/musician')
  })

  it('opens the lightbox showing the clicked gallery image', async () => {
    const wrapper = await mountActor()
    const triggers = wrapper.findAll('.gallery-grid__trigger')
    const expectedSrc = triggers[0].find('img').attributes('src')

    await triggers[0].trigger('click')

    expect(document.body.querySelector('.image-lightbox')).not.toBeNull()
    expect(document.body.querySelector('.image-lightbox__figure img')?.getAttribute('src')).toBe(
      expectedSrc,
    )
    expect(document.body.querySelector('.image-lightbox__caption')?.textContent).toContain(
      'Production 1',
    )
  })

  it('does not render lightbox triggers for entries without an image', async () => {
    mockedGallery.mockReturnValue(galleryFixture([
      { slug: 'with', image: '/images/a.svg', title: 'With image' },
      { slug: 'without', image: undefined, title: 'Without image' },
    ]))

    const wrapper = await mountActor()
    const items = wrapper.findAll('.gallery-grid__item')

    expect(items[0].find('.gallery-grid__trigger').exists()).toBe(true)
    expect(items[1].find('.gallery-grid__trigger').exists()).toBe(false)
    expect(items[1].find('.gallery-grid__fallback').exists()).toBe(true)
    expect(document.body.querySelector('.image-lightbox')).toBeNull()
  })

  it('closes the lightbox from its close button', async () => {
    const wrapper = await mountActor()

    await wrapper.findAll('.gallery-grid__trigger')[0].trigger('click')
    expect(document.body.querySelector('.image-lightbox')).not.toBeNull()

    ;(document.body.querySelector('.image-lightbox__close') as HTMLElement).click()
    await wrapper.vm.$nextTick()

    expect(document.body.querySelector('.image-lightbox')).toBeNull()
  })

  it('handles missing hero image, videos and galleries gracefully', async () => {
    mockedPage.mockReturnValue(pageFixture({
      heroImage: undefined,
      actorHeading: 'Performing',
      galleryHeading: 'Pictures',
    }))
    mockedVideos.mockReturnValue([])
    mockedHeadshots.mockReturnValue([])
    mockedGallery.mockReturnValue([])

    const wrapper = await mountActor()
    const text = () => wrapper.text()

    expect(wrapper.find('.actor-hero img').exists()).toBe(false)
    expect(text()).toContain('Performing')
    expect(text()).toContain('Pictures')
    expect(wrapper.findAll('.actor-video')).toHaveLength(0)
    expect(wrapper.find('.headshot-swiper').exists()).toBe(false)
    expect(wrapper.find('.gallery-grid').exists()).toBe(false)
    expect(text()).toContain('Musician')
  })
})
