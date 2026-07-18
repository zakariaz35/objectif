// Runs a snippet of JS/TS in an isolated **module** Web Worker, capturing console
// output. ES `import` works: bare specifiers (e.g. 'vue') are resolved to a CDN
// (esm.sh), so snippets that import packages actually run. TypeScript is stripped
// first via Sucrase. `console.log/info/warn/error` and a `log(...)` shorthand are
// available. Returns a promise of { logs: string[], error: string|null }.
import { toJs } from './transpile'

const CDN = 'https://esm.sh/'

// Rewrite bare import specifiers to the CDN; leave relative paths and URLs alone.
function rewriteImports(line) {
  return line.replace(/((?:from|import)\s+)(['"])([^'"]+)\2/g, (m, pre, q, spec) => {
    if (/^[./]/.test(spec) || /^https?:\/\//.test(spec)) return m
    return pre + q + CDN + spec + q
  })
}

// Assemble a module: imports hoisted on top, console captured, user body run.
function buildModule(code) {
  const imports = []
  const body = code.replace(/^[ \t]*import\b[^\n]*\n?/gm, (line) => {
    imports.push(rewriteImports(line.trim()))
    return ''
  })

  return `${imports.join('\n')}
function __fmt(args) {
  return Array.prototype.map.call(args, function (v) {
    if (typeof v === 'string') return v
    try { return JSON.stringify(v) } catch (e) { return String(v) }
  }).join(' ')
}
const __logs = []
const __push = function () { __logs.push(__fmt(arguments)) }
globalThis.console = { log: __push, info: __push, warn: __push, error: __push }
const log = __push
try {
${body}
} catch (e) {
  self.postMessage({ error: String((e && e.message) || e), logs: __logs })
  throw e
}
self.postMessage({ logs: __logs })
`
}

function runModuleWorker(moduleSrc, timeoutMs) {
  return new Promise((resolve) => {
    let url
    try {
      url = URL.createObjectURL(new Blob([moduleSrc], { type: 'application/javascript' }))
      const worker = new Worker(url, { type: 'module' })
      const done = (result) => {
        clearTimeout(timer)
        worker.terminate()
        URL.revokeObjectURL(url)
        resolve(result)
      }
      const timer = setTimeout(
        () => done({ logs: [], error: 'Temps dépassé (boucle infinie ?). Exécution interrompue.' }),
        timeoutMs,
      )
      worker.onmessage = (e) => done({ logs: e.data.logs || [], error: e.data.error || null })
      worker.onerror = (e) =>
        done({ logs: [], error: e.message || "Erreur (import introuvable ?). Vérifie le nom du paquet." })
    } catch (e) {
      if (url) URL.revokeObjectURL(url)
      resolve({ logs: [], error: String(e.message || e) })
    }
  })
}

export async function runCode(code, timeoutMs = 5000) {
  let js
  try {
    js = await toJs(code)
  } catch (e) {
    return { logs: [], error: 'Erreur de syntaxe : ' + (e.message || e) }
  }
  return runModuleWorker(buildModule(js), timeoutMs)
}
