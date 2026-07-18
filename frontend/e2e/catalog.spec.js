/**
 * Catalogue — désormais sur /explorer (et non plus sur /)
 * Données réelles de l'instance en cours :
 *   - Cursus "Anglais par les séries" : 3 formations
 *   - Cursus "Data-Analyst" : 2 formations (parcours-python, parcours-data-analyst)
 *   - "Autres formations" : 6 formations hors cursus (mission-demo-a, crash-course-fastapi, etc.)
 */
import { test, expect } from '@playwright/test'

test.describe('Catalogue — /explorer', () => {
  test.beforeEach(async ({ page }) => {
    // Locale FR stable pour tous les tests catalogue
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('locale', 'fr'))
    await page.goto('/explorer')
    // Attendre que le catalogue soit chargé (au moins une section)
    await expect(page.locator('.track-section').first()).toBeVisible({ timeout: 15_000 })
  })

  test('au moins deux sections de cursus existent dans le catalogue', async ({ page }) => {
    const sections = page.locator('.track-section')
    const count = await sections.count()
    expect(count, 'Le catalogue doit avoir au moins 2 sections').toBeGreaterThanOrEqual(2)
  })

  test('le cursus Data-Analyst est présent et contient des étapes numérotées', async ({ page }) => {
    const sections = page.locator('.track-section')
    const count = await sections.count()
    let dataAnalystSection = null
    for (let i = 0; i < count; i++) {
      const title = await sections.nth(i).locator('.track-head h2').innerText()
      if (title.toLowerCase().includes('data-analyst') || title.toLowerCase().includes('data analyst')) {
        dataAnalystSection = sections.nth(i)
        break
      }
    }
    expect(dataAnalystSection, 'Section cursus Data-Analyst introuvable').not.toBeNull()
    // Doit contenir au moins une carte avec un badge d'étape
    const firstStep = dataAnalystSection.locator('.step').first()
    await expect(firstStep).toContainText('Étape 1')
  })

  test('les cartes du cursus Data-Analyst ont des badges d\'étape dans l\'ordre croissant', async ({ page }) => {
    const sections = page.locator('.track-section')
    const count = await sections.count()
    let dataAnalystSection = null
    for (let i = 0; i < count; i++) {
      const title = await sections.nth(i).locator('.track-head h2').innerText()
      if (title.toLowerCase().includes('data-analyst') || title.toLowerCase().includes('data analyst')) {
        dataAnalystSection = sections.nth(i)
        break
      }
    }
    expect(dataAnalystSection).not.toBeNull()
    const steps = dataAnalystSection.locator('.step')
    const stepCount = await steps.count()
    for (let i = 0; i < stepCount; i++) {
      await expect(steps.nth(i)).toContainText(`Étape ${i + 1}`)
    }
  })

  test('le cursus Data-Analyst contient la formation Python', async ({ page }) => {
    const sections = page.locator('.track-section')
    const count = await sections.count()
    let dataAnalystSection = null
    for (let i = 0; i < count; i++) {
      const title = await sections.nth(i).locator('.track-head h2').innerText()
      if (title.toLowerCase().includes('data-analyst') || title.toLowerCase().includes('data analyst')) {
        dataAnalystSection = sections.nth(i)
        break
      }
    }
    expect(dataAnalystSection).not.toBeNull()
    const text = await dataAnalystSection.innerText()
    expect(text.toLowerCase()).toContain('python')
  })

  test('une section « Autres formations » existe', async ({ page }) => {
    const sections = page.locator('.track-section')
    const count = await sections.count()
    let found = false
    for (let i = 0; i < count; i++) {
      const title = await sections.nth(i).locator('.track-head h2').innerText()
      if (title === 'Autres formations') {
        found = true
        break
      }
    }
    expect(found, 'Section "Autres formations" introuvable').toBe(true)
  })

  test('la section « Autres formations » contient des formations non assignées à un cursus', async ({ page }) => {
    const sections = page.locator('.track-section')
    const count = await sections.count()
    let othersSection = null
    for (let i = 0; i < count; i++) {
      const title = await sections.nth(i).locator('.track-head h2').innerText()
      if (title === 'Autres formations') {
        othersSection = sections.nth(i)
        break
      }
    }
    expect(othersSection, 'Section "Autres formations" introuvable').not.toBeNull()
    // La section doit avoir au moins une carte
    const cards = othersSection.locator('.card')
    const cardCount = await cards.count()
    expect(cardCount, 'La section "Autres formations" doit contenir au moins une carte').toBeGreaterThan(0)
    // Les cartes "autres" ne doivent pas avoir de badge d'étape
    const steps = othersSection.locator('.step')
    await expect(steps).toHaveCount(0)
  })

  test('les sections de cursus affichent « Ordre conseillé »', async ({ page }) => {
    // Les sections avec track:true doivent afficher la mention "Ordre conseillé"
    const trackHints = page.locator('.track-hint')
    const count = await trackHints.count()
    expect(count, 'Au moins une section de cursus doit avoir "Ordre conseillé"').toBeGreaterThan(0)
    // Vérifier le texte du premier hint
    await expect(trackHints.first()).toContainText('Ordre conseillé')
  })
})
