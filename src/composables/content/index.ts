import type {
  AboutPageContent,
  ActorGalleryImage,
  ActorPageContent,
  AwardEntry,
  ContactPageContent,
  HeadshotEntry,
  HomePageContent,
  MusicianGalleryImage,
  MusicianPageContent,
  SiteSettings,
  ThemeConfig,
  VideoEntry,
} from './types'
import {
  normalizeAboutPage,
  normalizeActorGalleryImage,
  normalizeActorPage,
  normalizeAward,
  normalizeContactPage,
  normalizeHeadshot,
  normalizeHomePage,
  normalizeMusicianGalleryImage,
  normalizeMusicianPage,
  normalizeSettings,
  normalizeTheme,
  normalizeVideoEntry,
} from './normalize'

const SETTINGS_PATH = '/content/settings/site.json'
const THEME_PATH = '/content/settings/theme.json'
const HOME_PATH = '/content/pages/home.json'
const ABOUT_PATH = '/content/pages/about.json'
const CONTACT_PATH = '/content/pages/contact.json'
const ACTOR_PATH = '/content/pages/actor.json'
const MUSICIAN_PATH = '/content/pages/musician.json'

const ACTOR_VIDEOS_DIR = '/content/actor/videos/'
const ACTOR_HEADSHOTS_DIR = '/content/actor/headshots/'
const ACTOR_GALLERY_DIR = '/content/actor/gallery/'
const MUSICIAN_AWARDS_DIR = '/content/musician/awards/'
const MUSICIAN_HIGHLIGHTS_DIR = '/content/musician/highlights/'
const MUSICIAN_PROJECTS_DIR = '/content/musician/projects/'
const MUSICIAN_GALLERY_DIR = '/content/musician/gallery/'

const contentModules = import.meta.glob('/content/**/*.json', {
  eager: true,
}) as Record<string, { default: unknown }>

function readJson(path: string): unknown {
  return contentModules[path]?.default
}

interface OrderedEntry {
  slug: string
  order: number
}

function loadEntries<T extends OrderedEntry>(
  dir: string,
  normalize: (raw: unknown, slug: string) => T,
): T[] {
  return Object.entries(contentModules)
    .filter(([path]) => path.startsWith(dir) && path.endsWith('.json'))
    .map(([path, mod]) => normalize(mod?.default, path.slice(dir.length).replace(/\.json$/, '')))
    .sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug))
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

export function useActorPage(): ActorPageContent {
  return normalizeActorPage(readJson(ACTOR_PATH))
}

export function useMusicianPage(): MusicianPageContent {
  return normalizeMusicianPage(readJson(MUSICIAN_PATH))
}

export function useActorVideos(): VideoEntry[] {
  return loadEntries(ACTOR_VIDEOS_DIR, normalizeVideoEntry)
}

export function useHeadshots(): HeadshotEntry[] {
  return loadEntries(ACTOR_HEADSHOTS_DIR, normalizeHeadshot)
}

export function useActorGallery(): ActorGalleryImage[] {
  return loadEntries(ACTOR_GALLERY_DIR, normalizeActorGalleryImage)
}

export function useAwards(): AwardEntry[] {
  return loadEntries(MUSICIAN_AWARDS_DIR, normalizeAward)
}

export function useHighlights(): VideoEntry[] {
  return loadEntries(MUSICIAN_HIGHLIGHTS_DIR, normalizeVideoEntry)
}

export function useProjects(): VideoEntry[] {
  return loadEntries(MUSICIAN_PROJECTS_DIR, normalizeVideoEntry)
}

export function useMusicianGallery(): MusicianGalleryImage[] {
  return loadEntries(MUSICIAN_GALLERY_DIR, normalizeMusicianGalleryImage)
}
