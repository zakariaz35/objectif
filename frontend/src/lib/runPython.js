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
    const w = getWorker()
    const id = ++seq
    const timer = setTimeout(() => {
      if (!pending.has(id)) return
      pending.delete(id)
      try { w.terminate() } catch (_) { /* ignore */ }
      worker = null
      resolve({ error: 'Temps dépassé (boucle infinie ?). Exécution interrompue.' })
    }, timeoutMs)
    pending.set(id, { resolve, timer })
    w.postMessage({ id, ...payload })
  })
}

// Playground: run a snippet → { logs, error }.
export async function runPython(code, { packages = [], timeoutMs = 60000 } = {}) {
  const d = await send({ code, packages }, timeoutMs)
  return { logs: d.logs || [], error: d.error || null }
}

// Exercise: run user code + tests → { logs, runError, results, error }.
export async function runPythonTests(userCode, tests, { timeoutMs = 60000 } = {}) {
  const d = await send({ type: 'test', userCode, tests }, timeoutMs)
  return { logs: d.logs || [], runError: d.runError || null, results: d.results || [], error: d.error || null }
}
