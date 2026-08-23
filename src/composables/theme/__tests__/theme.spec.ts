import { describe, expect, it, vi } from 'vitest'

import { DEFAULT_THEME_PRESET, FONT_PAIRINGS, THEME_PRESETS } from '../presets'
import {
  applyThemeToDocument,
  contrastRatio,
  relativeLuminance,
  resolveOnColors,
  resolveTheme,
  themeToCssVariables,
} from '../index'

const CHOCOLATE_TRUFFLE = {
  primary: '#713600',
  secondary: '#C05800',
  surface: '#FDFBD4',
  ink: '#38240D',
}

describe('theme presets', () => {
  it('exposes the chocolate truffle preset with its four category colours', () => {
    const preset = THEME_PRESETS['chocolate truffle']
    expect(preset).toBeDefined()
    expect(preset.label).toBe('Chocolate Truffle')
    expect(preset.palette).toEqual(CHOCOLATE_TRUFFLE)
    expect(preset.fontPairing).toBe('classic')
  })

  it('always includes the default preset', () => {
    expect(THEME_PRESETS[DEFAULT_THEME_PRESET]).toBeDefined()
    expect(FONT_PAIRINGS.classic.heading.length).toBeGreaterThan(0)
    expect(FONT_PAIRINGS.classic.body.length).toBeGreaterThan(0)
  })

  it.each([
    [
      'salt and pepper',
      'Salt and Pepper',
      { primary: '#B3B3B3', secondary: '#D4D4D4', surface: '#FFFFFF', ink: '#2B2B2B' },
      'modern',
    ],
    [
      'tropical punch',
      'Tropical Punch',
      { primary: '#FF8243', secondary: '#FCE883', surface: '#FFC0CB', ink: '#069494' },
      'playful',
    ],
    [
      'yacht club',
      'Yacht Club',
      { primary: '#245F73', secondary: '#BBBDBC', surface: '#F2F0EF', ink: '#733E24' },
      'classic',
    ],
    [
      'lavender fields',
      'Lavender Fields',
      { primary: '#C1BFFF', secondary: '#BDB96A', surface: '#FDFBD4', ink: '#CF6DFC' },
      'editorial',
    ],
    [
      'stormy morning',
      'Stormy Morning',
      { primary: '#6A89A7', secondary: '#88BDF2', surface: '#BDDDFC', ink: '#384959' },
      'modern',
    ],
  ])('exposes the %s preset with its four category colours', (key, label, palette, fontPairing) => {
    const preset = THEME_PRESETS[key]
    expect(preset).toBeDefined()
    expect(preset.label).toBe(label)
    expect(preset.palette).toEqual(palette)
    expect(preset.fontPairing).toBe(fontPairing)
    expect(FONT_PAIRINGS[preset.fontPairing]).toBeDefined()
  })

  it('resolves accessible on-colours for every category of every preset', () => {
    for (const [key, preset] of Object.entries(THEME_PRESETS)) {
      const onColors = resolveOnColors(preset.palette)
      for (const category of ['primary', 'secondary', 'surface', 'ink'] as const) {
        const ratio = contrastRatio(onColors[category], preset.palette[category])
        expect(ratio, `${key} on-${category}`).toBeGreaterThanOrEqual(4.5)
      }
    }
  })

  it('uses well-formed six-digit hex colours in every preset', () => {
    for (const preset of Object.values(THEME_PRESETS)) {
      for (const value of Object.values(preset.palette)) {
        expect(value).toMatch(/^#[0-9A-F]{6}$/)
      }
    }
  })
})

describe('resolveTheme', () => {
  it('falls back to the default preset when the selection is missing or unknown', () => {
    const fallback = resolveTheme(undefined)
    expect(resolveTheme(null)).toEqual(fallback)
    expect(resolveTheme({})).toEqual(fallback)
    expect(resolveTheme({ preset: 'neon-rave' })).toEqual(fallback)
    expect(fallback.palette).toEqual(CHOCOLATE_TRUFFLE)
    expect(fallback.fonts).toEqual(FONT_PAIRINGS.classic)
  })

  it('resolves a named preset case-insensitively, ignoring surrounding whitespace', () => {
    const resolved = resolveTheme({ preset: '  Chocolate Truffle  ' })
    expect(resolved.palette.primary).toBe('#713600')
  })

  it('derives accessible on-colours for every category', () => {
    const resolved = resolveTheme({ preset: 'chocolate truffle' })
    expect(resolved.onColors.primary).toBe('#FDFBD4')
    expect(resolved.onColors.secondary).toBe('#000000')
    expect(resolved.onColors.surface).toBe('#38240D')
    expect(resolved.onColors.ink).toBe('#FDFBD4')
  })
})

describe('resolveOnColors', () => {
  it('prefers the palette-coherent candidate when it meets AA contrast', () => {
    const onColors = resolveOnColors(CHOCOLATE_TRUFFLE)
    expect(onColors.primary).toBe(CHOCOLATE_TRUFFLE.surface)
    expect(onColors.surface).toBe(CHOCOLATE_TRUFFLE.ink)
  })

  it('falls back to the higher-contrast of white/black when no palette colour reaches AA', () => {
    const onColors = resolveOnColors({
      primary: '#713600',
      secondary: '#C05800',
      surface: '#FDFBD4',
      ink: '#38240D',
    })
    expect(onColors.secondary).toBe('#000000')

    const grey = { primary: '#808080', secondary: '#808080', surface: '#FDFBD4', ink: '#101010' }
    expect(resolveOnColors(grey).primary).toBe('#000000')
  })

  it('always produces text meeting AA (4.5:1) for every category', () => {
    const onColors = resolveOnColors(CHOCOLATE_TRUFFLE)
    expect(contrastRatio(onColors.primary, CHOCOLATE_TRUFFLE.primary)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(onColors.secondary, CHOCOLATE_TRUFFLE.secondary)).toBeGreaterThanOrEqual(
      4.5,
    )
    expect(contrastRatio(onColors.surface, CHOCOLATE_TRUFFLE.surface)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(onColors.ink, CHOCOLATE_TRUFFLE.ink)).toBeGreaterThanOrEqual(4.5)
  })
})

describe('contrast utilities', () => {
  it('computes known luminance anchors', () => {
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 5)
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 5)
  })

  it('is symmetric and bounded below by 1', () => {
    expect(contrastRatio('#713600', '#FDFBD4')).toBeCloseTo(contrastRatio('#FDFBD4', '#713600'), 10)
    expect(contrastRatio('#38240D', '#FDFBD4')).toBeGreaterThanOrEqual(1)
  })
})

