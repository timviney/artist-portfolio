<script setup lang="ts">
import { computed } from 'vue'

import { resolveSocialIconKind } from '@/composables/socialIcons'

const props = defineProps<{ url: string }>()

const kind = computed(() => resolveSocialIconKind(props.url))
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="kind === 'instagram'">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </template>

    <template v-else-if="kind === 'youtube'">
      <rect x="2.5" y="5.5" width="19" height="13" rx="3.5" />
      <path d="m10.4 9.3 4.4 2.7-4.4 2.7V9.3Z" fill="currentColor" stroke="none" />
    </template>

    <template v-else-if="kind === 'x'">
      <path d="M4.5 4.5 19.5 19.5M19.5 4.5 4.5 19.5" />
    </template>

    <template v-else-if="kind === 'facebook'">
      <path d="M14.8 4.5h-2a3.2 3.2 0 0 0-3.2 3.2v2.6H7.2v3h2.4v6.2h3v-6.2h2.5l.5-3h-3V8a.8.8 0 0 1 .8-.8h1.9l-.5-2.7Z" />
    </template>

    <template v-else-if="kind === 'tiktok'">
      <path d="M13.5 4.5v10.9a3.4 3.4 0 1 1-3.4-3.4" />
      <path d="M13.5 6.2c.6 1.9 2.1 3.2 4.5 3.4" />
    </template>

    <template v-else-if="kind === 'spotify'">
      <circle cx="12" cy="12" r="9" />
      <path d="M7.7 10.2c2.9-.9 5.8-.7 8.3.7" />
      <path d="M8.3 13c2.3-.7 4.6-.5 6.6.6" />
      <path d="M8.9 15.5c1.7-.5 3.4-.3 4.9.5" />
    </template>

    <template v-else-if="kind === 'spotlight'">
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5.5 20c.8-3.6 3.4-5.6 6.5-5.6s5.7 2 6.5 5.6" />
    </template>

    <template v-else>
      <path
        d="M10 13a5 5 0 0 0 7.54.54l2.83-2.83a5 5 0 0 0-7.07-7.07L11.75 5.2"
        transform="translate(0 1)"
      />
      <path
        d="M14 11a5 5 0 0 0-7.54-.54l-2.83 2.83a5 5 0 0 0 7.07 7.07L12.25 18.8"
        transform="translate(0 -1)"
      />
    </template>
  </svg>
</template>
