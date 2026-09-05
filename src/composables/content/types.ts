export interface SocialLink {
  label: string
  url: string
}

export interface SiteSettings {
  name: string
  tagline: string
  socialLinks: SocialLink[]
  cv?: string
}

export interface ThemeSelection {
  preset?: string
}

/** Which part of a photo stays visible when the site crops it (object-position). */
export interface ImageFocus {
  /** 0 = left edge, 100 = right edge; unset/50 = centred. */
  x?: number
  /** 0 = top edge, 100 = bottom edge; unset/50 = centred. */
  y?: number
}

export interface HomePageContent {
  actorHeadshot?: string
  actorHeadshotFocus?: ImageFocus
  musicianHeadshot?: string
  musicianHeadshotFocus?: ImageFocus
}

export interface AboutPageContent {
  aboutEyebrow: string
  aboutHeading: string
  portraitImage?: string
  portraitFocus?: ImageFocus
  bioParagraphs: string[]
  statement?: string
}

export interface ContactPageContent {
  contactEyebrow: string
  contactHeading: string
  enquiryButtonLabel: string
  contactImage?: string
  contactImageFocus?: ImageFocus
  email: string
  phone?: string
  note?: string
}

export interface ActorPageContent {
  heroImage?: string
  heroFocus?: ImageFocus
  actorHeading: string
  heroCaption: string
  galleryHeading: string
  headshotCaption: string
}

export interface MusicianPageContent {
  heroImage?: string
  heroFocus?: ImageFocus
  intro: string
  musicianHeading: string
  heroCaption: string
  awardsHeading: string
  awardsText?: string
  awardsFirstImage?: string
  awardsFirstImageFocus?: ImageFocus
  awardsSecondImage?: string
  awardsSecondImageFocus?: ImageFocus
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
  focus?: ImageFocus
  alt?: string
  /** ISO datetime; newer entries display first. */
  dateAdded?: string
}

export interface ActorGalleryImage {
  slug: string
  image?: string
  focus?: ImageFocus
  title: string
  /** ISO datetime; newer entries display first. */
  dateAdded?: string
}

export interface MusicianGalleryImage {
  slug: string
  image?: string
  focus?: ImageFocus
  description?: string
  /** ISO datetime; newer entries display first. */
  dateAdded?: string
}
