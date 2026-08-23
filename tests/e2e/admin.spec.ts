import { expect, test } from '@playwright/test'

test.describe('Sveltia CMS admin', () => {
  test('/admin serves the CMS shell', async ({ page }) => {
    const response = await page.goto('/admin/')
    expect(response?.status()).toBe(200)

    const script = page.locator('script[src*="sveltia-cms"]')
    await expect(script).toHaveCount(1)
  })

  test('/admin/config.yml is served', async ({ request }) => {
    const response = await request.get('/admin/config.yml')
    expect(response.status()).toBe(200)
    expect(await response.text()).toContain('collections:')
  })
})
