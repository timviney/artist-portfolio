import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import {
  useActorGallery,
  useActorPage,
  useActorVideos,
  useHeadshots,
} from '@/composables/content'
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

vi.mock('@/composables/content', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/composables/content')>()
  return {
    ...actual,
    useActorPage: vi.fn(actual.useActorPage),
    useActorVideos: vi.fn(actual.useActorVideos),
    useHeadshots: vi.fn(actual.useHeadshots),
    useActorGallery: vi.fn(actual.useActorGallery),
  }
})

const mockedPage = vi.mocked(useActorPage)
const mockedVideos = vi.mocked(useActorVideos)
const mockedHeadshots = vi.mocked(useHeadshots)
const mockedGallery = vi.mocked(useActorGallery)

async function mountActor() {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push('/actor')
  await router.isReady()
  return mount(ActorView, { global: { plugins: [router] } })
}

beforeEach(() => {
  mockedPage.mockReset()
  mockedVideos.mockReset()
  mockedHeadshots.mockReset()
  mockedGallery.mockReset()
})

describe('ActorView', () => {
  it('renders the fullscreen hero image from the CMS', async () => {
    const wrapper = await mountActor()
    expect(wrapper.find('.actor-hero img').attributes('src')).toBe('/images/uploads/hero.svg')
  })

  it('renders central section titles from the CMS headings', async () => {
    const wrapper = await mountActor()
    const titles = wrapper.findAll('.actor-section-title').map((title) => title.text())

    expect(titles).toEqual(['Actor', 'Gallery'])
    expect(wrapper.find('.headshot-swiper').attributes('aria-label')).toBe('Headshots')
  })

  it('renders video embeds with descriptions below and no top titles', async () => {
    const wrapper = await mountActor()
    const videos = wrapper.findAll('.actor-video')

    expect(videos).toHaveLength(2)
    expect(videos[0].find('iframe').attributes('src')).toBe(
      'https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ',
    )
    expect(videos[0].find('.actor-video__title').exists()).toBe(false)
    expect(videos[0].find('.actor-video__description').text()).toContain('dramatic work')
  })

  it('renders gallery grid titles below each image', async () => {
    const wrapper = await mountActor()
    const items = wrapper.findAll('.gallery-grid__item')

    expect(items.map((item) => item.find('.gallery-grid__title').text())).toEqual([
      'As Prospero — The Tempest',
      'In Rehearsal — The Tempest',
      'Backstage — Harbour Sessions',
    ])
    expect(items[0].find('img').attributes('alt')).toBe('As Prospero — The Tempest')
  })

  it('renders all seeded headshots as swiper slides', async () => {
    const wrapper = await mountActor()

    expect(wrapper.findAll('.headshot-slide')).toHaveLength(useHeadshots().length)
    expect(wrapper.find('.headshot-slide img').attributes('src')).toBe(
      '/images/uploads/portrait.svg',
    )
  })

  it('hides navigation arrows when there is only one headshot', async () => {
    mockedHeadshots.mockReturnValue([
      { slug: 'only', image: '/images/uploads/portrait.svg', alt: 'Only headshot', order: 1 },
    ])

    const wrapper = await mountActor()

    expect(wrapper.findAll('.headshot-slide')).toHaveLength(1)
    expect(wrapper.find('.swiper-button-next').exists()).toBe(false)
    expect(wrapper.find('.swiper-button-prev').exists()).toBe(false)
  })

  it('enables navigation arrows when there are multiple headshots', async () => {
    mockedHeadshots.mockReturnValue([
      { slug: 'one', image: '/images/a.svg', alt: 'First', order: 1 },
      { slug: 'two', image: '/images/b.svg', alt: 'Second', order: 2 },
      { slug: 'three', image: undefined, alt: undefined, order: 3 },
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

  it('handles missing hero image, videos and galleries gracefully', async () => {
    mockedPage.mockReturnValue({
      actorHeading: 'Actor',
      galleryHeading: 'Gallery',
    } satisfies ActorPageContent)
    mockedVideos.mockReturnValue([] as VideoEntry[])
    mockedHeadshots.mockReturnValue([] as HeadshotEntry[])
    mockedGallery.mockReturnValue([] as ActorGalleryImage[])

    const wrapper = await mountActor()
    const text = () => wrapper.text()

    expect(wrapper.find('.actor-hero img').exists()).toBe(false)
    expect(text()).toContain('Actor')
    expect(text()).toContain('Gallery')
    expect(wrapper.findAll('.actor-video')).toHaveLength(0)
    expect(wrapper.find('.headshot-swiper').exists()).toBe(false)
    expect(wrapper.find('.gallery-grid').exists()).toBe(false)
    expect(text()).toContain('Musician')
  })
})
