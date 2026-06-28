import { test, expect } from '@playwright/test'

// Exercice Python interactif : parcours-python / collections / exo-revenue-by-category
// Validation cle : Pyodide execute le code Python dans le navigateur et valide les tests.

const FORMATION = 'parcours-python'
const MODULE = 'collections'
const LESSON = 'exo-revenue-by-category'

const CORRECTION_CODE = `def revenue_by_category(rows):
    totals = {}
    for row in rows:
        category = row["category"]
        totals[category] = totals.get(category, 0) + row["amount"]
    return totals
`

test.describe('Exercice Python interactif (parcours-python / collections)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/f/${FORMATION}/${MODULE}/${LESSON}`)
    // Attendre que l'exercice soit visible — pas besoin de timeout Pyodide ici,
    // le rendu du composant est rapide.
    await expect(page.locator('.exo')).toBeVisible({ timeout: 20_000 })
  })

  test("les elements de l'exercice Python sont presents (editeur, boutons, badge py)", async ({ page }) => {
    // Badge de langage
    await expect(page.locator('.exo .lang')).toContainText('python')
    // Bouton principal
    await expect(page.locator('button', { hasText: '▶ Lancer les tests' })).toBeVisible()
    // Bouton reset
    await expect(page.locator('button', { hasText: '↻ Réinitialiser' })).toBeVisible()
    // L'editeur contient le starter (TODO)
    const editor = page.locator('.exo .editor')
    await expect(editor).toBeVisible()
    const starterCode = await editor.inputValue()
    expect(starterCode, 'Le starter doit contenir "TODO"').toContain('TODO')
  })

  test('lancer les tests avec le starter Python → resultats KO affiches', async ({ page }) => {
    // Timeout etendu : 1er chargement Pyodide peut prendre ~60-120s
    test.setTimeout(180_000)

    const runBtn = page.locator('button', { hasText: '▶ Lancer les tests' })
    await runBtn.click()

    // Attendre la fin de l'execution Pyodide (le bouton redevient cliquable)
    await expect(runBtn).toBeEnabled({ timeout: 120_000 })

    // Des resultats de tests doivent apparaitre
    await expect(page.locator('.tests li').first()).toBeVisible({ timeout: 15_000 })
    const count = await page.locator('.tests li').count()
    expect(count, 'Au moins un resultat de test doit apparaitre').toBeGreaterThan(0)

    // Avec le starter (return {}), certains tests peuvent passer (liste vide OK),
    // mais au moins un doit echouer.
    const koItems = page.locator('.tests li.ko')
    const koCount = await koItems.count()
    expect(koCount, 'Le starter doit avoir au moins un test KO').toBeGreaterThan(0)
  })

  // TEST CLE : exercice Python valide au vert via Pyodide
  test('VALIDATION PYTHON : injecter la correction → bandeau vert "Tous les tests passent"', async ({ page }) => {
    test.setTimeout(180_000)

    // Injecter la correction dans l'editeur
    const editor = page.locator('.exo .editor')
    await editor.fill(CORRECTION_CODE)

    // Lancer les tests
    const runBtn = page.locator('button', { hasText: '▶ Lancer les tests' })
    await runBtn.click()

    // Attendre la fin de l'execution Pyodide (timeout genereux : 1er chargement WASM)
    await expect(runBtn).toBeEnabled({ timeout: 120_000 })

    // Attendre et verifier le bandeau vert de succes
    const banner = page.locator('.banner')
    await expect(banner).toBeVisible({ timeout: 30_000 })
    const bannerText = await banner.innerText()
    expect(bannerText, 'Le bandeau doit signaler le succes').toContain('Tous les tests passent')

    // Tous les tests sont OK, aucun KO
    await expect(page.locator('.tests li').first()).toBeVisible({ timeout: 10_000 })
    const okCount = await page.locator('.tests li.ok').count()
    const koCount = await page.locator('.tests li.ko').count()
    expect(okCount, 'Tous les tests doivent etre OK').toBeGreaterThan(0)
    expect(koCount, 'Aucun test ne doit etre KO').toBe(0)
  })
})
