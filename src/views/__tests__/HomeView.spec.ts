import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import { useHomePage, useSiteSettings } from '@/composables/content'
import type {
  HomePageContent,
  SiteSettings,
} from '@/composables/content/types'
import { routes } from '@/router'

import HomeView from '../HomeView.vue'

vi.mock('@/composables/content', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/composables/content')>()
  return { ...actual, useHomePage: vi.fn(), useSiteSettings: vi.fn() }
})

function homeFixture(overrides: Partial<HomePageContent> = {}): HomePageContent {
  return { ...overrides }
}

function settingsFixture(overrides: Partial<SiteSettings> = {}): SiteSettings {
  return {
    name: 'Test Artist',
    tagline: 'A tagline',
    socialLinks: [],
    cv: undefined,
    ...overrides,
  }
}

vi.mocked(useHomePage).mockReturnValue(homeFixture())
vi.mocked(useSiteSettings).mockReturnValue(settingsFixture())

async function mountHome() {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push('/')
  await router.isReady()
  return mount(HomeView, { global: { plugins: [router] } })
}

beforeEach(() => {
  vi.mocked(useHomePage).mockReturnValue(homeFixture())
  vi.mocked(useSiteSettings).mockReturnValue(settingsFixture())
})

describe('HomeView', () => {
  it('renders the tagline from site settings', async () => {
    const wrapper = await mountHome()
    expect(wrapper.find('.home__name').exists()).toBe(false)
    expect(wrapper.find('.home__tagline').text()).toBe('A tagline')
  })

  it('renders two headshot tiles linking to the actor and musician pages', async () => {
    const wrapper = await mountHome()
    const tiles = wrapper.findAll('.home__tile')

    expect(tiles.map((tile) => tile.attributes('href'))).toEqual(['/actor', '/musician'])
    expect(tiles[0].classes()).toContain('home__tile--actor')
    expect(tiles[1].classes()).toContain('home__tile--musician')
    expect(tiles.map((tile) => tile.find('.home__tile-label').text()).map((text) => text.trim().split(' ')[0])).toEqual([
      'Actor',
      'Musician',
    ])
  })

  it('renders the CMS-driven headshot images', async () => {
    vi.mocked(useHomePage).mockReturnValue({
      actorHeadshot: '/images/uploads/portrait.svg',
      actorHeadshotFocus: { x: 30, y: 20 },
      musicianHeadshot: '/images/uploads/portrait.svg',
    })

    const wrapper = await mountHome()
    const images = wrapper.findAll('.home__tile-image')

    expect(images.map((image) => image.attributes('src'))).toEqual([
      '/images/uploads/portrait.svg',
      '/images/uploads/portrait.svg',
    ])
    expect(images[0].attributes('alt')).toBe('Actor headshot')
  })

  it('applies crop focus to a tile image as object-position while others stay centred', async () => {
    vi.mocked(useHomePage).mockReturnValue({
      actorHeadshot: '/images/uploads/portrait.svg',
      actorHeadshotFocus: { x: 25, y: 15 },
      musicianHeadshot: '/images/uploads/portrait.svg',
      musicianHeadshotFocus: undefined,
    })

    const wrapper = await mountHome()
    const images = wrapper.findAll('.home__tile-image')

    expect(images[0].attributes('style')).toContain('object-position: 25% 15%')
    expect((images[1].attributes('style') ?? '')).not.toContain('object-position')
  })

  it('falls back to a placeholder tile when an image is missing', async () => {
    vi.mocked(useHomePage).mockReturnValue({
      actorHeadshot: '/images/uploads/portrait.svg',
      musicianHeadshot: undefined,
    })

    const wrapper = await mountHome()
    const tiles = wrapper.findAll('.home__tile')

    expect(tiles[0].find('.home__tile-image').exists()).toBe(true)
    expect(tiles[1].find('.home__tile-image').exists()).toBe(false)
    expect(tiles[1].find('.home__tile-fallback').exists()).toBe(true)
    expect(tiles[1].find('.home__tile-label').text()).toContain('Musician')
  })
})
