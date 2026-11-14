import { expect, test } from '@playwright/test'

// Smoke tests: does the app load, render its main surface, and react to
// basic input? Everything here must be deterministic and offline — no
// AniList requests, no network mocking, no visual snapshots. When adding
// a feature, extend the relevant test instead of adding brittle selectors.

test('app renders the main workspace', async ({ page }) => {
  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(String(error)))

  await page.goto('/')
  await expect(page).toHaveTitle('qTopTrumps')
  await expect(page.getByRole('heading', { level: 1, name: 'qTopTrumps' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Pick a character' })).toBeVisible()
  await expect(page.getByText('Select a character to see its details')).toBeVisible()
  // The upload affordance is a styled <label> around a hidden file input,
  // not a <button> — assert the visible text instead of a button role.
  await expect(page.getByText('Upload image', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Download PNG' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Attributes', exact: true })).toBeVisible()

  expect(pageErrors, 'uncaught exceptions on load').toEqual([])
  await page.screenshot({ path: 'test-results/smoke-landing.png', fullPage: true })
})

test('card editor accepts input', async ({ page }) => {
  await page.goto('/')

  const nameField = page.getByLabel('Character name')
  await nameField.fill('Smoke Test')
  await expect(nameField).toHaveValue('Smoke Test')

  const powerField = page.getByLabel('Power', { exact: true })
  await powerField.fill('9')
  await expect(powerField).toHaveValue('9')

  // Six default attributes must render with their labels.
  for (const label of ['Age', 'Height', 'Weight', 'Bust Size', 'Cuteness']) {
    await expect(page.getByLabel(label, { exact: true })).toBeVisible()
  }
})
