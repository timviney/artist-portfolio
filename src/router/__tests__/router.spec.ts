import { describe, expect, it } from 'vitest'

import router from '../index'

describe('router', () => {
  it('defines routes for all five pages', () => {
    const paths = router.getRoutes().map((route) => route.path)
    expect(paths).toEqual(
      expect.arrayContaining(['/', '/actor', '/musician', '/about', '/contact']),
    )
  })

  it('does not define the removed gallery route', () => {
    expect(router.getRoutes().map((route) => route.path)).not.toContain('/gallery')
  })

  it('navigates to the home route by default', async () => {
    await router.push('/')
    await router.isReady()
    expect(router.currentRoute.value.name).toBe('home')
  })
})
