/**
 * Tests de l'engine de composition (build.mjs).
 * Lancer : node --test content/_tools/
 *
 * Couvre : playlist (shared/local), copie verbatim, partage d'un module entre
 * deux formations (contenu identique), ordre de la playlist, module manquant.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { build, parsePlaylist, stripPlaylist } from './build.mjs'

/** Construit une arborescence de contenu jouet dans un dossier temporaire. */
function makeFixture() {
  const root = mkdtempSync(join(tmpdir(), 'objectif-build-'))
  const write = (rel, content) => {
    const path = join(root, rel)
    mkdirSync(join(path, '..'), { recursive: true })
    writeFileSync(path, content)
  }

  // Bibliothèque partagée
  write('_modules/js-essentiel/module.yaml', 'title: "JS essentiel"\n')
  write('_modules/js-essentiel/01-intro.md', '---\ntitle: Intro JS\n---\nBonjour JS\n')

  // Formation A : playlist (shared + local)
  write(
    'alpha/formation.yaml',
    'title: Alpha\nslug: alpha\nmodules:\n  - shared: js-essentiel\n  - local: solo\n',
  )
  write('alpha/09-solo/module.yaml', 'title: "Solo A"\n')
  write('alpha/09-solo/01-a.md', '---\ntitle: A\n---\ncontenu A\n')

  // Formation B : playlist réutilisant le MÊME module partagé
  write('beta/formation.yaml', 'title: Beta\nslug: beta\nmodules:\n  - shared: js-essentiel\n')

  // Formation C : pas de playlist → verbatim
  write('gamma/formation.yaml', 'title: Gamma\nslug: gamma\n')
  write('gamma/01-x/01-c.md', '---\ntitle: C\n---\ncontenu C\n')

  return root
}

test('parsePlaylist lit shared/local et ignore commentaires', () => {
  const pl = parsePlaylist('title: x\nmodules:\n  # cmt\n  - shared: m1\n  - local: m2\n')
  assert.deepEqual(pl, [
    { type: 'shared', name: 'm1' },
    { type: 'local', name: 'm2' },
  ])
})

test('parsePlaylist renvoie null sans bloc modules', () => {
  assert.equal(parsePlaylist('title: x\nslug: y\n'), null)
})

test('stripPlaylist retire le bloc modules: (et son commentaire)', () => {
  const out = stripPlaylist(
    'title: X\ntags: [a]\n# Playlist\nmodules:\n  - shared: m1\n  - local: m2\n',
  )
  assert.ok(!/modules:/.test(out))
  assert.ok(!/shared:/.test(out))
  assert.ok(/title: X/.test(out) && /tags: \[a\]/.test(out))
})

test('le formation.yaml généré ne contient plus de playlist', () => {
  const root = makeFixture()
  try {
    const out = join(root, '_dist')
    build({ contentRoot: root, outRoot: out })
    const fy = readFileSync(join(out, 'alpha/formation.yaml'), 'utf8')
    assert.ok(!/^modules:/m.test(fy))
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('assemble la playlist : shared piochés + local, dans l’ordre', () => {
  const root = makeFixture()
  try {
    const out = join(root, '_dist')
    const res = build({ contentRoot: root, outRoot: out })

    // alpha : module 1 = js-essentiel (shared), module 2 = solo (local)
    assert.ok(existsSync(join(out, 'alpha/01-js-essentiel/01-intro.md')))
    assert.ok(existsSync(join(out, 'alpha/02-solo/01-a.md')))

    // ordre respecté
    const alpha = res.composed.find((c) => c.dir === 'alpha')
    assert.equal(alpha.modules, 2)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('un module partagé est identique dans deux formations', () => {
  const root = makeFixture()
  try {
    const out = join(root, '_dist')
    build({ contentRoot: root, outRoot: out })
    const a = readFileSync(join(out, 'alpha/01-js-essentiel/01-intro.md'), 'utf8')
    const b = readFileSync(join(out, 'beta/01-js-essentiel/01-intro.md'), 'utf8')
    assert.equal(a, b)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('formation sans playlist est copiée verbatim', () => {
  const root = makeFixture()
  try {
    const out = join(root, '_dist')
    const res = build({ contentRoot: root, outRoot: out })
    assert.ok(existsSync(join(out, 'gamma/01-x/01-c.md')))
    assert.ok(res.verbatim.includes('gamma'))
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('_dist ne contient pas la bibliothèque _modules', () => {
  const root = makeFixture()
  try {
    const out = join(root, '_dist')
    build({ contentRoot: root, outRoot: out })
    assert.ok(!existsSync(join(out, '_modules')))
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('module référencé mais manquant → erreur explicite', () => {
  const root = makeFixture()
  try {
    writeFileSync(
      join(root, 'alpha/formation.yaml'),
      'title: Alpha\nslug: alpha\nmodules:\n  - shared: nexiste-pas\n',
    )
    assert.throws(() => build({ contentRoot: root, outRoot: join(root, '_dist') }), /introuvable/)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
