import {
  DEFAULT_ABOUT_PAGE,
  DEFAULT_ACTOR_PAGE,
  DEFAULT_CONTACT_PAGE,
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
  ImageFocus,
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

function entryDate(source: Record<string, unknown>): string | undefined {
  return asOptionalTrimmedString(source.dateAdded)
}

function clampPercent(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  return Math.min(100, Math.max(0, Math.round(value)))
}

export function normalizeImageFocus(value: unknown): ImageFocus | undefined {
  if (!isRecord(value)) return undefined
  const x = clampPercent(value.x)
  const y = clampPercent(value.y)
  if (x === undefined && y === undefined) return undefined
  return {
    ...(x !== undefined ? { x } : {}),
    ...(y !== undefined ? { y } : {}),
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
    cv: asOptionalTrimmedString(source.cv),
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
    actorHeadshotFocus: normalizeImageFocus(source.actorHeadshotFocus),
    musicianHeadshot: asOptionalTrimmedString(source.musicianHeadshot),
    musicianHeadshotFocus: normalizeImageFocus(source.musicianHeadshotFocus),
  }
}

export function normalizeAboutPage(raw: unknown): AboutPageContent {
  const source = isRecord(raw) ? raw : {}
  return {
    aboutEyebrow: asTrimmedString(source.aboutEyebrow, DEFAULT_ABOUT_PAGE.aboutEyebrow),
    aboutHeading: asTrimmedString(source.aboutHeading, DEFAULT_ABOUT_PAGE.aboutHeading),
    portraitImage: asOptionalTrimmedString(source.portraitImage),
    portraitFocus: normalizeImageFocus(source.portraitFocus),
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
    contactEyebrow: asTrimmedString(source.contactEyebrow, DEFAULT_CONTACT_PAGE.contactEyebrow),
    contactHeading: asTrimmedString(source.contactHeading, DEFAULT_CONTACT_PAGE.contactHeading),
    enquiryButtonLabel: asTrimmedString(
      source.enquiryButtonLabel,
      DEFAULT_CONTACT_PAGE.enquiryButtonLabel,
    ),
    contactImage: asOptionalTrimmedString(source.contactImage),
    contactImageFocus: normalizeImageFocus(source.contactImageFocus),
    email: typeof source.email === 'string' ? source.email.trim() : DEFAULT_CONTACT_PAGE.email,
    phone: asOptionalTrimmedString(source.phone),
    note: asOptionalTrimmedString(source.note),
  }
}

export function normalizeActorPage(raw: unknown): ActorPageContent {
  const source = isRecord(raw) ? raw : {}
  return {
    heroImage: asOptionalTrimmedString(source.heroImage),
    heroFocus: normalizeImageFocus(source.heroFocus),
    actorHeading: asTrimmedString(source.actorHeading, DEFAULT_ACTOR_PAGE.actorHeading),
    heroCaption: asTrimmedString(source.heroCaption, DEFAULT_ACTOR_PAGE.heroCaption),
    galleryHeading: asTrimmedString(source.galleryHeading, DEFAULT_ACTOR_PAGE.galleryHeading),
    headshotCaption: asTrimmedString(source.headshotCaption, DEFAULT_ACTOR_PAGE.headshotCaption),
  }
}

export function normalizeMusicianPage(raw: unknown): MusicianPageContent {
  const source = isRecord(raw) ? raw : {}
  return {
    heroImage: asOptionalTrimmedString(source.heroImage),
    heroFocus: normalizeImageFocus(source.heroFocus),
    intro: typeof source.intro === 'string' ? source.intro.trim() : DEFAULT_MUSICIAN_PAGE.intro,
    musicianHeading: asTrimmedString(source.musicianHeading, DEFAULT_MUSICIAN_PAGE.musicianHeading),
    heroCaption: asTrimmedString(source.heroCaption, DEFAULT_MUSICIAN_PAGE.heroCaption),
    awardsHeading: asTrimmedString(source.awardsHeading, DEFAULT_MUSICIAN_PAGE.awardsHeading),
    awardsText: asOptionalTrimmedString(source.awardsText),
    awardsFirstImage: asOptionalTrimmedString(source.awardsFirstImage),
    awardsFirstImageFocus: normalizeImageFocus(source.awardsFirstImageFocus),
    awardsSecondImage: asOptionalTrimmedString(source.awardsSecondImage),
    awardsSecondImageFocus: normalizeImageFocus(source.awardsSecondImageFocus),
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
    ...{ slug: slug.trim(), dateAdded: entryDate(source) },
    title: titleFrom(source, slug.trim()),
    videoUrl: asOptionalTrimmedString(source.videoUrl),
    description: asOptionalTrimmedString(source.description),
  }
}

export function normalizeHeadshot(raw: unknown, slug: string): HeadshotEntry {
  const source = isRecord(raw) ? raw : {}
  return {
    ...{ slug: slug.trim(), dateAdded: entryDate(source) },
    image: asOptionalTrimmedString(source.image),
    focus: normalizeImageFocus(source.focus),
    alt: asOptionalTrimmedString(source.alt),
  }
}

export function normalizeActorGalleryImage(raw: unknown, slug: string): ActorGalleryImage {
  const source = isRecord(raw) ? raw : {}
  return {
    ...{ slug: slug.trim(), dateAdded: entryDate(source) },
    image: asOptionalTrimmedString(source.image),
    focus: normalizeImageFocus(source.focus),
    title: titleFrom(source, slug.trim()),
  }
}

export function normalizeMusicianGalleryImage(raw: unknown, slug: string): MusicianGalleryImage {
  const source = isRecord(raw) ? raw : {}
  return {
    ...{ slug: slug.trim(), dateAdded: entryDate(source) },
    image: asOptionalTrimmedString(source.image),
    focus: normalizeImageFocus(source.focus),
    description: asOptionalTrimmedString(source.description),
  }
}
