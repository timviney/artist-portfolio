<script setup lang="ts">
import { useContactPage, useSiteSettings } from '@/composables/content'

const page = useContactPage()
const settings = useSiteSettings()

const DEFAULT_REPLY_NOTE = "Messages go directly to the artist's email inbox."

function telHref(phone: string): string {
  return `tel:${phone.replace(/[\s()-]/g, '')}`
}
</script>

<template>
  <section class="page contact">
    <h1 class="contact-title">{{ page.contactHeading }}</h1>

    <div class="contact-enquiry">
      <a :href="`mailto:${page.email}`" class="contact-button">Enquire by email</a>
      <a :href="`mailto:${page.email}`" class="contact-email">{{ page.email }}</a>
      <a v-if="page.phone" :href="telHref(page.phone)" class="contact-phone">{{ page.phone }}</a>
    </div>

    <p class="contact-note">{{ page.note ?? DEFAULT_REPLY_NOTE }}</p>

    <ul v-if="settings.socialLinks.length > 0" class="contact-socials">
      <li v-for="link in settings.socialLinks" :key="link.url">
        <a :href="link.url" target="_blank" rel="noopener noreferrer">{{ link.label }}</a>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.contact {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
}

.contact-title {
  margin: 0;
  text-align: center;
  font-family: var(--font-heading);
  font-size: clamp(2.25rem, 6vw, 3.5rem);
}

.contact-enquiry {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.contact-button {
  display: inline-block;
  padding: 0.75rem 2rem;
  border-radius: 9999px;
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  font-family: var(--font-heading);
  font-size: 1.15rem;
  text-decoration: none;
}

.contact-button:hover,
.contact-button:focus-visible {
  background-color: var(--color-secondary);
  color: var(--color-on-secondary);
}

.contact-email,
.contact-phone {
  font-size: 1.05rem;
}

.contact-note {
  max-width: 44rem;
  margin: 0;
  text-align: center;
}

.contact-socials {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
  text-align: center;
}
</style>
