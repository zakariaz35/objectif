---
title: "Exercice — convertir un module CommonJS en ESM"
type: exercise
---

> ⏱️ **Durée conseillée : ~20 min.** Cet exercice manipule `require`/`fs`/chemins
> de fichiers réels : il se fait en **lecture** (pas d'éditeur interactif ici,
> le bac à sable du navigateur n'a pas de vrai système de fichiers Node).

## Énoncé

Voici un module **CommonJS** qui charge un fichier de configuration JSON situé
à côté de lui :

```js
// config-loader.js (CommonJS)
const fs = require("node:fs")
const path = require("node:path")

function loadConfig(fileName) {
  const fullPath = path.join(__dirname, fileName)
  const raw = fs.readFileSync(fullPath, "utf8")
  return JSON.parse(raw)
}

module.exports = { loadConfig }
```

Convertis-le en module **ESM** (`config-loader.mjs`), en respectant les points
suivants :

1. Remplace les `require(...)` par des `import ... from ...`.
2. Remplace `module.exports` par des `export` nommés.
3. `__dirname` n'existe pas en ESM : reconstruis-le à partir de
   `import.meta.url` (indice : `fileURLToPath` + `dirname`, vus dans la leçon
   « ESM : les modules JavaScript natifs »).
4. Le module qui **consomme** `config-loader.mjs` doit lui aussi utiliser
   `import`.

<!--correction-->

## Correction

```js
// config-loader.mjs (ESM)
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { dirname } from "node:path"

// No __dirname in ESM: rebuild it from import.meta.url
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export function loadConfig(fileName) {
  const fullPath = path.join(__dirname, fileName)
  const raw = fs.readFileSync(fullPath, "utf8")
  return JSON.parse(raw)
}
```

```js
// app.mjs — consuming the converted module
import { loadConfig } from "./config-loader.mjs"

const config = loadConfig("settings.json")
console.log(config)
```

Points clés de la conversion :

- **`require` → `import`** : chaque module Node natif (`node:fs`, `node:path`)
  s'importe de la même façon qu'un paquet npm ou qu'un fichier local.
- **`module.exports = { loadConfig }` → `export function loadConfig(...)`** :
  en ESM, on exporte au fil de l'eau, directement sur la déclaration (ou via
  `export { loadConfig }` en fin de fichier).
- **`__dirname` reconstruit** : `import.meta.url` donne l'URL du module
  courant (`file:///.../config-loader.mjs`) ; `fileURLToPath` la convertit en
  chemin de fichier classique, puis `dirname()` en extrait le dossier — trois
  lignes de boilerplate qu'un dev CommonJS n'a jamais eu à écrire, prix à
  payer pour la portabilité d'ESM (pensé aussi pour tourner dans un
  navigateur, où « un chemin de fichier disque » n'a pas de sens).
- **Extension `.mjs` obligatoire** dans l'import (`./config-loader.mjs`, pas
  `./config-loader`) : rappel de la leçon précédente, ESM n'ajoute jamais
  l'extension à ta place.

> Note que `fs.readFileSync` reste **synchrone** dans les deux versions : ce
> module se charge au démarrage de l'application (pas dans un handler de
> requête), donc bloquer brièvement le thread ici ne pose aucun problème —
> conforme au réflexe du module précédent.
