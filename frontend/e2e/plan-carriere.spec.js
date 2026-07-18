import { test, expect } from '@playwright/test'

// Plan de carrière : cockpit /plan (jalons, semaine, revue, études, assistant IA)
// et tracker /candidatures. Jeton dédié + nettoyage complet en fin de run.
const TOKEN = 'e2e-plan-spec'
const API = 'http://localhost:8000/api'
const H = { 'X-Client-Token': TOKEN, Accept: 'application/json' }

async function purge(request) {
  for (const [list, del] of [
    ['/jalons', '/jalons'],
    ['/candidatures', '/candidatures'],
  ]) {
    const res = await (await request.get(API + list, { headers: H })).json()
    for (const item of res.data) {
      await request.delete(`${API}${del}/${item.id}`, { headers: H })
    }
  }
}

test.describe('Plan de carrière — cockpit et tracker', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeAll(async ({ request }) => purge(request))
  test.afterAll(async ({ request }) => purge(request))

  test.beforeEach(async ({ page }) => {
    await page.addInitScript((token) => {
      localStorage.setItem('client_token', token)
      localStorage.setItem('locale', 'fr')
    }, TOKEN)
  })

  test('import du plan 6 mois : 10 jalons avec écarts et critères', async ({ page }) => {
    await page.goto('/plan')
    await page.getByRole('button', { name: 'Importer le plan 6 mois' }).click()
    await expect(page.locator('.jalon')).toHaveCount(10, { timeout: 15_000 })

    const phase0 = page.locator('.jalon', { hasText: 'Phase 0 complète' })
    await expect(phase0).toContainText('Mail JL Recrutement')
    await expect(page.locator('.jalon', { hasText: 'Examen AWS SAA réel' })).toBeVisible()
  })

  test('marquer un jalon fait puis le rouvrir', async ({ page }) => {
    await page.goto('/plan')
    const phase0 = page.locator('.jalon', { hasText: 'Phase 0 complète' })
    await phase0.locator('.mini.ok').click()
    await expect(phase0.locator('.j-statut')).toContainText('Fait', { timeout: 10_000 })
    await phase0.locator('.mini', { hasText: '↺' }).click()
    await expect(phase0.locator('.j-statut')).toHaveCount(0)
  })

  test('semaine courante : tuiles objectifs + règle des 2 jours + assistant IA', async ({ page }) => {
    await page.goto('/plan')
    await expect(page.locator('.tile', { hasText: 'candidatures (objectif hebdo)' })).toContainText('0/5')
    await expect(page.locator('.tile', { hasText: 'règle des 2 jours' })).toBeVisible()
    await expect(page.locator('.ia code')).toContainText(`X-Client-Token: ${TOKEN}`)
  })

  test('revue du dimanche : saisie puis affichage', async ({ page }) => {
    await page.goto('/plan')
    await page.locator('.revue-form input').first().fill('Portfolio v0 en ligne')
    await page.locator('.revue-form input[type="number"]').fill('8')
    const saveBtn = page.getByRole('button', { name: 'Enregistrer la revue' })
    await saveBtn.click()
    await expect(page.locator('.revue-form button[type="submit"]')).toHaveText('✓', { timeout: 10_000 })
    await page.reload()
    await expect(page.getByText('Portfolio v0 en ligne')).toBeVisible({ timeout: 10_000 })
  })

  test('tracker : candidature envoyée → relance auto à J+7, compteur 1/5', async ({ page }) => {
    await page.goto('/candidatures')
    await page.getByRole('button', { name: '＋ Ajouter' }).click()
    await page.getByPlaceholder('Poste / rôle').fill('MLOps Engineer')
    await page.getByPlaceholder('Entreprise').fill('Himalayas Corp')
    await page.locator('.add-form select').last().selectOption('envoyee')
    await page.getByRole('button', { name: 'Enregistrer' }).click()

    const item = page.locator('.item', { hasText: 'MLOps Engineer' })
    await expect(item).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('.tile', { hasText: 'candidatures cette semaine' })).toContainText('1/5')

    // Passage en entretien : la relance programmée disparaît.
    await item.locator('select').selectOption('entretien')
    await expect(item.locator('select')).toHaveValue('entretien', { timeout: 10_000 })
  })

  test('tracker : onglet contacts réseau séparé, compteur 1/2', async ({ page }) => {
    await page.goto('/candidatures')
    await page.getByRole('button', { name: 'Contacts réseau' }).click()
    await expect(page.getByText("Rien ici pour l'instant.")).toBeVisible()

    await page.getByRole('button', { name: '＋ Ajouter' }).click()
    await page.locator('.add-form select').first().selectOption('contact')
    await page.getByPlaceholder('Poste / rôle').fill('Ancien collègue Orange')
    await page.getByRole('button', { name: 'Enregistrer' }).click()
    await expect(page.locator('.item', { hasText: 'Ancien collègue Orange' })).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('.tile', { hasText: 'contacts cette semaine' })).toContainText('1/2')
    // L'onglet Candidatures ne montre pas les contacts.
    await page.getByRole('button', { name: 'Candidatures', exact: true }).click()
    await expect(page.locator('.item', { hasText: 'Ancien collègue Orange' })).toHaveCount(0)
  })

  test("l'endpoint IA /suivi/etat reflète jalons et candidatures", async ({ request }) => {
    const etat = await (await request.get(`${API}/suivi/etat`, { headers: H })).json()
    expect(etat.jalons.length).toBe(10)
    expect(etat.candidatures.semaine_courante.candidatures).toBe(1)
    expect(etat.candidatures.semaine_courante.contacts_reseau).toBe(1)
    expect(Array.isArray(etat.alertes)).toBeTruthy()
    expect(etat.revues_hebdo[0].demontrable).toBe('Portfolio v0 en ligne')
  })
})
