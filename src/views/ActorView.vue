<script setup lang="ts">
import { computed, ref } from 'vue'
import { A11y, Keyboard, Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'

import ImageLightbox from '@/components/ImageLightbox.vue'
import type { LightboxImage } from '@/components/ImageLightbox.vue'
import RichText from '@/components/RichText.vue'
import VideoEmbed from '@/components/VideoEmbed.vue'
import { useActorGallery, useActorPage, useActorVideos, useHeadshots } from '@/composables/content'
import { stripInlineLinks } from '@/composables/richText'

import 'swiper/css'
import 'swiper/css/navigation'

const page = useActorPage()
const videos = useActorVideos()
const headshots = useHeadshots()
const gallery = useActorGallery()

const lightboxImages = computed<LightboxImage[]>(() =>
  gallery
    .filter((entry) => entry.image)
    .map((entry) => ({ slug: entry.slug, image: entry.image, caption: entry.title })),
)

const lightboxIndex = ref<number | null>(null)

function openLightbox(slug: string) {
  const index = lightboxImages.value.findIndex((entry) => entry.slug === slug)
  if (index !== -1) lightboxIndex.value = index
}
</script>

<template>
  <div class="actor">
    <section class="actor-hero" aria-label="Actor hero image">
      <img v-if="page.heroImage" :src="page.heroImage" alt="" />
      <div v-else class="actor-hero__fallback" aria-hidden="true"></div>
      <div class="actor-hero__scrim" aria-hidden="true"></div>
      <div class="actor-hero__content">
        <h2 class="actor-section-title actor-hero__title">{{ page.actorHeading }}</h2>
        <p class="actor-hero__caption">{{ page.heroCaption }}</p>
      </div>
    </section>

    <section class="page actor-videos">
      <article
        v-for="(video, index) in videos"
        :key="video.slug"
        class="actor-video"
        :class="{ 'actor-video--ruled': index > 0 }"
      >
        <VideoEmbed :video-url="video.videoUrl" :title="video.title" />
        <p v-if="video.description" class="actor-video__description">
          <RichText :text="video.description" />
        </p>
      </article>
    </section>

    <section class="band">
      <div class="page actor-gallery">
        <h2 class="actor-section-title">{{ page.galleryHeading }}</h2>

      <Swiper
        v-if="headshots.length > 0"
        class="headshot-swiper"
        :modules="[Navigation, Keyboard, A11y]"
        :navigation="headshots.length > 1"
        :keyboard="{ enabled: true }"
        :style="{ '--swiper-navigation-color': 'var(--color-primary)' }"
        aria-label="Headshots"
      >
        <SwiperSlide v-for="headshot in headshots" :key="headshot.slug" class="headshot-slide">
          <img v-if="headshot.image" :src="headshot.image" :alt="headshot.alt ?? ''" />
          <div v-else class="headshot-slide__fallback" aria-hidden="true"></div>
        </SwiperSlide>
      </Swiper>

      <ul v-if="gallery.length > 0" class="gallery-grid">
        <li v-for="image in gallery" :key="image.slug" class="gallery-grid__item">
          <button
            v-if="image.image"
            type="button"
            class="gallery-grid__trigger"
            @click="openLightbox(image.slug)"
          >
            <img :src="image.image" :alt="stripInlineLinks(image.title)" />
          </button>
          <div v-else class="gallery-grid__fallback" aria-hidden="true"></div>
          <p class="gallery-grid__title">
            <RichText :text="image.title" />
          </p>
        </li>
      </ul>
      </div>
    </section>

    <section class="page actor-next">
      <RouterLink to="/musician" class="actor-next__link">
        Musician <span aria-hidden="true">→</span>
      </RouterLink>
    </section>

    <ImageLightbox
      v-if="lightboxIndex !== null"
      :images="lightboxImages"
      :initial-index="lightboxIndex"
      @close="lightboxIndex = null"
    />
  </div>
</template>

<style scoped>
.actor-hero {
  position: relative;
  min-height: 100vh;
  min-height: 100svh;
}

.actor-hero img,
.actor-hero__fallback {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.actor-hero img {
  animation: hero-drift 14s var(--ease-out-soft) both;
}

@keyframes hero-drift {
  from {
    transform: scale(1.06);
  }

  to {
    transform: scale(1);
  }
}

.actor-hero__fallback {
  background:
    radial-gradient(
      ellipse 90% 60% at 70% 20%,
      color-mix(in oklab, var(--color-primary) 22%, var(--color-surface)),
      transparent
    ),
    var(--surface-deep);
}

.actor-hero__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgb(24 14 4 / 0.72), rgb(24 14 4 / 0.06) 46%);
}

