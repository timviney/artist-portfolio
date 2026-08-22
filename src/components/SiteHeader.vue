<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from 'vue'
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
const navElement = ref<HTMLElement | null>(null)
const toggleButton = ref<HTMLButtonElement | null>(null)

function onWindowKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeMenu()
}

function openMenu() {
  menuOpen.value = true
  void nextTick(() => {
    navElement.value?.querySelector('a')?.focus()
  })
}

function closeMenu() {
  if (!menuOpen.value) return
  menuOpen.value = false
  void nextTick(() => {
    toggleButton.value?.focus()
  })
}

function toggleMenu() {
  if (menuOpen.value) {
    closeMenu()
  } else {
    openMenu()
  }
}

watch(
  () => route.fullPath,
  () => {
    closeMenu()
  },
)

watch(menuOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (open) {
    window.addEventListener('keydown', onWindowKeydown)
  } else {
    window.removeEventListener('keydown', onWindowKeydown)
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', onWindowKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <header class="site-header" :class="{ 'site-header--menu-open': menuOpen }">
    <div class="site-header__inner">
      <RouterLink to="/" class="site-header__name">{{ settings.name }}</RouterLink>

      <button
        ref="toggleButton"
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
        ref="navElement"
        class="site-nav"
        :class="{ 'site-nav--open': menuOpen }"
        :role="menuOpen ? 'dialog' : undefined"
        :aria-modal="menuOpen ? 'true' : undefined"
        aria-label="Main navigation"
      >
        <RouterLink
          v-for="link in NAV_LINKS"
          :key="link.to"
          :to="link.to"
          class="site-nav__link"
          @click="closeMenu"
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
  align-items: center;
}

.site-header__inner {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 90rem;
  margin: 0 auto;
  padding: 1rem 1.5rem;
}

.site-header__name {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
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

.site-header--menu-open .site-header__toggle {
  position: relative;
  z-index: 50;
  color: var(--color-primary);
  border-color: var(--color-primary);
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
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.site-header--menu-open .site-header__toggle-bars span:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}

.site-header--menu-open .site-header__toggle-bars span:nth-child(2) {
  opacity: 0;
}

.site-header--menu-open .site-header__toggle-bars span:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}

.site-nav {
  display: flex;
  gap: 1.5rem;
  margin-right: auto;
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
  }

  .site-nav--open {
    position: fixed;
    inset: 0;
    z-index: 40;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2.5rem;
    background-color: var(--color-bg);
  }

  .site-nav__link {
    padding: 0;
    border-top: 0;
    font-family: var(--font-heading);
    font-size: 2rem;
  }
}
</style>
