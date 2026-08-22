import {
  DEFAULT_ABOUT_PAGE,
  DEFAULT_ACTOR_PAGE,
  DEFAULT_CONTACT_PAGE,
  DEFAULT_ENTRY_ORDER,
  DEFAULT_MUSICIAN_PAGE,
  DEFAULT_SITE_SETTINGS,
} from './defaults'
import type {
  AboutPageContent,
  ActorGalleryImage,
  ActorPageContent,
  ContactPageContent,
  HeadshotEntry,
  HomePageContent,
  MusicianGalleryImage,
  MusicianPageContent,
  SiteSettings,
  SocialLink,
  ThemeSelection,
  VideoEntry,
} from './types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asTrimmedString(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : fallback
}

function asOptionalTrimmedString(value: unknown): string | undefined {
  const trimmed = asTrimmedString(value, '')
  return trimmed.length > 0 ? trimmed : undefined
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry.trim())
}

function normalizeSocialLinks(value: unknown): SocialLink[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((entry): SocialLink[] => {
    if (!isRecord(entry)) return []
    const label = asTrimmedString(entry.label, '')
    const url = asTrimmedString(entry.url, '')
    return label.length > 0 && url.length > 0 ? [{ label, url }] : []
  })
}

export function prettifySlug(slug: string): string {
  return slug
    .split('-')
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

interface EntryBase {
  slug: string
  order: number
}

function entryBase(source: Record<string, unknown>, slug: string): EntryBase {
  const safeSlug = slug.trim()
  return {
    slug: safeSlug,
    order:
      typeof source.order === 'number' && Number.isFinite(source.order)
        ? source.order
        : DEFAULT_ENTRY_ORDER,
  }
}

function titleFrom(source: Record<string, unknown>, slug: string): string {
  return asTrimmedString(source.title, prettifySlug(slug))
}

export function normalizeSettings(raw: unknown): SiteSettings {
  const source = isRecord(raw) ? raw : {}
  return {
    name: asTrimmedString(source.name, DEFAULT_SITE_SETTINGS.name),
    tagline:
      typeof source.tagline === 'string' ? source.tagline.trim() : DEFAULT_SITE_SETTINGS.tagline,
    socialLinks: normalizeSocialLinks(source.socialLinks),
  }
}

export function normalizeThemeSelection(raw: unknown): ThemeSelection {
  const source = isRecord(raw) ? raw : {}
  return {
    preset: asOptionalTrimmedString(source.preset),
  }
}

export function normalizeHomePage(raw: unknown): HomePageContent {
  const source = isRecord(raw) ? raw : {}
  return {
    actorHeadshot: asOptionalTrimmedString(source.actorHeadshot),
    musicianHeadshot: asOptionalTrimmedString(source.musicianHeadshot),
  }
}

export function normalizeAboutPage(raw: unknown): AboutPageContent {
  const source = isRecord(raw) ? raw : {}
  return {
    aboutHeading: asTrimmedString(source.aboutHeading, DEFAULT_ABOUT_PAGE.aboutHeading),
    portraitImage: asOptionalTrimmedString(source.portraitImage),
    bioParagraphs:
      Array.isArray(source.bioParagraphs) && source.bioParagraphs.length > 0
        ? asStringArray(source.bioParagraphs).filter((paragraph) => paragraph.length > 0)
        : DEFAULT_ABOUT_PAGE.bioParagraphs,
    statement: asOptionalTrimmedString(source.statement),
  }
}

export function normalizeContactPage(raw: unknown): ContactPageContent {
  const source = isRecord(raw) ? raw : {}
  return {
    contactHeading: asTrimmedString(source.contactHeading, DEFAULT_CONTACT_PAGE.contactHeading),
    email: typeof source.email === 'string' ? source.email.trim() : DEFAULT_CONTACT_PAGE.email,
    phone: asOptionalTrimmedString(source.phone),
    note: asOptionalTrimmedString(source.note),
  }
}

export function normalizeActorPage(raw: unknown): ActorPageContent {
  const source = isRecord(raw) ? raw : {}
  return {
    heroImage: asOptionalTrimmedString(source.heroImage),
    actorHeading: asTrimmedString(source.actorHeading, DEFAULT_ACTOR_PAGE.actorHeading),
    galleryHeading: asTrimmedString(source.galleryHeading, DEFAULT_ACTOR_PAGE.galleryHeading),
  }
}

export function normalizeMusicianPage(raw: unknown): MusicianPageContent {
  const source = isRecord(raw) ? raw : {}
  return {
    heroImage: asOptionalTrimmedString(source.heroImage),
    intro: typeof source.intro === 'string' ? source.intro.trim() : DEFAULT_MUSICIAN_PAGE.intro,
    musicianHeading: asTrimmedString(source.musicianHeading, DEFAULT_MUSICIAN_PAGE.musicianHeading),
    awardsHeading: asTrimmedString(source.awardsHeading, DEFAULT_MUSICIAN_PAGE.awardsHeading),
    awardsText: asOptionalTrimmedString(source.awardsText),
    awardsFirstImage: asOptionalTrimmedString(source.awardsFirstImage),
    awardsSecondImage: asOptionalTrimmedString(source.awardsSecondImage),
    highlightsHeading: asTrimmedString(
      source.highlightsHeading,
      DEFAULT_MUSICIAN_PAGE.highlightsHeading,
    ),
    projectsHeading: asTrimmedString(source.projectsHeading, DEFAULT_MUSICIAN_PAGE.projectsHeading),
    galleryHeading: asTrimmedString(source.galleryHeading, DEFAULT_MUSICIAN_PAGE.galleryHeading),
  }
}

export function normalizeVideoEntry(raw: unknown, slug: string): VideoEntry {
  const source = isRecord(raw) ? raw : {}
  return {
    ...entryBase(source, slug),
    title: titleFrom(source, slug.trim()),
    videoUrl: asOptionalTrimmedString(source.videoUrl),
    description: asOptionalTrimmedString(source.description),
  }
}

export function normalizeHeadshot(raw: unknown, slug: string): HeadshotEntry {
  const source = isRecord(raw) ? raw : {}
  return {
    ...entryBase(source, slug),
    image: asOptionalTrimmedString(source.image),
    alt: asOptionalTrimmedString(source.alt),
  }
}

export function normalizeActorGalleryImage(raw: unknown, slug: string): ActorGalleryImage {
  const source = isRecord(raw) ? raw : {}
  return {
    ...entryBase(source, slug),
    image: asOptionalTrimmedString(source.image),
    title: titleFrom(source, slug.trim()),
  }
}

export function normalizeMusicianGalleryImage(raw: unknown, slug: string): MusicianGalleryImage {
  const source = isRecord(raw) ? raw : {}
  return {
    ...entryBase(source, slug),
    image: asOptionalTrimmedString(source.image),
    description: asOptionalTrimmedString(source.description),
  }
}