.actor-hero__content {
  position: absolute;
  right: 0;
  bottom: clamp(2rem, 7vh, 4.5rem);
  left: 0;
  padding: 1.5rem;
}

.actor-hero__title,
.actor-hero__caption {
  max-width: 90rem;
  margin: 0 auto;
  color: #fffdf2;
}

.actor-section-title {
  margin: 0;
  text-align: center;
  font-family: var(--font-heading);
  font-size: clamp(2.5rem, 6vw, 4.25rem);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: -0.01em;
}

.actor-hero__title {
  text-align: left;
  font-size: clamp(3.2rem, 9vw, 6.75rem);
  font-weight: 380;
  line-height: 0.98;
}

.actor-hero__caption {
  margin-top: 0.8rem;
  font-family: var(--font-heading);
  font-size: 0.78rem;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  opacity: 0.82;
}

.actor-videos {
  display: flex;
  flex-direction: column;
  gap: 3.5rem;
  max-width: 64rem;
  padding-block: 5rem;
}

.actor-video {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.actor-video--ruled {
  position: relative;
  padding-top: 3.5rem;
}

.actor-video--ruled::before {
  content: '';
  position: absolute;
  top: 0;
  right: 15%;
  left: 15%;
  height: 1px;
  background-image: linear-gradient(to right, transparent, var(--color-border), transparent);
}

.actor-video__description {
  max-width: 40rem;
  margin: 0 auto;
  font-size: 1.12rem;
  font-style: italic;
  text-align: center;
  color: color-mix(in oklab, var(--color-text), transparent 12%);
}

.actor-gallery {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  padding-block: 5rem;
}

.gallery-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.gallery-grid__item img,
.gallery-grid__fallback {
  display: block;
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
}

.gallery-grid__trigger {
  display: block;
  width: 100%;
  padding: 0;
  border: none;
  background: none;
  cursor: zoom-in;
}

.gallery-grid__trigger img {
  transition:
    transform 700ms var(--ease-out-soft),
    box-shadow 400ms ease;
}

.gallery-grid__trigger:hover img,
.gallery-grid__trigger:focus-visible img {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lift);
}

.gallery-grid__title {
  margin: 0.55rem 0 0;
  font-size: 0.95rem;
  text-align: center;
}

.headshot-swiper {
  width: 100%;
  max-width: 30rem;
  margin: 0 auto;
  padding: 0.6rem;

  /* Transparent mat with no border: the carousel sits on a full-bleed
     gradient band, so nothing here should paint its own fill or edge - the
     band shows through and stays matched at every position. */
}

.headshot-slide img,
.headshot-slide__fallback {
  display: block;
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
}

.headshot-slide__fallback {
  background-color: var(--surface-deep);
}

.actor-next {
  padding-block: 4.5rem 6rem;
  text-align: center;
}

.actor-next__link {
  display: inline-flex;
  align-items: baseline;
  gap: 0.6em;
  color: var(--color-text);
  font-family: var(--font-heading);
  font-size: clamp(1.5rem, 3vw, 2.1rem);
  font-style: italic;
  text-decoration: none;
  transition: color 200ms ease;
}

.actor-next__link span {
  display: inline-block;
  transition: transform 320ms var(--ease-out-soft);
}

.actor-next__link:hover,
.actor-next__link:focus-visible {
  color: var(--color-primary);
}

.actor-next__link:hover span,
.actor-next__link:focus-visible span {
  transform: translateX(0.4em);
}

@media (min-width: 320px) {
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .gallery-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
