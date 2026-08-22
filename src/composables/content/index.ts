import type {
  AboutPageContent,
  Artwork,
  ContactPageContent,
  HomePageContent,
  SiteSettings,
  ThemeConfig,
} from './types'
import {
  normalizeAboutPage,
  normalizeArtwork,
  normalizeContactPage,
  normalizeHomePage,
  normalizeSettings,
  normalizeTheme,
} from './normalize'

const SETTINGS_PATH = '/content/settings/site.json'
const THEME_PATH = '/content/settings/theme.json'
const HOME_PATH = '/content/pages/home.json'
const ABOUT_PATH = '/content/pages/about.json'
const CONTACT_PATH = '/content/pages/contact.json'
const ARTWORKS_DIR = '/content/artworks/'

const contentModules = import.meta.glob('/content/**/*.json', {
  eager: true,
}) as Record<string, { default: unknown }>

function readJson(path: string): unknown {
  return contentModules[path]?.default
}

export function useSiteSettings(): SiteSettings {
  return normalizeSettings(readJson(SETTINGS_PATH))
}

export function useTheme(): ThemeConfig {
  return normalizeTheme(readJson(THEME_PATH))
}

export function useHomePage(): HomePageContent {
  return normalizeHomePage(readJson(HOME_PATH))
}

export function useAboutPage(): AboutPageContent {
  return normalizeAboutPage(readJson(ABOUT_PATH))
}

export function useContactPage(): ContactPageContent {
  return normalizeContactPage(readJson(CONTACT_PATH))
}

function slugFromPath(path: string): string {
  return path.slice(ARTWORKS_DIR.length).replace(/\.json$/, '')
}

export function useArtworks(): Artwork[] {
  return Object.entries(contentModules)
    .filter(([path]) => path.startsWith(ARTWORKS_DIR) && path.endsWith('.json'))
    .map(([path, mod]) => normalizeArtwork(mod?.default, slugFromPath(path)))
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
}

export function useArtwork(slug: string): Artwork | undefined {
  return useArtworks().find((artwork) => artwork.slug === slug)
}
