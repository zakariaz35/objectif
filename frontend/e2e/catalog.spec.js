import { test, expect } from '@playwright/test'

test.describe('Catalogue — page d\'accueil', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Attendre que le catalogue soit chargé (au moins une section)
    await expect(page.locator('.track-section').first()).toBeVisible({ timeout: 15_000 })
  })

  test('la première section est « Cursus Data-Analyst »', async ({ page }) => {
    const firstSection = page.locator('.track-section').first()
    await expect(firstSection.locator('.track-head h2')).toHaveText('Cursus Data-Analyst')
  })

  test('le cursus Data-Analyst contient 6 cartes', async ({ page }) => {
    const firstSection = page.locator('.track-section').first()
    await expect(firstSection.locator('.card')).toHaveCount(6)
  })

  test('les 6 étapes sont dans le bon ordre (Python → Projet)', async ({ page }) => {
    const firstSection = page.locator('.track-section').first()
    const cards = firstSection.locator('.card')

    const expectedSteps = ['Étape 1', 'Étape 2', 'Étape 3', 'Étape 4', 'Étape 5', 'Étape 6']
    const expectedKeywords = ['Python', 'Excel', 'SQL', 'Power BI', 'Data-Analyst', 'Projet']

    for (let i = 0; i < 6; i++) {
      const card = cards.nth(i)
      // Badge d'étape
      await expect(card.locator('.step')).toHaveText(expectedSteps[i])
      // Le titre ou le stack contient le mot-clé attendu (insensible à la casse)
      const cardText = await card.innerText()
      expect(cardText.toLowerCase()).toContain(expectedKeywords[i].toLowerCase())
    }
  })

  test('la première carte a le badge « Étape 1 » et le mot « Python »', async ({ page }) => {
    const firstCard = page.locator('.track-section').first().locator('.card').first()
    await expect(firstCard.locator('.step')).toHaveText('Étape 1')
    const text = await firstCard.innerText()
    expect(text.toLowerCase()).toContain('python')
  })

  test('une section « Autres formations » existe (Angular, Vue.js…)', async ({ page }) => {
    const sections = page.locator('.track-section')
    const count = await sections.count()
    // On cherche la section "Autres formations"
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

  test('la section « Autres formations » contient les formations Angular et Vue.js', async ({ page }) => {
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
    const otherText = await othersSection.innerText()
    expect(otherText.toLowerCase()).toContain('angular')
    expect(otherText.toLowerCase()).toContain('vue')
  })
})
