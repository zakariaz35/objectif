import { test, expect } from '@playwright/test'

test.describe('FABs (boutons flottants) selon le stack de la formation', () => {

  test('parcours-python : FAB 🐍 visible, FAB Vue et ⌗ absents', async ({ page }) => {
    await page.goto('/f/parcours-python')
    // Attendre que la page soit chargée
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15_000 })

    await expect(page.locator('.fab-py')).toBeVisible()
    await expect(page.locator('.fab-vue')).not.toBeVisible()
    // Le FAB JS (⌗) ne doit pas être visible non plus
    // .fab sans autre classe = le FAB JS ; on vérifie via :not(.fab-py):not(.fab-vue)
    // Mais on peut aussi vérifier via text
    const jsFab = page.locator('button.fab').filter({ hasNotText: '🐍' }).filter({ hasNotText: 'Vue' })
    await expect(jsFab).not.toBeVisible()
  })

  test('parcours-vuejs : FAB Vue visible, FAB ⌗ visible, FAB 🐍 absent', async ({ page }) => {
    await page.goto('/f/parcours-vuejs')
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15_000 })

    await expect(page.locator('.fab-vue')).toBeVisible()
    // Le FAB JS devrait aussi être visible sur un parcours Vue/JS
    await expect(page.locator('.fab-py')).not.toBeVisible()
  })

  test('parcours-excel : aucun FAB visible', async ({ page }) => {
    await page.goto('/f/parcours-excel')
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15_000 })

    await expect(page.locator('.fab-py')).not.toBeVisible()
    await expect(page.locator('.fab-vue')).not.toBeVisible()
    const allFabs = page.locator('button.fab')
    const count = await allFabs.count()
    expect(count, 'Aucun FAB ne devrait être visible sur parcours-excel').toBe(0)
  })
})
