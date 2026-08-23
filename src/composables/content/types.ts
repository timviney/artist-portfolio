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
  aboutHeading: string
  portraitImage?: string
  bioParagraphs: string[]
  statement?: string
}

export interface ContactPageContent {
  contactHeading: string
  contactImage?: string
  email: string
  phone?: string
  note?: string
}

export interface ActorPageContent {
  heroImage?: string
  actorHeading: string
  galleryHeading: string
}

export interface MusicianPageContent {
  heroImage?: string
  intro: string
  musicianHeading: string
  awardsHeading: string
  awardsText?: string
  awardsFirstImage?: string
  awardsSecondImage?: string
  highlightsHeading: string
  projectsHeading: string
  galleryHeading: string
}

export interface VideoEntry {
  slug: string
  title: string
  videoUrl?: string
  description?: string
  /** ISO datetime; newer entries display first. */
  dateAdded?: string
}

export interface HeadshotEntry {
  slug: string
  image?: string
  alt?: string
  /** ISO datetime; newer entries display first. */
  dateAdded?: string
}

export interface ActorGalleryImage {
  slug: string
  image?: string
  title: string
  /** ISO datetime; newer entries display first. */
  dateAdded?: string
}

export interface MusicianGalleryImage {
  slug: string
  image?: string
  description?: string
  /** ISO datetime; newer entries display first. */
  dateAdded?: string
}
