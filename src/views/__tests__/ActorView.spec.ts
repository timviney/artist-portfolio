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
    expect(wrapper.find('.actor-hero img').attributes('src')).toBe(
      '/images/uploads/maxpavlovsky-actor-hero.jpg',
    )
    expect(wrapper.find('.actor-hero__caption').text()).toBe('Stage & screen')
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
      'https://www.youtube-nocookie.com/embed/K8fzMtCdVQE',
    )
    expect(videos[0].find('.actor-video__title').exists()).toBe(false)
    expect(videos[0].find('.actor-video__description').exists()).toBe(false)
  })

  it('renders gallery grid titles below each image', async () => {
    const wrapper = await mountActor()
    const items = wrapper.findAll('.gallery-grid__item')
    const firstTitle = "'Eternal Hourglass' 2022 directed by Joanna Vymeris. Photography by Jia Lang"

    expect(items[0].find('.gallery-grid__title').text()).toBe(firstTitle)
    expect(items[items.length - 1].find('.gallery-grid__title').text()).toBe(
      "'Dreamland' at The Corbett Theatre. Photography by Lidia Crisafulli",
    )
    expect(items[0].find('img').attributes('alt')).toBe(firstTitle)
  })

  it('renders photographer-credit links inside gallery titles and keeps alt plain', async () => {
    mockedGallery.mockReturnValue([
      {
        slug: 'credited',
        image: '/images/uploads/hamlet-laertes.jpg',
        title: "Photo by [Ana Silva](https://example.com)",
        dateAdded: '2026-05-01T09:00:00Z',
      },
    ] as ActorGalleryImage[])

    const wrapper = await mountActor()
    const anchor = wrapper.find('.gallery-grid__title a')

    expect(anchor.attributes('href')).toBe('https://example.com')
    expect(anchor.attributes('rel')).toBe('noopener noreferrer')
    expect(anchor.text()).toBe('Ana Silva')
    expect(wrapper.find('.gallery-grid__item img').attributes('alt')).toBe('Photo by Ana Silva')
  })

  it('renders all seeded headshots as swiper slides', async () => {
    const wrapper = await mountActor()

    expect(wrapper.findAll('.headshot-slide')).toHaveLength(useHeadshots().length)
    expect(wrapper.find('.headshot-slide img').attributes('src')).toBe(
      '/images/uploads/maxpavlovsky-headshot-1b.jpg',
    )
  })

  it('hides navigation arrows when there is only one headshot', async () => {
    mockedHeadshots.mockReturnValue([
      { slug: 'only', image: '/images/uploads/portrait.svg', alt: 'Only headshot', dateAdded: '2026-05-01T09:00:00Z' },
    ])

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
      "'Eternal Hourglass' 2022 directed by Joanna Vymeris. Photography by Jia Lang",
    )
  })

  it('does not render lightbox triggers for entries without an image', async () => {
    mockedGallery.mockReturnValue([
      { slug: 'with', image: '/images/a.svg', title: 'With image', dateAdded: '2026-05-01T09:00:00Z' },
      { slug: 'without', image: undefined, title: 'Without image', dateAdded: '2026-04-01T09:00:00Z' },
    ])

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
    mockedPage.mockReturnValue({
      actorHeading: 'Actor',
      heroCaption: 'Stage & screen',
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
