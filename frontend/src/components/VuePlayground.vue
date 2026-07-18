<script setup>
import { ref, onMounted, watch } from 'vue'
import { Repl, useStore } from '@vue/repl'
import CodeMirror from '@vue/repl/codemirror-editor'
import '@vue/repl/style.css'
import { vuePlay, closeVuePlayground, saveVueProject } from '../lib/vuePlayground'

// Real Vue SFC playground (compiler + preview) provided by @vue/repl.
const store = useStore()
const ready = ref(false)

onMounted(async () => {
  await store.setFiles({ 'src/App.vue': vuePlay.code }, 'src/App.vue')
  ready.value = true
  // Persist the personal project as it's edited.
  watch(
    () => store.getFiles()['src/App.vue'],
    (code) => saveVueProject(code),
  )
})
</script>

<template>
  <Teleport to="body">
    <div class="backdrop" @click.self="closeVuePlayground">
      <div class="modal">
        <header class="head">
          <span class="title">▶ Playground Vue <span class="tag">SFC live</span></span>
          <button class="btn-link close" type="button" @click="closeVuePlayground">✕</button>
        </header>
        <div class="repl-wrap">
          <Repl v-if="ready" :store="store" :editor="CodeMirror" :showCompileOutput="false" />
          <p v-else class="loading">Chargement du playground…</p>
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
  align-items: center;
  justify-content: center;
  padding: 4vh 16px;
  z-index: 100;
}
.modal {
  width: 100%;
  max-width: 1100px;
  height: 86vh;
  display: flex;
  flex-direction: column;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px 16px;
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.title {
  font-weight: 700;
}
.tag {
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
.repl-wrap {
  flex: 1;
  min-height: 0;
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}
.repl-wrap :deep(.vue-repl) {
  height: 100%;
}
.loading {
  padding: 24px;
  color: var(--muted);
}
</style>