describe('applyThemeToDocument', () => {
  it('sets every theme variable on the document root element, not the app shell', () => {
    const setProperty = vi.spyOn(document.documentElement.style, 'setProperty')
    const expected = themeToCssVariables(resolveTheme({ preset: 'stormy morning' }))

    applyThemeToDocument(resolveTheme({ preset: 'stormy morning' }))

    expect(setProperty).toHaveBeenCalledTimes(Object.keys(expected).length)
    for (const [property, value] of Object.entries(expected)) {
      expect(setProperty).toHaveBeenCalledWith(property, value)
    }
    setProperty.mockRestore()
  })
})

describe('themeToCssVariables', () => {
  it('maps the four categories, their on-colours and fonts to app CSS custom properties', () => {
    const resolved = resolveTheme({ preset: 'chocolate truffle' })
    expect(themeToCssVariables(resolved)).toEqual({
      '--color-primary': '#713600',
      '--color-secondary': '#C05800',
      '--color-surface': '#FDFBD4',
      '--color-ink': '#38240D',
      '--color-on-primary': '#FDFBD4',
      '--color-on-secondary': '#000000',
      '--color-on-surface': '#38240D',
      '--color-on-ink': '#FDFBD4',
      '--color-bg': '#FDFBD4',
      '--color-text': '#38240D',
      '--color-border': 'rgba(56, 36, 13, 0.15)',
      '--font-heading': FONT_PAIRINGS.classic.heading,
      '--font-body': FONT_PAIRINGS.classic.body,
    })
  })

  it('keeps legacy background/text aliases pointing at surface/on-surface', () => {
    const vars = themeToCssVariables(resolveTheme({ preset: 'chocolate truffle' }))
    expect(vars['--color-bg']).toBe(vars['--color-surface'])
    expect(vars['--color-text']).toBe(vars['--color-on-surface'])
  })
})
