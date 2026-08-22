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
    </section>

    <section class="page musician-intro">
      <h2 class="musician-section-title">{{ page.musicianHeading }}</h2>
      <p class="musician-intro__text">{{ page.intro }}</p>
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
      <article v-for="video in highlights" :key="video.slug" class="musician-video">
        <VideoEmbed :video-url="video.videoUrl" :title="video.title" />
        <p v-if="video.description" class="musician-video__description">{{ video.description }}</p>
      </article>
    </section>

    <section class="page musician-projects">
      <h2 class="musician-section-title">{{ page.projectsHeading }}</h2>
      <article v-for="video in projects" :key="video.slug" class="musician-video">
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
      <RouterLink to="/actor" class="musician-next__link"> Actor <span aria-hidden="true">→</span> </RouterLink>
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

.musician-hero__fallback {
  background-color: var(--color-surface);
}

.musician-intro,
.musician-awards,
.musician-highlights,
.musician-projects,
.musician-gallery {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.musician-section-title {
  margin: 0;
  text-align: center;
  font-family: var(--font-heading);
  font-size: clamp(2.25rem, 6vw, 3.5rem);
}

.musician-intro__text {
  max-width: 44rem;
  margin: 0 auto;
  font-size: 1.15rem;
  text-align: center;
}

.musician-awards__text {
  max-width: 44rem;
  margin: 0 auto;
  text-align: center;
}

.musician-awards__pictures {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem 0.5rem;
  width: 100%;
  max-width: 60rem;
  margin: 0 auto;
}

.musician-awards__picture,
.musician-awards__fallback {
  display: block;
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
}

.musician-video {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.musician-video__description {
  max-width: 44rem;
  margin: 0 auto;
  text-align: center;
}

.gallery-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem 0.5rem;
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

.gallery-grid__description {
  margin: 0.1rem 0 0;
  font-size: 1rem;
  text-align: center;
}

.musician-next {
  text-align: center;
}

.musician-next__link {
  font-family: var(--font-heading);
  font-size: 1.4rem;
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
