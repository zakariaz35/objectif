import { reactive, computed } from 'vue'

// Tracks the stack of the formation currently being viewed, so the global
// playground buttons (Vue SFC / JS-TS sandbox) only show up where they make
// sense. Set by FormationView on load, cleared on leave. Empty everywhere else
// (home, auth…) → no floating buttons.
export const pgContext = reactive({ stack: '' })

export function setPlaygroundStack(stack) {
  pgContext.stack = stack || ''
}

// Vue playground: only on a Vue course.
export const showVuePlayground = computed(() => /vue/i.test(pgContext.stack))

// JS/TS sandbox: only on JS/TS app courses (Vue, Angular, React). Data courses
// (Python, SQL, Excel, Power BI, BI) don't need it — their exercises run inline.
export const showJsPlayground = computed(() =>
  /vue|angular|react|javascript|typescript/i.test(pgContext.stack),
)

// Python sandbox (Pyodide): on Python / pandas courses.
export const showPythonPlayground = computed(() => /python|pandas/i.test(pgContext.stack))
