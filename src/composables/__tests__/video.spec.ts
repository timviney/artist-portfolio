import { describe, expect, it } from 'vitest'

import { toEmbedUrl } from '../video'

describe('toEmbedUrl', () => {
  it('converts YouTube watch URLs to privacy-enhanced embed URLs', () => {
    expect(toEmbedUrl('https://www.youtube.com/watch?v=L_LUpnjgPso')).toBe(
      'https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ',
    )
    expect(toEmbedUrl('https://www.youtube.com/watch?si=x&v=dQw4w9WgXcQ')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    )
  })

  it('converts share and shorts URLs', () => {
    expect(toEmbedUrl('https://youtu.be/aqz-KE-bpKQ')).toBe(
      'https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ',
    )
    expect(toEmbedUrl('https://www.youtube.com/shorts/aqz-KE-bpKQ')).toBe(
      'https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ',
    )
  })

  it('passes through existing embed URLs unchanged in shape', () => {
    expect(toEmbedUrl('https://www.youtube.com/embed/aqz-KE-bpKQ')).toBe(
      'https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ',
    )
  })

  it('converts Vimeo URLs including player links', () => {
    expect(toEmbedUrl('https://vimeo.com/76979871')).toBe(
      'https://player.vimeo.com/video/76979871',
    )
    expect(toEmbedUrl('https://player.vimeo.com/video/76979871')).toBe(
      'https://player.vimeo.com/video/76979871',
    )
  })

  it('trims surrounding whitespace', () => {
    expect(toEmbedUrl('  https://vimeo.com/76979871  ')).toBe(
      'https://player.vimeo.com/video/76979871',
    )
  })

  it('returns undefined for empty or unrecognised URLs', () => {
    expect(toEmbedUrl(undefined)).toBeUndefined()
    expect(toEmbedUrl('')).toBeUndefined()
    expect(toEmbedUrl('   ')).toBeUndefined()
    expect(toEmbedUrl('https://example.com/video/12345')).toBeUndefined()
  })
})
