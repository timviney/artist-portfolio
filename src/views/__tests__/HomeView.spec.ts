import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import { useHomePage } from '@/composables/content'
import { routes } from '@/router'

import HomeView from '../HomeView.vue'

vi.mock('@/composables/content', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/composables/content')>()
  return { ...actual, useHomePage: vi.fn() }
})

vi.mocked(useHomePage).mockReturnValue({})

async function mountHome() {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push('/')
  await router.isReady()
  return mount(HomeView, { global: { plugins: [router] } })
}

beforeEach(() => {
  vi.mocked(useHomePage).mockReturnValue({})
})

describe('HomeView', () => {
  it('renders the artist name and tagline from site settings', async () => {
    const wrapper = await mountHome()
    expect(wrapper.find('.home__name').text()).toBe('Max Young')
    expect(wrapper.find('.home__tagline').text()).toBe('Actor and musician.')
  })

  it('renders two headshot tiles linking to the actor and musician pages', async () => {
    const wrapper = await mountHome()
    const tiles = wrapper.findAll('.home__tile')

    expect(tiles.map((tile) => tile.attributes('href'))).toEqual(['/actor', '/musician'])
    expect(tiles.map((tile) => tile.find('.home__tile-label').text()).map((text) => text.trim().split(' ')[0])).toEqual([
      'Actor',
      'Musician',
    ])
  })

  it('renders the CMS-driven headshot images', async () => {
    vi.mocked(useHomePage).mockReturnValue({
      actorHeadshot: '/images/uploads/portrait.svg',
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
