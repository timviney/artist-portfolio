import { describe, expect, it } from 'vitest'

import { THEME_PRESETS } from '@/composables/theme/presets'

import {
  DEFAULT_ABOUT_PAGE,
  DEFAULT_ACTOR_PAGE,
  DEFAULT_CONTACT_PAGE,
  DEFAULT_HOME_PAGE,
  DEFAULT_MUSICIAN_PAGE,
  DEFAULT_SITE_SETTINGS,
} from '../defaults'
import {
  normalizeAboutPage,
  normalizeActorGalleryImage,
  normalizeActorPage,
  normalizeContactPage,
  normalizeHeadshot,
  normalizeHomePage,
  normalizeMusicianGalleryImage,
  normalizeMusicianPage,
  normalizeSettings,
  normalizeThemeSelection,
  normalizeVideoEntry,
} from '../normalize'
import {
  useAboutPage,
  useActorGallery,
  useActorPage,
  useActorVideos,
  useContactPage,
  useHeadshots,
  useHighlights,
  useHomePage,
  useMusicianGallery,
  useMusicianPage,
  useProjects,
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

describe('normalizeThemeSelection', () => {
  it('falls back to an empty selection when the file is missing or empty', () => {
    expect(normalizeThemeSelection(undefined)).toEqual({})
    expect(normalizeThemeSelection({})).toEqual({})
  })

  it('keeps only the preset field, trimmed', () => {
    const selection = normalizeThemeSelection({ preset: ' Chocolate Truffle ', palette: '#fff' })
    expect(selection).toEqual({ preset: 'Chocolate Truffle' })
  })

  it('coerces a non-string preset to no selection', () => {
    expect(normalizeThemeSelection({ preset: 42 })).toEqual({})
  })
})

describe('normalizeHomePage', () => {
  it('falls back to defaults when the file is missing or empty', () => {
    expect(normalizeHomePage(undefined)).toEqual(DEFAULT_HOME_PAGE)
    expect(normalizeHomePage({})).toEqual(DEFAULT_HOME_PAGE)
  })

  it('keeps provided headshot paths', () => {
    const home = normalizeHomePage({
      actorHeadshot: ' /images/actor.jpg ',
      musicianHeadshot: '/images/musician.jpg',
    })
    expect(home.actorHeadshot).toBe('/images/actor.jpg')
    expect(home.musicianHeadshot).toBe('/images/musician.jpg')
  })
})

describe('normalizeActorPage', () => {
  it('falls back to hardcoded headings when fields are missing', () => {
    expect(normalizeActorPage(undefined)).toEqual(DEFAULT_ACTOR_PAGE)
    expect(DEFAULT_ACTOR_PAGE.actorHeading).toBe('Actor')
    expect(DEFAULT_ACTOR_PAGE.galleryHeading).toBe('Gallery')
  })

  it('lets the artist override section headings', () => {
    const actor = normalizeActorPage({ actorHeading: ' On Stage ', heroImage: '/hero.jpg' })
    expect(actor.actorHeading).toBe('On Stage')
    expect(actor.heroImage).toBe('/hero.jpg')
    expect(actor.galleryHeading).toBe('Gallery')
  })
})

describe('normalizeMusicianPage', () => {
  it('falls back to hardcoded headings and empty intro', () => {
    expect(normalizeMusicianPage(undefined)).toEqual(DEFAULT_MUSICIAN_PAGE)
    expect(DEFAULT_MUSICIAN_PAGE.projectsHeading).toBe('Original Projects')
  })

  it('keeps a provided intro and heading overrides', () => {
    const musician = normalizeMusicianPage({ intro: ' Hello world. ', awardsHeading: 'Prizes' })
    expect(musician.intro).toBe('Hello world.')
    expect(musician.awardsHeading).toBe('Prizes')
    expect(musician.highlightsHeading).toBe('Highlights')
  })

  it('keeps the awards text and trims both picture slots independently', () => {
    const musician = normalizeMusicianPage({
      awardsText: ' Prizes below. ',
      awardsFirstImage: ' /first.jpg ',
      awardsSecondImage: '   ',
    })
    expect(musician.awardsText).toBe('Prizes below.')
    expect(musician.awardsFirstImage).toBe('/first.jpg')
    expect(musician.awardsSecondImage).toBeUndefined()

    const empty = normalizeMusicianPage(undefined)
    expect(empty.awardsText).toBeUndefined()
    expect(empty.awardsFirstImage).toBeUndefined()
    expect(empty.awardsSecondImage).toBeUndefined()
  })
})

describe('entry normalizers', () => {
  it('video entries derive their title from the slug and allow a missing url', () => {
    const video = normalizeVideoEntry(undefined, 'drama-reel')
    expect(video.title).toBe('Drama Reel')
    expect(video.videoUrl).toBeUndefined()
    expect(video.dateAdded).toBeUndefined()

    const full = normalizeVideoEntry(
      {
      title: ' Reel ',
      videoUrl: ' https://youtu.be/x ',
      description: ' Clips ',
      dateAdded: ' 2026-02-01T10:00:00Z ',
    },
      'reel',
    )
    expect(full.title).toBe('Reel')
    expect(full.videoUrl).toBe('https://youtu.be/x')
    expect(full.description).toBe('Clips')
  })

  it('headshot entries keep optional image and alt text', () => {
    const headshot = normalizeHeadshot(undefined, 'main')
    expect(headshot.image).toBeUndefined()
    expect(headshot.alt).toBeUndefined()

    const full = normalizeHeadshot(
      { image: ' /a.jpg ', alt: ' Max smiling ', dateAdded: ' 2026-03-01T08:00:00Z ' },
      'main',
    )
    expect(full.image).toBe('/a.jpg')
    expect(full.alt).toBe('Max smiling')
    expect(full.dateAdded).toBe('2026-03-01T08:00:00Z')
  })

  it('actor gallery images fall back to a slug-derived title', () => {
    expect(normalizeActorGalleryImage({}, 'on-stage')?.title).toBe('On Stage')
    expect(normalizeActorGalleryImage({ title: 'Still' }, 'on-stage')?.title).toBe('Still')
  })

  it('musician gallery images keep an optional description', () => {
    const image = normalizeMusicianGalleryImage(undefined, 'studio')
    expect(image.image).toBeUndefined()
    expect(image.description).toBeUndefined()

    const full = normalizeMusicianGalleryImage(
      { image: ' /p.jpg ', description: ' Studio ' },
      'studio',
    )
    expect(full.image).toBe('/p.jpg')
    expect(full.description).toBe('Studio')
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
})

describe('normalizeContactPage', () => {
  it('falls back to defaults when the file is missing', () => {
    expect(normalizeContactPage(undefined)).toEqual(DEFAULT_CONTACT_PAGE)
  })

  it('trims the email, keeps an optional phone and note', () => {
    const contact = normalizeContactPage({
      email: ' hi@example.com ',
      phone: ' +44 7700 900123 ',
      note: 'Replies within two days.',
    })
    expect(contact.email).toBe('hi@example.com')
    expect(contact.phone).toBe('+44 7700 900123')
    expect(contact.note).toBe('Replies within two days.')

    expect(normalizeContactPage({}).phone).toBeUndefined()
  })

  it('coerces a non-string email to the empty default', () => {
    expect(normalizeContactPage({ email: 42 }).email).toBe('')
  })
})

describe('seeded content loaders', () => {
  it('loads the seeded site settings', () => {
    const settings = useSiteSettings()
    expect(settings.name).toBe('Max Rivera')
    expect(settings.tagline).toContain('Actor')
    expect(settings.socialLinks.length).toBeGreaterThan(0)
  })

  it('loads the seeded theme selection as a known preset', () => {
    const selection = useTheme()
    expect(Object.keys(selection)).toEqual(['preset'])
    const preset = selection.preset ?? ''
    expect(THEME_PRESETS[preset.trim().toLowerCase()]).toBeDefined()
  })

  it('loads the seeded home page with both headshot slots filled', () => {
    const home = useHomePage()
    expect(home.actorHeadshot).toBeDefined()
    expect(home.musicianHeadshot).toBeDefined()
  })

  it('loads the seeded actor page with hero and headings', () => {
    const actor = useActorPage()
    expect(actor.heroImage).toBe('/images/uploads/hero.svg')
    expect(actor.actorHeading).toBe('Actor')
    expect(actor.galleryHeading).toBe('Gallery')
  })

  it('loads seeded actor videos sorted by order, all with urls', () => {
    const videos = useActorVideos()
    expect(videos.map((v) => v.slug)).toEqual(['reel-drama', 'reel-comedy'])
    expect(videos.every((v) => v.videoUrl?.startsWith('https://www.youtube.com/'))).toBe(true)
  })

  it('loads the seeded headshots carousel entry', () => {
    const headshots = useHeadshots()
    expect(headshots.length).toBeGreaterThan(0)
    expect(headshots[0].slug).toBe('main-headshot')
    expect(headshots[0].image).toBe('/images/uploads/portrait.svg')
    expect(headshots[0].alt).toContain('headshot')
  })

  it('loads the seeded actor gallery sorted by explicit order', () => {
    const gallery = useActorGallery()
    expect(gallery.map((g) => g.slug)).toEqual([
      'tempest-prospero',
      'tempest-rehearsal',
      'backstage-harbour',
    ])
    expect(gallery.every((g) => g.title.length > 0 && g.image !== undefined)).toBe(true)
  })

  it('loads the seeded musician page with intro and hero', () => {
    const musician = useMusicianPage()
    expect(musician.heroImage).toBe('/images/uploads/artwork-harbour-late-summer.svg')
    expect(musician.intro).toContain('cellist')
    expect(musician.projectsHeading).toBe('Original Projects')
  })

  it('loads the seeded musician awards text with both picture slots filled', () => {
    const musician = useMusicianPage()
    expect(musician.awardsHeading).toBe('Awards')
    expect(musician.awardsText).toContain('OffCommendation')
    expect(musician.awardsFirstImage).toBe('/images/uploads/artwork-tide-lines-i.svg')
    expect(musician.awardsSecondImage).toBe('/images/uploads/artwork-tide-lines-ii.svg')
  })

  it('loads seeded highlights and projects as ordered video lists', () => {
    const highlights = useHighlights()
    const projects = useProjects()
    expect(highlights.map((v) => v.slug)).toEqual(['harbour-sessions-live', 'score-excerpt'])
    expect(projects.map((v) => v.slug)).toEqual(['field-notes-album', 'the-long-shore'])
    expect([...highlights, ...projects].every((v) => v.description !== undefined)).toBe(true)
  })

  it('loads the seeded about page with bio paragraphs and a statement', () => {
    const about = useAboutPage()
    expect(about.bioParagraphs.length).toBeGreaterThan(1)
    expect(typeof about.statement).toBe('string')
  })

  it('loads the seeded contact page email', () => {
    const contact = useContactPage()
    expect(contact.email).toMatch(/@/)
    expect(contact.phone).toBeDefined()
  })

  it('loads the seeded musician gallery with descriptions, newest first', () => {
    const gallery = useMusicianGallery()
    expect(gallery).toHaveLength(2)
    expect(gallery[0].slug).toBe('field-notes-artwork')
    expect(gallery[0].image).toBe('/images/uploads/artwork-sea-glass-notes.svg')
    expect(gallery[0].description).toContain('Field Notes')
    expect(gallery[1].slug).toBe('making-sounds')
    expect(new Date(gallery[0].dateAdded ?? '').getTime()).toBeGreaterThan(
      new Date(gallery[1].dateAdded ?? '').getTime(),
    )
  })
})
