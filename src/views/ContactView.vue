<script setup lang="ts">
import Button from 'primevue/button'

import { useContactPage, useSiteSettings } from '@/composables/content'

import SocialIcon from '@/components/SocialIcon.vue'

const page = useContactPage()
const settings = useSiteSettings()

const DEFAULT_REPLY_NOTE = "Messages go directly to the artist's email inbox."

function telHref(phone: string): string {
  return `tel:${phone.replace(/[\s()-]/g, '')}`
}
</script>

<template>
  <section class="page contact">
    <header class="contact-head">
      <p class="eyebrow">Bookings &amp; enquiries</p>
      <h1 class="contact-title">{{ page.contactHeading }}</h1>
    </header>

    <div class="contact-body">
      <div v-if="page.contactImage" class="contact-portrait">
        <img :src="page.contactImage" alt="" />
      </div>

      <div class="contact-panel">
        <Button
          as="a"
          :href="`mailto:${page.email}`"
          label="Enquire by email"
          class="contact-button"
        />
        <a :href="`mailto:${page.email}`" class="contact-email">{{ page.email }}</a>
        <a v-if="page.phone" :href="telHref(page.phone)" class="contact-phone">{{ page.phone }}</a>

        <p class="contact-note">{{ page.note ?? DEFAULT_REPLY_NOTE }}</p>

        <ul v-if="settings.socialLinks.length > 0" class="contact-socials">
          <li v-for="link in settings.socialLinks" :key="link.url">
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
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact {
  display: flex;
  flex-direction: column;
  gap: 3.5rem;
  padding-block: 5rem 6rem;
}

.contact-head {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  text-align: center;
}

.contact-title {
  margin: 0;
  font-family: var(--font-heading);
  font-size: clamp(2.75rem, 7vw, 5.25rem);
  font-weight: 380;
  line-height: 1;
  letter-spacing: -0.015em;
}

.contact-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
}

.contact-portrait {
  position: relative;
  width: min(100%, 20rem);
}

.contact-portrait::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translate(0.85rem, 0.85rem);
  border: 1px solid color-mix(in oklab, var(--color-secondary) 55%, transparent);
  pointer-events: none;
}

.contact-portrait img {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border: 1px solid var(--color-border);
  background-color: var(--surface-deep);
}

.contact-panel {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  align-items: center;
  max-width: 26rem;
  text-align: center;
}

.contact-button {
  /* Bridge PrimeVue's design tokens onto the active site theme: the plugin's
     own palette is generated once from a static preset and cannot follow the
     CMS-selected theme, but these custom properties resolve at paint time. */
  --p-button-primary-background: var(--color-primary);
  --p-button-primary-border-color: var(--color-primary);
  --p-button-primary-color: var(--color-on-primary);
  --p-button-primary-hover-background: var(--color-secondary);
  --p-button-primary-hover-border-color: var(--color-secondary);
  --p-button-primary-hover-color: var(--color-on-secondary);
  --p-button-primary-active-background: var(--color-secondary);
  --p-button-primary-active-border-color: var(--color-secondary);
  --p-button-primary-active-color: var(--color-on-secondary);
  --p-button-primary-focus-ring-color: var(--color-secondary);

  margin-bottom: 0.4rem;
  border-radius: 9999px;
  font-family: var(--font-heading) !important;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  box-shadow: var(--shadow-lift);
}

.contact-email,
.contact-phone {
  color: var(--color-text);
  font-size: 1.08rem;
  transition: color 180ms ease;
}

.contact-email:hover,
.contact-phone:hover,
.contact-email:focus-visible,
.contact-phone:focus-visible {
  color: var(--color-primary);
}

.contact-note {
  margin: 1.1rem 0 0;
  padding-top: 1.4rem;
  border-top: 1px solid var(--color-border);
  font-size: 1rem;
  font-style: italic;
  color: color-mix(in oklab, var(--color-text), transparent 12%);
}

.contact-socials {
  display: flex;
  gap: 1.6rem;
  margin: 0.6rem 0 0;
  padding: 0;
  list-style: none;
}

.contact-socials a {
  display: flex;
  padding: 0.25rem;
  color: var(--color-text);
  transition:
    color 180ms ease,
    transform 220ms var(--ease-out-soft);
}

.contact-socials a:hover,
.contact-socials a:focus-visible {
  color: var(--color-secondary);
  transform: translateY(-2px);
}

.contact-socials svg {
  width: 1.45rem;
  height: 1.45rem;
}

@media (min-width: 900px) {
  .contact-body {
    flex-direction: row;
    justify-content: center;
    align-items: stretch;
    gap: 4.5rem;
  }

  .contact-panel {
    justify-content: center;
    align-items: flex-start;
    max-width: 24rem;
    text-align: left;
    border-left: 1px solid var(--color-border);
    padding-left: 4.5rem;
  }

  .contact-note {
    text-align: left;
  }
}
</style>
