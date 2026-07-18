/**
 * Atelier des itinéraires + feuille de route épinglée + missions.
 *
 * Suite séquentielle (test.describe.serial) : les étapes partagent une seule page
 * (même contexte / localStorage) car le scénario est un vrai parcours utilisateur
 * (créer → épingler → éditer → supprimer). Un test qui échoue arrête les suivants,
 * ce qui est voulu ici puisqu'ils dépendent tous de l'itinéraire créé en étape 3.
 *
 * Données de référence de cette instance :
 *   - Itinéraires existants : ai-augmented-developer, reprise-dev-web
 *   - Missions : mission-demo-a, mission-demo-b
 *   - Formation utilisée pour l'étape "formation" du nouvel itinéraire : parcours-traefik
 *     (« Traefik — reverse proxy par labels Docker »)
 *
 * Nettoyage : l'itinéraire « Test E2E » (slug test-e2e) est supprimé par le test
 * lui-même (étape 6) ; un filet de sécurité en afterAll le supprime aussi via l'API
 * si un test précédent a échoué avant d'atteindre la suppression. La locale est
 * remise en français dans tous les cas.
 */
import { test, expect } from '@playwright/test'

const API = 'http://localhost:8000/api'
const NEW_SLUG = 'test-e2e'

test.describe.serial('Atelier des itinéraires + feuille de route + missions', () => {
  let page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    // Confirm() natif du navigateur (suppression) : toujours accepter.
    page.on('dialog', (d) => d.accept())
  })

  test.afterAll(async ({ request }) => {
    // Filet de sécurité : si un test a échoué avant la suppression UI, on nettoie via l'API.
    await request.delete(`${API}/parcours/${NEW_SLUG}`).catch(() => {})
    if (page) {
      await page.evaluate(() => localStorage.setItem('locale', 'fr')).catch(() => {})
      await page.close()
    }
  })

  test('1. Explorateur : lien « Gérer les itinéraires » + section Missions (exclue du catalogue)', async () => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('locale', 'fr'))
    await page.goto('/explorer')
    await expect(page.locator('.track-section').first()).toBeVisible({ timeout: 15_000 })

    const atelierLink = page.locator('.parcours-list .head-link')
    await expect(atelierLink).toBeVisible()
    await expect(atelierLink).toHaveAttribute('href', '/atelier-parcours')
    await expect(atelierLink).toContainText('Gérer les itinéraires')

    const missionsSection = page.locator('section.missions')
    await expect(missionsSection).toBeVisible()
    await expect(missionsSection.locator('h2')).toContainText('Missions')

    const missionCards = missionsSection.locator('.mission-card')
    await expect(missionCards).toHaveCount(2)
    const missionTitles = await missionCards.locator('h3').allInnerTexts()
    expect(missionTitles.some((t) => t.includes('Mission démo A'))).toBe(true)
    expect(missionTitles.some((t) => t.includes('Mission démo B'))).toBe(true)
    await expect(missionCards.first().locator('.mission-badge')).toContainText('Mission')
    await expect(missionCards.nth(1).locator('.mission-badge')).toContainText('Mission')

    // Ces deux cartes ne doivent PLUS apparaître dans les sections cursus / "Autres formations".
    const catalogTitles = await page.locator('.track-section .card h3').allInnerTexts()
    expect(catalogTitles.some((t) => t.includes('Mission démo A'))).toBe(false)
    expect(catalogTitles.some((t) => t.includes('Mission démo B'))).toBe(false)
  })

  test('2. Atelier : la liste montre les itinéraires existants avec Voir / Modifier / Supprimer', async () => {
    await page.goto('/atelier-parcours')
    await expect(page.locator('.list .item')).toHaveCount(2, { timeout: 15_000 })

    const texts = await page.locator('.list .item').allInnerTexts()
    expect(texts.some((t) => t.includes('AI-Augmented Developer'))).toBe(true)
    expect(texts.some((t) => t.includes('Reprise dév web'))).toBe(true)

    const first = page.locator('.list .item').first()
    await expect(first.locator('a.link')).toContainText('Voir')
    await expect(first.locator('button.btn-ghost')).toContainText('Modifier')
    await expect(first.locator('button.btn-danger')).toContainText('Supprimer')
  })

  test('3. Atelier : créer « Test E2E » (formation auto-remplie, jalon, réordonnancement) → redirection + projection', async () => {
    await page.locator('button.new').click()
    await expect(page.locator('.editor h2')).toContainText('Nouvel itinéraire')

    await page.locator('.editor input[maxlength="150"]').fill('Test E2E')
    await page.locator('.editor textarea[maxlength="2000"]').fill('Itinéraire créé par la suite E2E — à supprimer.')
    await page.locator('.editor .field-sm input').fill('6')

    // Étape 1 (déjà présente par défaut) : type "formation" → choisir parcours-traefik.
    const step1 = page.locator('.steps .step').nth(0)
    const formationSelect = step1.locator('.step-fields select')
    await expect(formationSelect.locator('option[value="parcours-traefik"]')).toHaveCount(1, { timeout: 15_000 })
    await formationSelect.selectOption('parcours-traefik')
    // Le titre doit se remplir automatiquement avec le titre du catalogue.
    await expect(step1.locator('.step-fields input').first()).toHaveValue(
      'Traefik — reverse proxy par labels Docker',
    )

    // Étape 2 : jalon externe.
    await page.locator('.add-row button', { hasText: 'Ajouter un jalon' }).click()
    await expect(page.locator('.steps .step')).toHaveCount(2)
    const step2 = page.locator('.steps .step').nth(1)
    await step2.locator('.step-fields input').first().fill('Jalon test E2E')
    await step2.locator('.inline .mini input').fill('5')
    await step2.locator('.inline input.grow').fill('https://example.com')

    // Réordonnancement : monter le jalon (devient étape 1) puis le redescendre.
    await page.locator('.steps .step').nth(1).locator('button[aria-label="Monter"]').click()
    await expect(page.locator('.steps .step').nth(0).locator('.step-fields input').first()).toHaveValue(
      'Jalon test E2E',
    )
    await page.locator('.steps .step').nth(0).locator('button[aria-label="Descendre"]').click()
    await expect(page.locator('.steps .step').nth(0).locator('.step-fields input').first()).toHaveValue(
      'Traefik — reverse proxy par labels Docker',
    )

    await page.locator('.editor button[type="submit"]').click()
    await expect(page).toHaveURL(/\/parcours\/test-e2e$/, { timeout: 15_000 })

    await expect(page.locator('.timeline .step')).toHaveCount(2)
    await expect(page.locator('.stats')).toContainText('total 9 h')
    await expect(page.locator('.stats')).toContainText('à 6 h/sem')
    await expect(page.locator('.stats')).toContainText('~2 sem')
  })

  test('4. Épingler sur l’accueil : bloc « Ma feuille de route » + Reprendre → /f/parcours-traefik', async () => {
    const pinBtn = page.locator('button.pin')
    await expect(pinBtn).toContainText("Épingler sur l'accueil")
    await pinBtn.click()
    await expect(pinBtn).toHaveClass(/active/)
    await expect(pinBtn).toContainText('📌 Feuille de route')

    await page.goto('/')
    const roadmap = page.locator('a.roadmap')
    await expect(roadmap).toBeVisible({ timeout: 15_000 })
    await expect(roadmap.locator('.rm-label')).toContainText('Ma feuille de route')
    await expect(roadmap.locator('h2')).toContainText('Test E2E')
    await expect(roadmap.locator('.rm-bar')).toBeVisible()
    await expect(roadmap.locator('.rm-step')).toContainText('Étape en cours')
    await expect(roadmap.locator('.rm-eta')).toContainText('fin estimée')

    const resumeBtn = roadmap.locator('.rm-cta')
    await expect(resumeBtn).toContainText('Reprendre')
    await resumeBtn.click()
    await expect(page).toHaveURL(/\/f\/parcours-traefik/, { timeout: 15_000 })
  })

  test('5. Atelier : modifier la durée du jalon (5h → 8h) → le total affiché change', async () => {
    await page.goto('/atelier-parcours')
    const item = page.locator('.list .item', { hasText: 'Test E2E' })
    await expect(item).toBeVisible({ timeout: 15_000 })
    await item.locator('button.btn-ghost', { hasText: 'Modifier' }).click()
    await expect(page.locator('.editor h2')).toContainText('Test E2E')

    const jalonStep = page.locator('.steps .step').nth(1)
    await expect(jalonStep.locator('.step-fields input').first()).toHaveValue('Jalon test E2E')
    await jalonStep.locator('.inline .mini input').fill('8')

    await page.locator('.editor button[type="submit"]').click()
    await expect(page).toHaveURL(/\/parcours\/test-e2e$/, { timeout: 15_000 })
    await expect(page.locator('.stats')).toContainText('total 12 h')
  })

  test('6. Atelier : supprimer « Test E2E » → disparaît de la liste ET l’épingle est nettoyée sur /', async () => {
    await page.goto('/atelier-parcours')
    const item = page.locator('.list .item', { hasText: 'Test E2E' })
    await expect(item).toBeVisible({ timeout: 15_000 })
    await item.locator('button.btn-danger', { hasText: 'Supprimer' }).click()
    await expect(page.locator('.list .item', { hasText: 'Test E2E' })).toHaveCount(0, { timeout: 10_000 })

    await page.goto('/')
    await expect(page.locator('a.roadmap')).toHaveCount(0, { timeout: 15_000 })
  })

  test('7. Itinéraire réel ai-augmented-developer : 1re étape = formation AWS avec progression + projection 8h/sem', async () => {
    await page.goto('/parcours/ai-augmented-developer')
    const firstStep = page.locator('.timeline .step').first()
    await expect(firstStep.locator('h3')).toContainText('Formation AWS SAA-C03')
    await expect(firstStep.locator('.bar.sm')).toBeVisible()
    await expect(firstStep.locator('a.link')).toContainText('Ouvrir le cours')
    await expect(page.locator('.stats')).toContainText('à 8 h/sem')
  })

  test('8. RTL (arabe) : /atelier-parcours et / passent en miroir sans débordement horizontal', async () => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('locale', 'ar'))

    await page.goto('/atelier-parcours')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl', { timeout: 15_000 })
    const overflowAtelier = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflowAtelier, 'pas de débordement horizontal sur /atelier-parcours en RTL').toBeLessThanOrEqual(4)

    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl', { timeout: 15_000 })
    const overflowHome = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflowHome, 'pas de débordement horizontal sur / en RTL').toBeLessThanOrEqual(4)

    // Remettre la locale en français.
    await page.evaluate(() => localStorage.setItem('locale', 'fr'))
  })
})
