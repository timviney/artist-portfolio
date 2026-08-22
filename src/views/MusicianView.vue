<script setup lang="ts">
import { computed, ref } from 'vue'

import ImageLightbox from '@/components/ImageLightbox.vue'
import type { LightboxImage } from '@/components/ImageLightbox.vue'
import VideoEmbed from '@/components/VideoEmbed.vue'
import {
  useHighlights,
  useMusicianGallery,
  useMusicianPage,
  useProjects,
} from '@/composables/content'

const page = useMusicianPage()
const highlights = useHighlights()
const projects = useProjects()
const gallery = useMusicianGallery()

const lightboxImages = computed<LightboxImage[]>(() =>
  gallery
    .filter((entry) => entry.image)
    .map((entry) => ({ slug: entry.slug, image: entry.image, caption: entry.description })),
)

const lightboxIndex = ref<number | null>(null)

function openLightbox(slug: string) {
  const index = lightboxImages.value.findIndex((entry) => entry.slug === slug)
  if (index !== -1) lightboxIndex.value = index
}
</script>

<template>
  <div class="musician">
    <section class="musician-hero" aria-label="Musician hero image">
      <img v-if="page.heroImage" :src="page.heroImage" alt="" />
      <div v-else class="musician-hero__fallback" aria-hidden="true"></div>
      <div class="musician-hero__scrim" aria-hidden="true"></div>
      <div class="musician-hero__content">
        <h2 class="musician-section-title musician-hero__title">{{ page.musicianHeading }}</h2>
        <p class="musician-hero__caption">Cello · Guitar · Song</p>
      </div>
    </section>

    <section class="page musician-intro">
      <p class="section-lede musician-intro__text">{{ page.intro }}</p>
    </section>

    <section class="page musician-awards">
      <h2 class="musician-section-title">{{ page.awardsHeading }}</h2>
      <p v-if="page.awardsText" class="musician-awards__text">{{ page.awardsText }}</p>
      <div
        v-if="page.awardsFirstImage || page.awardsSecondImage"
        class="musician-awards__pictures"
      >
        <img
          v-if="page.awardsFirstImage"
          :src="page.awardsFirstImage"
          alt=""
          class="musician-awards__picture"
        />
        <div v-else class="musician-awards__fallback" aria-hidden="true"></div>
        <img
          v-if="page.awardsSecondImage"
          :src="page.awardsSecondImage"
          alt=""
          class="musician-awards__picture"
        />
        <div v-else class="musician-awards__fallback" aria-hidden="true"></div>
      </div>
    </section>

    <section class="page musician-highlights">
      <h2 class="musician-section-title">{{ page.highlightsHeading }}</h2>
      <article
        v-for="(video, index) in highlights"
        :key="video.slug"
        class="musician-video"
        :class="{ 'musician-video--ruled': index > 0 }"
      >
        <VideoEmbed :video-url="video.videoUrl" :title="video.title" />
        <p v-if="video.description" class="musician-video__description">{{ video.description }}</p>
      </article>
    </section>

    <section class="page musician-projects">
      <h2 class="musician-section-title">{{ page.projectsHeading }}</h2>
      <article
        v-for="(video, index) in projects"
        :key="video.slug"
        class="musician-video"
        :class="{ 'musician-video--ruled': index > 0 }"
      >
        <VideoEmbed :video-url="video.videoUrl" :title="video.title" />
        <p v-if="video.description" class="musician-video__description">{{ video.description }}</p>
      </article>
    </section>

    <section class="page musician-gallery">
      <h2 class="musician-section-title">{{ page.galleryHeading }}</h2>
      <ul v-if="gallery.length > 0" class="gallery-grid">
        <li v-for="image in gallery" :key="image.slug" class="gallery-grid__item">
          <button
            v-if="image.image"
            type="button"
            class="gallery-grid__trigger"
            @click="openLightbox(image.slug)"
          >
            <img :src="image.image" :alt="image.description ?? ''" />
          </button>
          <div v-else class="gallery-grid__fallback" aria-hidden="true"></div>
          <p v-if="image.description" class="gallery-grid__description">{{ image.description }}</p>
        </li>
      </ul>
    </section>

    <section class="page musician-next">
      <RouterLink to="/actor" class="musician-next__link">
        <span class="musician-next__arrow" aria-hidden="true">←</span> Actor
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
.musician-hero {
  position: relative;
  min-height: 100vh;
  min-height: 100svh;
}

