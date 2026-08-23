import type { CSSProperties } from 'vue'

import type { ImageFocus } from '@/composables/content/types'

/**
 * Inline object-position for a cover-cropped image from CMS focus values.
 * Missing axes (or no focus at all) stay browser-centred.
 */
export function objectPositionStyle(focus?: ImageFocus): CSSProperties | undefined {
  if (!focus) return undefined
  return { objectPosition: `${focus.x ?? 50}% ${focus.y ?? 50}%` }
}
