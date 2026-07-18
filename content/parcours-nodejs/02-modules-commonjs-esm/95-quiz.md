---
title: "Quiz — Modules CommonJS et ESM"
type: quiz
questions:
  - prompt: |
      Quelle paire syntaxique correspond au système **CommonJS** ?
    options:
      - "`import` / `export`"
      - "`require(...)` / `module.exports`"
      - "`use(...)` / `namespace`"
    answer: 1
    tags: ["commonjs", "syntaxe"]
    level: debutant
    explanation: |
      CommonJS utilise `require("./module.js")` pour importer et
      `module.exports = ...` pour exporter. `import`/`export` appartiennent au
      système ESM, le standard natif du langage JavaScript.
  - prompt: |
      Un même fichier CommonJS est `require()`-é depuis trois endroits
      différents de l'application. Combien de fois son code est-il exécuté ?
    options:
      - "Trois fois, une par `require()`."
      - "Une seule fois : le résultat est mis en cache et réutilisé ensuite."
      - "Zéro fois : `require()` ne fait que déclarer l'intention de charger."
    answer: 1
    tags: ["commonjs", "cache-modules"]
    level: intermediaire
    explanation: |
      Node exécute un module CommonJS **une seule fois**, à son premier
      `require()`, puis met en cache l'objet `module.exports` obtenu. Tous les
      `require()` suivants du même chemin renvoient le **même objet**, avec le
      même état interne — un piège si ce module contient un état mutable.
  - prompt: |
      Pourquoi `require()` est-il **synchrone** sans que ce soit un problème,
      alors que la règle générale de Node est de ne jamais bloquer le thread ?
    options:
      - |
        Parce que le chargement des modules a lieu au **démarrage** du process,
        pas en boucle dans un handler de requête — bloquer brièvement au boot
        est sans conséquence.
      - |
        Ce n'est pas vrai, `require()` est en réalité asynchrone en interne.
      - |
        Parce que Node limite `require()` à des fichiers de moins de 1 Ko.
    answer: 0
    tags: ["commonjs", "require", "blocking"]
    level: intermediaire
    explanation: |
      La règle « ne jamais bloquer » vise le code exécuté **pendant** le
      traitement des requêtes. Le chargement des modules se fait une seule
      fois, à l'initialisation de l'application, avant que le serveur ne
      commence à accepter du trafic : un blocage ponctuel à ce moment-là est
      sans impact sur la capacité à servir des requêtes ensuite.
  - prompt: |
      En ESM, comment récupère-t-on l'équivalent de `__dirname` (absent de ce
      système) ?
    options:
      - |
        Il n'existe aucun équivalent, c'est une limitation définitive d'ESM.
      - |
        En reconstruisant le chemin à partir de `import.meta.url` (via
        `fileURLToPath` puis `dirname`).
      - |
        En utilisant `process.cwd()`, qui donne toujours le dossier du fichier
        courant.
    answer: 1
    tags: ["esm", "import-meta"]
    level: intermediaire
    explanation: |
      ESM n'injecte pas `__dirname`/`__filename` (pensé pour être portable,
      y compris hors d'un système de fichiers disque). L'équivalent se
      reconstruit avec `import.meta.url` (l'URL du module courant),
      `fileURLToPath()` pour la convertir en chemin de fichier, puis
      `dirname()`. `process.cwd()` donne le dossier **de lancement** du
      process, pas celui du fichier courant — souvent différent.
  - prompt: |
      Un module CommonJS peut-il faire `require("un-module-esm.mjs")`
      directement ?
    options:
      - |
        Oui, sans restriction, Node fait toujours l'interop automatiquement.
      - |
        Non : cela lève `ERR_REQUIRE_ESM`, car ESM est chargé de façon
        asynchrone alors que `require()` est synchrone — il faut utiliser
        l'`import()` dynamique.
      - |
        Non, il faut d'abord renommer le fichier `.mjs` en `.cjs`.
    answer: 1
    tags: ["esm", "commonjs", "interop"]
    level: avance
    explanation: |
      L'interopérabilité est **asymétrique** : ESM peut `import` du CommonJS
      (Node adapte `module.exports` en export par défaut), mais CommonJS ne
      peut pas `require()` de l'ESM de façon synchrone — c'est une
      incompatibilité de modèle (asynchrone vs synchrone), pas juste une
      question de syntaxe. La solution est l'import dynamique
      `await import("./fichier.mjs")`, qui renvoie une Promise.
  - prompt: |
      À quoi sert le champ `"exports"` du `package.json`, en plus (ou à la
      place) de `"main"` ?
    options:
      - |
        À définir la version minimale de Node requise.
      - |
        À déclarer une carte **restrictive** des points d'entrée publics d'un
        paquet : seuls les chemins listés y sont importables de l'extérieur.
      - |
        À lister les dépendances de développement du paquet.
    answer: 1
    tags: ["package-json", "exports"]
    level: avance
    explanation: |
      `"main"` est l'ancien point d'entrée historique (un seul fichier).
      `"exports"` est la carte moderne, plus riche et surtout **restrictive** :
      si elle est présente, seuls les sous-chemins qu'elle liste sont
      accessibles depuis l'extérieur du paquet — impossible d'importer un
      fichier interne non exposé, contrairement à l'autoload PSR-4 de
      Composer où tout namespace mappé reste accessible.
---

Six questions pour vérifier la maîtrise du duo CommonJS/ESM : cache des
modules, caractère synchrone de `require`, absence de `__dirname` en ESM,
interopérabilité asymétrique, et rôle du champ `exports` du `package.json`.
