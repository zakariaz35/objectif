---
title: "Exercice — réimplémenter la logique des combinateurs de promesses"
type: exercise
exercise:
  language: js
  starter: |
    // You are given ALREADY-SETTLED results, shaped EXACTLY like what
    // `Promise.allSettled(...)` produces:
    //   { status: "fulfilled", value: ... }
    //   { status: "rejected", reason: ... }   (reason is an Error instance)
    //
    // This lets you practice the EXACT semantics of Promise.all / any /
    // allSettled synchronously (no real async timing involved here).

    // 1) Mimics Promise.all(): if ANY result is "rejected", throw its
    //    `reason` immediately. Otherwise, return an array of all the
    //    `value`s, in the SAME order as the input.
    function allOrThrow(results) {
      // TODO
      return null
    }

    // 2) Mimics Promise.any(): return the `value` of the FIRST "fulfilled"
    //    result (in array order). If NONE is fulfilled, throw
    //    new Error("All promises failed").
    function firstFulfilled(results) {
      // TODO
      return null
    }

    // 3) Mimics reading a Promise.allSettled() report: return
    //    { fulfilled: <count>, rejected: <count> }.
    function summarizeSettled(results) {
      // TODO
      return null
    }

    // (Optionnel) essaie :
    // const results = [
    //   { status: "fulfilled", value: 1 },
    //   { status: "rejected", reason: new Error("boom") },
    // ]
    // console.log(summarizeSettled(results))
  tests:
    - name: "allOrThrow renvoie toutes les valeurs quand tout a réussi"
      code: |
        const results = [
          { status: "fulfilled", value: "a" },
          { status: "fulfilled", value: "b" },
          { status: "fulfilled", value: "c" },
        ]
        const result = allOrThrow(results)
        console.log("values:", result)
        assertEqual(result, ["a", "b", "c"], "all fulfilled: same order, values only")
    - name: "allOrThrow relance l'erreur du premier échec rencontré"
      code: |
        const results = [
          { status: "fulfilled", value: "a" },
          { status: "rejected", reason: new Error("network down") },
          { status: "fulfilled", value: "c" },
        ]
        let thrown = null
        try {
          allOrThrow(results)
        } catch (e) {
          thrown = e
        }
        assert(thrown !== null, "allOrThrow must throw when any result is rejected")
        assertEqual(thrown.message, "network down", "must re-throw the ORIGINAL error, unchanged")
    - name: "allOrThrow d'une liste vide renvoie un tableau vide"
      code: |
        assertEqual(allOrThrow([]), [], "nothing to check: an empty list is trivially all-fulfilled")
    - name: "firstFulfilled ignore les échecs et prend le premier succès"
      code: |
        const results = [
          { status: "rejected", reason: new Error("mirror 1 down") },
          { status: "fulfilled", value: "mirror 2 ok" },
          { status: "fulfilled", value: "mirror 3 ok" },
        ]
        const result = firstFulfilled(results)
        console.log("winner:", result)
        assertEqual(result, "mirror 2 ok", "the first FULFILLED entry wins, failures before it are skipped")
    - name: "firstFulfilled lève une erreur si tout a échoué"
      code: |
        const results = [
          { status: "rejected", reason: new Error("down 1") },
          { status: "rejected", reason: new Error("down 2") },
        ]
        let thrown = null
        try {
          firstFulfilled(results)
        } catch (e) {
          thrown = e
        }
        assert(thrown !== null, "must throw when nothing fulfilled")
        assertEqual(thrown.message, "All promises failed", "the exact message expected when everything fails")
    - name: "summarizeSettled compte correctement chaque statut"
      code: |
        const results = [
          { status: "fulfilled", value: 1 },
          { status: "rejected", reason: new Error("x") },
          { status: "fulfilled", value: 2 },
          { status: "rejected", reason: new Error("y") },
          { status: "fulfilled", value: 3 },
        ]
        const result = summarizeSettled(results)
        console.log("summary:", result)
        assertEqual(result, { fulfilled: 3, rejected: 2 }, "3 fulfilled and 2 rejected")
---

> ⏱️ **Durée conseillée : ~20 min.**

## Énoncé

Tester du **vrai** code asynchrone (avec de vrais délais) n'est pas fiable
dans un bac à sable. Cet exercice te fait donc réimplémenter, en synchrone et
sur des données déjà « réglées », la **logique exacte** de trois
combinateurs de promesses — de quoi ancrer solidement leur sémantique.

Rappelle-toi la forme exacte que produit `Promise.allSettled(...)` : un
tableau d'objets `{ status: "fulfilled", value }` ou
`{ status: "rejected", reason }`. C'est cette forme que tu manipules ici.

1. `allOrThrow(results)` : comme `Promise.all` — un seul échec fait tout
   échouer (relance la **même** erreur), sinon renvoie toutes les valeurs.
2. `firstFulfilled(results)` : comme `Promise.any` — ignore les échecs, prend
   la première réussite ; si rien n'a réussi, lève une erreur dédiée.
3. `summarizeSettled(results)` : comme la lecture d'un rapport
   `Promise.allSettled` — compte simplement les deux statuts.

Réflexes utiles :

- `results.find((r) => r.status === "rejected")` repère le premier échec.
- `results.every((r) => r.status === "fulfilled")` vérifie que tout a réussi.
- `results.filter((r) => r.status === "fulfilled").length` compte un statut.

<!--correction-->

## Correction

```js
function allOrThrow(results) {
  const firstFailure = results.find((r) => r.status === "rejected")
  if (firstFailure) {
    throw firstFailure.reason // re-throw the ORIGINAL error, unchanged
  }
  return results.map((r) => r.value)
}

function firstFulfilled(results) {
  const winner = results.find((r) => r.status === "fulfilled")
  if (!winner) {
    throw new Error("All promises failed")
  }
  return winner.value
}

function summarizeSettled(results) {
  return {
    fulfilled: results.filter((r) => r.status === "fulfilled").length,
    rejected: results.filter((r) => r.status === "rejected").length,
  }
}
```

- **`allOrThrow`** cherche le **premier** résultat `rejected` avec `find`
  (qui s'arrête au premier trouvé, comme `Promise.all` qui rejette dès le
  premier échec) et relance son `reason` **tel quel** — jamais une nouvelle
  erreur générique, pour ne pas perdre l'information d'origine. Si aucun
  échec, `map` extrait juste les `value` dans l'ordre.
- **`firstFulfilled`** fait l'inverse : elle cherche le premier `fulfilled`
  et ignore silencieusement les échecs qui le précèdent — exactement le
  comportement de `Promise.any`, pensé pour les stratégies de repli
  (« essaie plusieurs miroirs, prends le premier qui répond »).
- **`summarizeSettled`** ne fait que compter : c'est le rapport que tu lirais
  après un vrai `await Promise.allSettled(...)`, pour savoir combien
  d'opérations ont réussi vs échoué sans jamais faire planter le programme.

> Dans du vrai code, ces trois `results` viendraient d'un
> `await Promise.allSettled([p1, p2, p3])` — la logique de traitement que tu
> viens d'écrire serait exactement la même, seule la **source** des données
> change (un vrai tableau de promesses réglées par le moteur JS, plutôt que
> des objets construits à la main).
