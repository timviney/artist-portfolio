<script setup lang="ts">
import { computed, ref } from 'vue'
import { A11y, Keyboard, Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'

import ImageLightbox from '@/components/ImageLightbox.vue'
import type { LightboxImage } from '@/components/ImageLightbox.vue'
import VideoEmbed from '@/components/VideoEmbed.vue'
import { useActorGallery, useActorPage, useActorVideos, useHeadshots } from '@/composables/content'

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
    </section>

    <section class="page actor-videos">
      <h2 class="actor-section-title">{{ page.actorHeading }}</h2>
      <article v-for="video in videos" :key="video.slug" class="actor-video">
        <VideoEmbed :video-url="video.videoUrl" :title="video.title" />
        <p v-if="video.description" class="actor-video__description">{{ video.description }}</p>
      </article>
    </section>

    <section class="page actor-gallery">
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
            <img :src="image.image" :alt="image.title" />
          </button>
          <div v-else class="gallery-grid__fallback" aria-hidden="true"></div>
          <p class="gallery-grid__title">{{ image.title }}</p>
        </li>
      </ul>
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

.actor-hero__fallback {
  background-color: var(--color-surface);
}

.actor-videos,
.actor-gallery {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.actor-section-title {
  margin: 0;
  text-align: center;
  font-family: var(--font-heading);
  font-size: clamp(2.25rem, 6vw, 3.5rem);
}

.actor-video {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.actor-video__description {
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

.gallery-grid__title {
  margin: 0.1rem 0 0;
  font-size: 1rem;
  text-align: center;
}

.headshot-swiper {
  width: 100%;
  max-width: 30rem;
  margin: 0 auto;
  border: 1px solid var(--color-border);
}

.headshot-slide img,
.headshot-slide__fallback {
  display: block;
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
}

.headshot-slide__fallback {
  background-color: var(--color-surface);
}

.actor-next {
  text-align: center;
}

.actor-next__link {
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
