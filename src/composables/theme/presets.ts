import type { FontPairing, FontPairingPreset, ThemePreset } from './types'

export const FONT_PAIRINGS: Record<FontPairingPreset, FontPairing> = {
  classic: {
    heading: 'Georgia, Cambria, "Times New Roman", Times, serif',
    body: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  modern: {
    heading: '"Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif',
    body: 'system-ui, -apple-system, Roboto, Ubuntu, Cantarell, sans-serif',
  },
  editorial: {
    heading: '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif',
    body: 'Charter, Georgia, Cambria, "Times New Roman", serif',
  },
  playful: {
    heading: '"Trebuchet MS", Verdana, Tahoma, sans-serif',
    body: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  },
}

export const THEME_PRESETS: Record<string, ThemePreset> = {
  'chocolate truffle': {
    label: 'Chocolate Truffle',
    palette: {
      primary: '#713600',
      secondary: '#C05800',
      surface: '#FDFBD4',
      ink: '#38240D',
    },
    fontPairing: 'classic',
  },
}

export const DEFAULT_THEME_PRESET = 'chocolate truffle'
