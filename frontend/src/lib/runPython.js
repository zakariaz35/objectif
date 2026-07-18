// Front-facing helpers for the persistent Pyodide worker. Keeps ONE worker alive
// (Pyodide load is costly); it is only recreated after a timeout (stuck/infinite
// loop). Two entry points: runPython (playground snippet) and runPythonTests
// (exercise suite).

let worker = null
let seq = 0
const pending = new Map()

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL('./pyodideWorker.js', import.meta.url), { type: 'module' })
    worker.onmessage = (e) => {
      const p = pending.get(e.data.id)
      if (!p) return
      clearTimeout(p.timer)
      pending.delete(e.data.id)
      p.resolve(e.data)
    }
    worker.onerror = (e) => {
      const msg = e.message || 'Erreur du worker Python (CDN injoignable ?).'
      for (const p of pending.values()) {
        clearTimeout(p.timer)
        p.resolve({ error: msg })
      }
      pending.clear()
      try { worker.terminate() } catch (_) { /* ignore */ }
      worker = null
    }
  }
  return worker
}

// Generic request → resolves with the worker's message payload. On timeout the
// worker is killed (next call reloads Pyodide). timeoutMs is generous: the FIRST
// call also downloads Pyodide (several MB) + any package (pandas…).
function send(payload, timeoutMs) {
  return new Promise((resolve) => {
    let w
    try {
      w = getWorker()
    } catch (e) {
      // Worker creation blocked (e.g. CSP) → resolve with an error instead of
      // throwing, so callers never stay stuck on "running".
      resolve({ error: String((e && e.message) || e) })
      return
    }
    const id = ++seq
    const timer = setTimeout(() => {
      if (!pending.has(id)) return
      // The worker is killed → every in-flight request on it is now void, not just
      // this one. Fail them all so no Promise hangs forever.
      try { w.terminate() } catch (_) { /* ignore */ }
      worker = null
      for (const [pid, p] of pending) {
        clearTimeout(p.timer)
        p.resolve({
          error: pid === id
            ? 'Temps dépassé (boucle infinie ?). Exécution interrompue.'
            : 'Exécution interrompue (worker Python réinitialisé).',
        })
      }
      pending.clear()
    }, timeoutMs)
    pending.set(id, { resolve, timer })
    w.postMessage({ id, ...payload })
  })
}

// Playground: run a snippet → { logs, html, images, error }.
// html = rich repr of the last expression (e.g. a DataFrame as an HTML table);
// images = base64 PNGs of any matplotlib figures.
export async function runPython(code, { packages = [], timeoutMs = 60000 } = {}) {
  const d = await send({ code, packages }, timeoutMs)
  return { logs: d.logs || [], html: d.html || null, images: d.images || [], error: d.error || null }
}

// Exercise: run user code + tests → { logs, runError, results, error }.
export async function runPythonTests(userCode, tests, { timeoutMs = 60000 } = {}) {
  const d = await send({ type: 'test', userCode, tests }, timeoutMs)
  return { logs: d.logs || [], runError: d.runError || null, results: d.results || [], error: d.error || null }
}
