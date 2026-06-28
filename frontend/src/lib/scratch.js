import { reactive } from 'vue'

const KEY = 'scratch_js'
const DEFAULT = `// Ton atelier JS / TS (sauvegardé automatiquement).
// Utilise log(...) ou console.log(...) pour voir la sortie.
log('Bonjour 👋')
`

// Shared state for the JS/TS sandbox popup.
// persist = true when it's the personal workspace (opened from the floating button);
// false when trying out a lesson snippet (transient).
export const scratch = reactive({ open: false, code: '', persist: false })

export function openScratch(code) {
  if (code && code.trim()) {
    scratch.code = code
    scratch.persist = false
  } else {
    scratch.code = localStorage.getItem(KEY) || DEFAULT
    scratch.persist = true
  }
  scratch.open = true
}

export function saveScratch() {
  if (scratch.persist) localStorage.setItem(KEY, scratch.code)
}

export function closeScratch() {
  saveScratch()
  scratch.open = false
}
