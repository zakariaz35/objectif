/**
 * build.mjs — Engine de composition « build-time ».
 *
 * Assemble content/_dist/ à partir des sources :
 *   - content/_modules/<slug>/      : bibliothèque de modules réutilisables (« cuillerées »)
 *   - content/<parcours>/           : formation.yaml (+ playlist `modules:`) + modules locaux
 *
 * Une formation avec une playlist `modules:` est ASSEMBLÉE (shared piochés dans _modules,
 * local pris dans le parcours, dans l'ordre de la playlist). Sans playlist, elle est
 * copiée VERBATIM. L'import se fait ensuite sur content/_dist (un seul chemin d'import).
 *
 * Usage : node content/_tools/build.mjs
 */
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const pad2 = (n) => String(n).padStart(2, '0')
const stripPrefix = (name) => name.replace(/^\d+-/, '')

/** Extrait la playlist `modules:` d'un formation.yaml (ou null si absente). */
export function parsePlaylist(text) {
  const lines = text.split('\n')
  const start = lines.findIndex((l) => /^modules:\s*$/.test(l))
  if (start === -1) return null
  const items = []
  for (let j = start + 1; j < lines.length; j++) {
    const m = lines[j].match(/^\s*-\s*(shared|local):\s*(\S+)\s*$/)
    if (m) {
      items.push({ type: m[1], name: m[2] })
    } else if (/^\s*(#.*)?$/.test(lines[j])) {
      continue // commentaire ou ligne vide dans le bloc
    } else {
      break // nouvelle clé de premier niveau → fin de la playlist
    }
  }
  return items.length ? items : null
}

/** Retire le bloc `modules:` (playlist) d'un formation.yaml : la sortie _dist a déjà
 *  les vrais dossiers, et l'import-time ne doit pas re-résoudre une playlist absente
 *  de _modules. Supprime aussi le bloc de commentaires qui précède immédiatement. */
export function stripPlaylist(text) {
  const lines = text.split('\n')
  const start = lines.findIndex((l) => /^modules:\s*$/.test(l))
  if (start === -1) return text
  let end = start + 1
  while (end < lines.length && /^(\s*-\s*(shared|local):\s*\S+\s*|\s*#.*|\s*)$/.test(lines[end])) {
    end++
  }
  let begin = start
  while (begin > 0 && /^\s*#/.test(lines[begin - 1])) begin--
  lines.splice(begin, end - begin)
  return lines.join('\n').replace(/\n{3,}/g, '\n\n')
}

/** Trouve le dossier d'un module local par son slug (préfixe numérique ignoré). */
function findLocalDir(formationDir, slug) {
  for (const e of readdirSync(formationDir, { withFileTypes: true })) {
    if (e.isDirectory() && stripPrefix(e.name) === slug) return join(formationDir, e.name)
  }
  return null
}

/** Dossiers de formation (hors `_*`, contenant un formation.yaml). */
function listFormationDirs(root) {
  return readdirSync(root, { withFileTypes: true })
    .filter(
      (e) =>
        e.isDirectory() &&
        !e.name.startsWith('_') &&
        existsSync(join(root, e.name, 'formation.yaml')),
    )
    .map((e) => e.name)
    .sort()
}

/**
 * Assemble outRoot à partir de contentRoot.
 * @returns {{ composed: Array<{dir:string,modules:number}>, verbatim: string[] }}
 */
export function build({ contentRoot, outRoot, modulesDir }) {
  modulesDir = modulesDir ?? join(contentRoot, '_modules')
  rmSync(outRoot, { recursive: true, force: true })
  mkdirSync(outRoot, { recursive: true })

  const composed = []
  const verbatim = []

  for (const dir of listFormationDirs(contentRoot)) {
    const src = join(contentRoot, dir)
    const dest = join(outRoot, dir)
    const playlist = parsePlaylist(readFileSync(join(src, 'formation.yaml'), 'utf8'))

    if (!playlist) {
      cpSync(src, dest, { recursive: true })
      verbatim.push(dir)
      continue
    }

    mkdirSync(dest, { recursive: true })
    // formation.yaml sans la playlist (le _dist contient déjà les modules inline).
    writeFileSync(
      join(dest, 'formation.yaml'),
      stripPlaylist(readFileSync(join(src, 'formation.yaml'), 'utf8')),
    )
    if (existsSync(join(src, 'assets'))) {
      cpSync(join(src, 'assets'), join(dest, 'assets'), { recursive: true })
    }

    let i = 0
    for (const item of playlist) {
      i += 1
      const srcMod =
        item.type === 'shared' ? join(modulesDir, item.name) : findLocalDir(src, item.name)
      if (!srcMod || !existsSync(srcMod)) {
        throw new Error(`[${dir}] module introuvable : ${item.type}:${item.name}`)
      }
      cpSync(srcMod, join(dest, `${pad2(i)}-${item.name}`), { recursive: true })
    }
    composed.push({ dir, modules: i })
  }

  return { composed, verbatim }
}

// Exécution directe (pas en import de test).
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const CONTENT = join(dirname(fileURLToPath(import.meta.url)), '..')
  const res = build({ contentRoot: CONTENT, outRoot: join(CONTENT, '_dist') })
  for (const c of res.composed) console.log(`✦ assemblé  ${c.dir} (${c.modules} modules)`)
  console.log(`↳ verbatim : ${res.verbatim.length} formations`)
  console.log(`\nSortie : content/_dist/ — importer avec « formation:import-all /content/_dist ».`)
}
