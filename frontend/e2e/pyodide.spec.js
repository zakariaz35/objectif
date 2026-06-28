import { test, expect } from '@playwright/test'

// Timeout très généreux pour Pyodide (1er chargement = téléchargement WASM ~10MB)
test.describe('Playground Python (Pyodide)', () => {
  // On part de la page parcours-python pour que le FAB 🐍 soit disponible

  test('exécution basique : print("Bonjour 👋") → sortie "Bonjour"', async ({ page }) => {
    // Timeout propre à ce test — le 1er chargement Pyodide prend jusqu'à ~60-90s
    test.setTimeout(180_000)

    await page.goto('/f/parcours-python')
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15_000 })

    // Ouvrir le playground via le FAB 🐍
    const fabPy = page.locator('.fab-py')
    await expect(fabPy).toBeVisible({ timeout: 10_000 })
    await fabPy.click()

    // La modale doit s'ouvrir
    const modal = page.locator('.modal')
    await expect(modal).toBeVisible({ timeout: 5_000 })

    // L'éditeur doit contenir du code par défaut (print("Bonjour 👋"))
    const editor = modal.locator('.editor')
    await expect(editor).toBeVisible()

    // Vérifier que le code par défaut contient "Bonjour"
    const defaultCode = await editor.inputValue()
    expect(defaultCode, 'Le code par défaut devrait contenir "Bonjour"').toContain('Bonjour')

    // Cliquer sur "▶ Exécuter"
    const runBtn = modal.locator('button', { hasText: '▶ Exécuter' })
    await expect(runBtn).toBeVisible()
    await runBtn.click()

    // Attendre la fin de l'exécution (le bouton repasse à "▶ Exécuter")
    // et que la sortie apparaisse — timeout long pour le 1er chargement Pyodide
    await expect(modal.locator('button', { hasText: '▶ Exécuter' })).toBeVisible({ timeout: 120_000 })

    // Vérifier la sortie : doit contenir "Bonjour"
    const out = modal.locator('.out')
    await expect(out).toBeVisible({ timeout: 10_000 })
    const outText = await out.innerText()
    expect(outText, 'La sortie doit contenir "Bonjour"').toContain('Bonjour')

    // Pas d'erreur affichée
    await expect(modal.locator('.err')).not.toBeVisible()
  })

  test('pandas auto-chargé : shape (2, 1) affiché', async ({ page }) => {
    test.setTimeout(180_000)

    await page.goto('/f/parcours-python')
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15_000 })

    const fabPy = page.locator('.fab-py')
    await expect(fabPy).toBeVisible({ timeout: 10_000 })
    await fabPy.click()

    const modal = page.locator('.modal')
    await expect(modal).toBeVisible({ timeout: 5_000 })

    // Remplacer le code dans l'éditeur (fill remplace tout le contenu)
    const editor = modal.locator('.editor')
    await editor.fill('import pandas as pd\nprint(pd.DataFrame({"a": [1, 2]}).shape)')

    // Exécuter
    const runBtn = modal.locator('button', { hasText: '▶ Exécuter' })
    await runBtn.click()

    // Attendre la fin (Pyodide chargé depuis le test précédent — plus rapide)
    await expect(modal.locator('button', { hasText: '▶ Exécuter' })).toBeVisible({ timeout: 120_000 })

    // Vérifier la sortie
    const out = modal.locator('.out')
    await expect(out).toBeVisible({ timeout: 10_000 })
    const outText = await out.innerText()
    expect(outText, 'La sortie doit contenir "(2, 1)"').toContain('(2, 1)')

    await expect(modal.locator('.err')).not.toBeVisible()
  })
})
