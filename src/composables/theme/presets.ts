import type { FontPairing, FontPairingPreset, ThemePreset } from './types'

export const FONT_PAIRINGS: Record<FontPairingPreset, FontPairing> = {
  classic: {
    heading: '"Fraunces", Georgia, Cambria, "Times New Roman", serif',
    body: '"Newsreader", Georgia, Cambria, "Times New Roman", serif',
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
      surface: '#fefde9',
      ink: '#38240D',
    },
    fontPairing: 'classic',
  },
  'salt and pepper': {
    label: 'Salt and Pepper',
    palette: {
      primary: '#B3B3B3',
      secondary: '#c0c0c0',
      surface: '#FFFFFF',
      ink: '#2B2B2B',
    },
    fontPairing: 'modern',
  },
  'tropical punch': {
    label: 'Tropical Punch',
    palette: {
      primary: '#FF8243',
      secondary: '#b89d1b',
      surface: '#ffe3e9',
      ink: '#069494',
    },
    fontPairing: 'playful',
  },
  'yacht club': {
    label: 'Yacht Club',
    palette: {
      primary: '#245F73',
      secondary: '#1a2b30',
      surface: '#F2F0EF',
      ink: '#733E24',
    },
    fontPairing: 'classic',
  },
  'lavender fields': {
    label: 'Lavender Fields',
    palette: {
      primary: '#C1BFFF',
      secondary: '#beb959',
      surface: '#fcfae1',
      ink: '#CF6DFC',
    },
    fontPairing: 'editorial',
  },
  'stormy morning': {
    label: 'Stormy Morning',
    palette: {
      primary: '#6A89A7',
      secondary: '#79b2ec',
      surface: '#dcedff',
      ink: '#384959',
    },
    fontPairing: 'modern',
  },
}

export const DEFAULT_THEME_PRESET = 'chocolate truffle'
