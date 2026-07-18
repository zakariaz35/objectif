import { createI18n } from 'vue-i18n'
import fr from '../locales/fr.json'
import en from '../locales/en.json'
import ar from '../locales/ar.json'

// Locales exposées dans le sélecteur. `dir` pilote la mise en page (RTL pour l'arabe).
export const LOCALES = [
  { code: 'fr', label: 'Français', dir: 'ltr' },
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
]

const FALLBACK = 'fr'

function initialLocale() {
  const saved = localStorage.getItem('locale')
  if (saved && LOCALES.some((l) => l.code === saved)) return saved
  const nav = (navigator.language || FALLBACK).slice(0, 2)
  return LOCALES.some((l) => l.code === nav) ? nav : FALLBACK
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true, // `$t` disponible dans les templates
  locale: initialLocale(),
  fallbackLocale: FALLBACK,
  messages: { fr, en, ar },
})

export function dirFor(code) {
  return LOCALES.find((l) => l.code === code)?.dir ?? 'ltr'
}

/** Reflète la locale courante sur <html> (lang + dir) — 1re couche RTL (chrome). */
export function applyDir(code = i18n.global.locale.value) {
  const el = document.documentElement
  el.setAttribute('lang', code)
  el.setAttribute('dir', dirFor(code))
}

export function setLocale(code) {
  i18n.global.locale.value = code
  localStorage.setItem('locale', code)
  applyDir(code)
}

applyDir() // avant le premier rendu (importé tôt dans main.js)
