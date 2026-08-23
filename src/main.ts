import './styles/main.css'

import PrimeVue from 'primevue/config'
import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import { InkAmberPreset } from './composables/theme/primePreset'

// The CMS lives at /admin/ as a plain static page. Without the trailing slash
// the SPA fallback would swallow the path and render the app shell with no
// matching route, so bounce to the real location before mounting.
// if (window.location.pathname === '/admin') {
//   window.location.replace('/admin')
// } else {
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
// }
