export type FontPairingPreset = 'classic' | 'modern' | 'editorial' | 'playful'

export interface SocialLink {
  label: string
  url: string
}

export interface ThemePalette {
  primary: string
  accent: string
  background: string
  text: string
}

export interface ThemeConfig {
  palette: ThemePalette
  fontPairing: FontPairingPreset
}

export interface SiteSettings {
  name: string
  tagline: string
  socialLinks: SocialLink[]
}

export interface HomePageContent {
  heading: string
  intro: string
  featuredArtworkSlug?: string
  heroImage?: string
}

export interface AboutPageContent {
  portraitImage?: string
  bioParagraphs: string[]
  statement?: string
}

export interface ContactPageContent {
  email: string
  note?: string
}

export interface Artwork {
  slug: string
  title: string
  image?: string
  videoUrl?: string
  medium?: string
  dimensions?: string
  year?: number
  categories: string[]
  description?: string
  order: number
}
