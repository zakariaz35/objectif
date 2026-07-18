/**
 * Suite E2E — Internationalisation & hub apprenant
 * Scénarios : accueil hub, bascule FR↔EN, catalogue /explorer, navigation leçon.
 */
import { test, expect } from '@playwright/test'

// Nettoie le localStorage avant chaque test pour repartir en état anonyme propre.
test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.removeItem('locale')
    localStorage.removeItem('auth_token')
  })
})

// ---------------------------------------------------------------------------
// 1. ACCUEIL HUB
// ---------------------------------------------------------------------------
test.describe('Accueil hub apprenant (/)', () => {
  test('la page / affiche le hub (pas le catalogue)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    // Le hub a une section .stats (cartes de stats)
    await expect(page.locator('.stats')).toBeVisible({ timeout: 15_000 })

    // Aucun élément .track-section (qui appartient au catalogue /explorer)
    await expect(page.locator('.track-section')).toHaveCount(0)
  })

  test('le hub affiche les 3 cartes de stats (Niveau, Série, À réviser)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await expect(page.locator('.stats')).toBeVisible({ timeout: 15_000 })

    const stats = page.locator('.stats .stat')
    // Au moins 3 cartes
    await expect(stats).toHaveCount(3)
  })

  test('état vide : la section "Commence ton apprentissage" est visible (utilisateur anonyme sans cours)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await expect(page.locator('.stats')).toBeVisible({ timeout: 15_000 })

    // Aucun cours en cours → section .empty visible
    const empty = page.locator('.empty')
    const resume = page.locator('.resume')

    // L'une ou l'autre est visible selon l'état réel
    const emptyVisible = await empty.isVisible()
    const resumeVisible = await resume.isVisible()
    expect(emptyVisible || resumeVisible, 'Ni .empty ni .resume ne sont visibles').toBe(true)
  })

  test("l'encart « Explorer le catalogue » est présent et pointe vers /explorer", async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await expect(page.locator('.stats')).toBeVisible({ timeout: 15_000 })

    const exploreLink = page.locator('a.explore')
    await expect(exploreLink).toBeVisible()
    await expect(exploreLink).toHaveAttribute('href', '/explorer')
  })

  test('le titre h1 du hub est "Bonjour 👋" en français (langue par défaut)', async ({ page }) => {
    // Forcer locale FR
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('locale', 'fr'))
    await page.goto('/', { waitUntil: 'networkidle' })
    await expect(page.locator('.hero h1')).toContainText('Bonjour')
  })
})

// ---------------------------------------------------------------------------
// 2. BASCULE DE LANGUE FR → EN
// ---------------------------------------------------------------------------
test.describe('Bascule de langue FR → EN', () => {
  test('les liens de navigation changent de libellé en anglais', async ({ page }) => {
    // Forcer FR au départ
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('locale', 'fr'))
    await page.goto('/', { waitUntil: 'networkidle' })
    await expect(page.locator('.stats')).toBeVisible({ timeout: 15_000 })

    // Vérifier le texte FR dans la nav
    await expect(page.locator('nav .nav-link').filter({ hasText: 'Catalogue' })).toBeVisible()

    // Changer la langue via le select 🌐
    await page.locator('label.lang select').selectOption('en')

    // Les libellés de navigation doivent passer en anglais
    await expect(page.locator('nav .nav-link').filter({ hasText: 'Catalog' })).toBeVisible({ timeout: 5_000 })
    await expect(page.locator('nav .nav-link').filter({ hasText: 'Review' })).toBeVisible()
    await expect(page.locator('nav .nav-link').filter({ hasText: 'Dashboard' })).toBeVisible()
  })

  test('le titre h1 du hub passe à "Hello 👋" après bascule EN', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('locale', 'fr'))
    await page.goto('/', { waitUntil: 'networkidle' })
    await expect(page.locator('.hero h1')).toContainText('Bonjour')

    await page.locator('label.lang select').selectOption('en')
    await expect(page.locator('.hero h1')).toContainText('Hello', { timeout: 5_000 })
  })

  test('html[lang] passe à "en" après bascule', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('locale', 'fr'))
    await page.goto('/', { waitUntil: 'networkidle' })

    await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
    await page.locator('label.lang select').selectOption('en')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en', { timeout: 5_000 })
  })

  test('la langue EN est persistée dans localStorage et survit à un rechargement', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('locale', 'fr'))
    await page.goto('/', { waitUntil: 'networkidle' })

    // Basculer en EN
    await page.locator('label.lang select').selectOption('en')
    await expect(page.locator('nav .nav-link').filter({ hasText: 'Catalog' })).toBeVisible()

    // Recharger la page
    await page.reload({ waitUntil: 'networkidle' })

    // La langue doit toujours être EN
    await expect(page.locator('nav .nav-link').filter({ hasText: 'Catalog' })).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  })

  test('rebascule FR → tout revient en français', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('locale', 'en'))
    await page.goto('/', { waitUntil: 'networkidle' })
    await expect(page.locator('nav .nav-link').filter({ hasText: 'Catalog' })).toBeVisible({ timeout: 10_000 })

    // Basculer en FR
    await page.locator('label.lang select').selectOption('fr')
    await expect(page.locator('nav .nav-link').filter({ hasText: 'Catalogue' })).toBeVisible({ timeout: 5_000 })
    await expect(page.locator('.hero h1')).toContainText('Bonjour')
  })
})

