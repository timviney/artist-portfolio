<script setup lang="ts">
import { useHomePage, useSiteSettings } from '@/composables/content'

const settings = useSiteSettings()
const home = useHomePage()

const tiles = [
  { to: '/actor', label: 'Actor', image: home.actorHeadshot },
  { to: '/musician', label: 'Musician', image: home.musicianHeadshot },
]
</script>

<template>
  <section class="page home">
    <header class="home__intro">
      <h1 class="home__name">{{ settings.name }}</h1>
      <p v-if="settings.tagline" class="home__tagline">{{ settings.tagline }}</p>
    </header>

    <div class="home__tiles">
      <RouterLink v-for="tile in tiles" :key="tile.to" :to="tile.to" class="home__tile">
        <img
          v-if="tile.image"
          class="home__tile-image"
          :src="tile.image"
          :alt="`${tile.label} headshot`"
        />
        <div v-else class="home__tile-fallback" aria-hidden="true"></div>
        <span class="home__tile-label">{{ tile.label }}</span>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.home__intro {
  text-align: center;
}

.home__name {
  margin: 0;
  font-family: var(--font-heading);
  font-size: clamp(2rem, 5vw, 3rem);
  color: var(--color-text);
}

.home__tagline {
  margin: 0.5rem 0 0;
  font-size: 1.1rem;
  color: var(--color-text);
}

.home__tiles {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
  width: 100%;
  align-self: center;
}

.home__tile {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--color-text);
}

.home__tile-image,
.home__tile-fallback {
  display: block;
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
}

.home__tile-label {
  font-family: var(--font-heading);
  font-size: 1.4rem;
  text-align: center;
}

.home__tile:hover .home__tile-label,
.home__tile:focus-visible .home__tile-label {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 0.3em;
}
</style>
