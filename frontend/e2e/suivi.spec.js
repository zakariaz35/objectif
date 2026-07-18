import { test, expect } from '@playwright/test'

// Suivi centralisé sur le tableau de bord : préparation certifs, heatmap
// d'activité, santé SRS. Jeton client dédié => données vierges, isolées.
test.describe('Tableau de bord — suivi centralisé', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('client_token', 'e2e-suivi-token')
      localStorage.setItem('locale', 'fr')
    })
  })

  test('les 4 certifications sont listées avec seuils et statut', async ({ page }) => {
    await page.goto('/tableau-de-bord')
    await expect(page.locator('.certifs .certif')).toHaveCount(4, { timeout: 15_000 })

    for (const exam of ['AWS SAA-C03', 'CCDV-F (Developer)', 'CCA-F (Architect)', 'PSM I']) {
      await expect(page.locator('.certif', { hasText: exam })).toBeVisible()
    }

    // Sans tentative : statut « À commencer » + nombre de questions affiché.
    const aws = page.locator('.certif', { hasText: 'AWS SAA-C03' })
    await expect(aws.locator('.c-status')).toHaveText('À commencer')
    await expect(aws).toContainText('65 questions')
    await expect(aws).toContainText('seuil 72%')
    await expect(aws).toContainText('cible 80%')

    const psm = page.locator('.certif', { hasText: 'PSM I' })
    await expect(psm).toContainText('seuil 85%')
  })

  test('la carte certif mène au test blanc', async ({ page }) => {
    await page.goto('/tableau-de-bord')
    await page.locator('.certif', { hasText: 'PSM I' }).click()
    await expect(page).toHaveURL(/\/f\/parcours-scrum\/test-blanc\/test-blanc/)
  })

  test('la heatmap couvre 8 semaines (56 jours)', async ({ page }) => {
    await page.goto('/tableau-de-bord')
    await expect(page.locator('.heat .cell')).toHaveCount(56, { timeout: 15_000 })
    await expect(page.getByText(/Cette semaine :/)).toBeVisible()
  })

  test('une tentative de quiz apparaît dans le suivi', async ({ page, request }) => {
    // Une tentative (réponse arbitraire à la 1re question) pour le jeton de test.
    const headers = { 'X-Client-Token': 'e2e-suivi-token', Accept: 'application/json' }
    const payload = await (
      await request.get('http://localhost:8000/api/formations/parcours-scrum/lessons/test-blanc/test-blanc', { headers })
    ).json()
    const firstQuestion = payload.lesson.quiz[0]
    const res = await request.post(
      'http://localhost:8000/api/formations/parcours-scrum/lessons/test-blanc/test-blanc/grade',
      { headers, data: { answers: { [firstQuestion.id]: 0 } } },
    )
    expect(res.ok()).toBeTruthy()

    await page.goto('/tableau-de-bord')
    const psm = page.locator('.certif', { hasText: 'PSM I' })
    await expect(psm.locator('.c-status')).not.toHaveText('À commencer', { timeout: 15_000 })
    await expect(psm.locator('.c-score')).toBeVisible()
  })

  test('RTL arabe : le bloc certifs reste lisible sans débordement', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('locale', 'ar'))
    await page.goto('/tableau-de-bord')
    await expect(page.locator('.certifs .certif').first()).toBeVisible({ timeout: 15_000 })
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(overflow).toBeFalsy()
  })
})
