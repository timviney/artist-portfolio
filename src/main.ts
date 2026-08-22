import './styles/main.css'

import PrimeVue from 'primevue/config'
import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import { InkAmberPreset } from './composables/theme/primePreset'

createApp(App)
  .use(router)
  .use(PrimeVue, {
    theme: {
      preset: InkAmberPreset,
      options: {
        darkModeSelector: '.app-dark-mode-none',
      },
    },
    ripple: false,
  })
  .mount('#app')