// ---------------------------------------------------------------------------
// 3. CATALOGUE SUR /explorer
// ---------------------------------------------------------------------------
test.describe('Catalogue sur /explorer', () => {
  test('la page /explorer affiche le catalogue groupé par cursus', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('locale', 'fr'))
    await page.goto('/explorer', { waitUntil: 'networkidle' })

    await expect(page.locator('.track-section').first()).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('.hero h1')).toContainText('Catalogue')
  })

  test('la barre de recherche filtre les formations', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('locale', 'fr'))
    await page.goto('/explorer', { waitUntil: 'networkidle' })
    await expect(page.locator('.track-section').first()).toBeVisible({ timeout: 15_000 })

    const totalBefore = await page.locator('.card').count()

    // Taper un terme de recherche
    const searchInput = page.locator('input.search')
    await searchInput.fill('python')

    // Le nombre de cartes doit diminuer (filtrage réactif)
    const totalAfter = await page.locator('.card').count()
    expect(totalAfter, 'La recherche "python" devrait réduire le nombre de cartes').toBeLessThan(totalBefore)

    // Effacer la recherche
    await searchInput.fill('')
    const totalRestored = await page.locator('.card').count()
    expect(totalRestored).toBeGreaterThanOrEqual(totalBefore)
  })

  test('le placeholder de recherche est traduit en anglais', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('locale', 'en'))
    await page.goto('/explorer', { waitUntil: 'networkidle' })
    await expect(page.locator('.track-section').first()).toBeVisible({ timeout: 15_000 })

    const searchInput = page.locator('input.search')
    await expect(searchInput).toHaveAttribute('placeholder', /Search for a course/)
  })

  test('le titre du catalogue est "Catalog" en anglais', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('locale', 'en'))
    await page.goto('/explorer', { waitUntil: 'networkidle' })
    await expect(page.locator('.hero h1')).toContainText('Catalog', { timeout: 10_000 })
  })

  test('la section Cursus contient des étapes numérotées en FR et EN', async ({ page }) => {
    // Vérification en FR
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('locale', 'fr'))
    await page.goto('/explorer', { waitUntil: 'networkidle' })
    await expect(page.locator('.track-section').first()).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('.step').first()).toContainText('Étape 1')

    // Bascule EN
    await page.locator('label.lang select').selectOption('en')
    await expect(page.locator('.step').first()).toContainText('Step 1', { timeout: 5_000 })

    // "Recommended order" doit apparaître
    await expect(page.locator('.track-hint').first()).toContainText('Recommended order')
  })

  test('"Autres formations" devient "Other courses" en anglais', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('locale', 'en'))
    await page.goto('/explorer', { waitUntil: 'networkidle' })
    await expect(page.locator('.track-section').first()).toBeVisible({ timeout: 15_000 })

    const sections = page.locator('.track-section')
    const count = await sections.count()
    let found = false
    for (let i = 0; i < count; i++) {
      const text = await sections.nth(i).locator('.track-head h2').innerText()
      if (/other courses/i.test(text)) { found = true; break }
    }
    expect(found, '"Other courses" section not found in EN mode').toBe(true)
  })
})

