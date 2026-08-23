<script setup lang="ts">
import { useAboutPage } from '@/composables/content'
import { objectPositionStyle } from '@/composables/imageFocus'

const page = useAboutPage()
</script>

<template>
  <section class="page about">
    <header class="about-head">
      <p class="eyebrow">{{ page.aboutEyebrow }}</p>
      <h1 class="about-title">{{ page.aboutHeading }}</h1>
    </header>

    <div class="about-body">
      <div class="about-portrait">
        <img
          v-if="page.portraitImage"
          :style="objectPositionStyle(page.portraitFocus)"
          :src="page.portraitImage"
          alt=""
        />
        <div v-else class="about-portrait__fallback" aria-hidden="true"></div>
      </div>

      <div class="about-bio">
        <p v-for="(paragraph, index) in page.bioParagraphs" :key="index">{{ paragraph }}</p>
      </div>
    </div>

    <blockquote v-if="page.statement" class="about-statement">
      {{ page.statement }}
    </blockquote>
  </section>
</template>

<style scoped>
.about {
  display: flex;
  flex-direction: column;
  gap: 3.5rem;
  padding-block: 5rem 6rem;
}

.about-head {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  text-align: center;
}

.about-title {
  margin: 0;
  font-family: var(--font-heading);
  font-size: clamp(2.75rem, 7vw, 5.25rem);
  font-weight: 380;
  line-height: 1;
  letter-spacing: -0.015em;
}

.about-body {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  align-items: center;
}

.about-portrait {
  position: relative;
  flex-shrink: 0;
  width: min(100%, 22rem);
}

.about-portrait::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translate(0.85rem, 0.85rem);
  border: 1px solid color-mix(in oklab, var(--color-secondary) 55%, transparent);
  pointer-events: none;
}

.about-portrait img,
.about-portrait__fallback {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border: 1px solid var(--color-border);
  background-color: var(--surface-deep);
}

.about-bio {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
  max-width: 38rem;
  font-size: 1.1rem;
  line-height: 1.78;
}

.about-bio p {
  margin: 0;
}

.about-statement {
  position: relative;
  max-width: 40rem;
  margin: 1rem auto 0;
  padding-top: 2.4rem;
  font-family: var(--font-heading);
  font-size: clamp(1.3rem, 2.6vw, 1.7rem);
  font-style: italic;
  font-weight: 340;
  line-height: 1.5;
  text-align: center;
  border-top: 1px solid var(--color-border);
}

.about-statement::before {
  content: '\201C';
  position: absolute;
  top: 0.65rem;
  left: 50%;
  transform: translateX(-50%);
  padding-inline: 0.9rem;
  background-color: var(--color-bg);
  color: var(--color-secondary);
  font-size: 2.6rem;
  font-style: normal;
  line-height: 1;
}

@media (min-width: 900px) {
  .about-body {
    flex-direction: row;
    align-items: flex-start;
    justify-content: center;
    gap: 4rem;
  }

  .about-bio {
    margin-top: 1.5rem;
  }
}
</style>
