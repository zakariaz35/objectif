import { test, expect } from '@playwright/test'

test('la page /suivi/etat affiche le rapport et le bouton copier', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('locale', 'fr'))
  await page.goto('/suivi/etat')
  await expect(page.getByRole('heading', { name: /État du plan/ })).toBeVisible({ timeout: 15_000 })
  await expect(page.locator('.json code')).toContainText('"jalons"')
  await expect(page.getByRole('button', { name: 'Copier le JSON' })).toBeVisible()
})

test("une URL inconnue redirige vers l'accueil (pas de page blanche)", async ({ page }) => {
  await page.goto('/nimporte-quoi-inexistant')
  await expect(page).toHaveURL(/\/$/, { timeout: 10_000 })
})
