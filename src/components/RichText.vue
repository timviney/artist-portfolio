<script setup lang="ts">
import { computed } from 'vue'

import { renderInlineLinks } from '@/composables/richText'

const props = defineProps<{
  text?: string
}>()

const html = computed(() => (props.text ? renderInlineLinks(props.text) : ''))
</script>

<template>
  <span v-if="html" class="rich-text" v-html="html"></span>
</template>

<style scoped>
.rich-text :deep(a) {
  color: inherit;
  text-decoration: underline;
  text-decoration-color: color-mix(in oklab, currentColor 45%, transparent);
  text-underline-offset: 0.18em;
}

.rich-text :deep(a:hover),
.rich-text :deep(a:focus-visible) {
  text-decoration-color: currentColor;
}
</style>