.musician-hero img,
.musician-hero__fallback {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.musician-hero img {
  animation: hero-drift-musician 14s var(--ease-out-soft) both;
}

@keyframes hero-drift-musician {
  from {
    transform: scale(1.06);
  }

  to {
    transform: scale(1);
  }
}

.musician-hero__fallback {
  background:
    radial-gradient(
      ellipse 90% 60% at 30% 20%,
      color-mix(in oklab, var(--color-secondary) 20%, var(--color-surface)),
      transparent
    ),
    var(--surface-deep);
}

.musician-hero__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgb(24 14 4 / 0.72), rgb(24 14 4 / 0.06) 46%);
}

.musician-hero__content {
  position: absolute;
  right: 0;
  bottom: clamp(2rem, 7vh, 4.5rem);
  left: 0;
  padding: 1.5rem;
}

.musician-hero__title,
.musician-hero__caption {
  max-width: 90rem;
  margin: 0 auto;
  color: #fffdf2;
}

.musician-section-title {
  margin: 0;
  text-align: center;
  font-family: var(--font-heading);
  font-size: clamp(2.5rem, 6vw, 4.25rem);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: -0.01em;
}

.musician-hero__title {
  text-align: left;
  font-size: clamp(3.2rem, 9vw, 6.75rem);
  font-weight: 380;
  line-height: 0.98;
}

.musician-hero__caption {
  margin-top: 0.8rem;
  font-family: var(--font-heading);
  font-size: 0.78rem;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  opacity: 0.82;
}

.musician-intro {
  padding-block: 4.5rem 1rem;
}

.musician-awards,
.musician-highlights,
.musician-projects,
.musician-gallery {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  padding-block: 4.5rem;
}

.musician-gallery {
  background-image: linear-gradient(
    to bottom,
    transparent,
    var(--accent-wash) 18%,
    var(--accent-wash) 82%,
    transparent
  );
}

.musician-awards__text {
  max-width: 42rem;
  margin: 0 auto;
  font-size: 1.12rem;
  line-height: 1.75;
  text-align: center;
  color: color-mix(in oklab, var(--color-text), transparent 8%);
}

.musician-awards__pictures {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
  width: 100%;
  max-width: 56rem;
  margin: 0 auto;
}

.musician-awards__picture,
.musician-awards__fallback {
  display: block;
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border: 1px solid var(--color-border);
  background-color: var(--surface-deep);
  transition:
    transform 600ms var(--ease-out-soft),
    box-shadow 400ms ease;
}

.musician-awards__picture:hover,
.musician-awards__fallback:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lift);
}

.musician-video {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.musician-video--ruled {
  position: relative;
  padding-top: 3.5rem;
}

.musician-video--ruled::before {
  content: '';
  position: absolute;
  top: 0;
  right: 15%;
  left: 15%;
  height: 1px;
  background-image: linear-gradient(to right, transparent, var(--color-border), transparent);
}

.musician-video__description {
  max-width: 40rem;
  margin: 0 auto;
  font-size: 1.12rem;
  font-style: italic;
  text-align: center;
  color: color-mix(in oklab, var(--color-text), transparent 12%);
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

.gallery-grid__description {
  margin: 0.55rem 0 0;
  font-size: 0.95rem;
  text-align: center;
}

.musician-next {
  padding-block: 4.5rem 6rem;
  text-align: center;
}

.musician-next__link {
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

.musician-next__link span {
  display: inline-block;
  transition: transform 320ms var(--ease-out-soft);
}

.musician-next__link:hover,
.musician-next__link:focus-visible {
  color: var(--color-primary);
}

.musician-next__link:hover .musician-next__arrow,
.musician-next__link:focus-visible .musician-next__arrow {
  transform: translateX(-0.4em);
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
