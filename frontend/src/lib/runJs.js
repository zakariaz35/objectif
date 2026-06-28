// Runs a snippet of JS/TS in an isolated Web Worker, capturing console output.
// TypeScript is transpiled first (types stripped). `console.log/info/warn/error`
// and a `log(...)` shorthand are available.
// Returns a promise of { logs: string[], error: string|null }.
import { toJs } from './transpile'

const WORKER_SRC = `
function fmt(args) {
  return Array.prototype.map.call(args, function (v) {
    if (typeof v === 'string') return v;
    try { return JSON.stringify(v); } catch (e) { return String(v); }
  }).join(' ');
}
self.onmessage = function (e) {
  var logs = [], error = null;
  function push() { logs.push(fmt(arguments)); }
  var sandboxConsole = { log: push, info: push, warn: push, error: push };
  try {
    new Function('console', 'log', e.data.code)(sandboxConsole, push);
  } catch (err) {
    error = String((err && err.message) || err);
  }
  self.postMessage({ logs: logs, error: error });
};
`

// The sandbox runs code with `new Function` (no ES modules), so module syntax
// can't work: drop `import` lines and unwrap `export` so pasted snippets still run.
function stripModuleSyntax(code) {
  return code
    .replace(/^[ \t]*import\b[^\n]*\n?/gm, '')
    .replace(/^[ \t]*export\s+default\s+/gm, '')
    .replace(/^[ \t]*export\s+/gm, '')
}

export async function runCode(code, timeoutMs = 2000) {
  let js
  try {
    js = await toJs(stripModuleSyntax(code))
  } catch (e) {
    return { logs: [], error: 'Erreur de syntaxe : ' + (e.message || e) }
  }
  return runInWorker(js, timeoutMs)
}

function runInWorker(code, timeoutMs) {
  return new Promise((resolve) => {
    let url
    try {
      const blob = new Blob([WORKER_SRC], { type: 'application/javascript' })
      url = URL.createObjectURL(blob)
      const worker = new Worker(url)
      const timer = setTimeout(() => {
        worker.terminate()
        URL.revokeObjectURL(url)
        resolve({ logs: [], error: 'Temps dépassé (boucle infinie ?). Exécution interrompue.' })
      }, timeoutMs)
      worker.onmessage = (e) => {
        clearTimeout(timer)
        worker.terminate()
        URL.revokeObjectURL(url)
        resolve(e.data)
      }
      worker.onerror = (e) => {
        clearTimeout(timer)
        worker.terminate()
        URL.revokeObjectURL(url)
        resolve({ logs: [], error: e.message || 'Erreur dans le worker' })
      }
      worker.postMessage({ code })
    } catch (e) {
      if (url) URL.revokeObjectURL(url)
      resolve({ logs: [], error: String(e.message || e) })
    }
  })
}
