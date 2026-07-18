---
title: "Exercice interactif — construire le batching de DataLoader"
type: exercise
exercise:
  language: ts
  starter: |
    // Build the core BATCHING mechanism behind DataLoader, in pure
    // TypeScript. No "dataloader"/"@nestjs"/"graphql" import here: this IS
    // the mechanism itself, the one the previous lesson used to fix N+1.

    // `batchFn` receives ALL the keys accumulated together, and MUST return
    // one value per key, IN THE SAME ORDER (DataLoader's own contract).
    // `undefined` at index i means "nothing found for keys[i]".
    type BatchFn<K, V> = (keys: K[]) => (V | undefined)[]

    // Decides WHEN the accumulated keys are actually sent to `batchFn`. The
    // DEFAULT groups everything requested during the SAME microtask tick --
    // exactly the mechanism from the lesson (`Promise.resolve().then(...)`,
    // never `setTimeout`). The tests below override it to trigger that
    // instant BY HAND, deterministically: real Promise/microtask TIMING
    // isn't something a test can reliably wait on in a sandbox (see the
    // async exercises of the NodeJS course for the same caveat).
    type ScheduleFn = (flushBatch: () => void) => void

    // Simpler than a native Promise: delivers its value SYNCHRONOUSLY, the
    // moment it is resolved -- enough to model DataLoader's core idea
    // without depending on real Promise timing.
    interface Loadable<V> {
      then(onValue: (value: V | undefined) => void): void
    }

    function createBatchLoader<K, V>(
      batchFn: BatchFn<K, V>,
      scheduleBatch: ScheduleFn = (flushBatch) => Promise.resolve().then(flushBatch),
    ) {
      // TODO:
      // - accumulate every requested `key` (with the `onValue` callback that
      //   wants its value later) in a pending list, WITHOUT calling
      //   `batchFn` yet.
      // - on the FIRST `.load()` of a new batch, call `scheduleBatch(...)`
      //   with a "flush" function: once THAT function runs (called by the
      //   real scheduler, or by a test), it must call `batchFn` EXACTLY
      //   ONCE with ALL the keys accumulated so far, then hand each value
      //   back to its matching `onValue` callback, in order.
      // - after a flush, the NEXT `.load()` must start a FRESH batch (a new
      //   pending list, a new call to `scheduleBatch`).
      return {
        load(key: K): Loadable<V> {
          return { then() {} }
        },
      }
    }
  tests:
    - name: "avec le planificateur par defaut, batchFn n'est pas appelee de facon synchrone"
      code: |
        let callCount = 0
        const batchFn = (keys: string[]) => {
          callCount++
          return keys.map((k) => `value-${k}`)
        }
        const loader = createBatchLoader(batchFn)
        loader.load("a")
        loader.load("b")
        console.log("callCount right after load():", callCount)
        assertEqual(callCount, 0, "batchFn must stay deferred to the next microtask tick, never called synchronously")
    - name: "une seule requete groupee pour plusieurs .load() accumules ensemble"
      code: |
        let flushBatch: (() => void) | null = null
        const captureSchedule = (flush: () => void) => { flushBatch = flush }
        let callCount = 0
        let receivedKeysHistory: string[][] = []
        const batchFn = (keys: string[]) => {
          callCount++
          receivedKeysHistory.push([...keys])
          return keys.map((k) => `book-${k}`)
        }
        const loader = createBatchLoader(batchFn, captureSchedule)

        let bookA: string | undefined
        let bookB: string | undefined
        let bookC: string | undefined
        loader.load("1").then((v) => (bookA = v))
        loader.load("2").then((v) => (bookB = v))
        loader.load("3").then((v) => (bookC = v))

        assertEqual(callCount, 0, "nothing must run before the batch is actually flushed")
        flushBatch!()
        console.log("received keys in the single call:", receivedKeysHistory)

        assertEqual(callCount, 1, "batchFn must be called EXACTLY once for the whole group of .load() calls")
        assertEqual(receivedKeysHistory, [["1", "2", "3"]], "the single call must receive ALL accumulated keys together, in order")
        assertEqual(bookA, "book-1", "each .load() must resolve to ITS OWN value")
        assertEqual(bookB, "book-2", "each .load() must resolve to ITS OWN value")
        assertEqual(bookC, "book-3", "each .load() must resolve to ITS OWN value")
    - name: "une cle absente se resout en undefined, sans casser les autres"
      code: |
        let flushBatch: (() => void) | null = null
        const captureSchedule = (flush: () => void) => { flushBatch = flush }
        const authorsById: Record<string, string> = { "1": "Frank Herbert" }
        const batchFn = (keys: string[]) => keys.map((k) => authorsById[k])
        const loader = createBatchLoader(batchFn, captureSchedule)

        let found: string | undefined
        let missing: string | undefined
        loader.load("1").then((v) => (found = v))
        loader.load("42").then((v) => (missing = v))
        flushBatch!()

        assertEqual(found, "Frank Herbert", "a known key resolves to its value")
        assertEqual(missing, undefined, "an unknown key resolves to undefined, without breaking the other results")
    - name: "apres un flush, le .load() suivant repart sur un nouveau lot"
      code: |
        let scheduleCalls = 0
        const flushes: Array<() => void> = []
        const captureSchedule = (flush: () => void) => {
          scheduleCalls++
          flushes.push(flush)
        }
        let callCount = 0
        const batchFn = (keys: string[]) => {
          callCount++
          return keys.map((k) => `v-${k}`)
        }
        const loader = createBatchLoader(batchFn, captureSchedule)

        loader.load("a")
        loader.load("b")
        flushes[0]()

        loader.load("c")

        assertEqual(scheduleCalls, 2, "a new .load() after a flush must schedule a NEW batch")
        assertEqual(callCount, 1, "batchFn must not have run yet for the second batch")
        flushes[1]()
        assertEqual(callCount, 2, "the second batch flushes independently, with its own single batchFn call")
