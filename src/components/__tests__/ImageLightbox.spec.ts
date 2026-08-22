import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import ImageLightbox from '../ImageLightbox.vue'
import type { LightboxImage } from '../ImageLightbox.vue'

enableAutoUnmount(afterEach)

const images: LightboxImage[] = [
  {
    slug: 'prospero',
    image: '/images/uploads/gallery-prospero.svg',
    caption: 'As Prospero - The Tempest',
  },
  {
    slug: 'rehearsal',
    image: '/images/uploads/gallery-rehearsal.svg',
    caption: 'In Rehearsal - The Tempest',
  },
  { slug: 'backstage', image: '/images/uploads/gallery-backstage.svg' },
]

function query<T extends Element = Element>(selector: string): T | null {
  return document.body.querySelector<T>(selector)
}

function clickInOverlay(selector: string) {
  ;(query(selector) as HTMLElement | null)?.click()
}

async function mountLightbox({ items = images, initialIndex = 0 } = {}) {
  const wrapper = mount(ImageLightbox, {
    props: { images: items, initialIndex },
    attachTo: document.body,
  })
  await nextTick()
  return wrapper
}

describe('ImageLightbox', () => {
  it('renders the image, caption and counter at the initial index', async () => {
    await mountLightbox()

    expect(query('.image-lightbox__figure img')?.getAttribute('src')).toBe(
      '/images/uploads/gallery-prospero.svg',
    )
    expect(query('.image-lightbox__caption')?.textContent).toContain('As Prospero - The Tempest')
    expect(query('.image-lightbox__counter')?.textContent).toContain('1 / 3')
  })

  it('renders entries without a caption without one', async () => {
    await mountLightbox()
    clickInOverlay('.image-lightbox__nav--next')
    await nextTick()
    clickInOverlay('.image-lightbox__nav--next')
    await nextTick()

    expect(query('.image-lightbox__figure img')?.getAttribute('src')).toBe(
      '/images/uploads/gallery-backstage.svg',
    )
    expect(query('.image-lightbox__caption')?.textContent?.trim()).toBe('3 / 3')
  })

  it('navigates forwards and backwards with wrap-around via buttons', async () => {
    await mountLightbox()
    const src = () => query('.image-lightbox__figure img')?.getAttribute('src')

    clickInOverlay('.image-lightbox__nav--next')
    await nextTick()
    clickInOverlay('.image-lightbox__nav--next')
    await nextTick()
    clickInOverlay('.image-lightbox__nav--next')
    await nextTick()
    expect(src()).toBe('/images/uploads/gallery-prospero.svg')

    clickInOverlay('.image-lightbox__nav--prev')
    await nextTick()
    expect(src()).toBe('/images/uploads/gallery-backstage.svg')
  })

  it('supports arrow-key navigation', async () => {
    await mountLightbox()
    const src = () => query('.image-lightbox__figure img')?.getAttribute('src')

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    await nextTick()
    expect(src()).toBe('/images/uploads/gallery-rehearsal.svg')

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    await nextTick()
    expect(src()).toBe('/images/uploads/gallery-prospero.svg')
  })

  it('emits close on the Escape key', async () => {
    const wrapper = await mountLightbox()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('closes on backdrop clicks but not on clicks inside the viewer', async () => {
    const wrapper = await mountLightbox()

    clickInOverlay('.image-lightbox__figure img')
    await nextTick()
    expect(wrapper.emitted('close')).toBeUndefined()

    ;(query('.image-lightbox') as HTMLElement).click()
    await nextTick()
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emits close from the close button', async () => {
    const wrapper = await mountLightbox()

    clickInOverlay('.image-lightbox__close')
    await nextTick()

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('hides navigation arrows and the counter for a single image', async () => {
    await mountLightbox({
      items: [{ slug: 'only', image: '/images/uploads/only.svg', caption: 'Only image' }],
    })

    expect(query('.image-lightbox__figure img')?.getAttribute('src')).toBe(
      '/images/uploads/only.svg',
    )
    expect(query('.image-lightbox__counter')).toBeNull()
    expect(query('.image-lightbox__nav--prev')).toBeNull()
    expect(query('.image-lightbox__nav--next')).toBeNull()
  })

  it('renders a fallback block for entries without an image', async () => {
    await mountLightbox({ items: [{ slug: 'no-image', caption: 'No image' }] })

    expect(query('.image-lightbox__fallback')).not.toBeNull()
    expect(query('.image-lightbox__figure img')).toBeNull()
  })

  it('locks body scroll while open and releases it on unmount', async () => {
    const wrapper = await mountLightbox()

    expect(document.body.style.overflow).toBe('hidden')

    wrapper.unmount()
    expect(document.body.style.overflow).toBe('')
  })

  it('moves focus into the dialog on mount and restores it on unmount', async () => {
    const trigger = document.createElement('button')
    trigger.textContent = 'Open gallery'
    document.body.appendChild(trigger)
    trigger.focus()

    const wrapper = await mountLightbox()
    expect(document.activeElement).toBe(query('.image-lightbox'))

    wrapper.unmount()
    expect(document.activeElement).toBe(trigger)
  })
})
