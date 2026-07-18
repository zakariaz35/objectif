/**
 * Scénario 3 — Type de leçon « matching » (relier EN↔FR)
 *
 * Formation : matching-anglais-series
 * Module    : relier
 * Leçon     : repliques-got
 *
 * Couverture :
 *  - Deux colonnes visibles ; droite dans un ordre différent de la gauche
 *  - Interaction : clic gauche → surligné, clic droit → reliés (badge numéroté)
 *  - Relier 5 paires (dont au moins 1 fausse intentionnellement)
 *  - Valider → scoreboard /5, paires correctes en vert, fausses en rouge,
 *    correction affichée pour les paires fausses (→ bonne traduction)
 */

import { test, expect } from '@playwright/test'

const FORMATION  = 'matching-anglais-series'
const MODULE     = 'relier'
const LESSON     = 'repliques-got'
const LESSON_URL = `/f/${FORMATION}/${MODULE}/${LESSON}`

// Données connues via API :
// left  : [0] "Looks fresh-forged." [1] "It's time to come home."
//         [2] "The North remembers." [3] "A Lannister always pays his debts." [4] "You know nothing."
// right (ordre mélangé) : [4] "Tu ne sais rien." [0] "Elle paraît neuve."
//         [3] "Un Lannister paie toujours ses dettes." [2] "Le Nord se souvient." [1] "Il est temps de rentrer."
//
// Stratégie de test :
//  - Paires 1-4 (indices 0..3) : on relie correctement left[i] → right[i] (même id)
//  - Paire 5 (index 4) : on relie left[4] ("You know nothing.") → right[0] ("Elle paraît neuve.")
//    → faute intentionnelle (correct serait right[4] "Tu ne sais rien.")

