// Module Web Worker: runs Python in the browser via Pyodide (CPython → WebAssembly,
// loaded from a CDN). Persistent: Pyodide is loaded once on the first message and
// reused. Two message types:
//   { id, code, packages? }                → run a snippet (playground)
//        → { id, logs, html, images, error }   (rich: DataFrame→HTML, matplotlib→PNG)
//   { id, type:'test', userCode, tests }   → run an exercise suite
//        → { id, type:'test', logs, runError, results }
// Packages referenced by imports (pandas, numpy, matplotlib…) are auto-loaded.
const VERSION = 'v0.27.7'
const INDEX_URL = `https://cdn.jsdelivr.net/pyodide/${VERSION}/full/`

// Python harness, defined once after load.
//  - run_suite(): exercise runner (mirrors the JS ExercisePlayer: phase-1 user code,
//    phase-2 each test in its own namespace, helpers assert_/assert_equal/assertEqual).
//  - run_cell(): playground runner with notebook-like rich output — the value of the
//    last expression is rendered (DataFrame/anything with _repr_html_ → HTML table),
//    and any matplotlib figures are returned as base64 PNGs.
const HARNESS = `
import os
os.environ.setdefault("MPLBACKEND", "AGG")  # matplotlib renders off-screen (no DOM)
import io, contextlib, base64, sys, ast, traceback

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

def run_cell(code):
    buf = io.StringIO()
    html = None
    images = []
    error = None
    g = {}
    try:
        with contextlib.redirect_stdout(buf), contextlib.redirect_stderr(buf):
            tree = ast.parse(code)
            last_expr = None
            if tree.body and isinstance(tree.body[-1], ast.Expr):
                last_expr = ast.Expression(tree.body.pop().value)
            exec(compile(tree, "<cell>", "exec"), g)
            value = eval(compile(last_expr, "<cell>", "eval"), g) if last_expr is not None else None
            if value is not None:
                if hasattr(value, "_repr_html_"):
                    html = value._repr_html_()
                else:
                    print(repr(value))
            if "matplotlib" in sys.modules:
                import matplotlib.pyplot as plt
                for num in plt.get_fignums():
                    bio = io.BytesIO()
                    plt.figure(num).savefig(bio, format="png", bbox_inches="tight", dpi=110)
                    images.append(base64.b64encode(bio.getvalue()).decode())
                plt.close("all")
    except Exception:
        error = traceback.format_exc(limit=3)
    return {"stdout": buf.getvalue(), "html": html, "images": images, "error": error}
`

let pyReady = null
// Cached proxies for the two Python harness functions — fetched once after the
// harness is loaded and reused across messages to avoid repeated WASM boundary
// crossings. These live for the worker's lifetime, so no .destroy() needed.
let cachedRunSuite = null
let cachedRunCell = null

function getPyodide() {
  if (!pyReady) {
    pyReady = (async () => {
      // Loaded from the CDN at runtime — Vite must not try to resolve/bundle it.
      const { loadPyodide } = await import(/* @vite-ignore */ `${INDEX_URL}pyodide.mjs`)
      const py = await loadPyodide({ indexURL: INDEX_URL })
      await py.runPythonAsync(HARNESS) // define run_suite + run_cell once
      cachedRunSuite = py.globals.get('run_suite')
      cachedRunCell = py.globals.get('run_cell')
      return py
    })()
  }
  return pyReady
}

function splitLines(s) {
  return s ? s.replace(/\n+$/, '').split('\n') : []
}

self.onmessage = async (e) => {
  const { id, type = 'run', code, userCode, tests, packages } = e.data
  try {
    const py = await getPyodide()

    if (type === 'test') {
      const allCode = (userCode || '') + '\n' + (tests || []).map((t) => t.code).join('\n')
      await py.loadPackagesFromImports(allCode)
      const argv = py.toPy(tests || [])
      let out
      try {
        const proxy = cachedRunSuite(userCode, argv)
        try {
          out = proxy.toJs({ dict_converter: Object.fromEntries })
        } finally {
          proxy.destroy()
        }
      } finally {
        argv.destroy()
      }
      self.postMessage({ id, type: 'test', logs: out.logs || [], runError: out.runError || null, results: out.results || [] })
      return
    }

    // Playground: run a snippet with rich output.
    if (packages && packages.length) await py.loadPackage(packages)
    await py.loadPackagesFromImports(code)
    let out
    {
      const proxy = cachedRunCell(code)
      try {
        out = proxy.toJs({ dict_converter: Object.fromEntries })
      } finally {
        proxy.destroy()
      }
    }
    self.postMessage({
      id,
      logs: splitLines(out.stdout),
      html: out.html || null,
      images: out.images || [],
      error: out.error || null,
    })
  } catch (err) {
    self.postMessage({ id, type, logs: [], images: [], error: String((err && err.message) || err) })
  }
}
