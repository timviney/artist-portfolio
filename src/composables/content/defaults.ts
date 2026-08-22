import type {
  AboutPageContent,
  ContactPageContent,
  HomePageContent,
  SiteSettings,
  ThemeConfig,
} from './types'

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  name: 'Your Name',
  tagline: '',
  socialLinks: [],
}

export const DEFAULT_THEME: ThemeConfig = {
  palette: {
    primary: '#9c6644',
    accent: '#3a5a40',
    background: '#fbf9f6',
    text: '#262220',
  },
  fontPairing: 'classic',
}

export const DEFAULT_HOME_PAGE: HomePageContent = {
  heading: '',
  intro: '',
  featuredArtworkSlug: undefined,
  heroImage: undefined,
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

export const DEFAULT_ARTWORK_ORDER = Number.MAX_SAFE_INTEGER
