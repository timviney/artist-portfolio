import { describe, expect, it } from 'vitest'

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
  normalizeImageFocus,
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

  it('keeps an optional trimmed CV path and omits anything else', () => {
    expect(normalizeSettings({ cv: ' /images/uploads/cv.pdf ' }).cv).toBe(
      '/images/uploads/cv.pdf',
    )
    expect(normalizeSettings({}).cv).toBeUndefined()
    expect(normalizeSettings({ cv: 42 }).cv).toBeUndefined()
    expect(normalizeSettings({ cv: '   ' }).cv).toBeUndefined()
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
    expect(DEFAULT_ACTOR_PAGE.heroCaption).toBe('Stage & screen')
    expect(DEFAULT_ACTOR_PAGE.galleryHeading).toBe('Gallery')
  })

  it('lets the artist override section headings and hero caption', () => {
    const actor = normalizeActorPage({
      actorHeading: ' On Stage ',
      heroCaption: ' Theatre & film ',
      heroImage: '/hero.jpg',
    })
    expect(actor.actorHeading).toBe('On Stage')
    expect(actor.heroCaption).toBe('Theatre & film')
    expect(actor.heroImage).toBe('/hero.jpg')
    expect(actor.galleryHeading).toBe('Gallery')
  })
})

describe('normalizeMusicianPage', () => {
  it('falls back to hardcoded headings and empty intro', () => {
    expect(normalizeMusicianPage(undefined)).toEqual(DEFAULT_MUSICIAN_PAGE)
    expect(DEFAULT_MUSICIAN_PAGE.heroCaption).toBe('Cello · Guitar · Song')
    expect(DEFAULT_MUSICIAN_PAGE.projectsHeading).toBe('Original Projects')
  })

  it('keeps a provided intro, heading and hero caption overrides', () => {
    const musician = normalizeMusicianPage({
      intro: ' Hello world. ',
      awardsHeading: 'Prizes',
      heroCaption: ' Strings & songs ',
    })
    expect(musician.intro).toBe('Hello world.')
    expect(musician.awardsHeading).toBe('Prizes')
    expect(musician.heroCaption).toBe('Strings & songs')
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

describe('normalizeImageFocus', () => {
  it('returns undefined for missing, empty or non-object focus data', () => {
    expect(normalizeImageFocus(undefined)).toBeUndefined()
    expect(normalizeImageFocus({})).toBeUndefined()
    expect(normalizeImageFocus('centre')).toBeUndefined()
    expect(normalizeImageFocus({ x: 'left', y: null })).toBeUndefined()
  })

  it('keeps valid percentages, rounds fractions and clamps to 0-100', () => {
    expect(normalizeImageFocus({ x: 42, y: 7 })).toEqual({ x: 42, y: 7 })
    expect(normalizeImageFocus({ x: 33.6 })).toEqual({ x: 34 })
    expect(normalizeImageFocus({ x: 250, y: -40 })).toEqual({ x: 100, y: 0 })
    expect(normalizeImageFocus({ y: 85 })).toEqual({ y: 85 })
  })

  it('flows through page and entry image slots via the same shape', () => {
    const actor = normalizeActorPage({ heroFocus: { x: 20, y: 80 } })
    expect(actor.heroFocus).toEqual({ x: 20, y: 80 })
    expect(normalizeActorPage({}).heroFocus).toBeUndefined()

    const home = normalizeHomePage({
      actorHeadshotFocus: { x: 10 },
      musicianHeadshotFocus: 'nope',
    })
    expect(home.actorHeadshotFocus).toEqual({ x: 10 })
    expect(home.musicianHeadshotFocus).toBeUndefined()

    const headshot = normalizeHeadshot({ focus: { y: 12 } }, 'main')
    expect(headshot.focus).toEqual({ y: 12 })
  })
})

describe('entry normalizers', () => {  it('video entries derive their title from the slug and allow a missing url', () => {
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
    expect(DEFAULT_ABOUT_PAGE.aboutEyebrow).toBe('The person behind the work')
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
    expect(DEFAULT_CONTACT_PAGE.contactEyebrow).toBe('Bookings & enquiries')
    expect(DEFAULT_CONTACT_PAGE.enquiryButtonLabel).toBe('Enquire by email')
  })

  it('keeps eyebrow and button-label overrides', () => {
    const contact = normalizeContactPage({
      contactEyebrow: ' Get in touch ',
      enquiryButtonLabel: ' Email me ',
    })
    expect(contact.contactEyebrow).toBe('Get in touch')
    expect(contact.enquiryButtonLabel).toBe('Email me')
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
  it('loads every content document through the build-time glob as well-formed shapes', () => {
    const settings = useSiteSettings()
    expect(typeof settings.name).toBe('string')
    expect(Array.isArray(settings.socialLinks)).toBe(true)
    for (const link of settings.socialLinks) {
      expect(typeof link.label).toBe('string')
      expect(typeof link.url).toBe('string')
    }

    for (const page of [useHomePage(), useAboutPage(), useContactPage(), useActorPage(), useMusicianPage()]) {
      expect(page).toBeTypeOf('object')
    }
    expect(Array.isArray(useAboutPage().bioParagraphs)).toBe(true)

    for (const video of [...useActorVideos(), ...useHighlights(), ...useProjects()]) {
      expect(typeof video.slug).toBe('string')
      expect(typeof video.title).toBe('string')
    }
    for (const entry of [...useHeadshots(), ...useActorGallery(), ...useMusicianGallery()]) {
      expect(typeof entry.slug).toBe('string')
    }
  })

  it('returns every entry collection newest-first regardless of what the artist stores', () => {
    function expectNewestFirst(entries: { slug: string; dateAdded?: string }[]) {
      for (let index = 1; index < entries.length; index += 1) {
        const previous = entries[index - 1]!
        const current = entries[index]!

        if (current.dateAdded === undefined) {
          if (previous.dateAdded === undefined) {
            expect(previous.slug <= current.slug, `${previous.slug} before ${current.slug}`).toBe(true)
          }
          continue
        }

        expect(previous.dateAdded, `${current.slug} is dated but ${previous.slug} is not`).toBeDefined()
        if (previous.dateAdded === current.dateAdded) {
          expect(previous.slug <= current.slug, `tie ${previous.slug} before ${current.slug}`).toBe(true)
        } else {
          expect(previous.dateAdded! >= current.dateAdded, `${previous.slug} before ${current.slug}`).toBe(true)
        }
      }
    }

    for (const entries of [
      useActorVideos(),
      useHeadshots(),
      useActorGallery(),
      useHighlights(),
      useProjects(),
      useMusicianGallery(),
    ]) {
      expectNewestFirst(entries)
    }
  })
})