---

> ⏱️ **Durée conseillée : ~25 min.**

## Énoncé

La leçon précédente a expliqué **l'idée** de DataLoader : au lieu d'appeler
`batchFn` une fois par `.load(key)`, on **accumule** les clés demandées
pendant le tick d'exécution en cours, puis on déclenche **un seul appel
groupé**, avant de redistribuer chaque résultat à l'appelant qui l'a
demandé. Cet exercice te fait **construire cette mécanique toi-même**.

Un détail de bac à sable, avant de commencer : tester du vrai code
asynchrone (avec de vrais délais de microtâche) n'est pas fiable dans
l'éditeur — exactement le constat déjà fait dans les exercices sur
l'asynchrone du parcours NodeJS. C'est pour ça que `createBatchLoader`
prend un **second argument optionnel**, `scheduleBatch`, qui décide *quand*
déclencher le lot :

- **par défaut**, il utilise une vraie microtâche
  (`Promise.resolve().then(flushBatch)`) — exactement le mécanisme réel de
  DataLoader, celui de la leçon ;
- les tests le **remplacent** par une version qui *capture* la fonction de
  déclenchement au lieu de l'exécuter tout de suite, pour pouvoir
  l'appeler à la main, au moment voulu, et vérifier chaque étape avec de
  simples `assert`/`assertEqual` synchrones.

La logique d'accumulation et de redistribution que tu écris est **exactement
la même** dans les deux cas — seul le *déclencheur* change.

Implémente `createBatchLoader(batchFn, scheduleBatch)` :

1. `load(key)` **accumule** `key` (et une place pour son futur callback
   `onValue`) dans un lot en cours, **sans** appeler `batchFn`.
2. Au **premier** `load()` d'un nouveau lot, appelle `scheduleBatch(flush)`
   avec une fonction `flush` : quand elle s'exécute (par le vrai
   planificateur, ou par un test), elle doit appeler `batchFn` **une seule
   fois** avec **toutes** les clés accumulées, dans l'ordre, puis transmettre
   à chaque `onValue` la valeur qui lui correspond (même index).
