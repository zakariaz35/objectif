// Module Web Worker: runs Python in the browser via Pyodide (CPython → WebAssembly,
// loaded from a CDN). Persistent: Pyodide is loaded once on the first message and
// reused. Captures stdout/stderr and auto-loads packages referenced by imports
// (e.g. `import pandas`). Messages: { id, code, packages? } → { id, logs, error }.
const VERSION = 'v0.27.7'
const INDEX_URL = `https://cdn.jsdelivr.net/pyodide/${VERSION}/full/`

let pyReady = null
function getPyodide() {
  if (!pyReady) {
    pyReady = (async () => {
      // Loaded from the CDN at runtime — Vite must not try to resolve/bundle it.
      const { loadPyodide } = await import(/* @vite-ignore */ `${INDEX_URL}pyodide.mjs`)
      return loadPyodide({ indexURL: INDEX_URL })
    })()
  }
  return pyReady
}

self.onmessage = async (e) => {
  const { id, code, packages } = e.data
  const logs = []
  try {
    const py = await getPyodide()
    py.setStdout({ batched: (s) => logs.push(s) })
    py.setStderr({ batched: (s) => logs.push(s) })
    if (packages && packages.length) await py.loadPackage(packages)
    // Pull in packages used by `import ...` (pandas, numpy…) before running.
    await py.loadPackagesFromImports(code)
    await py.runPythonAsync(code)
    self.postMessage({ id, logs, error: null })
  } catch (err) {
    self.postMessage({ id, logs, error: String((err && err.message) || err) })
  }
}
