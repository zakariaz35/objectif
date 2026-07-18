---
title: "package.json : anatomie et scripts npm"
type: lesson
---

## `package.json` : la carte d'identité du projet

Chaque projet Node possède un `package.json` à sa racine — le pendant du
`composer.json` en PHP : métadonnées du projet, dépendances, et scripts.

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "description": "A small API server",
  "type": "module",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "node --watch src/index.js",
    "test": "node --test",
    "lint": "eslint ."
  },
  "dependencies": {
    "express": "^4.19.0"
  },
  "devDependencies": {
    "eslint": "^9.0.0"
  }
}
```

> **Passerelle Composer.** Correspondance quasi terme à terme :

| `composer.json` | `package.json` |
|---|---|
| `name`, `description` | `name`, `description` |
| `require` | `dependencies` |
| `require-dev` | `devDependencies` |
| `scripts` | `scripts` |
| `composer install` | `npm install` |
| `composer.lock` | `package-lock.json` |
| `vendor/` | `node_modules/` |

## Les scripts : la commande `npm run`

Un script déclaré dans `"scripts"` se lance avec `npm run <nom>` — sauf
`start` et `test`, qui bénéficient d'un raccourci historique.

```bash
npm run dev      # runs the "dev" script
npm start        # shortcut for "npm run start"
npm test         # shortcut for "npm run test"
```

> **Passerelle Composer.** Les scripts npm remplissent le même rôle que les
> scripts `composer.json` (`"scripts": { "test": "phpunit" }`) — une commande
> nommée, mémorisable, indépendante des détails d'invocation exacts de
> l'outil sous-jacent.

## Composer les scripts entre eux

```json
{
  "scripts": {
    "lint": "eslint .",
    "test": "node --test",
    "check": "npm run lint && npm run test",
    "pretest": "echo 'Running checks before tests...'"
  }
}
```

- `npm run check` enchaîne deux scripts (`&&` : le second ne se lance que si
  le premier réussit — code de sortie `0`).
- Un script préfixé `pre<nom>` (ici `pretest`) s'exécute **automatiquement**
  avant le script `<nom>` correspondant (ici `test`), sans avoir à l'appeler
  explicitement. Il existe le pendant `post<nom>`.

## `npx` : exécuter un paquet sans l'installer globalement

```bash
npx create-vite my-app     # runs the "create-vite" package once, without a global install
npx eslint --version       # runs the LOCAL eslint from node_modules/.bin if present
```

> **Passerelle Composer.** Proche de `composer exec` ou de l'appel direct
> d'un binaire depuis `vendor/bin/` (par exemple `vendor/bin/phpunit`). `npx`
> va plus loin : s'il ne trouve pas le paquet en local, il le **télécharge
> temporairement** pour l'exécuter une seule fois — pratique pour des
> générateurs de projet ou des outils ponctuels, sans polluer les
> dépendances globales de la machine.

## À retenir

- `package.json` ≈ `composer.json` : nom, version, `dependencies` ≈
  `require`, `devDependencies` ≈ `require-dev`, `scripts` ≈ `scripts`.
- `npm run <nom>` lance un script ; `start`/`test` ont un raccourci direct
  (`npm start`, `npm test`).
- Les scripts se **composent** (`&&`, préfixes `pre`/`post`).
- `npx` exécute un paquet (local ou téléchargé à la volée) sans installation
  globale — proche de l'usage de `vendor/bin/` côté Composer.
