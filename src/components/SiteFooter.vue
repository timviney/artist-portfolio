<script setup lang="ts">
import { useSiteSettings } from '@/composables/content'

import SocialIcon from '@/components/SocialIcon.vue'

const settings = useSiteSettings()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer__inner">
      <p class="site-footer__mark">{{ settings.name }}</p>

      <ul v-if="settings.socialLinks.length > 0" class="site-footer__social">
        <li v-for="link in settings.socialLinks" :key="`${link.label}-${link.url}`">
          <a
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="link.label"
          >
            <SocialIcon :url="link.url" />
          </a>
        </li>
      </ul>

      <p class="site-footer__copyright">© {{ year }} {{ settings.name }}</p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  border-top: 1px solid color-mix(in oklab, var(--color-on-ink) 18%, transparent);
  background-color: var(--ink-band);
  color: var(--color-on-ink);
}

.site-footer__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem 2rem;
  max-width: 90rem;
  margin: 0 auto;
  padding: 1.6rem 1.5rem;
}

.site-footer__mark {
  margin: 0;
  font-family: var(--font-heading);
  font-size: 1.3rem;
  font-style: italic;
  letter-spacing: 0.01em;
}

.site-footer__social {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.site-footer__social a {
  display: flex;
  padding: 0.3rem;
  color: inherit;
  opacity: 0.85;
  transition:
    opacity 180ms ease,
    transform 220ms var(--ease-out-soft);
}

.site-footer__social a:hover,
.site-footer__social a:focus-visible {
  opacity: 1;
  transform: translateY(-2px);
}

.site-footer__social svg {
  width: 1.2rem;
  height: 1.2rem;
}

.site-footer__copyright {
  margin: 0;
  font-family: var(--font-heading);
  font-size: 0.72rem;
  letter-spacing: 0.28em;
  opacity: 0.72;
  text-transform: uppercase;
}

@media (max-width: 640px) {
  .site-footer__inner {
    flex-direction: column;
    text-align: center;
  }
}
</style>
