/**
 * Scénario 1 — Suivi de niveau CEFR (test de placement)
 *
 * Formation : test-anglais-placement
 * Module    : grammaire
 * Leçon     : quiz-grammaire
 *
 * Couverture :
 *  - Valider le quiz → scoreboard + badge « Niveau estimé : <niveau> »
 *  - Recommencer et revalider (2e tentative)
 *  - Page « Mes résultats » → carte, badge niveau, courbe SVG, tableau ≥ 2 lignes
 */

import { test, expect } from '@playwright/test'

const FORMATION = 'test-anglais-placement'
const MODULE    = 'grammaire'
const LESSON    = 'quiz-grammaire'
const LESSON_URL = `/f/${FORMATION}/${MODULE}/${LESSON}`
const RESULTS_URL = `/f/${FORMATION}/resultats`

/**
 * Répond à toutes les questions du quiz actif et clique « Valider le quiz ».
 * Chaque question : on clique l'option d'index `optionIndex` (0 = A).
 */
async function answerAllAndSubmit(page, optionIndex = 0) {
  // Attendre que les questions soient rendues
  await expect(page.locator('.quiz .q').first()).toBeVisible({ timeout: 15_000 })

  const questions = page.locator('.quiz .q')
  const count = await questions.count()
  expect(count).toBeGreaterThan(0)

  for (let i = 0; i < count; i++) {
    const opts = questions.nth(i).locator('.opt:not([disabled])')
    const optCount = await opts.count()
    // Prend l'option demandée (bornée à ce qui existe)
    await opts.nth(optionIndex % optCount).click()
  }

  // Bouton « Valider le quiz » maintenant activé
  const submitBtn = page.locator('.quiz .btn-primary')
  await expect(submitBtn).toBeEnabled({ timeout: 5_000 })
  await submitBtn.click()
}

test.describe('CEFR Placement — quiz grammaire', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LESSON_URL)
    // Attendre que la leçon soit chargée (titre visible)
    await expect(page.locator('article h1')).toBeVisible({ timeout: 20_000 })
  })

  // ─── 1.A Scoreboard avec badge niveau ───────────────────────────────────────
  test('1.A — scoreboard affiche score ET badge niveau estimé après validation', async ({ page }) => {
    await answerAllAndSubmit(page, 0)

    // Scoreboard visible
    const scoreboard = page.locator('.quiz .scoreboard')
    await expect(scoreboard).toBeVisible({ timeout: 15_000 })

    // Score au format « N / M »
    const big = scoreboard.locator('.big')
    await expect(big).toBeVisible()
    const bigText = await big.innerText()
    expect(bigText).toMatch(/\d+\s*\/\s*\d+/)

    // Badge « Niveau estimé : <niveau> »
    const levelBadge = scoreboard.locator('.level')
    await expect(levelBadge).toBeVisible({ timeout: 10_000 })
    const levelText = await levelBadge.innerText()
    expect(levelText).toMatch(/Niveau estimé\s*:\s*(A2|B1|B2|C1)/i)
  })

  // ─── 1.B Recommencer → 2e tentative ──────────────────────────────────────────
  test('1.B — recommencer et revalider (2e tentative enregistrée)', async ({ page }) => {
    // 1re tentative (option 0 partout)
    await answerAllAndSubmit(page, 0)
    await expect(page.locator('.quiz .scoreboard')).toBeVisible({ timeout: 15_000 })

    // Clic sur « ↻ Recommencer »
    const retryBtn = page.locator('.quiz .btn-ghost')
    await expect(retryBtn).toBeVisible()
    await retryBtn.click()

    // Les questions réapparaissent (scoreboard disparu)
    await expect(page.locator('.quiz .scoreboard')).not.toBeVisible()
    await expect(page.locator('.quiz .q').first()).toBeVisible({ timeout: 10_000 })

    // 2e tentative (option 1 partout — réponses différentes)
    await answerAllAndSubmit(page, 1)
    const scoreboard2 = page.locator('.quiz .scoreboard')
    await expect(scoreboard2).toBeVisible({ timeout: 15_000 })
    await expect(scoreboard2.locator('.level')).toBeVisible()
  })

  // ─── 1.C Page « Mes résultats » ──────────────────────────────────────────────
  test('1.C — page résultats : carte, badge niveau, courbe SVG, tableau ≥ 2 lignes', async ({ page }) => {
    // S'assurer qu'il y a au moins 2 tentatives enregistrées
    // Tentative 1
    await answerAllAndSubmit(page, 0)
    await expect(page.locator('.quiz .scoreboard')).toBeVisible({ timeout: 15_000 })

    // Tentative 2
    await page.locator('.quiz .btn-ghost').click()
    await expect(page.locator('.quiz .q').first()).toBeVisible({ timeout: 10_000 })
    await answerAllAndSubmit(page, 2)
    await expect(page.locator('.quiz .scoreboard')).toBeVisible({ timeout: 15_000 })

    // Naviguer vers « Mes résultats »
    const resultsLink = page.locator('.toc a.results-link, a[href*="resultats"]').first()
    await expect(resultsLink).toBeVisible({ timeout: 10_000 })
    await resultsLink.click()
    await expect(page).toHaveURL(new RegExp(RESULTS_URL.replace('/', '\\/')))

    // Titre de la page
    await expect(page.locator('.results h1')).toHaveText('Mes résultats', { timeout: 15_000 })

    // Au moins une carte article
    const cards = page.locator('.results .cards .card')
    await expect(cards.first()).toBeVisible({ timeout: 10_000 })

    // Badge de niveau (`.level` dans le header de la carte)
    const levelBadge = cards.first().locator('header .level')
    await expect(levelBadge).toBeVisible()
    const levelTxt = await levelBadge.innerText()
    expect(levelTxt).toMatch(/A2|B1|B2|C1/)

    // Courbe SVG
    const svg = cards.first().locator('svg.spark')
    await expect(svg).toBeVisible()

    // Tableau avec au moins 2 lignes de données
    const rows = cards.first().locator('table.attempts tbody tr')
    const rowCount = await rows.count()
    expect(rowCount).toBeGreaterThanOrEqual(2)

    // Chaque ligne a une date et un niveau
    for (let i = 0; i < Math.min(rowCount, 3); i++) {
      const cells = rows.nth(i).locator('td')
      const cellCount = await cells.count()
      expect(cellCount).toBe(4) // Date | Score | % | Niveau
    }
  })
})
