import { describe, expect, it } from 'vitest'

import router from '../index'

describe('router', () => {
  it('defines routes for all four pages', () => {
    const paths = router.getRoutes().map((route) => route.path)
    expect(paths).toEqual(expect.arrayContaining(['/', '/gallery', '/about', '/contact']))
  })

  it('navigates to the home route by default', async () => {
    await router.push('/')
    await router.isReady()
    expect(router.currentRoute.value.name).toBe('home')
  })
})
