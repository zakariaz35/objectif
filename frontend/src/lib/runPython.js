// Front-facing helper to run Python via the persistent Pyodide worker.
// Mirrors runJs.js#runCode, but keeps ONE worker alive (Pyodide load is costly):
// it is only recreated after a timeout (stuck/infinite loop). Returns a promise
// of { logs: string[], error: string|null }.

let worker = null
let seq = 0
const pending = new Map()

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL('./pyodideWorker.js', import.meta.url), { type: 'module' })
    worker.onmessage = (e) => {
      const { id, logs, error } = e.data
      const p = pending.get(id)
      if (!p) return
      clearTimeout(p.timer)
      pending.delete(id)
      p.resolve({ logs: logs || [], error: error || null })
    }
    worker.onerror = (e) => {
      // Fatal worker error (e.g. CDN unreachable): fail everything pending, reset.
      const msg = e.message || 'Erreur du worker Python (CDN injoignable ?).'
      for (const p of pending.values()) {
        clearTimeout(p.timer)
        p.resolve({ logs: [], error: msg })
      }
      pending.clear()
      try { worker.terminate() } catch (_) { /* ignore */ }
      worker = null
    }
  }
  return worker
}

// timeoutMs is generous: the FIRST run also downloads Pyodide (several MB), plus
// any package (pandas…). Subsequent runs are fast.
export function runPython(code, { packages = [], timeoutMs = 60000 } = {}) {
  return new Promise((resolve) => {
    const w = getWorker()
    const id = ++seq
    const timer = setTimeout(() => {
      if (!pending.has(id)) return
      pending.delete(id)
      try { w.terminate() } catch (_) { /* ignore */ }
      worker = null // next run reloads Pyodide
      resolve({ logs: [], error: 'Temps dépassé (boucle infinie ?). Exécution interrompue.' })
    }, timeoutMs)
    pending.set(id, { resolve, timer })
    w.postMessage({ id, code, packages })
  })
}
