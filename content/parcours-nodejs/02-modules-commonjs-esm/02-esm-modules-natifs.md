---
title: "ESM : les modules JavaScript natifs"
type: lesson
---

## ESM : le standard du langage, pas une invention de Node

**ESM** (*ECMAScript Modules*) est le système de modules défini par la
spécification JavaScript elle-même (depuis ES2015) — celui que tu utilises
déjà si tu as fait du Vue/React/Angular moderne. Node le supporte nativement
depuis plusieurs années, en parallèle de CommonJS.

```js
// math.mjs — an ES module
export function add(a, b) {
  return a + b
}

export function multiply(a, b) {
  return a * b
}

export default function subtract(a, b) {
  return a - b
}
```

```js
// app.mjs — consuming the module above
import subtract, { add, multiply } from "./math.mjs"

console.log(add(2, 3))       // 5
console.log(multiply(2, 3))  // 6
console.log(subtract(5, 2))  // 3 (default export)
```

> **Passerelle PHP/Symfony.** `export`/`import` te donne quelque chose que
> CommonJS n'a jamais eu : une syntaxe **analysable statiquement** — un outil
> peut savoir *sans exécuter le code* ce qu'un module exporte et importe.
> C'est proche de l'esprit des `use` PHP (déclarés en haut de fichier,
> analysables sans exécution), contrairement au `require()` CommonJS qui peut
> être appelé n'importe où, y compris conditionnellement.

## Différences syntaxiques et sémantiques clés

| | CommonJS | ESM |
|---|---|---|
| Importer | `const x = require("./mod.js")` | `import x from "./mod.js"` |
| Exporter | `module.exports = ...` | `export` / `export default` |
| Position de l'import | n'importe où, y compris conditionnel | **uniquement** en haut du fichier (portée module) |
| Chargement | synchrone | **asynchrone** (même pour un fichier local) |
| `this` au niveau module | `module.exports` (un objet) | `undefined` (mode strict imposé) |
| Chemin du fichier courant | `__dirname` / `__filename` | `import.meta.url` |
| Résolution des extensions | `.js` implicite (`require("./x")` → `./x.js`) | extension **explicite obligatoire** (`./x.js`) |

```js
// ⚠️ ESM imports must be TOP-LEVEL and STATIC — this is NOT valid ESM:
// if (condition) {
//   import { thing } from "./mod.js" // ❌ SyntaxError
// }

// ✅ Need a conditional import? Use the ASYNC dynamic form instead:
if (condition) {
  const { thing } = await import("./mod.js") // dynamic import: always async
}
```

> ⚠️ **Erreur fréquente — oublier l'extension du fichier.** En CommonJS,
> `require("./utils")` retrouve tout seul `./utils.js`. En ESM, l'extension
> `.js` est **obligatoire** dans le chemin : `import "./utils.js"`. C'est une
> des premières erreurs (`ERR_MODULE_NOT_FOUND`) que rencontre un dev qui
> convertit un projet CommonJS vers ESM.

## `import.meta.url` et le *top-level await*

```js
// ESM has no __dirname/__filename — use import.meta.url instead
import { fileURLToPath } from "node:url"
import { dirname } from "node:path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
```

ESM autorise aussi le **top-level await** : utiliser `await` directement au
niveau racine d'un module, sans l'envelopper dans une fonction `async`.

```js
// ESM only: `await` works at the TOP LEVEL of the module, no wrapper needed
const config = await loadConfigFromDatabase()
console.log("Config loaded before the rest of the module runs:", config)
```

> **Passerelle PHP/Symfony.** Rien d'équivalent en PHP (tout y est déjà
> synchrone par défaut). Le *top-level await* est utile pour des scripts
> d'initialisation (charger une config distante, ouvrir une connexion) avant
> que le reste du module ne s'exécute — un cas d'usage assez proche d'un
> `boot()` de Service Provider, mais **au niveau module**, pas au niveau
> framework.

## Comment Node sait quel système utiliser

Par défaut, un fichier `.js` est interprété comme **CommonJS**. Trois façons de
basculer vers ESM :

1. Extension `.mjs` (toujours ESM, quel que soit le contexte).
2. Extension `.cjs` (toujours CommonJS, quel que soit le contexte).
3. Champ `"type": "module"` dans le `package.json` le plus proche : tous les
   `.js` de ce paquet deviennent alors des modules ESM par défaut (détaillé
   dans la prochaine leçon).

> 💡 **À retenir.** ESM est **asynchrone par conception**, même pour un import
> de fichier local sur disque — c'est un choix délibéré de la spécification
> (pensé aussi pour le chargement de modules depuis le réseau, comme dans un
> navigateur), qui explique certaines subtilités d'interopérabilité avec
> CommonJS (leçon suivante).

## À retenir

- **ESM** (`import`/`export`) est le standard du **langage** JavaScript,
  analysable statiquement, avec chargement **asynchrone** et extensions de
  fichier **obligatoires**.
- Pas de `__dirname`/`__filename` en ESM : utilise `import.meta.url`.
- Le **top-level await** n'existe qu'en ESM.
- Un fichier est ESM via l'extension `.mjs`, ou via `"type": "module"` dans
  le `package.json` (sinon CommonJS par défaut).
