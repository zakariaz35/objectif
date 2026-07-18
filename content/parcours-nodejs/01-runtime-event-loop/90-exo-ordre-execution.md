---
title: "Exercice — prédire l'ordre d'exécution"
type: exercise
exercise:
  language: js
  starter: |
    // Each "action" below represents a piece of code SCHEDULED during a
    // synchronous pass of a script, tagged with the mechanism used to run it:
    //   "sync"      -> runs immediately, in the order it appears in the code
    //   "nextTick"  -> process.nextTick(...)      (highest async priority)
    //   "microtask" -> Promise.resolve().then(...) / queueMicrotask(...)
    //   "macrotask" -> setTimeout(...) / setImmediate(...)
    //
    // Real Node/JS scheduling rule (see the lesson):
    //   1) ALL "sync" actions run first, in their original order.
    //   2) THEN all "nextTick" actions, in their original order.
    //   3) THEN all "microtask" actions, in their original order.
    //   4) THEN all "macrotask" actions, in their original order.
    //
    // Implement `resolveExecutionOrder` so it returns the array of LABELS
    // in the actual order they would really run.
    function resolveExecutionOrder(actions) {
      // TODO: group actions by kind, respecting the priority above,
      // keeping the original relative order WITHIN each group.
      return null
    }

    // (Optionnel) essaie :
    // console.log(resolveExecutionOrder([
    //   { label: "A", kind: "sync" },
    //   { label: "D", kind: "macrotask" },
    //   { label: "B", kind: "microtask" },
    // ]))
  tests:
    - name: "sync runs before microtask, which runs before macrotask"
      code: |
        const actions = [
          { label: "A", kind: "sync" },
          { label: "D", kind: "macrotask" },
          { label: "B", kind: "microtask" },
          { label: "C", kind: "microtask" },
        ]
        const result = resolveExecutionOrder(actions)
        console.log("order:", result)
        assertEqual(result, ["A", "B", "C", "D"], "sync, then both microtasks (in order), then the macrotask")
    - name: "nextTick beats a microtask scheduled earlier in the code"
      code: |
        const actions = [
          { label: "start", kind: "sync" },
          { label: "promise-then", kind: "microtask" },
          { label: "next-tick", kind: "nextTick" },
        ]
        const result = resolveExecutionOrder(actions)
        console.log("order:", result)
        assertEqual(result, ["start", "next-tick", "promise-then"], "process.nextTick always wins over a Promise microtask")
    - name: "several macrotasks keep their relative scheduling order"
      code: |
        const actions = [
          { label: "timeout-1", kind: "macrotask" },
          { label: "sync-1", kind: "sync" },
          { label: "timeout-2", kind: "macrotask" },
        ]
        assertEqual(resolveExecutionOrder(actions), ["sync-1", "timeout-1", "timeout-2"], "macrotasks run in the order they were scheduled")
    - name: "a realistic mix of all four kinds"
      code: |
        const actions = [
          { label: "1-sync", kind: "sync" },
          { label: "4-macrotask", kind: "macrotask" },
          { label: "3-microtask", kind: "microtask" },
          { label: "2-nextTick", kind: "nextTick" },
          { label: "1b-sync", kind: "sync" },
        ]
        const result = resolveExecutionOrder(actions)
        console.log("order:", result)
        assertEqual(result, ["1-sync", "1b-sync", "2-nextTick", "3-microtask", "4-macrotask"], "one representative of each kind, in strict priority order")
    - name: "an empty list of actions gives an empty order"
      code: |
        assertEqual(resolveExecutionOrder([]), [], "nothing scheduled: nothing to run")
---

> ⏱️ **Durée conseillée : ~15 min.**

## Énoncé

Plutôt que de chronométrer du vrai code asynchrone (peu fiable dans un
bac à sable), cet exercice te fait manipuler **le modèle mental** de la leçon
précédente : étant donné une liste d'« actions » déjà étiquetées par leur
mécanisme de planification (`sync`, `nextTick`, `microtask`, `macrotask`),
reconstruis l'**ordre réel d'exécution**.

Réflexes utiles :

- Les 4 priorités, du plus prioritaire au moins prioritaire :
  `sync` → `nextTick` → `microtask` → `macrotask`.
- **À l'intérieur d'un même groupe**, l'ordre d'origine est conservé (un
  deuxième `setTimeout` posé après un premier s'exécute après lui).
- Une bonne piste : `actions.filter(a => a.kind === "sync").map(a => a.label)`
  pour chaque groupe, puis concatène les 4 tableaux dans le bon ordre.

<!--correction-->

## Correction

```js
function resolveExecutionOrder(actions) {
  const priority = ["sync", "nextTick", "microtask", "macrotask"]

  return priority.flatMap((kind) =>
    actions.filter((action) => action.kind === kind).map((action) => action.label)
  )
}
```

- `priority` fixe l'ordre des 4 groupes, exactement celui de la table de la
  leçon (`process.nextTick` > microtâches > macrotâches, `sync` étant toujours
  en tête puisqu'il s'exécute avant même que la moindre planification asynchrone
  ne soit prise en compte).
- Pour **chaque** priorité, `filter` garde uniquement les actions de ce type,
  `map` n'en garde que le label — et comme `filter`/`map` **préservent l'ordre
  d'origine**, les actions d'un même groupe restent dans l'ordre où elles ont
  été planifiées.
- `flatMap` aplatit directement les 4 sous-tableaux en un seul, dans l'ordre
  des priorités : exactement l'ordre réel d'exécution.

> Dans du vrai code, remplace mentalement chaque `kind` par l'API réelle
> (`nextTick` → `process.nextTick`, `microtask` → `Promise.resolve().then()` /
> `queueMicrotask()`, `macrotask` → `setTimeout()` / `setImmediate()`) : le
> raisonnement — et donc l'ordre obtenu — est rigoureusement le même.
