---
title: "EventEmitter : le patron pub/sub natif de Node"
type: lesson
---

## Le patron le plus utilisé de tout l'écosystème Node

`EventEmitter` (module natif `node:events`) est une classe qui implémente le
patron **pub/sub** (« publish/subscribe ») : un objet peut **émettre** des
événements nommés, et n'importe quel nombre d'autres parties du code peuvent
s'y **abonner**. Beaucoup d'objets Node natifs **héritent** d'`EventEmitter` :
les streams (leçon suivante), les serveurs HTTP, les sockets réseau...

```js
import { EventEmitter } from "node:events"

const emitter = new EventEmitter()

// Subscribe to the "order-placed" event
emitter.on("order-placed", (order) => {
  console.log("New order received:", order.id)
})

// Emit the event: EVERY subscribed listener runs, SYNCHRONOUSLY, in order
emitter.emit("order-placed", { id: 42 })
```

> **Passerelle PHP/Symfony.** `EventEmitter` joue exactement le rôle de
> l'`EventDispatcher` de Symfony : `on(...)` ≈ un `EventSubscriber` qui
> écoute un événement, `emit(...)` ≈ `dispatch(new OrderPlacedEvent(...))`.
> Différence notable : Symfony distingue événements et listeners par des
> **classes** typées ; `EventEmitter` utilise de simples **chaînes de
> caractères** comme noms d'événement — plus simple, mais sans vérification
> de type à la compilation.

## `on`, `once`, `off` : le cycle de vie d'un abonnement

```js
const emitter = new EventEmitter()

function onOrder(order) {
  console.log("Order:", order.id)
}

emitter.on("order-placed", onOrder)     // subscribe: runs on EVERY emit
emitter.once("order-placed", (o) => {   // subscribe: runs only on the FIRST emit
  console.log("First order ever:", o.id)
})

emitter.emit("order-placed", { id: 1 }) // both listeners run
emitter.emit("order-placed", { id: 2 }) // only `onOrder` runs (once() already fired)

emitter.off("order-placed", onOrder)    // unsubscribe
emitter.emit("order-placed", { id: 3 }) // nothing runs anymore
```

> 💡 **À retenir.** `emitter.emit(...)` appelle tous les listeners
> **synchrones**, **dans l'ordre d'abonnement**, avant de rendre la main.
> Émettre un événement ne rend PAS la main à l'event loop entre chaque
> listener — si un listener est lent ou bloquant, il retarde tous les
> suivants (et bloque le thread, module 1).

## La convention spéciale de l'événement `"error"`

> ⚠️ **Erreur fréquente — émettre `"error"` sans aucun listener abonné.**
> `EventEmitter` traite l'événement `"error"` de façon spéciale : si **aucun**
> listener n'y est abonné au moment de l'`emit("error", ...)`, Node **lève
> l'erreur** (et peut arrêter le process) au lieu de l'ignorer silencieusement
> comme pour n'importe quel autre nom d'événement.

```js
const emitter = new EventEmitter()

// ❌ No listener for "error": this CRASHES the process
// emitter.emit("error", new Error("Something broke"))

// ✅ Always attach an "error" listener on any EventEmitter you create
emitter.on("error", (err) => {
  console.error("Handled:", err.message)
})
emitter.emit("error", new Error("Something broke")) // now safely handled
```

> **Passerelle PHP/Symfony.** C'est l'équivalent d'une exception PHP qui
> remonterait jusqu'en haut de la pile sans `catch` : Node force ce
> comportement pour l'événement `"error"` précisément pour qu'une erreur ne
> puisse jamais passer inaperçue.

## Quand utiliser `EventEmitter`

Utile pour découpler un producteur d'événements de ses consommateurs — un
`Logger`, un système de notifications internes, un cache qui notifie ses
invalidations. **Ce n'est pas un mécanisme de promesse** : `emit()` ne renvoie
pas de résultat et est **synchrone** (pas de `await emitter.emit(...)`).

## À retenir

- `EventEmitter` (module `node:events`) implémente le pub/sub natif de Node :
  `on`/`once` pour s'abonner, `emit` pour notifier, `off` pour se désabonner.
- Les listeners s'exécutent **synchrones**, dans l'ordre d'abonnement, sans
  rendre la main entre chacun.
- L'événement `"error"` a un comportement **spécial** : sans listener abonné,
  Node lève l'erreur au lieu de l'ignorer — attache **toujours** un handler
  `"error"` sur tout `EventEmitter` créé.
- Beaucoup d'objets Node natifs (streams, serveurs HTTP, sockets) héritent
  d'`EventEmitter` : ce patron est la base de toute la leçon suivante.
