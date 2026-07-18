---
title: "Exercice interactif — implémenter satisfies(version, range)"
type: exercise
exercise:
  language: js
  starter: |
    // Given helper: turns "4.19.2" into { major: 4, minor: 19, patch: 2 }
    function parseVersion(version) {
      const [major, minor, patch] = version.split(".").map(Number)
      return { major, minor, patch }
    }

    // Given helper: compares two version strings.
    // Returns -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2.
    function compareVersions(v1, v2) {
      const a = parseVersion(v1)
      const b = parseVersion(v2)
      if (a.major !== b.major) return a.major > b.major ? 1 : -1
      if (a.minor !== b.minor) return a.minor > b.minor ? 1 : -1
      if (a.patch !== b.patch) return a.patch > b.patch ? 1 : -1
      return 0
    }

    // TODO: implement satisfies(version, range)
    // `range` can be:
    //   - an exact version, e.g. "4.19.2"     -> only that exact version matches
    //   - a tilde range,     e.g. "~4.19.0"    -> same MAJOR.MINOR, PATCH >= base
    //   - a caret range,     e.g. "^4.19.0"    -> see the special "0.x.y" rule below!
    //
    // Real npm/semver caret rule (NOT a simplification -- this is the actual behavior):
    //   ^1.2.3  := >=1.2.3 <2.0.0   (MAJOR >= 1: locks only MAJOR)
    //   ^0.2.3  := >=0.2.3 <0.3.0   (MAJOR == 0, MINOR > 0: locks MAJOR *and* MINOR)
    //   ^0.0.3  := >=0.0.3 <0.0.4   (MAJOR == 0, MINOR == 0: locks even PATCH)
    function satisfies(version, range) {
      // TODO
      return false
    }

    // (Optionnel) essaie :
    // console.log(satisfies("4.20.0", "^4.19.0"))
    // console.log(satisfies("0.3.0", "^0.2.3"))
  tests:
    - name: "version exacte : seule l'egalite stricte matche"
      code: |
        assert(satisfies("4.19.2", "4.19.2"), "exact range must match the identical version")
        assert(!satisfies("4.19.3", "4.19.2"), "exact range must reject any other version")
    - name: "caret classique (MAJOR >= 1) : verrouille seulement le MAJOR"
      code: |
        console.log("4.20.0 satisfies ^4.19.0 ?", satisfies("4.20.0", "^4.19.0"))
        assert(satisfies("4.20.0", "^4.19.0"), "^4.19.0 must accept 4.20.0 (minor bump)")
        assert(!satisfies("5.0.0", "^4.19.0"), "^4.19.0 must REJECT 5.0.0 (different major)")
        assert(!satisfies("4.18.9", "^4.19.0"), "^4.19.0 must REJECT an older version")
    - name: "caret sur 0.x.y (MINOR > 0) : verrouille aussi le MINOR"
      code: |
        console.log("0.3.0 satisfies ^0.2.3 ?", satisfies("0.3.0", "^0.2.3"))
        assert(satisfies("0.2.9", "^0.2.3"), "^0.2.3 must accept 0.2.9 (same 0.x.y minor)")
        assert(!satisfies("0.3.0", "^0.2.3"), "^0.2.3 must REJECT 0.3.0 -- the 0.x special rule!")
    - name: "caret sur 0.0.z : verrouille meme le PATCH"
      code: |
        assert(satisfies("0.0.3", "^0.0.3"), "^0.0.3 must accept the exact base version")
        assert(!satisfies("0.0.4", "^0.0.3"), "^0.0.3 must REJECT 0.0.4 -- almost an exact pin")
    - name: "tilde : verrouille MAJOR et MINOR, autorise le PATCH"
      code: |
        assert(satisfies("4.19.9", "~4.19.0"), "~4.19.0 must accept 4.19.9 (patch bump)")
        assert(!satisfies("4.20.0", "~4.19.0"), "~4.19.0 must REJECT 4.20.0 (different minor)")
        assert(!satisfies("4.18.9", "~4.19.0"), "~4.19.0 must REJECT an older version")
