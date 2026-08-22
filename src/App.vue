<script setup lang="ts">
import { AnimatePresence, motion, MotionConfig } from 'motion-v'
import ScrollTop from 'primevue/scrolltop'
import { useRoute } from 'vue-router'

import SiteFooter from '@/components/SiteFooter.vue'
import SiteHeader from '@/components/SiteHeader.vue'
import { themeToCssVariables, useActiveTheme } from '@/composables/theme'

const themeStyle = themeToCssVariables(useActiveTheme())
const route = useRoute()

const easeSoft = [0.22, 1, 0.36, 1] as const
</script>

<template>
  <MotionConfig reduced-motion="user">
    <div class="app-shell" :style="themeStyle">
      <SiteHeader />

      <main class="site-main">
        <RouterView v-slot="{ Component }">
          <AnimatePresence mode="wait" :initial="false">
            <motion.div
              :key="route.fullPath"
              :initial="{ opacity: 0, y: 22 }"
              :animate="{ opacity: 1, y: 0, transition: { duration: 0.5, ease: easeSoft } }"
              :exit="{ opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }"
            >
              <component :is="Component" />
            </motion.div>
          </AnimatePresence>
        </RouterView>
      </main>

      <SiteFooter />

      <ScrollTop :threshold="600" />
    </div>
  </MotionConfig>
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
