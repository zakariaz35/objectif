---
title: "try/catch avec async/await, et les filets de sécurité globaux"
type: lesson
---

## `try`/`catch` retrouve son sens naturel

Le module 3 l'a déjà montré : avec `async`/`await`, `try`/`catch` fonctionne
exactement comme en PHP synchrone. Rappel de la règle essentielle avant
d'aller plus loin :

```js
async function processOrder(orderId) {
  try {
    const order = await fetchOrder(orderId)
    const payment = await chargePayment(order)
    return { order, payment }
  } catch (err) {
    console.error(`Failed to process order ${orderId}:`, err.message)
    throw err // decide: re-throw, or return a fallback value
  }
}
```

> 💡 **À retenir.** Un `try/catch` autour d'un `async function` attrape
> **toute** promesse rejetée rencontrée par un `await` à l'intérieur du bloc
> `try` — que ce soit une erreur métier attendue ou un bug. C'est **après**
> l'avoir attrapée qu'il faut décider quoi en faire (leçon précédente) : la
> gérer, ou la relancer (`throw err`) si elle ne t'appartient pas.

## Les deux filets de sécurité globaux du process

Deux événements sur l'objet `process` permettent d'intercepter ce qui aurait
sinon fait planter silencieusement (ou brutalement) l'application.

```js
// Catches a synchronous error that escaped EVERY try/catch in the codebase.
process.on("uncaughtException", (err) => {
  console.error("FATAL — uncaught exception:", err)
  process.exit(1) // recommended: log, then let the process die and restart
})

// Catches a rejected Promise that no .catch()/try-catch ever handled.
process.on("unhandledRejection", (reason) => {
  console.error("FATAL — unhandled rejection:", reason)
  process.exit(1)
})
```

> ⚠️ **Erreur fréquente — utiliser ces événements pour « avaler » les
> erreurs et continuer comme si de rien n'était.** `uncaughtException` et
> `unhandledRejection` sont des **filets de dernier recours**, pas une
> stratégie de gestion d'erreur normale. Une fois qu'ils se déclenchent,
> l'état du process est potentiellement corrompu (rappel de la leçon
> précédente) : la bonne pratique est de **logger puis quitter**
> (`process.exit(1)`), en laissant un gestionnaire de process (PM2,
> Kubernetes...) redémarrer proprement, plutôt que de continuer à servir des
> requêtes dans un état incertain.

> **Passerelle PHP/Symfony.** Le plus proche équivalent : le
> `ExceptionListener`/`kernel.exception` de Symfony, qui intercepte toute
> exception non attrapée par le code applicatif pour la transformer en
> réponse HTTP propre (souvent une 500). Différence clé : en PHP, ce filet
> se déclenche **par requête**, sans affecter les autres workers. En Node,
> `uncaughtException` se déclenche pour **tout le process** — d'où la
> recommandation de redémarrer plutôt que de continuer.

## Une erreur dans un `EventEmitter` sans handler `"error"` (rappel du module 4)

```js
import { EventEmitter } from "node:events"

const emitter = new EventEmitter()
// No "error" listener attached: emitting "error" here would CRASH the process
// (see module 4: the special behavior of the "error" event)
```

C'est en réalité une forme d'`uncaughtException` : Node considère qu'un
`EventEmitter` qui émet `"error"` sans personne pour l'écouter est une
situation suffisamment grave pour justifier l'arrêt du process.

## À retenir

- `try`/`catch` autour d'un `async function` attrape toute promesse rejetée
  rencontrée par un `await` du bloc — décide **après coup** de la gérer ou
  de la relancer.
- `process.on("uncaughtException", ...)` et
  `process.on("unhandledRejection", ...)` sont des **filets de dernier
  recours** : leur bon usage est de **logger puis `process.exit(1)`**, jamais
  de continuer comme si de rien n'était.
- Contrairement au `kernel.exception` de Symfony (portée : une requête), ces
  filets Node concernent **tout le process** — cohérent avec la
  recommandation de redémarrer plutôt que continuer (leçon précédente).
