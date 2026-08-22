import {
  DEFAULT_ABOUT_PAGE,
  DEFAULT_ARTWORK_ORDER,
  DEFAULT_CONTACT_PAGE,
  DEFAULT_HOME_PAGE,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_THEME,
} from './defaults'
import type {
  AboutPageContent,
  Artwork,
  ContactPageContent,
  FontPairingPreset,
  HomePageContent,
  SiteSettings,
  SocialLink,
  ThemeConfig,
} from './types'

export const FONT_PAIRING_PRESETS = ['classic', 'modern', 'editorial', 'playful'] as const

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

function asOptionalPositiveInt(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : undefined
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

export function normalizeSettings(raw: unknown): SiteSettings {
  const source = isRecord(raw) ? raw : {}
  return {
    name: asTrimmedString(source.name, DEFAULT_SITE_SETTINGS.name),
    tagline:
      typeof source.tagline === 'string' ? source.tagline.trim() : DEFAULT_SITE_SETTINGS.tagline,
    socialLinks: normalizeSocialLinks(source.socialLinks),
  }
}

export function normalizeTheme(raw: unknown): ThemeConfig {
  const source = isRecord(raw) ? raw : {}
  const palette = isRecord(source.palette) ? source.palette : {}
  const fallbackPalette = DEFAULT_THEME.palette
  const fontPairing =
    typeof source.fontPairing === 'string' &&
    (FONT_PAIRING_PRESETS as readonly string[]).includes(source.fontPairing)
      ? (source.fontPairing as FontPairingPreset)
      : DEFAULT_THEME.fontPairing
  return {
    palette: {
      primary: asTrimmedString(palette.primary, fallbackPalette.primary),
      accent: asTrimmedString(palette.accent, fallbackPalette.accent),
      background: asTrimmedString(palette.background, fallbackPalette.background),
      text: asTrimmedString(palette.text, fallbackPalette.text),
    },
    fontPairing,
  }
}

export function normalizeHomePage(raw: unknown): HomePageContent {
  const source = isRecord(raw) ? raw : {}
  return {
    heading: asTrimmedString(source.heading, DEFAULT_HOME_PAGE.heading),
    intro: asTrimmedString(source.intro, DEFAULT_HOME_PAGE.intro),
    featuredArtworkSlug: asOptionalTrimmedString(source.featuredArtworkSlug),
    heroImage: asOptionalTrimmedString(source.heroImage),
  }
}

export function normalizeAboutPage(raw: unknown): AboutPageContent {
  const source = isRecord(raw) ? raw : {}
  return {
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
    email: typeof source.email === 'string' ? source.email.trim() : DEFAULT_CONTACT_PAGE.email,
    note: asOptionalTrimmedString(source.note),
  }
}

export function normalizeArtwork(raw: unknown, slug: string): Artwork {
  const source = isRecord(raw) ? raw : {}
  const safeSlug = slug.trim()
  const order =
    typeof source.order === 'number' && Number.isFinite(source.order)
      ? source.order
      : DEFAULT_ARTWORK_ORDER
  return {
    slug: safeSlug,
    title: asTrimmedString(source.title, prettifySlug(safeSlug)),
    image: asOptionalTrimmedString(source.image),
    videoUrl: asOptionalTrimmedString(source.videoUrl),
    medium: asOptionalTrimmedString(source.medium),
    dimensions: asOptionalTrimmedString(source.dimensions),
    year: asOptionalPositiveInt(source.year),
    categories: asStringArray(source.categories).filter((category) => category.length > 0),
    description: asOptionalTrimmedString(source.description),
    order,
  }
}
