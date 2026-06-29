/**
 * add-tags.mjs — Ajoute (ou remplace) la ligne `tags:` dans le formation.yaml des
 * formations EXISTANTES d'objectif. Idempotent. Les 2 formations générées depuis
 * ref361-web reçoivent leurs tags via from-ref361web.mjs.
 *
 * Usage : node content/_tools/add-tags.mjs
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const OUT = '/home/hassane/Documents/objectif/content'

// Tags curatés par dossier de formation (facettes orthogonales à stack/track).
const TAGS = {
  demo: [],
  'jwt-hexagonal-ddd': ['API', 'sécurité', 'architecture', 'avancé'],
  'parcours-angular': ['web', 'frontend', 'TypeScript', 'intermédiaire'],
  'parcours-vuejs': ['langage', 'web', 'frontend', 'TypeScript', 'intermédiaire'],
  'parcours-python': ['data', 'langage', 'débutant', 'interactif'],
  'parcours-excel': ['data', 'BI', 'débutant'],
  'parcours-sql': ['data', 'base-de-données', 'débutant', 'interactif'],
  'parcours-powerbi': ['data', 'BI', 'dataviz', 'intermédiaire'],
  'parcours-data-analyst': ['data', 'BI', 'métier', 'débutant'],
  'parcours-projet-ventes': ['data', 'projet', 'BI', 'avancé'],
}

const yamlStr = (s) => JSON.stringify(s)

for (const [dir, tags] of Object.entries(TAGS)) {
  const path = join(OUT, dir, 'formation.yaml')
  if (!existsSync(path)) {
    console.log(`↷ ${dir} : pas de formation.yaml, ignoré`)
    continue
  }
  // Retire une éventuelle ligne tags: existante, puis ajoute la nouvelle.
  const lines = readFileSync(path, 'utf8').replace(/\s+$/, '').split('\n')
  const kept = lines.filter((l) => !/^tags:\s*\[/.test(l))
  kept.push(`tags: [${tags.map(yamlStr).join(', ')}]`)
  writeFileSync(path, kept.join('\n') + '\n')
  console.log(`✔ ${dir} ← tags: [${tags.join(', ')}]`)
}
