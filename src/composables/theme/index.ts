import { useTheme } from '@/composables/content'
import type { ThemeSelection } from '@/composables/content/types'
import { DEFAULT_THEME_PRESET, FONT_PAIRINGS, THEME_PRESETS } from './presets'
import type { OnColors, ResolvedTheme, ThemePalette } from './types'

const LIGHT_TEXT_FALLBACK = '#FFFFFF'
const DARK_TEXT_FALLBACK = '#000000'
const AA_CONTRAST = 4.5

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const [lighter, darker] = la >= lb ? [la, lb] : [lb, la]
  return (lighter + 0.05) / (darker + 0.05)
}

function adaptiveTextColor(background: string, paletteCoherent: string): string {
  if (contrastRatio(paletteCoherent, background) >= AA_CONTRAST) return paletteCoherent
  return contrastRatio(LIGHT_TEXT_FALLBACK, background) >=
    contrastRatio(DARK_TEXT_FALLBACK, background)
    ? LIGHT_TEXT_FALLBACK
    : DARK_TEXT_FALLBACK
}

export function resolveOnColors(palette: ThemePalette): OnColors {
  return {
    primary: adaptiveTextColor(palette.primary, palette.surface),
    secondary: adaptiveTextColor(palette.secondary, palette.surface),
    surface: adaptiveTextColor(palette.surface, palette.ink),
    ink: adaptiveTextColor(palette.ink, palette.surface),
  }
}

export function resolveTheme(selection: ThemeSelection | undefined | null): ResolvedTheme {
  const key = selection?.preset?.trim().toLowerCase()
  const preset = (key !== undefined && THEME_PRESETS[key]) || THEME_PRESETS[DEFAULT_THEME_PRESET]
  return {
    palette: preset.palette,
    onColors: resolveOnColors(preset.palette),
    fonts: FONT_PAIRINGS[preset.fontPairing],
  }
}

export function useActiveTheme(): ResolvedTheme {
  return resolveTheme(useTheme())
}

export function applyThemeToDocument(theme: ResolvedTheme): void {
  const style = document.documentElement.style
  for (const [property, value] of Object.entries(themeToCssVariables(theme))) {
    style.setProperty(property, value)
  }
}

const HEX_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

function hexChannels(hex: string): [number, number, number] {
  let value = hex.trim()
  if (!HEX_PATTERN.test(value)) return [0, 0, 0]
  if (value.length === 4) {
    const short = value.slice(1)
    value = `#${short[0]}${short[0]}${short[1]}${short[1]}${short[2]}${short[2]}`
  }
  const digits = value.slice(1)
  return [
    parseInt(digits.slice(0, 2), 16),
    parseInt(digits.slice(2, 4), 16),
    parseInt(digits.slice(4, 6), 16),
  ]
}

function channelSrgb(channel: number): number {
  const scaled = channel / 255
  return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexChannels(hex)
  return 0.2126 * channelSrgb(r) + 0.7152 * channelSrgb(g) + 0.0722 * channelSrgb(b)
}

function hexToRgba(hex: string, alpha: number): string {
  const [r, g, b] = hexChannels(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function themeToCssVariables(theme: ResolvedTheme): Record<string, string> {
  const palette = theme.palette
  const onColors = theme.onColors
  return {
    '--color-primary': palette.primary,
    '--color-secondary': palette.secondary,
    '--color-surface': palette.surface,
    '--color-ink': palette.ink,
    '--color-on-primary': onColors.primary,
    '--color-on-secondary': onColors.secondary,
    '--color-on-surface': onColors.surface,
    '--color-on-ink': onColors.ink,
    '--color-bg': palette.surface,
    '--color-text': onColors.surface,
    '--color-border': hexToRgba(palette.ink, 0.15),
    '--font-heading': theme.fonts.heading,
    '--font-body': theme.fonts.body,
  }
}
