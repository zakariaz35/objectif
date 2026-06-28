<script setup>
import { ref, watch } from 'vue'
import { pyPlay, closePythonPlayground, savePythonPlayground } from '../lib/pythonPlayground'
import { runPython } from '../lib/runPython'

const logs = ref([])
const error = ref(null)
const running = ref(false)
const ran = ref(false)
// True until Python has been loaded once this session (first run downloads Pyodide).
const firstRun = ref(true)

async function run() {
  running.value = true
  error.value = null
  const out = await runPython(pyPlay.code)
  firstRun.value = false
  running.value = false
  ran.value = true
  logs.value = out.logs || []
  error.value = out.error || null
}

// Reset the output panel each time the popup is (re)opened.
watch(
  () => pyPlay.open,
  (open) => {
    if (open) {
      logs.value = []
      error.value = null
      ran.value = false
    }
  }
)

// Persist the personal workspace as it's edited.
watch(() => pyPlay.code, savePythonPlayground)

function onTab(e) {
  const el = e.target
  const s = el.selectionStart
  const end = el.selectionEnd
  pyPlay.code = pyPlay.code.slice(0, s) + '    ' + pyPlay.code.slice(end)
  requestAnimationFrame(() => {
    el.selectionStart = el.selectionEnd = s + 4
  })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="pyPlay.open" class="backdrop" @click.self="closePythonPlayground" @keydown.esc="closePythonPlayground">
      <div class="modal">
        <header class="head">
          <span class="title">🐍 Bac à sable <span class="lang">Python</span></span>
          <button class="btn-link close" type="button" @click="closePythonPlayground">✕</button>
        </header>

        <textarea
          v-model="pyPlay.code"
          class="editor"
          spellcheck="false"
          autocapitalize="off"
          autocomplete="off"
          placeholder="Écris du Python, puis Exécuter. Utilise print(...) pour voir la sortie. import pandas / numpy fonctionne."
          @keydown.tab.prevent="onTab"
        ></textarea>

        <div class="actions">
          <button class="btn btn-primary" type="button" :disabled="running" @click="run">
            {{ running ? 'Exécution…' : '▶ Exécuter' }}
          </button>
          <span v-if="running && firstRun" class="hint">⏳ Chargement de Python (Pyodide) — la première fois est plus longue…</span>
          <span v-else class="hint">Exécuté dans le navigateur via <code>Pyodide</code></span>
        </div>

        <div v-if="error" class="err">{{ error }}</div>
        <div v-else-if="ran" class="out">
          <div class="olabel">Sortie</div>
          <pre v-if="logs.length" v-for="(l, i) in logs" :key="i" class="oline">{{ l }}</pre>
          <p v-else class="empty">(aucune sortie — ajoute un <code>print(...)</code>)</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 6vh 16px;
  z-index: 100;
}
.modal {
  width: 100%;
  max-width: 720px;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px 18px;
  max-height: 88vh;
  overflow-y: auto;
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.title {
  font-weight: 700;
}
.lang {
  font-size: 11px;
  color: var(--accent2);
  background: var(--panel2);
  padding: 2px 8px;
  border-radius: 20px;
  margin-left: 6px;
}
.close {
  font-size: 16px;
}
.editor {
  width: 100%;
  min-height: 180px;
  resize: vertical;
  background: var(--code);
  color: var(--code-txt);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px 16px;
  font-family: 'SF Mono', Menlo, Consolas, monospace;
  font-size: 13.5px;
  line-height: 1.55;
  tab-size: 4;
}
.editor:focus {
  outline: none;
  border-color: var(--accent);
}
.actions {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 12px 0;
}
.hint {
  color: var(--muted);
  font-size: 13px;
}
.hint code {
  background: var(--code);
  color: var(--code-inline);
  padding: 1px 5px;
  border-radius: 4px;
}
.err {
  color: var(--bad);
  background: var(--code);
  border: 1px solid var(--bad);
  border-radius: 8px;
  padding: 10px 14px;
  font-family: 'SF Mono', Menlo, Consolas, monospace;
  font-size: 13px;
  white-space: pre-wrap;
}
.out {
  background: var(--code);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 14px;
}
.olabel {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--muted);
  margin-bottom: 6px;
}
.oline {
  margin: 0;
  font-family: 'SF Mono', Menlo, Consolas, monospace;
  font-size: 13px;
  color: var(--code-txt);
  white-space: pre-wrap;
  word-break: break-word;
}
.empty {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
}
.empty code {
  color: var(--code-inline);
}
</style>