---

> ⏱️ **Durée conseillée : ~20 min.**

## Énoncé

Implémente `satisfies(version, range)`, qui simule ce que fait npm en
interne pour décider si une version installée respecte une plage déclarée
dans `package.json`.

`range` peut prendre trois formes :

1. **Version exacte** (`"4.19.2"`) : seule cette version exacte matche.
2. **Tilde** (`"~4.19.0"`) : même `MAJOR.MINOR`, `PATCH` supérieur ou égal à
   la base.
3. **Caret** (`"^4.19.0"`) : la règle **change selon le `MAJOR` de la base** —
   voir le rappel dans le `starter`. C'est le vrai comportement npm sur les
   paquets encore en `0.x.y` (pas une simplification pédagogique) : plus un
   paquet est jeune, plus `^` devient strict.

Réflexes utiles :

- Réutilise les deux helpers fournis (`parseVersion`, `compareVersions`) —
  ne les réécris pas.
- Commence par écarter le cas « version plus ancienne que la base » : dans
  les trois formes de plage, une version strictement inférieure à la base ne
  peut jamais satisfaire.
- Pour le caret, décompose en trois branches selon `major`/`minor` de la
  **base** (`range` sans son `^`) : `major > 0`, puis `major === 0 && minor >
  0`, puis le reste (`major === 0 && minor === 0`).

<!--correction-->

## Correction

```js
function parseVersion(version) {
  const [major, minor, patch] = version.split(".").map(Number)
  return { major, minor, patch }
}

function compareVersions(v1, v2) {
  const a = parseVersion(v1)
  const b = parseVersion(v2)
  if (a.major !== b.major) return a.major > b.major ? 1 : -1
  if (a.minor !== b.minor) return a.minor > b.minor ? 1 : -1
  if (a.patch !== b.patch) return a.patch > b.patch ? 1 : -1
  return 0
}

function satisfies(version, range) {
  // Exact version: no "^" or "~" prefix -> strict equality only
  if (range[0] !== "^" && range[0] !== "~") {
    return compareVersions(version, range) === 0
  }

  const prefix = range[0]
  const base = range.slice(1)
  const v = parseVersion(version)
  const b = parseVersion(base)

  // In every range form below, an older version than the base never matches
  if (compareVersions(version, base) < 0) return false

  if (prefix === "~") {
    // Tilde: locks MAJOR and MINOR, only PATCH is free to move
    return v.major === b.major && v.minor === b.minor
  }

  // Caret: the real npm/semver rule, which depends on the BASE's major/minor
  if (b.major > 0) {
    // Classic case: locks only MAJOR
    return v.major === b.major
  }
  if (b.minor > 0) {
    // 0.x.y with x > 0: caret behaves like tilde (locks MINOR too)
    return v.major === 0 && v.minor === b.minor
  }
  // 0.0.z: caret only accepts that exact PATCH (next patch already breaks it)
  return v.major === 0 && v.minor === 0 && v.patch === b.patch
}
```

- La garde `compareVersions(version, base) < 0 → false` couvre le cas commun
  aux trois formes de plage : personne n'accepte une version **plus
  ancienne** que la base déclarée.
- Le **tilde** est la branche la plus simple : `MAJOR` et `MINOR` fixés, seul
  le `PATCH` est libre de monter.
- Le **caret** a trois branches, dans l'ordre de priorité inverse de la
  sévérité : `b.major > 0` (le cas courant, très permissif) → `b.minor > 0`
  avec `b.major === 0` (déjà plus strict : verrouille aussi le `MINOR`) →
  sinon `0.0.z` (le plus strict : seul le `PATCH` exact de la base convient).

> En vrai npm, la logique est identique — la spécification semver précise
> même que ces plages « courtes » (`^0.2.3`) sont converties, en interne, en
> une plage explicite `>=0.2.3 <0.3.0` avant comparaison. C'est exactement ce
> que `satisfies` vient de reproduire, sans avoir besoin d'un parseur de
> plages complet.
