---
title: "L'objet process : argv, env, cwd, exit, signaux"
type: lesson
---

## `process` : la porte d'entrée vers l'environnement d'exécution

`process` est un objet **global** (pas besoin de l'importer) qui donne accès
à tout ce qui concerne le process Node en cours d'exécution : ses arguments
de lancement, ses variables d'environnement, son dossier courant, et le
contrôle de son cycle de vie.

## `process.argv` : les arguments de la ligne de commande

```bash
node script.js --env=production --verbose input.txt
```

```js
console.log(process.argv)
// [
//   "/usr/bin/node",              // [0] path to the node executable
//   "/path/to/script.js",         // [1] path to the script being run
//   "--env=production",          // [2] first REAL argument
//   "--verbose",                 // [3]
//   "input.txt",                 // [4]
// ]

// In practice, you almost always slice off the first two:
const args = process.argv.slice(2)
console.log(args) // ["--env=production", "--verbose", "input.txt"]
```

> **Passerelle PHP/Symfony.** `process.argv` correspond au `$argv` de PHP CLI
> — avec la même particularité : `$argv[0]` est le script, donc les vrais
> arguments commencent à l'index 1 en PHP contre l'index **2** en Node
> (puisque `argv[0]` est l'exécutable `node` lui-même, pas le script). Pour
> un parsing sérieux d'arguments (flags, options), Symfony Console offre des
> `InputArgument`/`InputOption` typés ; côté Node, on utilise généralement une
> librairie dédiée (`commander`, `yargs`) plutôt que de tout parser à la main.

## `process.env` : les variables d'environnement

```js
console.log(process.env.NODE_ENV)      // e.g. "production", or undefined if unset
console.log(process.env.DATABASE_URL)  // e.g. "postgres://..."

// Common pattern: fallback value if the variable is not set
const port = process.env.PORT || 3000
```

> **Passerelle PHP/Symfony.** Exactement l'équivalent de `$_ENV`/`getenv()`.
> Et comme en Symfony (fichier `.env` chargé par `symfony/dotenv`), l'usage
> courant en Node est de charger un fichier `.env` local en développement via
> le paquet `dotenv` (ou, depuis Node 20+, le flag natif `--env-file=.env`),
> tout en injectant les vraies variables directement dans l'environnement en
> production (jamais de fichier `.env` déployé tel quel).

```bash
# .env (development only — never commit this file, never deploy it as-is)
DATABASE_URL=postgres://localhost:5432/myapp
PORT=4000
```

```js
// With Node 20.6+: load a .env file natively, no extra dependency
// $ node --env-file=.env server.js
console.log(process.env.DATABASE_URL)
```

> ⚠️ **Erreur fréquente — committer un fichier `.env` contenant de vrais
> secrets.** Comme en Symfony, `.env` doit rester dans `.gitignore` : seul un
> `.env.example` (sans valeurs sensibles) est versionné, pour documenter les
> variables attendues.

## `process.cwd()`, `process.exit()`, et les signaux

```js
console.log(process.cwd()) // the directory from which `node` was LAUNCHED
                            // (NOT the folder of the current file — see module 2's __dirname)

process.exit(0) // exit immediately, code 0 = success
process.exit(1) // exit immediately, code 1 = failure (convention read by shells/CI)
```

> ⚠️ **Erreur fréquente — confondre `process.cwd()` avec `__dirname`.**
> `process.cwd()` dépend d'**où** tu lances `node` (le dossier courant du
> terminal) ; `__dirname` (ou son équivalent ESM, module 2) dépend d'**où se
> trouve le fichier** sur disque. Lancer le même script depuis deux dossiers
> différents donne deux `process.cwd()` différents, mais toujours le même
> `__dirname`.

Enfin, Node permet d'écouter les **signaux système** pour un arrêt propre du
process (fermer les connexions DB, terminer les requêtes en cours) —
essentiel pour un process long-vivant (rappel du module 1) qu'on doit pouvoir
redéployer sans couper brutalement le trafic en cours.

```js
// Graceful shutdown: react to the signal sent by `docker stop`, Kubernetes, systemd...
process.on("SIGTERM", async () => {
  console.log("Received SIGTERM, shutting down gracefully...")
  await closeDatabaseConnections()
  process.exit(0)
})
```

> **Passerelle PHP/Symfony.** Concept **nouveau** pour un dev PHP-FPM : un
> worker PHP-FPM n'a pas besoin de « s'arrêter proprement » puisqu'il meurt
> déjà après chaque requête. Un process Node **long-vivant** (module 1), lui,
> doit gérer explicitement son arrêt (déploiement, redémarrage) sans couper
> les requêtes en cours de traitement — un vrai changement de responsabilité.

## À retenir

- `process.argv` : arguments CLI, à découper avec `.slice(2)` pour ignorer
  l'exécutable et le script.
- `process.env` : variables d'environnement (≈ `$_ENV`/`getenv()`) ; charge
  un `.env` en développement, jamais en production tel quel.
- `process.cwd()` (dossier de lancement) ≠ `__dirname` (dossier du fichier).
- `process.exit(code)` arrête le process ; écouter `SIGTERM`/`SIGINT` permet
  un **arrêt propre** — une responsabilité nouvelle pour un dev habitué à
  PHP-FPM, où chaque worker meurt déjà après chaque requête.
