import { reactive } from 'vue'

const KEY = 'vue_project'

const DEFAULT_SFC = `<script setup>
import { ref, computed } from 'vue'

const count = ref(0)
const double = computed(() => count.value * 2)
</script>

<template>
  <button @click="count++">Compté : {{ count }}</button>
  <p>Double : {{ double }}</p>
</template>
`

// Shared state for the Vue SFC playground modal.
// persist = true for the personal project (floating button), false for a lesson try-out.
export const vuePlay = reactive({ open: false, code: DEFAULT_SFC, persist: false })

export function openVuePlayground(code) {
  if (code && code.trim()) {
    vuePlay.code = code
    vuePlay.persist = false
  } else {
    vuePlay.code = localStorage.getItem(KEY) || DEFAULT_SFC
    vuePlay.persist = true
  }
  vuePlay.open = true
}

export function saveVueProject(code) {
  if (vuePlay.persist && typeof code === 'string') localStorage.setItem(KEY, code)
}

export function closeVuePlayground() {
  vuePlay.open = false
}
