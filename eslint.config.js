import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'

export default defineConfigWithVueTs(
  {
    files: ['**/*.{ts,mts,tsx,vue}'],
  },
  globalIgnores(['dist/', 'node_modules/', 'playwright-report/', 'test-results/']),
  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
)
