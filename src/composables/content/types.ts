export interface SocialLink {
  label: string
  url: string
}

export interface SiteSettings {
  name: string
  tagline: string
  socialLinks: SocialLink[]
}

export interface ThemeSelection {
  preset?: string
}

export interface HomePageContent {
  actorHeadshot?: string
  musicianHeadshot?: string
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

export interface ActorPageContent {
  heroImage?: string
  actorHeading: string
  galleryHeading: string
  headshotsHeading: string
  imagesHeading: string
}

export interface MusicianPageContent {
  heroImage?: string
  intro: string
  musicianHeading: string
  awardsHeading: string
  highlightsHeading: string
  projectsHeading: string
  galleryHeading: string
}

export interface VideoEntry {
  slug: string
  title: string
  videoUrl?: string
  description?: string
  order: number
}

export interface HeadshotEntry {
  slug: string
  image?: string
  alt?: string
  order: number
}

export interface ActorGalleryImage {
  slug: string
  image?: string
  title: string
  order: number
}

export interface AwardEntry {
  slug: string
  title: string
  text: string
  image?: string
  order: number
}

export interface MusicianGalleryImage {
  slug: string
  image?: string
  description?: string
  order: number
}
