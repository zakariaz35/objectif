// Syntax highlighting for lesson code blocks — Shiki, lazy-loaded.
//
// The highlighter is a singleton created on first use (like mermaid in
// LessonView). We use Shiki's DUAL-THEME output (`defaultColor: false`): every
// token span carries both `--shiki-light` and `--shiki-dark` CSS variables, and
// CSS (style.css) picks the right one from the active `data-theme`. So there is
// NO need to re-highlight when the user switches theme.

// Languages we ship. Keep in sync with the code we actually write in lessons.
const LANGS = [
  'js', 'ts', 'jsx', 'tsx', 'python', 'vue', 'php',
  'json', 'yaml', 'bash', 'sql', 'html', 'css', 'markdown', 'graphql',
  'java', 'properties',
]

// Common aliases → canonical Shiki id.
const ALIASES = {
  javascript: 'js',
  typescript: 'ts',
  py: 'python',
  shell: 'bash',
  sh: 'bash',
  yml: 'yaml',
  md: 'markdown',
}

/** Languages we can highlight (canonical ids + aliases). */
export const SUPPORTED = new Set([...LANGS, ...Object.keys(ALIASES)])

let highlighterPromise = null

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = import('shiki').then(({ createHighlighter }) =>
      createHighlighter({
        themes: ['github-light', 'github-dark'],
        langs: LANGS,
      }),
    )
  }
  return highlighterPromise
}

/**
 * Highlight `code` for `lang`. Returns a Shiki HTML string (`<pre class="shiki">
 * …`) on success, or `null` if the language is unsupported or highlighting
 * fails — callers keep the raw text in that case.
 */
export async function highlight(code, lang) {
  const id = ALIASES[lang] || lang
  if (!id || !LANGS.includes(id)) return null
  try {
    const hl = await getHighlighter()
    return hl.codeToHtml(code, {
      lang: id,
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
    })
  } catch (e) {
    return null // unknown grammar / Shiki failure → graceful fallback
  }
}
