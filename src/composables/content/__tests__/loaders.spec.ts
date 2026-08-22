import { describe, expect, it } from 'vitest'

import {
  DEFAULT_ABOUT_PAGE,
  DEFAULT_ARTWORK_ORDER,
  DEFAULT_CONTACT_PAGE,
  DEFAULT_HOME_PAGE,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_THEME,
} from '../defaults'
import {
  normalizeAboutPage,
  normalizeArtwork,
  normalizeContactPage,
  normalizeHomePage,
  normalizeSettings,
  normalizeTheme,
} from '../normalize'
import {
  useAboutPage,
  useArtwork,
  useArtworks,
  useContactPage,
  useHomePage,
  useSiteSettings,
  useTheme,
} from '../index'

describe('normalizeSettings', () => {
  it('falls back to full defaults when the file is missing or empty', () => {
    expect(normalizeSettings(undefined)).toEqual(DEFAULT_SITE_SETTINGS)
    expect(normalizeSettings({})).toEqual(DEFAULT_SITE_SETTINGS)
    expect(normalizeSettings('nope')).toEqual(DEFAULT_SITE_SETTINGS)
  })

  it('trims strings and ignores fields of the wrong type', () => {
    const settings = normalizeSettings({ name: '  Ada Lovelace  ', tagline: 42 })
    expect(settings.name).toBe('Ada Lovelace')
    expect(settings.tagline).toBe('')
    expect(settings.socialLinks).toEqual([])
  })

  it('keeps an empty tagline as an intentional value', () => {
    const settings = normalizeSettings({ name: 'Ada', tagline: '   ' })
    expect(settings.tagline).toBe('')
  })

  it('drops social links that are missing a label or url', () => {
    const settings = normalizeSettings({
      socialLinks: [
        { label: 'Instagram', url: 'https://instagram.example' },
        { label: 'No URL' },
        { url: 'https://orphan.example' },
        'not-an-object',
      ],
    })
    expect(settings.socialLinks).toEqual([{ label: 'Instagram', url: 'https://instagram.example' }])
  })
})

describe('normalizeTheme', () => {
  it('falls back to the default theme when the file is missing', () => {
    expect(normalizeTheme(undefined)).toEqual(DEFAULT_THEME)
  })

  it('merges a partial palette over the defaults', () => {
    const theme = normalizeTheme({ palette: { primary: '#123456' } })
    expect(theme.palette.primary).toBe('#123456')
    expect(theme.palette.accent).toBe(DEFAULT_THEME.palette.accent)
    expect(theme.fontPairing).toBe('classic')
  })

  it('rejects font pairings outside the preset list', () => {
    const theme = normalizeTheme({ fontPairing: 'comic-sans-everything' })
    expect(theme.fontPairing).toBe(DEFAULT_THEME.fontPairing)
  })
})

describe('normalizeHomePage', () => {
  it('falls back to defaults when the file is missing or empty', () => {
    expect(normalizeHomePage(undefined)).toEqual(DEFAULT_HOME_PAGE)
    expect(normalizeHomePage({})).toEqual(DEFAULT_HOME_PAGE)
  })

  it('keeps provided values and trims whitespace', () => {
    const home = normalizeHomePage({ heading: ' Hello ', featuredArtworkSlug: ' sea-study ' })
    expect(home.heading).toBe('Hello')
    expect(home.featuredArtworkSlug).toBe('sea-study')
    expect(home.heroImage).toBeUndefined()
  })
})

describe('normalizeAboutPage', () => {
  it('falls back to defaults when the file is missing', () => {
    expect(normalizeAboutPage(undefined)).toEqual(DEFAULT_ABOUT_PAGE)
  })

  it('keeps only non-empty string paragraphs', () => {
    const about = normalizeAboutPage({
      bioParagraphs: ['First paragraph.', '   ', 42, null],
      statement: 'My statement.',
    })
    expect(about.bioParagraphs).toEqual(['First paragraph.'])
    expect(about.statement).toBe('My statement.')
  })

  it('treats an all-invalid paragraphs array as no bio rather than crashing', () => {
    const about = normalizeAboutPage({ bioParagraphs: [1, true] })
    expect(about.bioParagraphs).toEqual([])
  })
})

