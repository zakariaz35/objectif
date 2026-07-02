/**
 * add-exo-duree.mjs — Ajoute un encadré « ⏱️ Durée conseillée » bien visible en tête
 * de chaque exercice (`90-exo-*.md`) de js-debutant. Idempotent.
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = '/home/hassane/Documents/objectif/content/js-debutant'

// Durée conseillée (minutes) par exercice — adaptée à la complexité.
const DUREE = {
  'exo-total-ventes': 15,
  'exo-prix-remise': 15,
  'exo-categorie-montant': 15,
  'exo-somme-moyenne-ventes': 20,
  'exo-filtrer-transformer-ventes': 20,
  'exo-tableau-objets-ventes': 20,
  'exo-prix-ttc-remise': 25,
  'exo-parsing-securise': 20,
  'exo-analyse-ventes': 40, // mini-projet de synthèse
}
const durationFor = (name) => {
  for (const k of Object.keys(DUREE)) if (name.includes(k)) return DUREE[k]
  return 20
}

let n = 0
for (const entry of readdirSync(ROOT)) {
  const dir = join(ROOT, entry)
  if (!statSync(dir).isDirectory()) continue
  for (const f of readdirSync(dir).filter((x) => /^90-exo-.*\.md$/.test(x))) {
    const path = join(dir, f)
    const txt = readFileSync(path, 'utf8')
    if (txt.includes('Durée conseillée')) continue // idempotent
    const lines = txt.split('\n')
    let count = 0
    let idx = -1
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        count++
        if (count === 2) { idx = i; break }
      }
    }
    if (idx < 0) continue // pas de front-matter détecté
    const d = durationFor(f)
    lines.splice(idx + 1, 0,
      '',
      `> ⏱️ **Durée conseillée : ~${d} min.** Prends ton temps — l'objectif est de **comprendre**, pas d'aller vite. N'hésite pas à relire, modifier et relancer le code.`,
    )
    writeFileSync(path, lines.join('\n'))
    n++
    console.log(`✔ ${entry}/${f} — ~${d} min`)
  }
}
console.log(`\n${n} exercice(s) annotés.`)
