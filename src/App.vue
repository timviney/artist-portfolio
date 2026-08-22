<script setup lang="ts">
import SiteFooter from '@/components/SiteFooter.vue'
import SiteHeader from '@/components/SiteHeader.vue'
import { themeToCssVariables, useActiveTheme } from '@/composables/theme'

const themeStyle = themeToCssVariables(useActiveTheme())
</script>

<template>
  <div class="app-shell" :style="themeStyle">
    <SiteHeader />

    <main class="site-main">
      <RouterView />
    </main>

    <SiteFooter />
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.site-main {
  flex: 1;
}
</style>
