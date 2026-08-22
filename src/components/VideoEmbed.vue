<script setup lang="ts">
import { computed } from 'vue'

import { toEmbedUrl } from '@/composables/video'

const props = defineProps<{ videoUrl?: string; title?: string }>()

const embedUrl = computed(() => toEmbedUrl(props.videoUrl))
</script>

<template>
  <div v-if="embedUrl" class="video-embed">
    <iframe
      :src="embedUrl"
      :title="title ?? 'Embedded video'"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
    ></iframe>
  </div>
</template>

<style scoped>
.video-embed {
  position: relative;
  aspect-ratio: 16 / 9;
  background-color: var(--color-ink);
}

.video-embed iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
