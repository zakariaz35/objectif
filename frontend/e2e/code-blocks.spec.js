import { test, expect } from '@playwright/test'
import { waitForEditor } from './helpers/codemirror.js'

// Décorations des blocs de code dans les leçons + autocomplétion du bac à sable.
//
// Leçon de référence AVEC blocs JS : js-debutant/reprise-javascript/cours
//   → label langage, bouton Copier, bouton Tester, coloration Shiki.
// Leçon de référence AVEC un bloc SANS langage (arbre src/) :
//   demo-course/vue-densemble/le-projet-en-30-secondes
//   → régression du fix : PAS de Tester, PAS de label, MAIS un bouton Copier.

const JS_LESSON = '/f/js-debutant/reprise-javascript/cours'
const NOLANG_LESSON = '/f/demo-course/vue-densemble/le-projet-en-30-secondes'

test.describe('Décorations des blocs de code (leçons)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('locale', 'fr'))
  })

  test('bloc JS : label langage + Copier + Tester + coloration Shiki', async ({ page }) => {
    await page.goto(JS_LESSON)
    await expect(page.locator('article .prose pre').first()).toBeVisible({ timeout: 20_000 })

    const pre = page.locator('.prose pre').first()
    await expect(pre.locator('.code-lang')).toHaveText('js')
    await expect(pre.locator('.copy-btn')).toHaveCount(1)
    await expect(pre.locator('.scratch-btn')).toHaveCount(1)

    // Coloration : Shiki remplace le <code> par des spans colorés (asynchrone).
    await expect(pre.locator('code.shiki')).toBeVisible({ timeout: 10_000 })
    const coloredSpans = pre.locator('code.shiki span[style*="--shiki"]')
    expect(await coloredSpans.count()).toBeGreaterThan(0)
  })

  test('régression : un bloc SANS langage n’a ni Tester ni label, mais garde Copier', async ({ page }) => {
    await page.goto(NOLANG_LESSON)
    await expect(page.locator('article .prose pre').first()).toBeVisible({ timeout: 20_000 })

    // Le bloc contenant l’arbre src/ (fence sans langage).
    const tree = page.locator('.prose pre').filter({ hasText: 'IamModule' })
    await expect(tree).toHaveCount(1)
    await expect(tree.locator('.scratch-btn')).toHaveCount(0)
    await expect(tree.locator('.code-lang')).toHaveCount(0)
    await expect(tree.locator('.copy-btn')).toHaveCount(1)
    // Pas de coloration Shiki non plus (langage inconnu).
    await expect(tree.locator('code.shiki')).toHaveCount(0)
  })

  test('bouton Copier : feedback « Copié » + presse-papier = texte brut', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto(JS_LESSON)
    await expect(page.locator('article .prose pre').first()).toBeVisible({ timeout: 20_000 })

    const pre = page.locator('.prose pre').first()
    const copy = pre.locator('.copy-btn')
    await copy.hover()
    await copy.click()

    // Feedback visuel : classe .done + libellé « Copié ».
    await expect(copy).toHaveClass(/done/)
    await expect(copy).toContainText('Copié')

    // Le presse-papier contient le texte brut, PAS le HTML des spans Shiki.
    const clip = await page.evaluate(() => navigator.clipboard.readText())
    expect(clip.length).toBeGreaterThan(0)
    expect(clip).not.toContain('<span')

    // Le feedback revient à « Copier » après ~1,5 s.
    await expect(copy).not.toHaveClass(/done/, { timeout: 4_000 })
  })
})

test.describe('Autocomplétion du bac à sable (CodeMirror)', () => {
  test('taper « con » propose une complétion (dont console)', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('locale', 'fr'))
    await page.goto(JS_LESSON)
    await expect(page.locator('article .prose pre').first()).toBeVisible({ timeout: 20_000 })

    // Ouvrir le bac à sable depuis le premier bouton Tester.
    const tester = page.locator('.prose pre .scratch-btn').first()
    await tester.hover()
    await tester.click()

    const modal = page.locator('.modal')
    await expect(modal).toBeVisible({ timeout: 10_000 })
    await waitForEditor(modal, 30_000)

    // Si fallback textarea (bundle absent), on ne teste pas l’autocomplétion.
    const isCM = await modal.locator('.cm-content').isVisible().catch(() => false)
    test.skip(!isCM, 'CodeMirror indisponible (fallback textarea) — autocomplétion sans objet')

    const content = modal.locator('.cm-content')
    await content.click()
    await content.press('Control+a')
    await content.press('Delete')
    await page.keyboard.type('con', { delay: 60 })

    const tooltip = page.locator('.cm-tooltip-autocomplete')
    await expect(tooltip).toBeVisible({ timeout: 6_000 })
    await expect(tooltip.locator('> ul > li', { hasText: 'console' })).toHaveCount(1)
  })

  test('fermeture automatique des parenthèses : « foo( » → « foo() »', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('locale', 'fr'))
    await page.goto(JS_LESSON)
    await expect(page.locator('article .prose pre').first()).toBeVisible({ timeout: 20_000 })

    const tester = page.locator('.prose pre .scratch-btn').first()
    await tester.hover()
    await tester.click()
    const modal = page.locator('.modal')
    await expect(modal).toBeVisible({ timeout: 10_000 })
    await waitForEditor(modal, 30_000)
    const isCM = await modal.locator('.cm-content').isVisible().catch(() => false)
    test.skip(!isCM, 'CodeMirror indisponible (fallback textarea)')

    const content = modal.locator('.cm-content')
    await content.click()
    await content.press('Control+a')
    await content.press('Delete')
    await page.keyboard.type('foo(')
    await expect(content).toContainText('foo()')
  })
})