3. Après un flush, le `load()` suivant **redémarre** un nouveau lot (un
   nouvel appel à `scheduleBatch`).

Réflexes utiles :

- Un tableau d'objets `{ key, onValue }` (plutôt que deux tableaux séparés)
  évite tout risque de désynchronisation entre les clés et leurs callbacks.
- `batch.forEach((entry, index) => entry.onValue?.(values[index]))`
  redistribue chaque valeur à l'appelant qui l'a demandée, dans l'ordre —
  exactement la contrainte d'ordre que `DataLoader` impose à `batchFn`.
- Un simple booléen (`batchScheduled`) suffit à savoir si un lot est déjà en
  cours d'accumulation, pour n'appeler `scheduleBatch` qu'une fois par lot.

<!--correction-->

## Correction

```ts
type BatchFn<K, V> = (keys: K[]) => (V | undefined)[]

type ScheduleFn = (flushBatch: () => void) => void

interface Loadable<V> {
  then(onValue: (value: V | undefined) => void): void
}

function createBatchLoader<K, V>(
  batchFn: BatchFn<K, V>,
  scheduleBatch: ScheduleFn = (flushBatch) => Promise.resolve().then(flushBatch),
) {
  type PendingEntry = { key: K; onValue: ((value: V | undefined) => void) | null }
  let pending: PendingEntry[] = []
  let batchScheduled = false

  function flushBatch() {
    // Snapshot AND reset immediately: any .load() called from INSIDE a
    // callback below must start a brand new batch, not join this one.
    const batch = pending
    pending = []
    batchScheduled = false

    const values = batchFn(batch.map((entry) => entry.key)) // ONE call, for the WHOLE batch
    batch.forEach((entry, index) => entry.onValue?.(values[index]))
  }

  return {
    load(key: K): Loadable<V> {
      const entry: PendingEntry = { key, onValue: null }
      pending.push(entry)

      if (!batchScheduled) {
        batchScheduled = true
        scheduleBatch(flushBatch)
      }

      return {
        then(onValue) {
          entry.onValue = onValue
        },
      }
    },
  }
}
```

- **Accumulation** : `load(key)` ne fait jamais appel à `batchFn` — il pousse
  seulement une `entry` dans `pending`. C'est très exactement ce que fait
  `.load(id)` sur un vrai `DataLoader` : rien ne part tant que le tick n'est
  pas terminé.
- **Un seul déclenchement par lot** : `batchScheduled` garantit qu'un seul
  `scheduleBatch(flushBatch)` est programmé, même si `load()` est appelé dix
  fois de suite — c'est la garantie « batchFn appelée une seule fois ».
- **Redistribution dans l'ordre** : `batch.map((entry) => entry.key)` donne
  à `batchFn` exactement les clés dans l'ordre où elles ont été demandées ;
  `batch.forEach((entry, index) => entry.onValue?.(values[index]))`
  redistribue `values[index]` à l'appelant `index` — le **même** contrat
  d'ordre que le vrai `DataLoader` impose à sa `batchFn`.
- **Une clé absente** : si `batchFn` renvoie `undefined` à une position (id
  inconnu), `entry.onValue?.(undefined)` transmet `undefined` à ce seul
  appelant, sans rien casser pour les autres — comme le montre le test
  dédié.
- **Ré-armement** : `pending = []` et `batchScheduled = false` sont remis à
  zéro **avant** d'appeler `batchFn` (pas après) : un `load()` déclenché
  depuis un callback de résolution repart bien sur un lot neuf, jamais sur
  celui en train d'être vidé.

> Dans un vrai serveur NestJS, `scheduleBatch` n'est jamais fourni : c'est le
> paramètre par défaut — une vraie microtâche — qui s'en charge, exactement
> comme la leçon l'a montré avec la vraie librairie `dataloader`. Ce que tu
> viens d'écrire, c'est **le mécanisme derrière** `new DataLoader(batchFn)` :
> ce qui transforme N appels individuels en une seule requête groupée.
