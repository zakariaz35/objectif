---
title: "Exercice — un script CLI qui charge une configuration"
type: exercise
---

> ⏱️ **Durée conseillée : ~20 min.** Cet exercice utilise `fs`, `path` et
> `process` réels : il se fait en **lecture** (le bac à sable du navigateur
> n'a pas de vrai système de fichiers ni de vrai `process.argv`).

## Énoncé

Écris un script `list-config-files.mjs` qui :

1. Lit un dossier passé en argument de ligne de commande
   (`node list-config-files.mjs ./config`), avec un dossier par défaut
   (`./config`) si aucun argument n'est fourni.
2. Liste tous les fichiers `.json` de ce dossier (ignore les autres
   extensions et les sous-dossiers).
3. Pour chacun, affiche son nom et sa taille en octets.
4. Si le dossier n'existe pas, affiche un message clair et quitte avec un
   code de sortie `1` (plutôt que de crasher avec une stack trace brute).
5. Respecte une variable d'environnement `VERBOSE=1` : si elle est définie,
   affiche en plus le chemin absolu complet de chaque fichier.

Réflexes utiles :

- `process.argv.slice(2)[0]` pour le premier argument réel.
- `path.resolve(dir)` pour obtenir un chemin absolu fiable, quel que soit le
  dossier depuis lequel le script est lancé.
- `readdir(dir, { withFileTypes: true })` renvoie des entrées permettant de
  distinguer fichiers et dossiers (`entry.isFile()`).
- `err.code === "ENOENT"` pour détecter un dossier manquant proprement.

<!--correction-->

## Correction

```js
// list-config-files.mjs
import { readdir, stat } from "node:fs/promises"
import path from "node:path"

const targetDir = path.resolve(process.argv.slice(2)[0] || "./config")
const verbose = process.env.VERBOSE === "1"

async function listConfigFiles(dir) {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch (err) {
    if (err.code === "ENOENT") {
      console.error(`Directory not found: ${dir}`)
      process.exit(1)
    }
    throw err // anything else (permissions...) is unexpected: let it crash loudly
  }

  const jsonFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".json"))

  if (jsonFiles.length === 0) {
    console.log(`No .json files found in ${dir}`)
    return
  }

  for (const file of jsonFiles) {
    const fullPath = path.join(dir, file.name)
    const info = await stat(fullPath)
    console.log(`${file.name} — ${info.size} bytes`)
    if (verbose) {
      console.log(`  → ${fullPath}`)
    }
  }
}

await listConfigFiles(targetDir)
```

```bash
# Usage examples
node list-config-files.mjs                  # uses ./config by default
node list-config-files.mjs ./other-folder    # explicit folder
VERBOSE=1 node list-config-files.mjs ./config # also prints full paths
```

- **`path.resolve(...)`** transforme l'argument (potentiellement relatif) en
  chemin absolu **une seule fois**, avant toute utilisation — évite les
  surprises liées au dossier de lancement (`process.cwd()`, vu dans la
  leçon).
- **`readdir(dir, { withFileTypes: true })`** renvoie des `Dirent` (et non de
  simples chaînes) : `entry.isFile()` permet d'exclure proprement les
  sous-dossiers sans appel `stat()` supplémentaire pour chacun.
- **`err.code === "ENOENT"`** distingue un dossier absent (cas métier
  attendu, géré avec un message clair et `process.exit(1)`) d'une erreur
  réellement anormale, qu'on laisse remonter (`throw err`) plutôt que de
  masquer silencieusement.
- **`process.env.VERBOSE === "1"`** : rappel important — **toutes** les
  variables d'environnement sont des **chaînes de caractères**, jamais des
  booléens ou des nombres natifs (contrairement à certaines conventions PHP
  qui castent automatiquement `"true"`/`"1"`). Compare toujours avec la
  chaîne exacte attendue.

> Ce script illustre la combinaison typique de ce module : `process.argv`
> (entrée), `path` (chemins fiables), `fs/promises` (I/O asynchrone,
> jamais bloquante malgré l'usage en CLI), et `process.env`/`process.exit`
> pour le comportement en ligne de commande.
