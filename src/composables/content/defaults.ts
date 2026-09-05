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
  actorHeadshotFocus: undefined,
  musicianHeadshot: undefined,
  musicianHeadshotFocus: undefined,
}

export const DEFAULT_ABOUT_PAGE: AboutPageContent = {
  aboutEyebrow: 'The person behind the work',
  aboutHeading: 'About Me',
  portraitImage: undefined,
  portraitFocus: undefined,
  bioParagraphs: [],
  statement: undefined,
}

export const DEFAULT_CONTACT_PAGE: ContactPageContent = {
  contactEyebrow: 'Bookings & enquiries',
  contactHeading: 'Contact',
  enquiryButtonLabel: 'Enquire by email',
  contactImage: undefined,
  contactImageFocus: undefined,
  email: '',
  phone: undefined,
  note: undefined,
}

export const DEFAULT_ACTOR_PAGE: ActorPageContent = {
  heroImage: undefined,
  heroFocus: undefined,
  actorHeading: 'Actor',
  heroCaption: 'Stage & screen',
  galleryHeading: 'Gallery',
  headshotCaption: 'Headshots',
}

export const DEFAULT_MUSICIAN_PAGE: MusicianPageContent = {
  heroImage: undefined,
  heroFocus: undefined,
  intro: '',
  musicianHeading: 'Musician',
  heroCaption: 'Cello · Guitar · Song',
  awardsHeading: 'Awards',
  awardsText: undefined,
  awardsFirstImage: undefined,
  awardsFirstImageFocus: undefined,
  awardsSecondImage: undefined,
  awardsSecondImageFocus: undefined,
  highlightsHeading: 'Highlights',
  projectsHeading: 'Original Projects',
  galleryHeading: 'Gallery',
}
