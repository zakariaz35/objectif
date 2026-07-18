---
title: "CommonJS : require/module.exports"
type: lesson
---

## Le système de modules historique de Node

Avant que JavaScript n'ait son propre système de modules standard (ESM, vu
dans la prochaine leçon), Node a inventé le sien : **CommonJS**. C'est encore
aujourd'hui le système par défaut de tout fichier `.js` sans configuration
particulière, et l'immense majorité des paquets npm plus anciens l'utilisent.

```js
// math.js — a CommonJS module
function add(a, b) {
  return a + b
}

function multiply(a, b) {
  return a * b
}

// Everything exported must be attached to `module.exports`
module.exports = { add, multiply }
```

```js
// app.js — consuming the module above
const { add, multiply } = require("./math.js")

console.log(add(2, 3))      // 5
console.log(multiply(2, 3)) // 6
```

> **Passerelle PHP/Symfony.** `require("./math.js")` ressemble furieusement à
> un `require`/`include` PHP — sauf que Node l'enveloppe dans une **fonction**
> (voir plus bas) et met en **cache** le résultat, contrairement au `require`
> PHP qui ré-exécute le fichier à chaque appel (sauf `require_once`). Plus
> proche encore : Composer/PSR-4 charge une **classe** par un mapping
> namespace → fichier ; `require()` charge un **module entier** (fonctions,
> objets, valeurs) par son chemin, sans notion de namespace.

## Chaque fichier est une fonction enveloppée

Node enveloppe silencieusement chaque fichier CommonJS dans une fonction avant
de l'exécuter, à peu près ainsi :

```js
// What Node effectively does behind the scenes (simplified)
function (exports, require, module, __filename, __dirname) {
  // ... your file's actual code lives here ...
}
```

C'est pour ça que `require`, `module`, `exports`, `__filename` et `__dirname`
« existent comme par magie » dans n'importe quel fichier CommonJS, sans jamais
être importés explicitement.

```js
console.log(__filename) // absolute path of THIS file
console.log(__dirname)  // absolute path of the folder containing this file
```

> **Passerelle PHP/Symfony.** `__dirname`/`__filename` jouent le rôle de
> `__DIR__`/`__FILE__` en PHP : des constantes magiques calculées par
> l'environnement d'exécution, pas des variables que tu déclares.

## Le cache des modules : `require` ne relit jamais deux fois

Node met en cache **chaque module** dès son premier `require`, à la clé de son
chemin absolu résolu. Un second `require("./math.js")` ailleurs dans
l'application renvoie **le même objet exporté**, sans ré-exécuter le fichier.

```js
// counter.js
let count = 0
function increment() {
  count++
  return count
}
module.exports = { increment }
```

```js
// a.js and b.js both require the SAME cached module instance
const counterA = require("./counter.js")
const counterB = require("./counter.js")

console.log(counterA === counterB)  // true — same object, same closure state
console.log(counterA.increment())   // 1
console.log(counterB.increment())   // 2 — shares the SAME `count` variable!
```

> ⚠️ **Erreur fréquente — croire qu'un module CommonJS est ré-exécuté à chaque
> `require`.** C'est faux : le fichier ne s'exécute **qu'une seule fois**, la
> première fois qu'il est chargé. Tous les `require()` suivants (même dans des
> fichiers différents) renvoient le **même objet** déjà construit — avec le
> même état interne. C'est un piège classique si tu stockes un état mutable
> dans un module en pensant qu'il sera « frais » à chaque usage.

## `require` est **synchrone** et **bloquant**

`require("./math.js")` lit le fichier sur disque, l'exécute et renvoie son
`module.exports` — **tout ça de façon synchrone**, ligne par ligne, dans
l'ordre où les `require()` apparaissent. C'est une exception notable à la
règle « ne jamais bloquer » vue au module précédent : c'est acceptable
uniquement parce que ça n'arrive **qu'au démarrage** de l'application
(chargement des modules), jamais en boucle dans un handler de requête.

```js
console.log("1. before require")
const math = require("./math.js") // reads and executes math.js SYNCHRONOUSLY
console.log("2. after require — module is fully ready here")
```

> **Réflexe à prendre.** Le chargement des modules CommonJS est un problème de
> **démarrage** (résolu une fois, au boot du process), pas un problème de
> **requête** (qui, lui, doit rester asynchrone). C'est pour ça que
> `require()` bloquant ne pose pas de problème en pratique.

## À retenir

- **CommonJS** : `require(...)` pour importer, `module.exports = { ... }` pour
  exporter — le système historique, encore omniprésent dans l'écosystème npm.
- Chaque fichier est enveloppé dans une fonction qui reçoit `require`,
  `module`, `exports`, `__filename`, `__dirname` automatiquement.
- Un module est **exécuté une seule fois** puis **mis en cache** : tous les
  `require()` suivants renvoient le **même objet**, avec le même état.
- `require()` est **synchrone** — acceptable car réservé au chargement des
  modules au démarrage, jamais à un traitement de requête.