describe('normalizeContactPage', () => {
  it('falls back to defaults when the file is missing', () => {
    expect(normalizeContactPage(undefined)).toEqual(DEFAULT_CONTACT_PAGE)
  })

  it('trims the email and keeps an optional note', () => {
    const contact = normalizeContactPage({
      email: ' hi@example.com ',
      note: 'Replies within two days.',
    })
    expect(contact.email).toBe('hi@example.com')
    expect(contact.note).toBe('Replies within two days.')
  })

  it('coerces a non-string email to the empty default', () => {
    expect(normalizeContactPage({ email: 42 }).email).toBe('')
  })
})

describe('normalizeArtwork', () => {
  it('derives a readable title from the slug when title is missing', () => {
    const artwork = normalizeArtwork(undefined, 'harbour-late-summer')
    expect(artwork.slug).toBe('harbour-late-summer')
    expect(artwork.title).toBe('Harbour Late Summer')
    expect(artwork.order).toBe(DEFAULT_ARTWORK_ORDER)
    expect(artwork.categories).toEqual([])
  })

  it('keeps all provided fields including the video url', () => {
    const raw = {
      title: 'Studio Process',
      videoUrl: 'https://www.youtube.com/watch?v=abc',
      year: 2026,
      categories: ['Video'],
      order: 2,
      medium: 'Video',
      dimensions: '',
      description: 'A short film.',
    }
    const artwork = normalizeArtwork(raw, 'studio-process')
    expect(artwork.videoUrl).toBe('https://www.youtube.com/watch?v=abc')
    expect(artwork.year).toBe(2026)
    expect(artwork.dimensions).toBeUndefined()
    expect(artwork.order).toBe(2)
  })

  it('ignores invalid years and sorts unknown orders last', () => {
    const artwork = normalizeArtwork({ year: -4, order: 'first', categories: [1, 'Painting'] }, 'x')
    expect(artwork.year).toBeUndefined()
    expect(artwork.order).toBe(DEFAULT_ARTWORK_ORDER)
    expect(artwork.categories).toEqual(['Painting'])
  })
})

describe('seeded content loaders', () => {
  it('loads the seeded site settings', () => {
    const settings = useSiteSettings()
    expect(settings.name).toBe('Max Rivera')
    expect(settings.tagline).toContain('Mixed-media')
    expect(settings.socialLinks.length).toBeGreaterThan(0)
  })

  it('loads the seeded theme with a known preset', () => {
    const theme = useTheme()
    expect(theme.fontPairing).toBe('classic')
    expect(theme.palette.background).toBe('#fbf9f6')
  })

  it('loads the seeded home page with a featured artwork slug', () => {
    const home = useHomePage()
    expect(home.heading).toContain('light')
    expect(home.featuredArtworkSlug).toBe('harbour-late-summer')
  })

  it('loads the seeded about page with bio paragraphs and a statement', () => {
    const about = useAboutPage()
    expect(about.bioParagraphs.length).toBeGreaterThan(1)
    expect(typeof about.statement).toBe('string')
  })

  it('loads the seeded contact page email', () => {
    expect(useContactPage().email).toMatch(/@/)
  })

  it('loads every seeded artwork sorted by its explicit order', () => {
    const artworks = useArtworks()
    expect(artworks).toHaveLength(6)
    const orders = artworks.map((a) => a.order)
    expect([...orders].sort((a, b) => a - b)).toEqual(orders)
    expect(artworks[0].slug).toBe('harbour-late-summer')
  })

  it('includes one video artwork entry with an embeddable url', () => {
    const videoArtwork = useArtworks().find((a) => a.videoUrl)
    expect(videoArtwork?.slug).toBe('studio-process')
    expect(videoArtwork?.videoUrl).toMatch(/^https:\/\/www\.youtube\.com\//)
    expect(videoArtwork?.image).toBeDefined()
  })

  it('looks up artworks by slug and returns undefined for unknown slugs', () => {
    expect(useArtwork('tide-lines-i')?.title).toBe('Tide Lines I')
    expect(useArtwork('does-not-exist')).toBeUndefined()
  })
})
