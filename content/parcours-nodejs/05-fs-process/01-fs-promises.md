---
title: "fs/promises : manipuler les fichiers proprement"
type: lesson
---

## Trois variantes, une seule à privilégier

Le module `fs` (*file system*) propose **trois** familles de fonctions pour
chaque opération : synchrone, callback, et basée sur les promesses.

```js
import fs from "node:fs"
import fsPromises from "node:fs/promises"

// 1) Synchronous: BLOCKS the thread until done — module 1's forbidden zone
const content1 = fs.readFileSync("data.json", "utf8")

// 2) Callback-based: the historical async API, error-first
fs.readFile("data.json", "utf8", (err, content) => {
  if (err) throw err
  console.log(content)
})

// 3) Promise-based: async/await, the modern recommended way
const content3 = await fsPromises.readFile("data.json", "utf8")
```

> **Réflexe à prendre.** Dans du code applicatif moderne (routes, services),
> utilise **systématiquement** `node:fs/promises` avec `async/await`. Réserve
> les variantes `Sync` aux scripts ponctuels ou au tout démarrage du process
> (charger une config une fois, avant que le serveur n'accepte du trafic —
> rappel du module 1).

## Les opérations les plus courantes

```js
import { readFile, writeFile, readdir, mkdir, stat, unlink } from "node:fs/promises"

// Read a file as text
const config = await readFile("config.json", "utf8")

// Write a file (creates it if it doesn't exist, overwrites otherwise)
await writeFile("output.txt", "Hello, Node!", "utf8")

// List the contents of a directory
const entries = await readdir("./uploads")
console.log(entries) // ["avatar.png", "report.pdf", ...]

// Get metadata about a file (size, type, dates...)
const info = await stat("output.txt")
console.log(info.size, info.isDirectory())

// Create a directory (recursive: creates parent folders as needed)
await mkdir("./uploads/2026/07", { recursive: true })

// Delete a file
await unlink("output.txt")
```

> **Passerelle PHP/Symfony.** Table de correspondance directe :

| PHP | Node (`fs/promises`) |
|---|---|
| `file_get_contents($path)` | `await readFile(path, "utf8")` |
| `file_put_contents($path, $data)` | `await writeFile(path, data)` |
| `scandir($dir)` | `await readdir(dir)` |
| `mkdir($dir, 0777, true)` | `await mkdir(dir, { recursive: true })` |
| `unlink($path)` | `await unlink(path)` |
| `filesize($path)` / `is_dir($path)` | `(await stat(path)).size` / `.isDirectory()` |

## Toujours gérer les erreurs de fichier

Une opération fichier peut échouer pour de nombreuses raisons (fichier
absent, permissions insuffisantes, disque plein). Les erreurs `fs` portent un
code standardisé dans `err.code`.

```js
import { readFile } from "node:fs/promises"

async function readConfigSafely(path) {
  try {
    return await readFile(path, "utf8")
  } catch (err) {
    if (err.code === "ENOENT") {
      console.warn(`Config file not found at ${path}, using defaults`)
      return null
    }
    throw err // re-throw anything unexpected (permissions, disk error...)
  }
}
```

> 💡 **À retenir.** `ENOENT` (« Error NO ENTry ») signifie fichier ou dossier
> introuvable ; `EACCES` signifie permission refusée. Tester `err.code`
> permet de distinguer une absence **attendue** (fichier de config optionnel)
> d'une erreur réellement anormale à faire remonter.

## À retenir

- Trois variantes par opération (`*Sync`, callback, promesse) : privilégie
  **toujours** `node:fs/promises` + `async/await` dans du code de requête.
- API très proche des fonctions fichier de PHP, avec les mêmes concepts
  (`readFile`/`writeFile`/`readdir`/`mkdir`/`unlink`).
- Les erreurs fichier portent un `err.code` standardisé (`ENOENT`, `EACCES`) à
  tester pour distinguer une absence normale d'une vraie erreur.
