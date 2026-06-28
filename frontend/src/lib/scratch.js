import { reactive } from 'vue'

// Shared state for the code sandbox popup.
export const scratch = reactive({ open: false, code: '' })

export function openScratch(code = '') {
  scratch.code = code
  scratch.open = true
}

export function closeScratch() {
  scratch.open = false
}
