import { reactive } from 'vue'

// Thèmes disponibles. Ajouter un thème = ajouter un bloc [data-theme] dans style.css
// et son entrée ici.
export const THEMES = [
  { key: 'dark', label: 'Sombre' },
  { key: 'light', label: 'Clair' },
  { key: 'pink', label: 'Rose' },
]

const keys = THEMES.map((t) => t.key)
const saved = localStorage.getItem('theme')
const initial = keys.includes(saved) ? saved : 'dark'

const state = reactive({ current: initial })

function apply(key) {
  document.documentElement.setAttribute('data-theme', key)
}
apply(initial)

export const theme = {
  state,
  list: THEMES,
  set(key) {
    if (!keys.includes(key)) return
    state.current = key
    localStorage.setItem('theme', key)
    apply(key)
  },
}
