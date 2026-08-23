<script setup lang="ts">
import { motion } from 'motion-v'

import { useHomePage, useSiteSettings } from '@/composables/content'
import { objectPositionStyle } from '@/composables/imageFocus'

const settings = useSiteSettings()
const home = useHomePage()

const tiles = [
  {
    to: '/actor',
    kind: 'actor',
    label: 'Actor',
    image: home.actorHeadshot,
    focus: home.actorHeadshotFocus,
  },
  {
    to: '/musician',
    kind: 'musician',
    label: 'Musician',
    image: home.musicianHeadshot,
    focus: home.musicianHeadshotFocus,
  },
]

const easeSoft = [0.22, 1, 0.36, 1] as const
</script>

<template>
  <section class="page home">
    <motion.header
      class="home__intro"
      :initial="{ opacity: 0, y: 28 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.8, ease: easeSoft }"
    >
      <p v-if="settings.tagline" class="home__tagline">{{ settings.tagline }}</p>
    </motion.header>

    <div class="home__tiles">
      <RouterLink
        v-for="(tile, index) in tiles"
        :key="tile.to"
        :to="tile.to"
        :class="['home__tile', `home__tile--${tile.kind}`]"
        tabindex="0"
      >
        <motion.span
          class="home__tile-frame"
          :initial="{ opacity: 0, y: 32 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.85, delay: 0.25 + index * 0.18, ease: easeSoft }"
        >
          <img
            v-if="tile.image"
            class="home__tile-image"
            :style="objectPositionStyle(tile.focus)"
            :src="tile.image"
            :alt="`${tile.label} headshot`"
          />
          <span v-else class="home__tile-fallback" aria-hidden="true"></span>
          <span class="home__tile-inner-frame" aria-hidden="true"></span>
          <span class="home__tile-label">
            {{ tile.label }}
            <span class="home__tile-arrow" aria-hidden="true">→</span>
          </span>
        </motion.span>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
}

.home__intro {
  text-align: center;
}

.home__tagline {
  margin: 0 0 1.1rem;
  color: var(--color-secondary);
  font-family: var(--font-heading);
  font-size: 0.58rem;
  font-weight: 500;
  letter-spacing: 0.34em;
  text-transform: uppercase;
}

.home__name {
  margin: 0;
  font-family: var(--font-heading);
  font-size: clamp(1.2rem, 3vw, 3rem);
  font-weight: 360;
  line-height: 0.98;
  letter-spacing: -0.02em;
}

.home__ornament {
  display: block;
  width: 5.5rem;
  height: 3px;
  margin: 1.9rem auto 0;
  border-top: 1px solid var(--color-secondary);
  border-bottom: 1px solid var(--color-secondary);
}

.home__tiles {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
  width: 100%;
  align-self: center;
}

.home__tile {
  display: block;
  text-decoration: none;
}

.home__tile-frame {
  position: relative;
  display: block;
  overflow: hidden;
  aspect-ratio: 3 / 4;
}

.home__tile-image,
.home__tile-fallback {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: var(--surface-deep);
  transform: scale(1.001);
  transition: transform 900ms var(--ease-out-soft);
}

.home__tile:hover .home__tile-image,
.home__tile:focus-visible .home__tile-image {
  transform: scale(1.045);
}

.home__tile-fallback {
  background-image: linear-gradient(
    160deg,
    var(--surface-deep),
    color-mix(in oklab, var(--color-primary) 16%, var(--color-surface))
  );
}

.home__tile-frame::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgb(24 14 4 / 0.68), rgb(24 14 4 / 0.08) 52%);
}

.home__tile-inner-frame {
  position: absolute;
  inset: 0.85rem;
  z-index: 1;
  border: 1px solid rgb(253 251 212 / 0.38);
  pointer-events: none;
  transition: border-color 300ms ease;
}

.home__tile:hover .home__tile-inner-frame,
.home__tile:focus-visible .home__tile-inner-frame {
  border-color: rgb(253 251 212 / 0.75);
}

.home__tile-label {
  position: absolute;
  top: 1.7rem;
  z-index: 1;
  display: flex;
  gap: 0.45em;
  align-items: baseline;
  font-family: var(--font-heading);
  font-size: clamp(2rem, 3.6vw, 3rem);
  font-weight: 400;
  color: #fffdf2;
}

.home__tile--actor .home__tile-label {
  left: 2rem;
}

.home__tile--musician .home__tile-label {
  right: 2rem;
}

.home__tile-arrow {
  display: inline-block;
  font-size: 0.72em;
  transform: translateX(0);
  transition: transform 320ms var(--ease-out-soft);
}

.home__tile:hover .home__tile-arrow,
.home__tile:focus-visible .home__tile-arrow {
  transform: translateX(0.45em);
}

/* Desktop: size tiles from the viewport height so they fill the screen
   without scrolling. Tile width derives from the height budget
   (aspect-ratio 3/4 => width = available height * 0.75), floored for
   readability and capped so two tiles always fit side by side. */
@media (min-width: 641px) {
  .home {
    min-height: calc(100svh - 9.5rem);
    justify-content: center;
    gap: 1rem;
  }

  .home__tiles {
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }

  .home__tile {
    width: clamp(10rem, calc((100svh - 13.5rem) * 0.75), 47%);
  }
}

@media (max-width: 640px) {
  .home__tiles {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .home__tile--actor .home__tile-label {
    left: 1.25rem;
  }

  .home__tile--musician .home__tile-label {
    right: 1.25rem;
  }
}
</style>
