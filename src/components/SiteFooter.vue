<script setup lang="ts">
import { useSiteSettings } from '@/composables/content'

const settings = useSiteSettings()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <ul v-if="settings.socialLinks.length > 0" class="site-footer__social">
      <li v-for="link in settings.socialLinks" :key="`${link.label}-${link.url}`">
        <a :href="link.url" target="_blank" rel="noopener noreferrer">{{ link.label }}</a>
      </li>
    </ul>
    <p class="site-footer__copyright">© {{ year }} {{ settings.name }}</p>
  </footer>
</template>

<style scoped>
.site-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1.5rem;
  max-width: 72rem;
  margin: 0 auto;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--color-border);
}

.site-footer__social {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.site-footer__copyright {
  margin: 0;
  color: var(--color-text);
  font-size: 0.9rem;
}

@media (max-width: 640px) {
  .site-footer {
    flex-direction: column;
  }
}
</style>
