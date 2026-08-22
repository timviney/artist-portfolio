import { definePreset } from '@primevue/themes'
import Aura from '@primevue/themes/aura'

export const InkAmberPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#fbf3ec',
      100: '#f4e0d0',
      200: '#e8c2a1',
      300: '#daa06d',
      400: '#c05800',
      500: '#9c4a08',
      600: '#713600',
      700: '#5c2d02',
      800: '#452203',
      900: '#38240d',
      950: '#221507',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#fdfbd4',
          100: '#f8f3dc',
          200: '#efe4c6',
          300: '#e0d0ae',
          400: '#c9b28f',
          500: '#a98d70',
          600: '#866c54',
          700: '#5f4c3c',
          800: '#452203',
          900: '#38240d',
          950: '#221507',
        },
      },
    },
  },
})
