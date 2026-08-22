<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { useSiteSettings } from '@/composables/content'

import SocialIcon from '@/components/SocialIcon.vue'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Me' },
  { to: '/contact', label: 'Contact' },
]

const settings = useSiteSettings()
const route = useRoute()
const menuOpen = ref(false)
const scrolled = ref(false)
const navElement = ref<HTMLElement | null>(null)
const toggleButton = ref<HTMLButtonElement | null>(null)

function onWindowKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeMenu()
}

function onWindowScroll() {
  scrolled.value = window.scrollY > 12
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

onMounted(() => {
  window.addEventListener('scroll', onWindowScroll, { passive: true })
  onWindowScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onWindowScroll)
  window.removeEventListener('keydown', onWindowKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <header
    class="site-header"
    :class="{ 'site-header--menu-open': menuOpen, 'site-header--scrolled': scrolled }"
  >
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
        <div class="site-nav__links">
          <RouterLink
            v-for="(link, index) in NAV_LINKS"
            :key="link.to"
            :to="link.to"
            class="site-nav__link"
            :style="{ '--stagger': index }"
            @click="closeMenu"
          >
            {{ link.label }}
          </RouterLink>
        </div>

        <ul v-if="settings.socialLinks.length > 0" class="site-nav__socials">
          <li v-for="social in settings.socialLinks" :key="social.url">
            <a
              :href="social.url"
              target="_blank"
              rel="noopener noreferrer"
              class="site-nav__social"
              :aria-label="social.label"
            >
              <SocialIcon :url="social.url" />
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 60;
  border-bottom: 1px solid var(--color-border);
  align-items: center;
  background-color: color-mix(in oklab, var(--color-surface) 86%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  transition:
    box-shadow 320ms var(--ease-out-soft),
    background-color 320ms var(--ease-out-soft);
}

.site-header--scrolled {
  background-color: color-mix(in oklab, var(--color-surface) 94%, transparent);
  box-shadow: 0 1px 0 var(--color-border), var(--shadow-lift);
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
  color: var(--color-text);
  font-family: var(--font-heading);
  font-size: 1.35rem;
  font-style: italic;
  font-weight: 480;
  text-decoration: none;
  white-space: nowrap;
  transition: color 200ms ease;
}

.site-header__name:hover,
.site-header__name:focus-visible {
  color: var(--color-primary);
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
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
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
  gap: 2rem;
  margin-right: auto;
}

.site-nav__links {
  display: flex;
  gap: 1.75rem;
}

.site-nav__link {
  position: relative;
  color: var(--color-text);
  font-family: var(--font-heading);
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-decoration: none;
  text-transform: uppercase;
  transition: color 180ms ease;
}

.site-nav__link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -0.35em;
  width: 100%;
  height: 1px;
  background-color: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 260ms var(--ease-out-soft);
}

.site-nav__link:hover::after,
.site-nav__link:focus-visible::after {
  transform: scaleX(1);
  transform-origin: left;
}

.site-nav__link:hover,
.site-nav__link:focus-visible,
.site-nav__link.router-link-exact-active {
  color: var(--color-primary);
}

.site-nav__link.router-link-exact-active::after {
  transform: scaleX(1);
}

.site-nav__socials {
  position: absolute;
  top: 50%;
  right: 1.5rem;
  transform: translateY(-50%);
  display: flex;
  gap: 1.1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.site-nav__social {
  display: flex;
  padding: 0.2rem;
  color: var(--color-text);
  transition:
    color 180ms ease,
    transform 220ms var(--ease-out-soft);
}

.site-nav__social:hover,
.site-nav__social:focus-visible {
  color: var(--color-secondary);
  transform: translateY(-2px);
}

.site-nav__social svg {
  width: 1.25rem;
  height: 1.25rem;
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
    padding-bottom: 2.5rem;
    background-color: var(--color-bg);
  }

  .site-nav__link {
    padding: 0;
    border-top: 0;
    font-size: 2.1rem;
    font-weight: 400;
    letter-spacing: 0.02em;
    text-transform: none;
  }

  .site-nav--open .site-nav__links {
    display: flex;
    flex-direction: column;
    gap: 2.25rem;
    margin-block: auto;
    text-align: center;
  }

  .site-nav--open .site-nav__link {
    animation: rise-in 560ms var(--ease-out-soft) both;
    animation-delay: calc(90ms * var(--stagger));
  }

  .site-nav--open .site-nav__socials {
    position: static;
    transform: none;
    gap: 1.9rem;
    margin-top: auto;
  }

  .site-nav--open .site-nav__social svg {
    width: 1.75rem;
    height: 1.75rem;
  }
}
</style>
