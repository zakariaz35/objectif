<script setup>
import { ref, computed, watch } from 'vue'
import BaseCallout from './BaseCallout.vue'
import CodeEditor from './CodeEditor.vue'
import { toJs } from '../lib/transpile'
import { runPythonTests } from '../lib/runPython'

const props = defineProps({
  starter: { type: String, default: '' },
  tests: { type: Array, default: () => [] },
  language: { type: String, default: 'js' },
})
const emit = defineEmits(['completed'])

const code = ref(props.starter)
const results = ref(null) // [{ name, pass, error }]
const logs = ref([]) // console output captured from the code
const running = ref(false)
const globalError = ref(null)
let emitted = false

const allPass = computed(
  () => results.value && results.value.length > 0 && results.value.every((r) => r.pass)
)
const passCount = computed(() => (results.value ? results.value.filter((r) => r.pass).length : 0))

watch(allPass, (ok) => {
  if (ok && !emitted) {
    emitted = true
    emit('completed')
  }
})

// Web Worker source. Phase 1: run the user code once with a captured console
// (free experimentation → "Sortie" panel). Phase 2: run each test capturing its
// OWN console output (so a test can illustrate encode → decode), while the user
// code's top-level logs stay silent during tests (no duplication).
// (concatenated string to avoid nested backticks)
const WORKER_SRC = `
var REAL = self.console || {};
function fmt(args) {
  return Array.prototype.map.call(args, function (v) {
    if (typeof v === 'string') return v;
    try { return JSON.stringify(v); } catch (e) { return String(v); }
  }).join(' ');
}
function makeConsole(buf) {
  function c(method) {
    return function () {
      buf.push(fmt(arguments));
      if (REAL[method]) REAL[method].apply(REAL, arguments);
    };
  }
  return { log: c('log'), info: c('info'), warn: c('warn'), error: c('error') };
}
var SILENT = { log: function(){}, info: function(){}, warn: function(){}, error: function(){} };
function assert(cond, msg) { if (!cond) throw new Error(msg || 'Assertion échouée'); }
function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
  var ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (var i = 0; i < ka.length; i++) if (!deepEqual(a[ka[i]], b[ka[i]])) return false;
  return true;
}
function assertEqual(actual, expected, msg) {
  if (!deepEqual(actual, expected))
    throw new Error((msg || 'assertEqual') + ' — attendu ' + fmt([expected]) + ', obtenu ' + fmt([actual]));
}

self.onmessage = function (e) {
  var userCode = e.data.userCode, tests = e.data.tests;
  var logs = [], runError = null, results = [];

  // Phase 1 — run user code once, capturing its console output.
  try {
    new Function('console', userCode)(makeConsole(logs));
  } catch (err) {
    runError = String((err && err.message) || err);
  }

  // Phase 2 — per test: user code runs SILENT, then the test runs with its own
  // captured console (its const/let live in a block, no name collisions).
  for (var i = 0; i < tests.length; i++) {
    var out = [];
    try {
      var body = 'var console = SILENT;\\n' + userCode + '\\n;\\nconsole = CAP;\\n{\\n' + tests[i].code + '\\n}\\n';
      new Function('assert', 'assertEqual', 'SILENT', 'CAP', body)(assert, assertEqual, SILENT, makeConsole(out));
      results.push({ name: tests[i].name, pass: true, output: out });
    } catch (err) {
      results.push({ name: tests[i].name, pass: false, error: String((err && err.message) || err), output: out });
    }
  }

  self.postMessage({ logs: logs, runError: runError, results: results });
};
`

function runInWorker(userCode, tests) {
  return new Promise((resolve) => {
    let url
    try {
      const blob = new Blob([WORKER_SRC], { type: 'application/javascript' })
      url = URL.createObjectURL(blob)
      const worker = new Worker(url)
      const timer = setTimeout(() => {
        worker.terminate()
        URL.revokeObjectURL(url)
        resolve({ timeout: true })
      }, 2000)
      worker.onmessage = (e) => {
        clearTimeout(timer)
        worker.terminate()
        URL.revokeObjectURL(url)
        resolve({ data: e.data })
      }
      worker.onerror = (e) => {
        clearTimeout(timer)
        worker.terminate()
        URL.revokeObjectURL(url)
        resolve({ error: e.message || 'Erreur dans le worker' })
      }
      worker.postMessage({ userCode, tests })
    } catch (e) {
      if (url) URL.revokeObjectURL(url)
      resolve({ error: String(e.message || e) })
    }
  })
}

