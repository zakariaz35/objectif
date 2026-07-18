/**
 * FABs (boutons flottants) selon le stack de la formation.
 * Seules les formations importées sont testées :
 *   - Python/pandas (parcours-python) → FAB 🐍
 *   - JavaScript (js-debutant) → FAB ⌗ (JS)
 *   - Anglais (test-anglais-placement) → aucun FAB
 * Note : parcours-vuejs, parcours-excel, parcours-sql ne sont pas importés dans cette instance.
 */
import { test, expect } from '@playwright/test'

test.describe('FABs (boutons flottants) selon le stack de la formation', () => {

  test('parcours-python (stack Python/pandas) : FAB 🐍 visible, FAB Vue absent', async ({ page }) => {
    await page.goto('/f/parcours-python')
    // Attendre que la page soit chargée (menu latéral = .toc)
    await expect(page.locator('.toc')).toBeVisible({ timeout: 15_000 })

    await expect(page.locator('.fab-py')).toBeVisible()
    await expect(page.locator('.fab-vue')).not.toBeVisible()
  })

  test('js-debutant (stack JavaScript) : FAB ⌗ visible, FAB 🐍 absent', async ({ page }) => {
    await page.goto('/f/js-debutant')
    await expect(page.locator('.toc')).toBeVisible({ timeout: 15_000 })

    // Le FAB JS (⌗) doit être visible
    const jsFab = page.locator('button.fab:not(.fab-py):not(.fab-vue)')
    await expect(jsFab).toBeVisible()
    await expect(page.locator('.fab-py')).not.toBeVisible()
    await expect(page.locator('.fab-vue')).not.toBeVisible()
  })

  test('test-anglais-placement (stack Anglais) : aucun FAB visible', async ({ page }) => {
    await page.goto('/f/test-anglais-placement')
    await expect(page.locator('.toc')).toBeVisible({ timeout: 15_000 })

    await expect(page.locator('.fab-py')).not.toBeVisible()
    await expect(page.locator('.fab-vue')).not.toBeVisible()
    const allFabs = page.locator('button.fab')
    const count = await allFabs.count()
    expect(count, 'Aucun FAB ne devrait être visible sur test-anglais-placement (stack Anglais)').toBe(0)
  })
})
