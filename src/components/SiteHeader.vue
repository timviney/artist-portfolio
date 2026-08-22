<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { useSiteSettings } from '@/composables/content'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Me' },
  { to: '/contact', label: 'Contact' },
]

const settings = useSiteSettings()
const route = useRoute()
const menuOpen = ref(false)

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
  },
)
</script>

<template>
  <header class="site-header">
    <div class="site-header__inner">
      <RouterLink to="/" class="site-header__name">{{ settings.name }}</RouterLink>

      <button
        type="button"
        class="site-header__toggle"
        :aria-expanded="menuOpen"
        aria-controls="site-navigation"
        @click="toggleMenu"
      >
        <span class="visually-hidden">Toggle menu</span>
        <span class="site-header__toggle-bars" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      <nav
        id="site-navigation"
        class="site-nav"
        :class="{ 'site-nav--open': menuOpen }"
        aria-label="Main navigation"
      >
        <RouterLink
          v-for="link in NAV_LINKS"
          :key="link.to"
          :to="link.to"
          class="site-nav__link"
          @click="menuOpen = false"
        >
          {{ link.label }}
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  border-bottom: 1px solid var(--color-border);
}

.site-header__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1.5rem;
  max-width: 72rem;
  margin: 0 auto;
  padding: 1rem 1.5rem;
}

.site-header__name {
  font-family: var(--font-heading);
  font-size: 1.35rem;
  color: var(--color-text);
  text-decoration: none;
}

.site-header__toggle {
  display: none;
  margin-left: auto;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 0.25rem;
  background: none;
  color: var(--color-text);
  cursor: pointer;
}

.site-header__toggle-bars {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.site-header__toggle-bars span {
  width: 20px;
  height: 2px;
  background-color: currentColor;
}

.site-nav {
  display: flex;
  gap: 1.5rem;
  margin-left: auto;
}

.site-nav__link {
  color: var(--color-text);
  text-decoration: none;
  font-weight: 500;
}

.site-nav__link:hover,
.site-nav__link:focus-visible,
.site-nav__link.router-link-exact-active {
  color: var(--color-primary);
}

.site-nav__link.router-link-exact-active {
  text-decoration: underline;
  text-underline-offset: 0.3em;
}

@media (max-width: 640px) {
  .site-header__toggle {
    display: block;
  }

  .site-nav {
    display: none;
    flex-basis: 100%;
    flex-direction: column;
    gap: 0;
    padding-bottom: 0.75rem;
  }

  .site-nav--open {
    display: flex;
  }

  .site-nav__link {
    padding: 0.6rem 0;
    border-top: 1px solid var(--color-border);
  }
}
</style>