async function run() {
  running.value = true
  results.value = null
  logs.value = []
  globalError.value = null
  emitted = allPass.value // avoid re-emitting if already passed
  // Plain copy: a reactive proxy can't be structured-cloned by postMessage.
  let userCode = code.value
  let tests = props.tests.map((t) => ({ name: t.name, code: t.code }))
  // Python exercises run via Pyodide (no transpile, separate runner).
  if (props.language === 'python' || props.language === 'py') {
    const out = await runPythonTests(userCode, tests)
    running.value = false
    if (out.error) {
      globalError.value = 'Erreur : ' + out.error
      return
    }
    logs.value = out.logs || []
    results.value = out.results || []
    if (out.runError) globalError.value = 'Erreur : ' + out.runError
    return
  }
  // TS / TSX / JSX exercises: transpile user code + tests to JS before running.
  if (['ts', 'tsx', 'jsx'].includes(props.language)) {
    try {
      userCode = await toJs(userCode, props.language)
      tests = await Promise.all(tests.map(async (t) => ({ name: t.name, code: await toJs(t.code, props.language) })))
    } catch (e) {
      running.value = false
      globalError.value = 'Erreur de syntaxe : ' + (e.message || e)
      return
    }
  }
  const out = await runInWorker(userCode, tests)
  running.value = false
  if (out.timeout) {
    globalError.value = 'Temps dépassé (boucle infinie ?). Exécution interrompue.'
  } else if (out.error) {
    globalError.value = 'Erreur : ' + out.error
  } else {
    logs.value = out.data.logs || []
    results.value = out.data.results
    if (out.data.runError) globalError.value = 'Erreur : ' + out.data.runError
  }
}

function reset() {
  code.value = props.starter
  results.value = null
  logs.value = []
  globalError.value = null
  emitted = false
}

</script>

<template>
  <div class="exo">
    <div class="bar">
      <span class="lang">{{ language }}</span>
      <span class="spacer"></span>
      <button class="btn btn-ghost" type="button" @click="reset">↻ Réinitialiser</button>
      <button class="btn btn-primary" type="button" :disabled="running" @click="run">
        {{ running ? 'Exécution…' : '▶ Lancer les tests' }}
      </button>
    </div>

    <CodeEditor v-model="code" :language="language" />

    <BaseCallout v-if="globalError" tone="bad" class="banner">{{ globalError }}</BaseCallout>

    <div v-if="logs.length" class="console">
      <div class="clabel">Sortie (console)</div>
      <pre v-for="(line, i) in logs" :key="i" class="cline">{{ line }}</pre>
    </div>

    <BaseCallout v-if="allPass" tone="good" class="banner">
      ✅ Tous les tests passent ({{ passCount }}/{{ results.length }}) — exercice validé !
    </BaseCallout>

    <ul v-if="results" class="tests">
      <li v-for="(r, i) in results" :key="i" :class="r.pass ? 'ok' : 'ko'">
        <div class="trow">
          <span class="ic">{{ r.pass ? '✓' : '✗' }}</span>
          <span class="nm">{{ r.name }}</span>
          <span v-if="!r.pass && r.error" class="msg">— {{ r.error }}</span>
        </div>
        <pre v-for="(o, j) in r.output" :key="j" class="tout">{{ o }}</pre>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.exo {
  margin: 8px 0 4px;
}
.bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.lang {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--accent2);
  background: var(--panel2);
  padding: 3px 10px;
  border-radius: 6px;
}
.spacer {
  flex: 1;
}
.editor {
  width: 100%;
  min-height: 220px;
  resize: vertical;
  background: var(--code);
  color: var(--code-txt);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px 16px;
  font-family: 'SF Mono', Menlo, Consolas, monospace;
  font-size: 13.5px;
  line-height: 1.55;
  tab-size: 2;
}
.editor:focus {
  outline: none;
  border-color: var(--accent);
}
.banner {
  margin-top: 12px;
}
.console {
  margin-top: 12px;
  background: var(--code);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 14px;
}
.clabel {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--muted);
  margin-bottom: 6px;
}
.cline {
  margin: 0;
  font-family: 'SF Mono', Menlo, Consolas, monospace;
  font-size: 13px;
  color: var(--code-txt);
  white-space: pre-wrap;
  word-break: break-word;
}
.tests {
  list-style: none;
  padding: 0;
  margin: 14px 0 0;
}
.tests li {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  margin: 6px 0;
  background: var(--panel);
  font-size: 14px;
}
.trow {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.tout {
  margin: 6px 0 0 24px;
  padding: 4px 0 0;
  font-family: 'SF Mono', Menlo, Consolas, monospace;
  font-size: 12.5px;
  color: var(--muted);
  white-space: pre-wrap;
  word-break: break-word;
}
.tests li.ok {
  border-left: 3px solid var(--good);
}
.tests li.ko {
  border-left: 3px solid var(--bad);
}
.tests .ic {
  font-weight: 800;
}
.tests li.ok .ic {
  color: var(--good);
}
.tests li.ko .ic {
  color: var(--bad);
}
.tests .msg {
  color: var(--bad);
  font-size: 13px;
}
</style>
