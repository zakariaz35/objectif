/**
 * Scénario 2 — Stratégies de quiz (mode linear sans badge niveau)
 *
 * Un quiz ordinaire (js-debutant / reprise-javascript / quiz) doit :
 *  - Se valider normalement et afficher le score
 *  - NE PAS afficher de badge « Niveau estimé » (réservé aux placements)
 */

import { test, expect } from '@playwright/test'

const FORMATION = 'js-debutant'
const MODULE    = 'reprise-javascript'
const LESSON    = 'quiz'
const LESSON_URL = `/f/${FORMATION}/${MODULE}/${LESSON}`

async function answerAllAndSubmit(page, optionIndex = 0) {
  await expect(page.locator('.quiz .q').first()).toBeVisible({ timeout: 15_000 })
  const questions = page.locator('.quiz .q')
  const count = await questions.count()
  expect(count).toBeGreaterThan(0)

  for (let i = 0; i < count; i++) {
    const opts = questions.nth(i).locator('.opt:not([disabled])')
    const optCount = await opts.count()
    await opts.nth(optionIndex % optCount).click()
  }

  const submitBtn = page.locator('.quiz .btn-primary')
  await expect(submitBtn).toBeEnabled({ timeout: 5_000 })
  await submitBtn.click()
}

test.describe('Quiz ordinaire (linear) — sans badge CEFR', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LESSON_URL)
    await expect(page.locator('article h1')).toBeVisible({ timeout: 20_000 })
  })

  test('2.A — le quiz se valide et affiche le score', async ({ page }) => {
    await answerAllAndSubmit(page, 0)

    const scoreboard = page.locator('.quiz .scoreboard')
    await expect(scoreboard).toBeVisible({ timeout: 15_000 })

    // Score visible
    const big = scoreboard.locator('.big')
    await expect(big).toBeVisible()
    const bigText = await big.innerText()
    expect(bigText).toMatch(/\d+\s*\/\s*\d+/)
  })

  test('2.B — le scoreboard n\'affiche PAS de badge niveau CEFR', async ({ page }) => {
    await answerAllAndSubmit(page, 0)

    const scoreboard = page.locator('.quiz .scoreboard')
    await expect(scoreboard).toBeVisible({ timeout: 15_000 })

    // Le badge .level ne doit pas exister (ou être masqué)
    const levelBadge = scoreboard.locator('.level')
    await expect(levelBadge).not.toBeVisible()
  })
})
