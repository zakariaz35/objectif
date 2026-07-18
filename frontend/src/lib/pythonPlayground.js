import { reactive } from 'vue'

const KEY = 'scratch_python'
const DEFAULT = `# Atelier Python (sauvegardé automatiquement).
# Utilise print(...) pour afficher la sortie. import pandas/numpy fonctionne.
print("Bonjour 👋")
`

// Shared state for the Python sandbox popup (same shape as the JS scratch store).
// persist = true for the personal workspace (floating button), false for a lesson
// snippet opened via the "Tester" button.
export const pyPlay = reactive({ open: false, code: '', persist: false })

export function openPythonPlayground(code) {
  if (code && code.trim()) {
    pyPlay.code = code
    pyPlay.persist = false
  } else {
    pyPlay.code = localStorage.getItem(KEY) || DEFAULT
    pyPlay.persist = true
  }
  pyPlay.open = true
}

export function savePythonPlayground() {
  if (pyPlay.persist) localStorage.setItem(KEY, pyPlay.code)
}

export function closePythonPlayground() {
  savePythonPlayground()
  pyPlay.open = false
}
