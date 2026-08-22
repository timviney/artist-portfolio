import { describe, expect, it } from 'vitest'

import { resolveSocialIconKind } from '../socialIcons'

describe('resolveSocialIconKind', () => {
  it('maps known platforms from their hostnames', () => {
    expect(resolveSocialIconKind('https://www.instagram.com/maxrivera')).toBe('instagram')
    expect(resolveSocialIconKind('https://youtube.com/@maxrivera')).toBe('youtube')
    expect(resolveSocialIconKind('https://youtu.be/L_LUpnjgPso')).toBe('youtube')
    expect(resolveSocialIconKind('https://x.com/maxrivera')).toBe('x')
    expect(resolveSocialIconKind('https://twitter.com/maxrivera')).toBe('x')
    expect(resolveSocialIconKind('https://www.facebook.com/maxrivera')).toBe('facebook')
    expect(resolveSocialIconKind('https://www.tiktok.com/@maxrivera')).toBe('tiktok')
    expect(resolveSocialIconKind('https://open.spotify.com/artist/abc')).toBe('spotify')
    expect(resolveSocialIconKind('https://www.spotlight.com/1234')).toBe('spotlight')
  })

  it('is case-insensitive and tolerates subdomains', () => {
    expect(resolveSocialIconKind('https://WWW.Instagram.COM/max')).toBe('instagram')
    expect(resolveSocialIconKind('https://open.spotify.com/artist/abc')).toBe('spotify')
  })

  it('falls back to the generic link icon for unknown or invalid urls', () => {
    expect(resolveSocialIconKind('https://vimeo.com/maxrivera')).toBe('link')
    expect(resolveSocialIconKind('not a url')).toBe('link')
  })
})
