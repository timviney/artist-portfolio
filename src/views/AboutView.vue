<script setup lang="ts">
import { useAboutPage } from '@/composables/content'

const page = useAboutPage()
</script>

<template>
  <section class="page about">
    <h1 class="about-title">{{ page.aboutHeading }}</h1>

    <div class="about-body">
      <div class="about-portrait">
        <img v-if="page.portraitImage" :src="page.portraitImage" alt="" />
        <div v-else class="about-portrait__fallback" aria-hidden="true"></div>
      </div>

      <div class="about-bio">
        <p v-for="(paragraph, index) in page.bioParagraphs" :key="index">{{ paragraph }}</p>
      </div>
    </div>

    <blockquote v-if="page.statement" class="about-statement">{{ page.statement }}</blockquote>
  </section>
</template>

<style scoped>
.about {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.about-title {
  margin: 0;
  text-align: center;
  font-family: var(--font-heading);
  font-size: clamp(2.25rem, 6vw, 3.5rem);
}

.about-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
}

.about-portrait {
  flex-shrink: 0;
  width: 100%;
  max-width: 22rem;
}

.about-portrait img,
.about-portrait__fallback {
  display: block;
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
}

.about-bio {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 44rem;
}

.about-bio p {
  margin: 0;
}

.about-statement {
  max-width: 44rem;
  margin: 0 auto;
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-style: italic;
  text-align: center;
}

@media (min-width: 640px) {
  .about-body {
    flex-direction: row;
    align-items: flex-start;
    justify-content: center;
    gap: 3rem;
  }

  .about-portrait {
    width: 22rem;
  }

  .about-statement {
    border-top: 1px solid var(--color-border);
    padding-top: 2rem;
  }
}
</style>
