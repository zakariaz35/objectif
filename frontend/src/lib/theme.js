import { reactive } from 'vue'

// Available themes. Add a theme = add a [data-theme] block in style.css
// and its entry here.
export const THEMES = [
  { key: 'blue', label: 'Bleu' },
  { key: 'dark', label: 'Sombre' },
  { key: 'light', label: 'Clair' },
  { key: 'pink', label: 'Rose' },
]

const keys = THEMES.map((t) => t.key)
const saved = localStorage.getItem('theme')
const initial = keys.includes(saved) ? saved : 'blue' // « blue » by default

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
