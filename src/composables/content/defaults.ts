import type {
  AboutPageContent,
  ActorPageContent,
  ContactPageContent,
  HomePageContent,
  MusicianPageContent,
  SiteSettings,
} from './types'

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  name: 'Your Name',
  tagline: '',
  socialLinks: [],
}

export const DEFAULT_HOME_PAGE: HomePageContent = {
  actorHeadshot: undefined,
  musicianHeadshot: undefined,
}

export const DEFAULT_ABOUT_PAGE: AboutPageContent = {
  portraitImage: undefined,
  bioParagraphs: [],
  statement: undefined,
}

export const DEFAULT_CONTACT_PAGE: ContactPageContent = {
  email: '',
  note: undefined,
}

export const DEFAULT_ACTOR_PAGE: ActorPageContent = {
  heroImage: undefined,
  actorHeading: 'Actor',
  galleryHeading: 'Gallery',
}

export const DEFAULT_MUSICIAN_PAGE: MusicianPageContent = {
  heroImage: undefined,
  intro: '',
  musicianHeading: 'Musician',
  awardsHeading: 'Awards',
  highlightsHeading: 'Highlights',
  projectsHeading: 'Original Projects',
  galleryHeading: 'Gallery',
}

export const DEFAULT_ENTRY_ORDER = Number.MAX_SAFE_INTEGER
