/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { load } from 'js-yaml'
import { describe, expect, it } from 'vitest'

import { THEME_PRESETS } from '@/composables/theme/presets'

interface ConfigField {
  name: string
  widget?: string
  required?: boolean
  default?: string
  options?: string[]
  min?: number
  max?: number
  fields?: ConfigField[]
}

interface ConfigFile {
  backend: { name: string; repo: string; branch: string }
  media_folder: string
  public_folder: string
  collections: Array<{
    name: string
    files?: Array<{ name: string; file: string; fields: ConfigField[] }>
    folder?: string
    format?: string
    create?: boolean
    fields?: ConfigField[]
  }>
}

const raw = readFileSync(resolve(process.cwd(), 'public/admin/config.yml'), 'utf8')
const config = load(raw) as ConfigFile

function collectionByName(name: string) {
  const collection = config.collections.find((entry) => entry.name === name)
  expect(collection, `collection "${name}" exists`).toBeTruthy()
  return collection!
}

function fieldNames(fields: ConfigField[] | undefined): string[] {
  return (fields ?? []).map((field) => field.name)
}

describe('Sveltia admin config', () => {
  it('parses as valid YAML with a GitHub backend', () => {
    expect(config.backend.name).toBe('github')
    expect(config.backend.repo).toBe('timviney/artist-portfolio')
    expect(config.backend.branch).toBe('main')
  })

  it('points the media library at the CMS upload folder', () => {
    expect(config.media_folder).toBe('public/images/uploads')
    expect(config.public_folder).toBe('/images/uploads')
  })

  it('exposes site settings matching SiteSettings and ThemeSelection', () => {
    const settings = collectionByName('settings')
    const site = settings.files?.find((file) => file.name === 'site')

    expect(site?.file).toBe('content/settings/site.json')
    expect(fieldNames(site?.fields)).toEqual(['name', 'tagline', 'socialLinks', 'cv'])
    expect(fieldNames(site?.fields?.[2].fields)).toEqual(['label', 'url'])
    expect(site?.fields?.[3]).toMatchObject({ widget: 'file', required: false })

    const theme = settings.files?.find((file) => file.name === 'theme')
    expect(theme?.file).toBe('content/settings/theme.json')
    expect(theme?.fields?.[0].options).toEqual(Object.keys(THEME_PRESETS))
    expect(theme?.fields?.[0].default).toBe('chocolate truffle')
  })

  it('exposes all five page files with fields matching their content types', () => {
    const pages = collectionByName('pages')
    const byName = (name: string) => pages.files?.find((file) => file.name === name)

    expect(pages.files?.map((file) => file.file)).toEqual([
      'content/pages/home.json',
      'content/pages/about.json',
      'content/pages/contact.json',
      'content/pages/actor.json',
      'content/pages/musician.json',
    ])

    expect(fieldNames(byName('home')?.fields)).toEqual([
      'actorHeadshot',
      'actorHeadshotFocus',
      'musicianHeadshot',
      'musicianHeadshotFocus',
    ])
    expect(fieldNames(byName('about')?.fields)).toEqual([
      'aboutEyebrow',
      'aboutHeading',
      'portraitImage',
      'portraitFocus',
      'bioParagraphs',
      'statement',
    ])
    expect(fieldNames(byName('contact')?.fields)).toEqual([
      'contactEyebrow',
      'contactHeading',
      'enquiryButtonLabel',
      'contactImage',
      'contactImageFocus',
      'email',
      'phone',
      'note',
    ])
    expect(fieldNames(byName('actor')?.fields)).toEqual([
      'heroImage',
      'heroFocus',
      'actorHeading',
      'heroCaption',
      'galleryHeading',
      'headshotCaption',
    ])
    expect(fieldNames(byName('musician')?.fields)).toEqual([
      'heroImage',
      'heroFocus',
      'intro',
      'musicianHeading',
      'heroCaption',
      'awardsHeading',
      'awardsText',
      'awardsFirstImage',
      'awardsFirstImageFocus',
      'awardsSecondImage',
      'awardsSecondImageFocus',
      'highlightsHeading',
      'projectsHeading',
      'galleryHeading',
    ])
  })

  it.each([
    ['actor-videos', 'content/actor/videos', ['title', 'videoUrl', 'description', 'dateAdded']],
    [
      'actor-headshots',
      'content/actor/headshots',
      ['image', 'focus', 'alt', 'dateAdded'],
    ],
    ['actor-gallery', 'content/actor/gallery', ['image', 'focus', 'title', 'dateAdded']],
    [
      'musician-highlights',
      'content/musician/highlights',
      ['title', 'videoUrl', 'description', 'dateAdded'],
    ],
    [
      'musician-projects',
      'content/musician/projects',
      ['title', 'videoUrl', 'description', 'dateAdded'],
    ],
    [
      'musician-gallery',
      'content/musician/gallery',
      ['image', 'focus', 'description', 'dateAdded'],
    ],
  ])(
    'maps folder collection %s to %s with the right fields',
    (name, folder, expectedFields) => {
      const collection = collectionByName(name)

      expect(collection.folder).toBe(folder)
      expect(collection.format).toBe('json')
      expect(collection.create).toBe(true)
      expect(fieldNames(collection.fields)).toEqual(expectedFields)
    },
  )

  it('has exactly one collection per editable media section (no awards list)', () => {
    const folders = config.collections
      .map((collection) => collection.folder)
      .filter((folder) => folder !== undefined)

    expect(folders).toHaveLength(6)
    expect(folders.join('\n')).not.toContain('/awards')
  })

  it('gives every image slot an optional crop-focus object with clamped x/y number axes', () => {
    const focusFields: Array<{ where: string; field: ConfigField }> = []
    const walk = (where: string, fields: ConfigField[] | undefined) => {
      for (const field of fields ?? []) {
        if (field.name === 'focus' || field.name.endsWith('Focus')) {
          focusFields.push({ where, field })
        }
        walk(`${where}.${field.name}`, field.fields)
      }
    }
    for (const collection of config.collections) {
      for (const file of collection.files ?? []) {
        walk(`${collection.name}.${file.name}`, file.fields)
      }
      walk(collection.name, collection.fields)
    }

    expect(focusFields.map(({ where }) => where)).toEqual([
      'pages.home',
      'pages.home',
      'pages.about',
      'pages.contact',
      'pages.actor',
      'pages.musician',
      'pages.musician',
      'pages.musician',
      'actor-headshots',
      'actor-gallery',
      'musician-gallery',
    ])

    for (const { where, field } of focusFields) {
      expect(field.widget, where).toBe('object')
      expect(field.required, where).toBe(false)
      expect(fieldNames(field.fields), where).toEqual(['x', 'y'])
      for (const axis of field.fields ?? []) {
        expect(axis.widget, `${where}.${axis.name}`).toBe('number')
        expect(axis.required, `${where}.${axis.name}`).toBe(false)
        expect(axis.min, `${where}.${axis.name}`).toBe(0)
        expect(axis.max, `${where}.${axis.name}`).toBe(100)
      }
    }
  })

  it('uses markdown widgets for every link-enabled caption/title/description field', () => {
    const markdownFields: string[] = []
    for (const collection of config.collections) {
      for (const field of collection.fields ?? []) {
        if (field.widget === 'markdown') {
          markdownFields.push(`${collection.name}.${field.name}`)
        }
      }
    }

    expect(markdownFields).toEqual([
      'actor-videos.description',
      'actor-gallery.title',
      'musician-highlights.description',
      'musician-projects.description',
      'musician-gallery.description',
    ])
  })
})
