/**
 * Navigation catalogue → formation → leçon
 * Le catalogue est désormais sur /explorer (et non plus sur /).
 * Le bouton retour pointe vers /explorer.
 * Les libellés de type leçon utilisent vue-i18n (traduits selon locale).
 *
 * Formation de référence pour l'exercice JS : js-debutant/reprise-javascript/exo-total-ventes (lang: js)
 * Formation de référence pour une leçon normale : parcours-python/bases/intro
 */
import { test, expect } from '@playwright/test'

test.describe('Navigation catalogue → formation → leçon', () => {

  test('cliquer une carte depuis /explorer mène à /f/...', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('locale', 'fr'))
    await page.goto('/explorer')
    await expect(page.locator('.track-section').first()).toBeVisible({ timeout: 15_000 })

    // Cliquer la première carte visible
    const firstCard = page.locator('.card').first()
    await firstCard.click()

    // L'URL doit changer vers /f/...
    await expect(page).toHaveURL(/\/f\/[\w-]+/, { timeout: 10_000 })
  })

  test('la page formation affiche les modules et leçons', async ({ page }) => {
    await page.goto('/f/parcours-python')
    // On doit voir le menu latéral avec la liste des modules
    await expect(page.locator('.toc')).toBeVisible({ timeout: 15_000 })
    // Vérifier qu'on est bien sur la bonne URL
    expect(page.url()).toContain('/f/parcours-python')
  })

  test('la page leçon affiche le bouton "← Toutes les formations" pointant vers /explorer', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('locale', 'fr'))
    await page.goto('/f/parcours-python/bases/intro')

    // Attendre le chargement de la leçon
    await expect(page.locator('article')).toBeVisible({ timeout: 15_000 })

    // Le lien retour dans .toc doit pointer vers /explorer
    const backLink = page.locator('a.back[href="/explorer"]')
    await expect(backLink).toBeVisible()
    const backText = await backLink.innerText()
    // La clé i18n common.backToCourses = "← Toutes les formations"
    expect(backText).toContain('Toutes les formations')
  })

  test('ouvrir une leçon depuis une formation affiche le contenu de la leçon', async ({ page }) => {
    await page.goto('/f/parcours-python/bases/intro')

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
    expect(page.url()).not.toContain('variables-types')
  })

  test('le badge de type de leçon est bien traduit selon la locale active', async ({ page }) => {
    // EN locale
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('locale', 'en'))
    await page.goto('/f/parcours-python/bases/intro')
    await expect(page.locator('article')).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('.tag')).toContainText('Lesson')

    // FR locale
    await page.evaluate(() => localStorage.setItem('locale', 'fr'))
    await page.goto('/f/parcours-python/bases/intro')
    await expect(page.locator('article')).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('.tag')).toContainText('Leçon')
  })

  test('la page d\'un exercice JS affiche le label "Exercice" et le player', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('locale', 'fr'))
    // Exercice JS dans js-debutant (importé et disponible)
    await page.goto('/f/js-debutant/reprise-javascript/exo-total-ventes')
    await expect(page.locator('article')).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('.tag')).toContainText('Exercice')
    // L'ExercisePlayer doit être présent
    await expect(page.locator('.exo')).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('button', { hasText: '▶ Lancer les tests' })).toBeVisible()
  })

  test('en anglais, le bouton retour affiche "All courses"', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('locale', 'en'))
    await page.goto('/f/parcours-python/bases/intro')
    await expect(page.locator('article')).toBeVisible({ timeout: 15_000 })

    // Le lien retour doit afficher la version anglaise
    const backLink = page.locator('a.back[href="/explorer"]')
    await expect(backLink).toBeVisible()
    const backText = await backLink.innerText()
    // La clé i18n common.backToCourses = "← All courses" en EN
    expect(backText).toContain('All courses')
  })
})
