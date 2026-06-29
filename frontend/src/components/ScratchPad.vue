<script setup>
import { ref, watch } from 'vue'
import { scratch, closeScratch, saveScratch } from '../lib/scratch'
import { runCode } from '../lib/runJs'
import CodeEditor from './CodeEditor.vue'

const logs = ref([])
const error = ref(null)
const running = ref(false)
const ran = ref(false)

async function run() {
  running.value = true
  error.value = null
  const out = await runCode(scratch.code)
  running.value = false
  ran.value = true
  logs.value = out.logs || []
  error.value = out.error || null
}

// Reset the output panel each time the popup is (re)opened.
watch(
  () => scratch.open,
  (open) => {
    if (open) {
      logs.value = []
      error.value = null
      ran.value = false
    }
  }
)

// Persist the personal workspace as it's edited.
watch(() => scratch.code, saveScratch)
</script>

<template>
  <Teleport to="body">
    <div v-if="scratch.open" class="backdrop" @click.self="closeScratch" @keydown.esc="closeScratch">
      <div class="modal">
        <header class="head">
          <span class="title">⌗ Bac à sable <span class="lang">JS / TS</span></span>
          <button class="btn-link close" type="button" @click="closeScratch">✕</button>
        </header>

        <CodeEditor v-model="scratch.code" language="js" />

        <div class="actions">
          <button class="btn btn-primary" type="button" :disabled="running" @click="run">
            {{ running ? 'Exécution…' : '▶ Exécuter' }}
          </button>
          <span class="hint">Astuce : <code>log(x)</code> = <code>console.log(x)</code></span>
        </div>

        <div v-if="error" class="err">{{ error }}</div>
        <div v-else-if="ran" class="out">
          <div class="olabel">Sortie</div>
          <pre v-if="logs.length" v-for="(l, i) in logs" :key="i" class="oline">{{ l }}</pre>
          <p v-else class="empty">(aucune sortie — ajoute un <code>log(...)</code>)</p>
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
  tab-size: 2;
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
