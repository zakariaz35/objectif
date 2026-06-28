import { test, expect } from '@playwright/test'

test.describe('Navigation catalogue → formation → leçon', () => {

  test('cliquer une carte depuis le catalogue mène à /f/...', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.track-section').first()).toBeVisible({ timeout: 15_000 })

    // Cliquer la première carte du cursus Data-Analyst
    const firstCard = page.locator('.track-section').first().locator('.card').first()
    const cardTitle = await firstCard.locator('h3').innerText()
    await firstCard.click()

    // L'URL doit changer vers /f/...
    await expect(page).toHaveURL(/\/f\/[\w-]+/, { timeout: 10_000 })
  })

  test('la page formation affiche les modules et leçons', async ({ page }) => {
    await page.goto('/f/parcours-python')
    // On doit voir le titre de la formation ou des modules
    // La FormationView affiche une liste de modules
    await expect(page.locator('h1, h2, h3').first()).toBeVisible({ timeout: 15_000 })
    // Vérifier qu'on est bien sur la bonne URL
    expect(page.url()).toContain('/f/parcours-python')
  })

  test('ouvrir une leçon depuis une formation affiche le contenu de la leçon', async ({ page }) => {
    // Navigation directe vers une leçon connue
    await page.goto('/f/parcours-python/bases/intro')

    // Attendre le chargement de la leçon
    await expect(page.locator('article')).toBeVisible({ timeout: 15_000 })

    // Le fil d'Ariane (crumbs) doit être présent
    await expect(page.locator('.crumbs')).toBeVisible()
    const crumbsText = await page.locator('.crumbs').innerText()
    expect(crumbsText.toLowerCase()).toContain('python')

    // Le titre h1 de l'en-tête de leçon doit être présent (.head h1)
    await expect(page.locator('.head h1')).toBeVisible()

    // Le badge de type de leçon doit être affiché
    await expect(page.locator('.tag')).toBeVisible()

    // Les boutons de navigation (pager) doivent être présents
    await expect(page.locator('.pager')).toBeVisible()
  })

  test('la navigation prev/next entre leçons fonctionne', async ({ page }) => {
    await page.goto('/f/parcours-python/bases/variables-types')
    await expect(page.locator('article')).toBeVisible({ timeout: 15_000 })

    // Vérifier que le bouton "next" est actif (pas désactivé)
    const nextBtn = page.locator('.pager .next')
    await expect(nextBtn).toBeVisible()
    const isDisabled = await nextBtn.isDisabled()
    expect(isDisabled, 'Le bouton suivant doit être actif').toBe(false)

    // Cliquer "suivant" et vérifier le changement d'URL
    await nextBtn.click()
    await expect(page).toHaveURL(/\/f\/parcours-python\/bases\//, { timeout: 10_000 })
    // L'URL doit avoir changé
    expect(page.url()).not.toContain('variables-types')
  })

  test('la page d\'une leçon affiche le label de type correct', async ({ page }) => {
    // Leçon normale
    await page.goto('/f/parcours-python/bases/intro')
    await expect(page.locator('article')).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('.tag')).toContainText('Leçon')
  })

  test('la page d\'un exercice interactif TypeScript affiche le label "Exercice" et le player', async ({ page }) => {
    // Exercice interactif TypeScript (parcours-sql) — le seul type avec .exo visible
    await page.goto('/f/parcours-sql/interroger/exo-filtrer-ts')
    await expect(page.locator('article')).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('.tag')).toContainText('Exercice')
    // L'ExercisePlayer doit être présent
    await expect(page.locator('.exo')).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('button', { hasText: '▶ Lancer les tests' })).toBeVisible()
  })
})
