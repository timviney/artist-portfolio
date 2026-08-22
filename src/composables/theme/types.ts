export type FontPairingPreset = 'classic' | 'modern' | 'editorial' | 'playful'

export interface ThemePalette {
  primary: string
  secondary: string
  surface: string
  ink: string
}

export interface OnColors {
  primary: string
  secondary: string
  surface: string
  ink: string
}

export interface FontPairing {
  heading: string
  body: string
}

export interface ThemePreset {
  label: string
  palette: ThemePalette
  fontPairing: FontPairingPreset
}

export interface ResolvedTheme {
  palette: ThemePalette
  onColors: OnColors
  fonts: FontPairing
}
