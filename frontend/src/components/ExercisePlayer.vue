<script setup>
import { ref, computed, watch } from 'vue'
import BaseCallout from './BaseCallout.vue'

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

// Web Worker source. First runs the user code once with a captured console
// (so console.log output is shown), then runs each test in isolation (silent).
// (concatenated string to avoid nested backticks)
const WORKER_SRC = `
function fmt(args) {
  return Array.prototype.map.call(args, function (v) {
    if (typeof v === 'string') return v;
    try { return JSON.stringify(v); } catch (e) { return String(v); }
  }).join(' ');
}
var SILENT = { log: function(){}, info: function(){}, warn: function(){}, error: function(){} };
function assert(cond, msg) { if (!cond) throw new Error(msg || 'Assertion échouée'); }

self.onmessage = function (e) {
  var userCode = e.data.userCode, tests = e.data.tests;
  var logs = [], runError = null, results = [];

  // 1) Run the user code once, capturing console output.
  var captured = {
    log: function(){ logs.push(fmt(arguments)); },
    info: function(){ logs.push(fmt(arguments)); },
    warn: function(){ logs.push(fmt(arguments)); },
    error: function(){ logs.push(fmt(arguments)); }
  };
  try {
    new Function('console', userCode)(captured);
  } catch (err) {
    runError = String((err && err.message) || err);
  }

  // 2) Run each test (silent console), collect pass/fail.
  for (var i = 0; i < tests.length; i++) {
    try {
      new Function('assert', 'console', userCode + '\\n;\\n{\\n' + tests[i].code + '\\n}\\n')(assert, SILENT);
      results.push({ name: tests[i].name, pass: true });
    } catch (err) {
      results.push({ name: tests[i].name, pass: false, error: String((err && err.message) || err) });
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
  const tests = props.tests.map((t) => ({ name: t.name, code: t.code }))
  const out = await runInWorker(code.value, tests)
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

// Tab inserts 2 spaces instead of moving to the next field.
function onTab(e) {
  const el = e.target
  const s = el.selectionStart
  const eend = el.selectionEnd
  code.value = code.value.slice(0, s) + '  ' + code.value.slice(eend)
  requestAnimationFrame(() => {
    el.selectionStart = el.selectionEnd = s + 2
  })
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

    <textarea
      v-model="code"
      class="editor"
      spellcheck="false"
      autocapitalize="off"
      autocomplete="off"
      @keydown.tab.prevent="onTab"
    ></textarea>

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
        <span class="ic">{{ r.pass ? '✓' : '✗' }}</span>
        <span class="nm">{{ r.name }}</span>
        <span v-if="!r.pass && r.error" class="msg">— {{ r.error }}</span>
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
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  margin: 6px 0;
  background: var(--panel);
  font-size: 14px;
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
