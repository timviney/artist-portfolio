import { expect, test } from '@playwright/test'

test('home page loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Artist Portfolio/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Max Rivera')
})

test('navigation reaches all placeholder pages', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'About Me' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('About Me')
  await page.getByRole('link', { name: 'Contact' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Contact')
})
