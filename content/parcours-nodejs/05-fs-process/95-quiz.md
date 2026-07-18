---
title: "Quiz — Système de fichiers & process"
type: quiz
questions:
  - prompt: |
      Dans du code qui répond à des requêtes HTTP, quelle variante de `fs`
      faut-il privilégier pour lire un fichier ?
    options:
      - "`fs.readFileSync` : la plus simple, donc la meilleure par défaut."
      - "`fs.promises.readFile` (ou `fs/promises`), avec `async/await`."
      - "Peu importe, les trois variantes ont les mêmes performances."
    answer: 1
    tags: ["fs", "bonnes-pratiques"]
    level: debutant
    explanation: |
      `readFileSync` bloque le thread unique (module 1) : inacceptable dans
      un handler de requête. La version basée sur les promesses
      (`node:fs/promises`), utilisée avec `async/await`, est le standard
      moderne recommandé pour tout code applicatif.
  - prompt: |
      Que représente `err.code === "ENOENT"` quand une opération `fs` échoue ?
    options:
      - "Une erreur de syntaxe dans le code JavaScript."
      - "Le fichier ou dossier ciblé n'existe pas."
      - "Le disque est plein."
    answer: 1
    tags: ["fs", "erreurs"]
    level: intermediaire
    explanation: |
      `ENOENT` (« Error NO ENTry ») signifie que le chemin ciblé n'existe
      pas. C'est un code parmi d'autres (`EACCES` pour une permission
      refusée, par exemple) qui permet de distinguer une absence attendue
      d'une erreur réellement anormale.
  - prompt: |
      Quelle est la différence entre `path.join("a", "b")` et
      `path.resolve("a", "b")` ?
    options:
      - "Elles sont strictement identiques dans tous les cas."
      - |
        `path.join` assemble les segments tels quels (peut rester relatif) ;
        `path.resolve` calcule toujours un chemin **absolu**, depuis
        `process.cwd()` si nécessaire.
      - "`path.resolve` ne fonctionne que sur Windows."
    answer: 1
    tags: ["path", "chemins"]
    level: intermediaire
    explanation: |
      `path.join("a", "b")` renvoie `"a/b"`, qui reste **relatif**.
      `path.resolve("a", "b")` renvoie un chemin **absolu**, en le
      complétant depuis `process.cwd()` si les segments donnés ne le sont
      pas déjà.
  - prompt: |
      Quelle est la différence entre `process.cwd()` et `__dirname` (ou son
      équivalent ESM) ?
    options:
      - |
        `process.cwd()` dépend d'**où** `node` a été lancé ; `__dirname`
        dépend d'**où se trouve le fichier** sur disque — deux notions
        indépendantes, souvent confondues.
      - "Ce sont deux noms strictement équivalents."
      - "`process.cwd()` n'existe qu'en mode debug."
    answer: 0
    tags: ["process", "cwd", "erreur-frequente"]
    level: avance
    explanation: |
      `process.cwd()` reflète le dossier **courant du terminal** au moment du
      lancement de `node` : il change selon d'où tu exécutes la commande.
      `__dirname` (ou `import.meta.url` en ESM) reflète l'emplacement **fixe**
      du fichier sur le disque, indépendamment d'où le script est lancé.
  - prompt: |
      Quelle affirmation sur `process.env` est correcte ?
    options:
      - |
        Toutes les valeurs de `process.env` sont des chaînes de caractères,
        même `process.env.PORT` qui « ressemble » à un nombre.
      - |
        `process.env` convertit automatiquement les valeurs numériques en
        `number` et les booléennes en `boolean`.
      - |
        `process.env` n'est accessible qu'après avoir appelé
        `require("dotenv").config()`.
    answer: 0
    tags: ["process-env", "erreur-frequente"]
    level: intermediaire
    explanation: |
      Toute variable d'environnement, quelle que soit sa signification
      apparente, est stockée et lue comme une **chaîne de caractères** —
      `process.env.PORT` vaut `"3000"`, pas `3000`. Il faut la convertir
      explicitement (`Number(process.env.PORT)`) si besoin d'un nombre.
  - prompt: |
      Pourquoi un process Node long-vivant a-t-il besoin d'écouter
      `process.on("SIGTERM", ...)`, contrairement à un worker PHP-FPM ?
    options:
      - |
        Parce qu'un worker PHP-FPM meurt déjà après chaque requête : il n'a
        rien à « arrêter proprement ». Un process Node, lui, reste actif et
        doit gérer explicitement son arrêt (fermer connexions, terminer les
        requêtes en cours) lors d'un redéploiement.
      - |
        Parce que `SIGTERM` n'existe que sous Linux, jamais sous PHP.
      - |
        Ce n'est pas nécessaire : Node s'arrête toujours proprement par
        défaut, sans configuration.
    answer: 0
    tags: ["process", "signaux", "graceful-shutdown"]
    level: avance
    explanation: |
      C'est une responsabilité **nouvelle** pour un dev PHP-FPM : puisque le
      process Node vit en continu et traite potentiellement des requêtes en
      cours au moment d'un redéploiement, il doit intercepter les signaux
      d'arrêt (`SIGTERM` envoyé par Docker/Kubernetes/systemd) pour terminer
      proprement son travail avant de quitter, plutôt que de couper
      brutalement le trafic.
---

Six questions couvrant les réflexes essentiels : privilégier `fs/promises`,
lire les codes d'erreur (`ENOENT`), distinguer `join`/`resolve` et
`process.cwd()`/`__dirname`, le typage « toujours string » de `process.env`,
et l'arrêt propre (`SIGTERM`) d'un process long-vivant.
