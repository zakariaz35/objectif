// Module Web Worker: runs Python in the browser via Pyodide (CPython → WebAssembly,
// loaded from a CDN). Persistent: Pyodide is loaded once on the first message and
// reused. Two message types:
//   { id, code, packages? }                  → run a snippet  → { id, logs, error }
//   { id, type:'test', userCode, tests }      → run an exercise suite
//                                             → { id, type:'test', logs, runError, results }
// Packages referenced by imports (pandas, numpy…) are auto-loaded.
const VERSION = 'v0.27.7'
const INDEX_URL = `https://cdn.jsdelivr.net/pyodide/${VERSION}/full/`

// Python harness defining run_suite() for exercises. Mirrors the JS ExercisePlayer:
// phase 1 runs the user code once (captured output → "Sortie"); phase 2 runs each
// test in its OWN namespace (user code silently, then the test with its own captured
// output), with assert_/assert_equal helpers. assertEqual is an alias for comfort.
const HARNESS = `
import io, contextlib

_HELPERS = '''
def assert_(cond, msg="Assertion echouee"):
    if not cond:
        raise AssertionError(msg)

def assert_equal(actual, expected, msg="assert_equal"):
    if actual != expected:
        raise AssertionError(f"{msg} — attendu {expected!r}, obtenu {actual!r}")

assertEqual = assert_equal
'''

def run_suite(user_code, tests):
    results = []
    buf = io.StringIO()
    run_error = None
    try:
        with contextlib.redirect_stdout(buf):
            exec(user_code, {})
    except Exception as e:
        run_error = f"{type(e).__name__}: {e}"
    logs = buf.getvalue().splitlines()

    for t in tests:
        out = io.StringIO()
        ns = {}
        try:
            exec(_HELPERS, ns)
            with contextlib.redirect_stdout(io.StringIO()):
                exec(user_code, ns)
            with contextlib.redirect_stdout(out):
                exec(t["code"], ns)
            results.append({"name": t["name"], "pass": True, "output": out.getvalue().splitlines()})
        except Exception as e:
            results.append({"name": t["name"], "pass": False,
                            "error": f"{type(e).__name__}: {e}", "output": out.getvalue().splitlines()})

    return {"logs": logs, "runError": run_error, "results": results}
`

let pyReady = null
function getPyodide() {
  if (!pyReady) {
    pyReady = (async () => {
      // Loaded from the CDN at runtime — Vite must not try to resolve/bundle it.
      const { loadPyodide } = await import(/* @vite-ignore */ `${INDEX_URL}pyodide.mjs`)
      const py = await loadPyodide({ indexURL: INDEX_URL })
      await py.runPythonAsync(HARNESS) // define run_suite once
      return py
    })()
  }
  return pyReady
}

self.onmessage = async (e) => {
  const { id, type = 'run', code, userCode, tests, packages } = e.data
  try {
    const py = await getPyodide()

    if (type === 'test') {
      const allCode = (userCode || '') + '\n' + (tests || []).map((t) => t.code).join('\n')
      await py.loadPackagesFromImports(allCode)
      const runSuite = py.globals.get('run_suite')
      const proxy = runSuite(userCode, py.toPy(tests || []))
      const out = proxy.toJs({ dict_converter: Object.fromEntries })
      proxy.destroy()
      runSuite.destroy()
      self.postMessage({
        id,
        type: 'test',
        logs: out.logs || [],
        runError: out.runError || null,
        results: out.results || [],
      })
      return
    }

    // Default: run a snippet (playground).
    const logs = []
    py.setStdout({ batched: (s) => logs.push(s) })
    py.setStderr({ batched: (s) => logs.push(s) })
    if (packages && packages.length) await py.loadPackage(packages)
    await py.loadPackagesFromImports(code)
    await py.runPythonAsync(code)
    self.postMessage({ id, logs, error: null })
  } catch (err) {
    self.postMessage({ id, type, logs: [], error: String((err && err.message) || err) })
  }
}
