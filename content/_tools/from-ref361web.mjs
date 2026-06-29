/**
 * from-ref361web.mjs — Convertit les cours (objets JS) de `ref361-web` vers l'arbre
 * Markdown + front-matter YAML attendu par `objectif` (cf. content/FORMAT.md).
 *
 * Mapping (résumé) :
 *   cours    -> content/<slug>/formation.yaml
 *   module   -> dossier NN-<slug>/ + module.yaml (title)
 *   sections -> leçon 01-cours.md (type: lesson) : markdown / ```code / ```mermaid
 *   sandbox  -> bloc ```python (bouton « Tester » auto) + hint en blockquote
 *   quiz[]   -> leçon 95-quiz.md (type: quiz) ; explanation = celle de l'option correcte
 *
 * Usage : node content/_tools/from-ref361web.mjs
 * Idempotent : réécrit les dossiers de formation ciblés.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const SRC = '/home/hassane/Documents/tutorials/ref361-web/src/data/courses'
const OUT = '/home/hassane/Documents/objectif/content'

// --- Périmètre : uniquement le contenu ABSENT d'objectif (pas de doublon). -----------
const JOBS = [
  {
    file: 'python.js',
    slug: 'python-langage',
    title: 'Python — le langage (au-delà des bases)',
    description:
      "POO & dataclasses, exceptions, itérateurs & générateurs, typing : les fondations du langage Python qui complètent le parcours orienté data.",
    stack: 'Python',
    tags: ['langage', 'POO', 'avancé', 'interactif'],
    // On NE porte PAS m1-m3 (doublon avec parcours-python : bases + collections).
    includeModules: [
      'm4-fonctions',
      'm5-classes',
      'm6-modules-exceptions',
      'm7-iterateurs-generateurs',
      'm8-typing-fstrings',
    ],
  },
  {
    file: 'fastapi.js',
    slug: 'crash-course-fastapi',
    title: 'Crash course FastAPI',
    description:
      "Construire une API moderne en Python : routes typées, modèles Pydantic, validation 422, injection de dépendances et structure de projet.",
    stack: 'Python / FastAPI',
    tags: ['API', 'web', 'intermédiaire', 'interactif'],
    includeModules: null, // tous les modules 'ready'
    // Pydantic v2 (seul module REF-361 abouti) greffé en module d'intro : la
    // validation est le cœur de FastAPI (LookupInput + Depends + 422 auto).
    graft: [{ file: 'ref361.js', moduleId: 'm01-pydantic', slug: 'pydantic-validation' }],
  },
]

// --- Helpers ---------------------------------------------------------------------------
const pad2 = (n) => String(n).padStart(2, '0')
const moduleSlug = (id) => id.replace(/^m\d+-/, '')
const yamlStr = (s) => JSON.stringify(s ?? '') // scalaire YAML double-quoté sûr (JSON ⊂ YAML)

/** Indente chaque ligne non vide de `n` espaces (les lignes vides restent vides). */
function indentLines(text, n) {
  const pad = ' '.repeat(n)
  return String(text)
    .replace(/\r\n/g, '\n')
    .replace(/\s+$/, '')
    .split('\n')
    .map((l) => (l.trim() === '' ? '' : pad + l))
    .join('\n')
}

/** Émet `key: |` + bloc littéral indenté (robuste : pas d'échappement de quotes/`:`). */
function blockScalar(key, text, keyIndent) {
  const ki = ' '.repeat(keyIndent)
  return `${ki}${key}: |\n${indentLines(text, keyIndent + 2)}`
}

/** Une section -> Markdown. */
function sectionToMd(sec) {
  if (sec.type === 'markdown') return sec.body.trim()
  if (sec.type === 'code') return '```' + (sec.lang || '') + '\n' + sec.code.trim() + '\n```'
  if (sec.type === 'mermaid') {
    const cap = sec.title ? `**${sec.title}**\n\n` : ''
    return cap + '```mermaid\n' + sec.code.trim() + '\n```'
  }
  if (sec.type === 'svg') {
    const cap = sec.title ? `**${sec.title}**\n\n` : ''
    return cap + sec.svg.trim()
  }
  return ''
}

