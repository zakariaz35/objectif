import { reactive } from 'vue'

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
export const vuePlay = reactive({ open: false, code: DEFAULT_SFC })

export function openVuePlayground(code) {
  vuePlay.code = code && code.trim() ? code : DEFAULT_SFC
  vuePlay.open = true
}

export function closeVuePlayground() {
  vuePlay.open = false
}