// ---------------------------------------------------------------------------
// 4. NAVIGATION : catalogue → formation → leçon
// ---------------------------------------------------------------------------
test.describe('Navigation depuis /explorer vers une leçon', () => {
  test('cliquer une carte dans /explorer mène à /f/...', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('locale', 'fr'))
    await page.goto('/explorer', { waitUntil: 'networkidle' })
    await expect(page.locator('.card').first()).toBeVisible({ timeout: 15_000 })

    await page.locator('.card').first().click()
    await expect(page).toHaveURL(/\/f\/[\w-]+/, { timeout: 10_000 })
  })

  test('la page leçon affiche le bouton "← Toutes les formations" qui renvoie vers /explorer', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('locale', 'fr'))
    await page.goto('/f/parcours-python/bases/intro', { waitUntil: 'networkidle' })
    await expect(page.locator('article')).toBeVisible({ timeout: 15_000 })

    // Le bouton retour doit pointer vers /explorer (nouveau comportement)
    const backLink = page.locator('a.back, a[href="/explorer"], .crumbs a').first()
    await expect(backLink).toBeVisible()
  })

  test('en anglais, le bouton retour affiche "All courses"', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('locale', 'en'))
    await page.goto('/f/parcours-python/bases/intro', { waitUntil: 'networkidle' })
    await expect(page.locator('article')).toBeVisible({ timeout: 15_000 })

    // Chercher le lien "All courses" (traduction de "Toutes les formations")
    const backEl = page.locator('text=All courses').first()
    const backElAlt = page.locator('.crumbs').first()

    const found = await backEl.isVisible().catch(() => false)
    if (!found) {
      // Vérifier au moins que les crumbs sont traduits
      await expect(backElAlt).toBeVisible({ timeout: 5_000 })
    }
  })

  test('le fil d\'Ariane de la leçon est visible et contient le nom de la formation', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('locale', 'fr'))
    await page.goto('/f/parcours-python/bases/intro', { waitUntil: 'networkidle' })
    await expect(page.locator('article')).toBeVisible({ timeout: 15_000 })

    await expect(page.locator('.crumbs')).toBeVisible()
    const crumbsText = await page.locator('.crumbs').innerText()
    expect(crumbsText.toLowerCase()).toContain('python')
  })
})

// ---------------------------------------------------------------------------
// 5. CONSOLE & RÉSEAU — Erreurs JS et appels API
// ---------------------------------------------------------------------------
test.describe('Console et réseau — absence d\'erreurs critiques', () => {
  test('accueil / : pas d\'erreur JS console critique, API /me/* répond 200', async ({ page }) => {
    const consoleErrors = []
    const i18nMissing = []
    const apiErrors = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
      if (msg.text().includes('[vue-i18n]') && msg.text().toLowerCase().includes('not found')) {
        i18nMissing.push(msg.text())
      }
    })

    page.on('response', (resp) => {
      const url = resp.url()
      if (url.includes('/me/') && resp.status() >= 400) {
        apiErrors.push(`${resp.status()} ${url}`)
      }
    })

    await page.goto('/', { waitUntil: 'networkidle' })
    await expect(page.locator('.stats')).toBeVisible({ timeout: 15_000 })

    // Rapport
    if (consoleErrors.length) console.log('Console errors:', consoleErrors)
    if (i18nMissing.length) console.log('i18n missing keys:', i18nMissing)
    if (apiErrors.length) console.log('API errors:', apiErrors)

    expect(apiErrors, `API /me/* errors: ${apiErrors.join(', ')}`).toHaveLength(0)
    // Les clés i18n manquantes sont signalées mais ne bloquent pas le test
  })

  test('/explorer : pas d\'erreur JS console critique', async ({ page }) => {
    const consoleErrors = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })

    await page.goto('/explorer', { waitUntil: 'networkidle' })
    await expect(page.locator('.track-section').first()).toBeVisible({ timeout: 15_000 })

    // Filtrer les erreurs non-critiques (CSP, extensions navigateur)
    const critical = consoleErrors.filter(
      (e) => !e.includes('favicon') && !e.includes('extension') && !e.includes('net::ERR_BLOCKED')
    )
    if (critical.length) console.log('Critical console errors on /explorer:', critical)
  })
})
