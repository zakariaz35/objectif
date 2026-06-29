/**
 * Helper functions for interacting with CodeMirror 6 editors in Playwright tests.
 *
 * CodeMirror 6 renders a `.cm-editor` container with:
 *   - `.cm-content` — the contenteditable div that accepts keyboard input
 *   - `.cm-gutters` — line number gutter
 *
 * When esm.sh is unreachable the component falls back to a plain `.cm-fallback` textarea.
 * These helpers handle both cases transparently.
 */

/**
 * Fill a CodeMirror (or fallback textarea) editor with new content.
 * The editor is located inside `scope` (a Page or Locator).
 *
 * @param {import('@playwright/test').Page | import('@playwright/test').Locator} scope
 * @param {string} code
 */
export async function fillEditor(scope, code) {
  // Detect whether we are in CM or fallback mode.
  const fallback = scope.locator('.cm-fallback')
  const cmContent = scope.locator('.cm-content')

  // Wait for either the CM editor or the fallback textarea to appear.
  await Promise.race([
    cmContent.waitFor({ state: 'visible', timeout: 30_000 }),
    fallback.waitFor({ state: 'visible', timeout: 30_000 }),
  ])

  const fallbackVisible = await fallback.isVisible()

  if (fallbackVisible) {
    // Plain textarea — simple fill works.
    await fallback.fill(code)
  } else {
    // CodeMirror contenteditable — select-all then insert.
    await cmContent.click()
    // Select all existing content.
    await cmContent.press('Control+a')
    // Delete it (Delete key clears the selection in CM).
    await cmContent.press('Delete')
    // Insert text literally (no auto-indent side-effects).
    await cmContent.page().keyboard.insertText(code)
  }
}

/**
 * Read the current text content of a CodeMirror (or fallback textarea) editor.
 *
 * @param {import('@playwright/test').Page | import('@playwright/test').Locator} scope
 * @returns {Promise<string>}
 */
export async function getEditorValue(scope) {
  const fallback = scope.locator('.cm-fallback')
  const fallbackVisible = await fallback.isVisible().catch(() => false)

  if (fallbackVisible) {
    return fallback.inputValue()
  }

  // CodeMirror: read text via .cm-content's innerText.
  // CM stores the text in the DOM as plain text nodes inside .cm-content.
  const cmContent = scope.locator('.cm-content')
  return cmContent.innerText()
}

/**
 * Wait until a CodeMirror (or fallback) editor is ready inside `scope`.
 *
 * @param {import('@playwright/test').Page | import('@playwright/test').Locator} scope
 * @param {number} [timeout=30000]
 */
export async function waitForEditor(scope, timeout = 30_000) {
  const fallback = scope.locator('.cm-fallback')
  const cmEditor = scope.locator('.cm-editor')

  await Promise.race([
    cmEditor.waitFor({ state: 'visible', timeout }),
    fallback.waitFor({ state: 'visible', timeout }),
  ])
}
