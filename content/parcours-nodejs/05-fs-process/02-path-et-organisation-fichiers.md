---
title: "Le module path : chemins fiables et portables"
type: lesson
---

## Pourquoi ne jamais construire un chemin avec de la concaténation

> ⚠️ **Erreur fréquente — concaténer des chemins avec `+` ou des template
> strings.** `` `${dossier}/${fichier}` `` fonctionne... jusqu'au jour où le
> code tourne sur Windows (séparateur `\`), où `dossier` se termine déjà par
> un `/` (double séparateur), ou où `fichier` contient un `../` malicieux. Le
> module `node:path` résout tout ça correctement, sur toutes les plateformes.

```js
import path from "node:path"

// ❌ Fragile: assumes "/", breaks on Windows, breaks on trailing slashes
const bad = folder + "/" + fileName

// ✅ Robust: path.join() normalizes separators AND removes redundant slashes
const good = path.join(folder, fileName)
```

> **Passerelle PHP/Symfony.** Rien d'imposé nativement en PHP (beaucoup de
> code concatène encore `$dir . '/' . $file`, parfois via
> `DIRECTORY_SEPARATOR`) — Node, lui, fournit un module dédié et
> systématiquement utilisé dans tout code sérieux.

## Les fonctions essentielles de `path`

```js
import path from "node:path"

const filePath = "/var/www/app/uploads/report.final.pdf"

path.join("a", "b", "c")          // "a/b/c" — joins segments, normalizes separators
path.resolve("uploads", "x.pdf")  // absolute path, resolved from process.cwd()
path.basename(filePath)           // "report.final.pdf" — last segment
path.basename(filePath, ".pdf")   // "report.final" — last segment, extension stripped
path.dirname(filePath)            // "/var/www/app/uploads" — parent folder
path.extname(filePath)            // ".pdf" — the extension
path.isAbsolute(filePath)         // true
path.isAbsolute("uploads/x.pdf")  // false
```

> ⚠️ **Erreur fréquente — confondre `path.join` et `path.resolve`.**
> `path.join` assemble des segments **tels quels** (le résultat peut rester
> relatif). `path.resolve` calcule un chemin **absolu**, en partant de la
> droite et en s'arrêtant dès qu'un segment absolu est rencontré — sinon en
> complétant avec `process.cwd()` (le dossier de lancement du process, voir
> la prochaine leçon).

```js
path.join("/a", "b")     // "/a/b"
path.resolve("/a", "b")  // "/a/b" (same here, because "/a" is already absolute)

path.join("a", "b")      // "a/b" (stays RELATIVE)
path.resolve("a", "b")   // "/current/working/dir/a/b" (made ABSOLUTE from cwd)
```

## Construire un chemin sûr avec des entrées utilisateur

```js
import path from "node:path"

const UPLOADS_DIR = path.resolve("./uploads")

function safeUploadPath(userProvidedName) {
  // path.join() does NOT prevent "../" traversal by itself!
  const target = path.join(UPLOADS_DIR, userProvidedName)

  // Defense: verify the resolved path STILL starts with the uploads folder
  if (!target.startsWith(UPLOADS_DIR)) {
    throw new Error("Invalid file name: path traversal attempt detected")
  }
  return target
}

safeUploadPath("avatar.png")     // OK: "<uploads>/avatar.png"
// safeUploadPath("../../etc/passwd") // would resolve OUTSIDE uploads/ — rejected
```

> **Réflexe à prendre.** Ne fais **jamais** confiance à un nom de fichier
> fourni par un utilisateur sans vérifier, après résolution du chemin, qu'il
> reste bien à l'intérieur du dossier attendu — un classique de sécurité
> (*path traversal*), tout aussi valable côté PHP avec
> `realpath()`/`basename()`.

## À retenir

- Ne **jamais** concaténer des chemins à la main : `path.join`/`path.resolve`
  gèrent les séparateurs correctement, sur toutes les plateformes.
- `path.join` assemble tel quel (peut rester relatif) ; `path.resolve`
  calcule toujours un chemin **absolu**, depuis `process.cwd()` si besoin.
- `basename`/`dirname`/`extname` extraient respectivement le nom de fichier,
  le dossier parent, et l'extension.
- Un nom de fichier fourni par l'utilisateur doit être **vérifié après
  résolution** pour éviter un *path traversal* (`../../...`).
