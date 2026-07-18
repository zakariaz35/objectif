---
title: "Exercice — réimplémenter un mini EventEmitter"
type: exercise
exercise:
  language: js
  starter: |
    // Implement a SIMPLIFIED version of Node's EventEmitter, from scratch.
    // No import needed: build the pub/sub mechanism yourself.
    class MiniEmitter {
      constructor() {
        // TODO: pick a data structure to store, PER EVENT NAME,
        // the list of subscribed listener functions.
        this.listeners = {}
      }

      // Subscribe `listener` to `eventName`. Can be called several times
      // for the same event: all listeners must run on emit().
      on(eventName, listener) {
        // TODO
      }

      // Unsubscribe `listener` from `eventName` (only THIS exact function).
      off(eventName, listener) {
        // TODO
      }

      // Call every listener subscribed to `eventName`, IN SUBSCRIPTION ORDER,
      // forwarding all extra arguments to each of them.
      // Returns true if at least one listener was called, false otherwise.
      emit(eventName, ...args) {
        // TODO
        return false
      }
    }

    // (Optionnel) essaie :
    // const bus = new MiniEmitter()
    // bus.on("greet", (name) => console.log("Hello, " + name))
    // bus.emit("greet", "Ada")
  tests:
    - name: "un seul listener reçoit l'événement émis"
      code: |
        const bus = new MiniEmitter()
        let received = null
        bus.on("order-placed", (order) => { received = order })
        bus.emit("order-placed", { id: 42 })
        assertEqual(received, { id: 42 }, "the listener must receive the emitted payload")
    - name: "plusieurs listeners sont appelés, dans l'ordre d'abonnement"
      code: |
        const bus = new MiniEmitter()
        const calls = []
        bus.on("tick", () => calls.push("first"))
        bus.on("tick", () => calls.push("second"))
        bus.on("tick", () => calls.push("third"))
        bus.emit("tick")
        console.log("calls:", calls)
        assertEqual(calls, ["first", "second", "third"], "listeners must run in subscription order")
    - name: "emit transmet plusieurs arguments à chaque listener"
      code: |
        const bus = new MiniEmitter()
        let received = null
        bus.on("sum", (a, b) => { received = a + b })
        bus.emit("sum", 2, 3)
        assertEqual(received, 5, "extra arguments to emit() must reach the listener")
    - name: "off désabonne UNIQUEMENT le listener précis, les autres restent actifs"
      code: |
        const bus = new MiniEmitter()
        const calls = []
        function onA() { calls.push("A") }
        function onB() { calls.push("B") }
        bus.on("event", onA)
        bus.on("event", onB)
        bus.off("event", onA)
        bus.emit("event")
        assertEqual(calls, ["B"], "only onA was removed, onB must still run")
    - name: "emit sur un événement sans aucun listener ne fait rien planter"
      code: |
        const bus = new MiniEmitter()
        const result = bus.emit("nobody-listens")
        assertEqual(result, false, "emit() with zero listeners returns false and does not throw")
    - name: "deux instances de MiniEmitter ont des listeners totalement indépendants"
      code: |
        const busA = new MiniEmitter()
        const busB = new MiniEmitter()
        let calledOnB = false
        busA.on("shared-name", () => { calledOnB = true })
        busB.emit("shared-name") // busB has NO listener for this event
        assertEqual(calledOnB, false, "emitting on busB must not trigger a listener subscribed on busA")
---

> ⏱️ **Durée conseillée : ~20 min.**

## Énoncé

Plutôt que d'utiliser `node:events`, tu vas **reconstruire** son mécanisme
central pour bien comprendre ce qui se passe « sous le capot » à chaque
`.on()`/`.emit()`.

1. `on(eventName, listener)` : mémorise `listener` dans la liste des
   fonctions abonnées à `eventName` (il peut y en avoir plusieurs).
2. `off(eventName, listener)` : retire **cette fonction précise** de la
   liste — les autres restent abonnées.
3. `emit(eventName, ...args)` : appelle **tous** les listeners abonnés à
   `eventName`, **dans l'ordre où ils ont été ajoutés**, en leur transmettant
   `args`. Renvoie `true` si au moins un listener a été appelé, `false`
   sinon.

Réflexes utiles :

- Un objet `{ "order-placed": [fn1, fn2], "tick": [fn3] }` (une clé par nom
  d'événement, une valeur = tableau de fonctions) est une structure de
  données naturelle ici.
- `this.listeners[eventName] ??= []` (ou `if (!this.listeners[eventName])
  this.listeners[eventName] = []`) initialise proprement le tableau au
  premier abonnement à un événement donné.
- Pour `off`, `filter` permet de retirer une fonction précise d'un tableau
  sans toucher aux autres.

<!--correction-->

## Correction

```js
class MiniEmitter {
  constructor() {
    this.listeners = {} // { eventName: [listener1, listener2, ...] }
  }

  on(eventName, listener) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = []
    }
    this.listeners[eventName].push(listener)
  }

  off(eventName, listener) {
    if (!this.listeners[eventName]) return
    this.listeners[eventName] = this.listeners[eventName].filter((fn) => fn !== listener)
  }

  emit(eventName, ...args) {
    const subscribed = this.listeners[eventName]
    if (!subscribed || subscribed.length === 0) {
      return false
    }
    for (const listener of subscribed) {
      listener(...args) // called SYNCHRONOUSLY, in subscription order
    }
    return true
  }
}
```

- **`on`** initialise le tableau au besoin (`if (!this.listeners[eventName])`)
  puis `push` le nouveau listener à la fin — ce qui garantit l'**ordre
  d'abonnement** utilisé ensuite par `emit`.
- **`off`** utilise `filter` pour reconstruire le tableau **sans** la
  fonction précise passée en argument (comparaison par référence, `fn !==
  listener`) : les autres listeners du même événement restent intacts.
- **`emit`** boucle sur les listeners abonnés et les appelle **un par un,
  de façon synchrone** — exactement le comportement du vrai `EventEmitter`
  de Node (module `node:events`), qui n'est ni asynchrone ni parallèle : un
  listener lent retarde tous les suivants.

> Le vrai `EventEmitter` de Node ajoute des détails supplémentaires (un
> avertissement au-delà de 10 listeners par événement, la méthode `once()`,
> le traitement spécial de l'événement `"error"` vu dans la leçon) — mais le
> cœur du mécanisme, celui que tu viens d'écrire, est rigoureusement le
> même.
