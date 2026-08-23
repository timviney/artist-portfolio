<script lang="ts">
export interface LightboxImage {
  slug: string
  image?: string
  caption?: string
}
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import RichText from '@/components/RichText.vue'
import { stripInlineLinks } from '@/composables/richText'

const props = defineProps<{
  images: LightboxImage[]
  initialIndex: number
}>()

const emit = defineEmits<{ close: [] }>()

const dialogRef = ref<HTMLElement | null>(null)
const index = ref(Math.max(0, Math.min(props.initialIndex, props.images.length - 1)))
const current = computed(() => props.images[index.value])

function goToPrevious() {
  index.value = (index.value - 1 + props.images.length) % props.images.length
}

function goToNext() {
  index.value = (index.value + 1) % props.images.length
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
  else if (event.key === 'ArrowLeft') goToPrevious()
  else if (event.key === 'ArrowRight') goToNext()
}

function onOverlayClick(event: MouseEvent) {
  if (event.target === event.currentTarget) emit('close')
}

let previouslyFocused: HTMLElement | null = null

onMounted(() => {
  previouslyFocused = document.activeElement as HTMLElement | null
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', onKeydown)
  dialogRef.value?.focus()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
  previouslyFocused?.focus()
})
</script>

<template>
  <Teleport to="body">
    <div
      ref="dialogRef"
      class="image-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      tabindex="-1"
      @click="onOverlayClick"
    >
      <button
        type="button"
        class="image-lightbox__button image-lightbox__close"
        aria-label="Close"
        @click="emit('close')"
      >
        ×
      </button>

      <button
        v-if="images.length > 1"
        type="button"
        class="image-lightbox__button image-lightbox__nav image-lightbox__nav--prev"
        aria-label="Previous image"
        @click="goToPrevious"
      >
        ‹
      </button>

      <figure class="image-lightbox__figure">
        <img
          v-if="current?.image"
          :key="current.slug"
          :src="current.image"
          :alt="stripInlineLinks(current.caption ?? '')"
        />
        <div v-else class="image-lightbox__fallback" aria-hidden="true"></div>
        <figcaption class="image-lightbox__caption">
          <RichText v-if="current?.caption" :text="current.caption" class="image-lightbox__text" />
          <span v-if="images.length > 1" class="image-lightbox__counter" aria-live="polite">
            {{ index + 1 }} / {{ images.length }}
          </span>
        </figcaption>
      </figure>

      <button
        v-if="images.length > 1"
        type="button"
        class="image-lightbox__button image-lightbox__nav image-lightbox__nav--next"
        aria-label="Next image"
        @click="goToNext"
      >
        ›
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
.image-lightbox {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3.5rem 4.5rem;
  background-color: rgb(24 14 4 / 92%);
}

.image-lightbox:focus {
  outline: none;
}

.image-lightbox__button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid rgb(255 255 255 / 40%);
  border-radius: 9999px;
  background: none;
  color: #fffdf2;
  font-size: 1.75rem;
  line-height: 1;
  cursor: pointer;
  transition:
    border-color 180ms ease,
    transform 220ms var(--ease-out-soft);
}

.image-lightbox__button:hover,
.image-lightbox__button:focus-visible {
  border-color: #fffdf2;
}

.image-lightbox__button:not(.image-lightbox__nav):hover,
.image-lightbox__button:not(.image-lightbox__nav):focus-visible {
  transform: scale(1.06);
}

.image-lightbox__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.image-lightbox__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.image-lightbox__nav--prev {
  left: 1rem;
}

.image-lightbox__nav--next {
  right: 1rem;
}

.image-lightbox__figure {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
  max-width: min(90vw, 60rem);
  margin: 0;
}

.image-lightbox__figure img {
  display: block;
  max-width: 100%;
  max-height: 78vh;
  object-fit: contain;
}

.image-lightbox__fallback {
  width: min(70vw, 36rem);
  aspect-ratio: 3 / 4;
  border: 1px solid rgb(255 255 255 / 25%);
  background-color: rgb(255 255 255 / 8%);
}

.image-lightbox__caption {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: #fffdf2;
  font-style: italic;
  text-align: center;
}

.image-lightbox__counter {
  font-family: var(--font-heading);
  font-size: 0.72rem;
  font-style: normal;
  letter-spacing: 0.3em;
  opacity: 0.7;
}

@media (max-width: 640px) {
  .image-lightbox {
    padding: 3.5rem 3.25rem;
  }

  .image-lightbox__button {
    width: 2.25rem;
    height: 2.25rem;
  }
}
</style>
