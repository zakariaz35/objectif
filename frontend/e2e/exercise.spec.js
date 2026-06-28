import { test, expect } from '@playwright/test'

// Exercice TypeScript interactif : parcours-sql / interroger / exo-filtrer-ts
// - starter : fonction filterAndSort qui retourne [] (tests KO)
// - correction : implémentation complète (tous les tests passent)

const FORMATION = 'parcours-sql'
const MODULE = 'interroger'
const LESSON = 'exo-filtrer-ts'

const CORRECTION_CODE = `interface Order {
  orderId: number
  region: string
  category: string
  amount: number | null
}

function filterAndSort(orders: Order[], filterRegion: string, minAmount: number): Order[] {
  return orders
    .filter(
      (o) =>
        o.region === filterRegion &&
        o.amount !== null &&
        o.amount !== undefined &&
        o.amount >= minAmount,
    )
    .sort((a, b) => (b.amount as number) - (a.amount as number))
}
`

test.describe('Exercice interactif TypeScript (parcours-sql)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/f/${FORMATION}/${MODULE}/${LESSON}`)
    // Attendre que la page soit chargée et l'exercice visible
    await expect(page.locator('.exo')).toBeVisible({ timeout: 20_000 })
  })

  test('les boutons de l\'exercice sont présents', async ({ page }) => {
    await expect(page.locator('button', { hasText: '▶ Lancer les tests' })).toBeVisible()
    await expect(page.locator('button', { hasText: '↻ Réinitialiser' })).toBeVisible()
    // Badge de langage
    await expect(page.locator('.exo .lang')).toContainText('ts')
  })

  test('lancer les tests avec le code starter → des résultats de test s\'affichent', async ({ page }) => {
    const runBtn = page.locator('button', { hasText: '▶ Lancer les tests' })
    await runBtn.click()

    // Attendre que les résultats apparaissent
    await expect(page.locator('.tests li').first()).toBeVisible({ timeout: 15_000 })

    const testItems = page.locator('.tests li')
    const count = await testItems.count()
    expect(count, 'Au moins un résultat de test doit s\'afficher').toBeGreaterThan(0)

    // Avec le code starter (return []), tous les tests devraient être KO
    const koItems = page.locator('.tests li.ko')
    const koCount = await koItems.count()
    expect(koCount, 'Le starter devrait avoir des tests KO').toBeGreaterThan(0)
  })

  test('BONUS : injecter la solution correcte → bandeau « Tous les tests passent »', async ({ page }) => {
    // Remplir l'éditeur avec la correction (fill remplace tout le contenu)
    const editor = page.locator('.exo .editor')
    await editor.fill(CORRECTION_CODE)

    // Lancer les tests
    const runBtn = page.locator('button', { hasText: '▶ Lancer les tests' })
    await runBtn.click()

    // Attendre les résultats
    await expect(page.locator('.tests li').first()).toBeVisible({ timeout: 15_000 })

    // Vérifier le bandeau de succès
    const banner = page.locator('.banner')
    await expect(banner).toBeVisible({ timeout: 10_000 })
    const bannerText = await banner.innerText()
    expect(bannerText).toContain('Tous les tests passent')

    // Tous les tests doivent être OK
    const okItems = page.locator('.tests li.ok')
    const koItems = page.locator('.tests li.ko')
    const okCount = await okItems.count()
    const koCount = await koItems.count()
    expect(okCount, 'Tous les tests doivent passer').toBeGreaterThan(0)
    expect(koCount, 'Aucun test ne doit échouer').toBe(0)
  })
})