/** Construit le corps de la leçon « cours » (sections + sandbox éventuel). */
function lessonMarkdown(mod) {
  const parts = (mod.sections || []).map(sectionToMd).filter(Boolean)
  if (mod.sandbox && mod.sandbox.initialCode) {
    let sb = '## Bac à sable\n'
    if (mod.sandbox.hint) {
      sb += '\n' + mod.sandbox.hint.trim().split('\n').map((l) => '> ' + l).join('\n') + '\n'
    }
    sb += '\n```python\n' + mod.sandbox.initialCode.trim() + '\n```'
    parts.push(sb)
  }
  const front = `---\ntitle: ${yamlStr(mod.title)}\ntype: lesson\n---\n`
  return front + '\n' + parts.join('\n\n') + '\n'
}

/** Construit la leçon quiz (front-matter `questions`). */
function quizMarkdown(mod) {
  let fm = `---\ntitle: ${yamlStr('Quiz — ' + mod.title)}\ntype: quiz\nquestions:\n`
  for (const q of mod.quiz) {
    const correctIdx = q.options.findIndex((o) => o.correct)
    const correct = q.options[correctIdx] || {}
    fm += '  - prompt: |\n' + indentLines(q.question, 6) + '\n'
    fm += '    options:\n'
    for (const opt of q.options) {
      fm += '      - |\n' + indentLines(opt.text, 8) + '\n'
    }
    fm += `    answer: ${correctIdx < 0 ? 0 : correctIdx}\n`
    if (correct.explanation) {
      fm += blockScalar('explanation', correct.explanation, 4) + '\n'
    } else {
      fm += '    explanation: ""\n'
    }
  }
  fm += '---\n'
  return fm
}

// --- Conversion ------------------------------------------------------------------------
const courseCache = new Map()
async function loadCourse(file) {
  if (!courseCache.has(file)) courseCache.set(file, (await import(join(SRC, file))).default)
  return courseCache.get(file)
}

let totalFormations = 0
let totalModules = 0
let totalQuizzes = 0

for (const job of JOBS) {
  const course = await loadCourse(job.file)
  const formationDir = join(OUT, job.slug)
  rmSync(formationDir, { recursive: true, force: true })
  mkdirSync(formationDir, { recursive: true })

  // formation.yaml
  let fy =
    `title: ${yamlStr(job.title)}\n` +
    `slug: ${job.slug}\n` +
    `description: ${yamlStr(job.description)}\n` +
    `stack: ${yamlStr(job.stack)}\n`
  if (job.tags?.length) fy += `tags: [${job.tags.map((t) => yamlStr(t)).join(', ')}]\n`
  writeFileSync(join(formationDir, 'formation.yaml'), fy)

  // Modules greffés (prepend) depuis d'autres cours, avec slug de dossier explicite.
  const grafts = []
  for (const g of job.graft || []) {
    const src = await loadCourse(g.file)
    const m = src.modules.find((x) => x.id === g.moduleId)
    if (m) grafts.push({ ...m, __slug: g.slug })
  }

  // Modules propres au cours (ready, filtrés par includeModules).
  let own = course.modules.filter((m) => (m.status ? m.status === 'ready' : true))
  if (job.includeModules) {
    const set = new Set(job.includeModules)
    own = own.filter((m) => set.has(m.id))
  }

  const modules = [...grafts, ...own]
  let i = 0
  for (const m of modules) {
    i += 1
    const dir = join(formationDir, `${pad2(i)}-${m.__slug || moduleSlug(m.id)}`)
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'module.yaml'), `title: ${yamlStr(m.title)}\n`)
    writeFileSync(join(dir, '01-cours.md'), lessonMarkdown(m))
    if (Array.isArray(m.quiz) && m.quiz.length) {
      writeFileSync(join(dir, '95-quiz.md'), quizMarkdown(m))
      totalQuizzes += m.quiz.length
    }
    totalModules += 1
  }
  totalFormations += 1
  console.log(`✔ ${job.slug} — ${modules.length} modules (depuis ${job.file})`)
}

console.log(
  `\nTerminé : ${totalFormations} formations, ${totalModules} modules, ${totalQuizzes} questions de quiz.`,
)