test.describe('Matching EN↔FR — GoT S04E01', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LESSON_URL)
    await expect(page.locator('article h1')).toBeVisible({ timeout: 20_000 })
    // Attendre que les colonnes soient rendues
    await expect(page.locator('.matching .cols')).toBeVisible({ timeout: 15_000 })
  })

  // ─── 3.A État initial ─────────────────────────────────────────────────────
  test('3.A — deux colonnes visibles, droite dans un ordre mélangé', async ({ page }) => {
    const cols = page.locator('.matching .col')
    await expect(cols).toHaveCount(2)

    const leftItems  = cols.nth(0).locator('li')
    const rightItems = cols.nth(1).locator('li')

    await expect(leftItems).toHaveCount(5)
    await expect(rightItems).toHaveCount(5)

    // La colonne gauche commence par "Looks fresh-forged."
    const firstLeftText = await leftItems.nth(0).innerText()
    expect(firstLeftText).toContain('Looks fresh-forged')

    // La colonne droite ne commence PAS par la traduction directe de la phrase 1
    // (droite[0] = "Tu ne sais rien." — traduction de left[4], pas de left[0])
    const firstRightText = await rightItems.nth(0).innerText()
    expect(firstRightText).not.toContain('Elle paraît neuve') // la traduction correcte de left[0] n'est pas en 1re position
  })

  // ─── 3.B Interaction : clic gauche → surligné, clic droit → reliés ────────
  test('3.B — cliquer gauche sélectionne (sel), cliquer droit relie (badge)', async ({ page }) => {
    const leftCells  = page.locator('.matching .col').nth(0).locator('.cell')
    const rightCells = page.locator('.matching .col').nth(1).locator('.cell')

    // Clic sur la 1re phrase gauche
    await leftCells.nth(0).click()
    // Elle doit passer en état "sel"
    await expect(leftCells.nth(0)).toHaveClass(/sel/)

    // Clic sur la 1re traduction droite
    await rightCells.nth(0).click()
    // La sélection est consommée, la paire est liée (classe "linked" ou badge visible)
    await expect(leftCells.nth(0)).not.toHaveClass(/sel/)
    // Un badge numéroté (1) apparaît des deux côtés
    const leftBadge  = leftCells.nth(0).locator('.badge')
    const rightBadge = rightCells.nth(0).locator('.badge')
    await expect(leftBadge).toBeVisible()
    await expect(rightBadge).toBeVisible()
    await expect(leftBadge).toHaveText('1')
    await expect(rightBadge).toHaveText('1')
  })

  // ─── 3.C Valider avec une faute intentionnelle ────────────────────────────
  test('3.C — scoreboard /5, vert/rouge, correction affichée pour la paire fausse', async ({ page }) => {
    const leftCells  = page.locator('.matching .col').nth(0).locator('.cell')
    const rightCells = page.locator('.matching .col').nth(1).locator('.cell')

    // L'ordre d'affichage du côté droit est décidé par le composant Vue (shufflé).
    // On lit le texte de chaque cellule droite pour trouver les positions DOM
    // des traductions qui correspondent aux phrases gauches (même index sémantique).
    //
    // Correspondances sémantiques connues (left_id === right_id) :
    //   left[0] "Looks fresh-forged."       → right "Elle paraît neuve."
    //   left[1] "It's time to come home."   → right "Il est temps de rentrer."
    //   left[2] "The North remembers."      → right "Le Nord se souvient."
    //   left[3] "A Lannister always..."     → right "Un Lannister paie..."
    //   left[4] "You know nothing."         → right "Tu ne sais rien."
    //
    // Stratégie : relier left[0..2] correctement, et left[3] intentionnellement
    // à la traduction de left[4] (et vice-versa) pour avoir 2 fautes.

    // Lire les textes des cellules droites pour trouver leur position DOM
    const rightCount = await rightCells.count()
    const rightTexts = []
    for (let i = 0; i < rightCount; i++) {
      rightTexts.push(await rightCells.nth(i).innerText())
    }

    // Trouver la position DOM de chaque traduction
    function findRight(keyword) {
      return rightTexts.findIndex(t => t.toLowerCase().includes(keyword.toLowerCase()))
    }

    const posElleParait     = findRight('paraît neuve')       // correct pour left[0]
    const posIlEstTemps     = findRight('est temps de rentrer') // correct pour left[1]
    const posLeNord         = findRight('nord se souvient')   // correct pour left[2]
    const posLannister      = findRight('lannister paie')     // correct pour left[3]
    const posTuNeSaisRien   = findRight('tu ne sais rien')    // correct pour left[4]

    // Vérifier que tous ont été trouvés
    expect(posElleParait).toBeGreaterThanOrEqual(0)
    expect(posIlEstTemps).toBeGreaterThanOrEqual(0)
    expect(posLeNord).toBeGreaterThanOrEqual(0)
    expect(posLannister).toBeGreaterThanOrEqual(0)
    expect(posTuNeSaisRien).toBeGreaterThanOrEqual(0)

    // 3 bonnes paires (left[0..2]) + 2 fausses (left[3] ↔ left[4] inversées)
    const pairs = [
      [0, posElleParait],    // correct
      [1, posIlEstTemps],    // correct
      [2, posLeNord],        // correct
      [3, posTuNeSaisRien],  // FAUSSE intentionnelle : left[3] → traduction de left[4]
      [4, posLannister],     // FAUSSE intentionnelle : left[4] → traduction de left[3]
    ]

    for (const [li, ri] of pairs) {
      await leftCells.nth(li).click()
      await expect(leftCells.nth(li)).toHaveClass(/sel/)
      await rightCells.nth(ri).click()
      // Attendre que la sélection soit consommée (paire liée)
      await expect(leftCells.nth(li)).not.toHaveClass(/sel/)
    }

    // Toutes les paires liées → bouton « Valider » activé
    const submitBtn = page.locator('.matching .btn-primary')
    await expect(submitBtn).toBeEnabled({ timeout: 5_000 })
    await submitBtn.click()

    // Scoreboard visible
    const scoreboard = page.locator('.matching .scoreboard')
    await expect(scoreboard).toBeVisible({ timeout: 15_000 })

    // Score 3/5 (3 bonnes, 2 fausses)
    const big = scoreboard.locator('.big')
    await expect(big).toBeVisible()
    const bigText = await big.innerText()
    expect(bigText).toMatch(/3\s*\/\s*5/)

    // Les 3 bonnes paires (indices 0..2) : classe "good" sur les cellules gauches
    for (let i = 0; i < 3; i++) {
      await expect(leftCells.nth(i)).toHaveClass(/good/)
    }

    // Les 2 paires fausses (indices 3 et 4) : classe "bad"
    await expect(leftCells.nth(3)).toHaveClass(/bad/)
    await expect(leftCells.nth(4)).toHaveClass(/bad/)

    // La correction de left[3] : affiche la bonne traduction ("Un Lannister paie…")
    const leftItems = page.locator('.matching .col').nth(0).locator('li')
    const fix3 = leftItems.nth(3).locator('.fix')
    await expect(fix3).toBeVisible()
    const fix3Text = await fix3.innerText()
    expect(fix3Text).toContain('Lannister')

    // La correction de left[4] : affiche la bonne traduction ("Tu ne sais rien.")
    const fix4 = leftItems.nth(4).locator('.fix')
    await expect(fix4).toBeVisible()
    const fix4Text = await fix4.innerText()
    expect(fix4Text).toContain('Tu ne sais rien')
  })
})
