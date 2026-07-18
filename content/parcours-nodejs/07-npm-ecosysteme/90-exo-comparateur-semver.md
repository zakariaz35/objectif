---
title: "Exercice — comparateur de versions semver simplifié"
type: exercise
exercise:
  language: js
  starter: |
    // A minimal semver engine: version strings look like "MAJOR.MINOR.PATCH",
    // e.g. "4.19.2". No pre-release tags to handle here, keep it simple.

    // Given helper: turns "4.19.2" into { major: 4, minor: 19, patch: 2 }
    function parseVersion(version) {
      const [major, minor, patch] = version.split(".").map(Number)
      return { major, minor, patch }
    }

    // 1) Compares two version strings.
    //    Returns -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2.
    //    Compare MAJOR first, then MINOR, then PATCH.
    function compareVersions(v1, v2) {
      // TODO
      return null
    }

    // 2) Does `version` satisfy a caret range "^base" ?
    //    Rule: same MAJOR as `base`, AND version >= base.
    function satisfiesCaret(version, base) {
      // TODO: reuse compareVersions and parseVersion
      return null
    }

    // 3) Does `version` satisfy a tilde range "~base" ?
    //    Rule: same MAJOR AND same MINOR as `base`, AND version >= base.
    function satisfiesTilde(version, base) {
      // TODO
      return null
    }

    // (Optionnel) essaie :
    // console.log(compareVersions("4.19.1", "4.19.0"))
    // console.log(satisfiesCaret("4.20.0", "4.19.0"))
  tests:
    - name: "compareVersions detecte l'egalite"
      code: |
        assertEqual(compareVersions("4.19.0", "4.19.0"), 0, "identical versions compare equal")
    - name: "compareVersions compare correctement PATCH, MINOR et MAJOR"
      code: |
        assertEqual(compareVersions("4.19.1", "4.19.0"), 1, "higher PATCH wins")
        assertEqual(compareVersions("4.18.9", "4.19.0"), -1, "lower MINOR loses, even with a higher PATCH")
        assertEqual(compareVersions("5.0.0", "4.99.9"), 1, "higher MAJOR always wins, regardless of MINOR/PATCH")
    - name: "^4.19.0 accepte les MINOR et PATCH superieurs, dans le meme MAJOR"
      code: |
        assert(satisfiesCaret("4.19.1", "4.19.0"), "^4.19.0 must accept 4.19.1 (patch bump)")
        assert(satisfiesCaret("4.20.0", "4.19.0"), "^4.19.0 must accept 4.20.0 (minor bump)")
        console.log("4.99.9 satisfies ^4.19.0 ?", satisfiesCaret("4.99.9", "4.19.0"))
        assert(satisfiesCaret("4.99.9", "4.19.0"), "^4.19.0 must accept any 4.x.x version at or above the base")
    - name: "^4.19.0 refuse un MAJOR different ou une version plus ancienne"
      code: |
        assert(!satisfiesCaret("5.0.0", "4.19.0"), "^4.19.0 must REJECT 5.0.0 (different MAJOR)")
        assert(!satisfiesCaret("4.18.9", "4.19.0"), "^4.19.0 must REJECT an OLDER version than the base")
    - name: "~4.19.0 accepte seulement les PATCH du meme MINOR"
      code: |
        assert(satisfiesTilde("4.19.9", "4.19.0"), "~4.19.0 must accept 4.19.9 (patch bump, same minor)")
        console.log("4.20.0 satisfies ~4.19.0 ?", satisfiesTilde("4.20.0", "4.19.0"))
        assert(!satisfiesTilde("4.20.0", "4.19.0"), "~4.19.0 must REJECT 4.20.0 (different MINOR)")
        assert(!satisfiesTilde("4.18.9", "4.19.0"), "~4.19.0 must REJECT an OLDER version than the base")
---

> ⏱️ **Durée conseillée : ~20 min.**

## Énoncé

Réimplémente, en simplifié, la logique de comparaison de versions et de
satisfaction des plages `^`/`~` vues dans la leçon sur semver.

1. `compareVersions(v1, v2)` : compare deux versions `"MAJOR.MINOR.PATCH"`
   composant par composant (MAJOR d'abord, puis MINOR, puis PATCH), renvoie
   `-1`, `0` ou `1`.
2. `satisfiesCaret(version, base)` : simule `^base` — même MAJOR que `base`,
   et `version` supérieure ou égale à `base`.
3. `satisfiesTilde(version, base)` : simule `~base` — même MAJOR **et** même
   MINOR que `base`, et `version` supérieure ou égale à `base`.

Réflexes utiles :

- Réutilise le helper fourni `parseVersion(...)` (déjà écrit) pour éclater
  chaque chaîne en `{ major, minor, patch }`.
- Pour `compareVersions`, compare `major` d'abord : s'ils diffèrent, la
  réponse est déjà connue (pas besoin de regarder `minor`/`patch`). Sinon,
  compare `minor`, puis `patch` avec la même logique.
- `satisfiesCaret`/`satisfiesTilde` peuvent **réutiliser**
  `compareVersions(version, base) >= 0` pour la condition « supérieure ou
  égale à la base ».

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

function satisfiesCaret(version, base) {
  const v = parseVersion(version)
  const b = parseVersion(base)
  return v.major === b.major && compareVersions(version, base) >= 0
}

function satisfiesTilde(version, base) {
  const v = parseVersion(version)
  const b = parseVersion(base)
  return v.major === b.major && v.minor === b.minor && compareVersions(version, base) >= 0
}
```

- **`compareVersions`** compare chaque composant **dans l'ordre de
  priorité** (MAJOR > MINOR > PATCH) et s'arrête dès qu'une différence est
  trouvée — exactement la logique de tri utilisée par npm en interne pour
  ordonner des versions.
- **`satisfiesCaret`** n'exige que l'égalité du MAJOR : tout MINOR/PATCH égal
  ou supérieur à la base est accepté, ce qui correspond bien à
  `^4.19.0` acceptant `4.99.9` mais rejetant `5.0.0`.
- **`satisfiesTilde`** est plus stricte : elle exige en plus l'égalité du
  MINOR, n'autorisant que des PATCH plus récents dans le **même** MINOR —
  d'où `~4.19.0` qui rejette `4.20.0` (MINOR différent) mais accepte
  `4.19.9`.
- Les deux fonctions réutilisent `compareVersions(...) >= 0` pour vérifier
  « au moins aussi récent que la base » : éviter de dupliquer cette logique
  de comparaison.

> En pratique, npm gère aussi des subtilités supplémentaires (tags de
> pré-version comme `4.19.0-beta.1`, plages combinées `>=1.2.0 <2.0.0`...) —
> hors périmètre ici, mais le cœur du raisonnement (comparer MAJOR, puis
> MINOR, puis PATCH) reste rigoureusement le même.
