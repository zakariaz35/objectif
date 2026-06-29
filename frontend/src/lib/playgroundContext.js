import { reactive, computed } from 'vue'

// Tracks the stack of the formation currently being viewed, so the global
// playground buttons (Vue SFC / JS-TS sandbox) only show up where they make
// sense. Set by FormationView on load, cleared on leave. Empty everywhere else
// (home, auth…) → no floating buttons.
export const pgContext = reactive({ stack: '' })

export function setPlaygroundStack(stack) {
  pgContext.stack = stack || ''
}

// Classify the current stack once; the three visibility exports derive from it.
// 'python' → Python sandbox; 'js' → JS/TS sandbox (+ Vue SFC when applicable).
const stackType = computed(() => {
  const s = pgContext.stack
  if (/python|pandas/i.test(s)) return 'python'
  if (/vue|angular|react|javascript|typescript/i.test(s)) return 'js'
  return null
})

// Vue playground: only on a Vue course.
export const showVuePlayground = computed(() => /vue/i.test(pgContext.stack))

// JS/TS sandbox: only on JS/TS app courses (Vue, Angular, React). Data courses
// (Python, SQL, Excel, Power BI, BI) don't need it — their exercises run inline.
export const showJsPlayground = computed(() => stackType.value === 'js')

// Python sandbox (Pyodide): on Python / pandas courses.
export const showPythonPlayground = computed(() => stackType.value === 'python')
