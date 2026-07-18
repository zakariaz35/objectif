---
title: "Quiz — Runtime & event loop"
type: quiz
questions:
  - prompt: |
      Quel est le rôle respectif de **V8** et de **libuv** dans Node.js ?
    options:
      - |
        V8 exécute le JavaScript ; libuv fournit l'event loop, le pool de
        threads et l'accès aux I/O asynchrones du système.
      - |
        V8 gère les I/O réseau ; libuv compile et exécute le JavaScript.
      - |
        Ce sont deux noms différents pour la même bibliothèque.
    answer: 0
    tags: ["v8", "libuv", "runtime"]
    level: debutant
    explanation: |
      **V8** est le moteur JavaScript (celui de Chrome) : il compile et exécute
      ton code JS, gère la mémoire. **libuv** est une bibliothèque C séparée
      qui fournit l'event loop, un pool de threads (pour certaines opérations
      fichiers) et l'accès aux primitives d'I/O asynchrone de l'OS (epoll,
      kqueue, IOCP). V8 seul ne sait pas lire un fichier ou ouvrir une socket.
  - prompt: |
      Quelle est la différence **fondamentale** entre le modèle PHP-FPM et le
      modèle Node.js pour traiter des requêtes HTTP ?
    options:
      - |
        PHP-FPM lance un worker process qui traite une requête puis détruit
        son état ; Node.js utilise un seul process long-vivant qui garde son
        état en mémoire entre les requêtes.
      - |
        Node.js démarre un nouveau process à chaque requête, exactement comme
        PHP-FPM.
      - |
        PHP-FPM et Node.js sont tous les deux mono-thread et long-vivants ;
        seule la syntaxe change.
    answer: 0
    tags: ["php-fpm", "architecture"]
    level: debutant
    explanation: |
      C'est LE changement de mental model de ce module : PHP-FPM = un worker
      par requête, détruit à la fin (état propre à chaque fois). Node.js = un
      seul process qui démarre une fois et tourne en continu, partageant son
      état (variables globales, connexions, caches) entre **toutes** les
      requêtes tant qu'il vit.
  - prompt: |
      Pourquoi bloquer le thread principal est-il **beaucoup plus grave** en
      Node.js qu'en PHP-FPM ?
    options:
      - |
        Ce n'est pas plus grave : les deux ont un pool de workers qui absorbe
        le blocage.
      - |
        En Node, il n'y a **qu'un seul thread** qui sert toutes les requêtes en
        cours : le bloquer bloque littéralement tous les utilisateurs connectés,
        alors qu'en PHP-FPM seul le worker concerné est affecté.
      - |
        Bloquer le thread en Node fait planter le process immédiatement.
    answer: 1
    tags: ["single-thread", "blocking"]
    level: debutant
    explanation: |
      PHP-FPM isole chaque requête dans son propre worker : un `sleep()` lourd
      n'affecte que ce worker, les autres continuent de répondre. Node n'a
      qu'un seul thread principal partagé par toutes les requêtes en cours :
      une boucle de calcul synchrone bloque **tout le monde**, pas seulement
      la requête qui l'a déclenchée.
  - prompt: |
      Que se passe-t-il si on appelle `fs.readFileSync(...)` dans un handler de
      requête HTTP qui répond à des milliers de clients ?
    options:
      - |
        Rien de spécial : `readFileSync` est optimisé pour ne jamais bloquer.
      - |
        Le thread principal se bloque pendant toute la lecture du fichier :
        aucune autre requête n'est traitée pendant ce temps.
      - |
        Node bascule automatiquement cette opération sur un thread séparé.
    answer: 1
    tags: ["fs", "blocking", "bonnes-pratiques"]
    level: intermediaire
    explanation: |
      Les fonctions `*Sync` (`readFileSync`, `execSync`...) sont **bloquantes**
      par construction : elles gèlent le thread principal jusqu'à la fin de
      l'opération. Dans un handler qui répond à des requêtes, il faut préférer
      la version asynchrone (`fs.promises.readFile` ou callback) qui ne bloque
      jamais le thread pendant l'attente.
  - prompt: |
      Dans quel ordre ces lignes s'affichent-elles ?

      ```js
      console.log("A")
      setTimeout(() => console.log("B"), 0)
      Promise.resolve().then(() => console.log("C"))
      console.log("D")
      ```
    options:
      - "A, D, C, B"
      - "A, B, C, D"
      - "A, D, B, C"
    answer: 0
    tags: ["microtask", "macrotask", "ordre-execution"]
    level: intermediaire
    explanation: |
      `A` et `D` sont synchrones : ils s'exécutent immédiatement, dans l'ordre
      du code. Une fois le code synchrone terminé, **toute** la file de
      microtâches est vidée : `C` (la promesse) passe avant `B` (le
      `setTimeout`, une macrotâche), même si `setTimeout` a été posé en premier
      dans le code. Ordre final : **A, D, C, B**.
  - prompt: |
      Entre `process.nextTick(fn)` et `Promise.resolve().then(fn)`, lequel
      s'exécute en premier ?
    options:
      - |
        `process.nextTick` : c'est la file la plus prioritaire, exécutée avant
        même les microtâches des promesses.
      - |
        `Promise.resolve().then` : les promesses ont toujours priorité sur
        `process.nextTick`.
      - |
        Cela dépend uniquement de l'ordre d'écriture dans le code.
    answer: 0
    tags: ["process-nexttick", "microtask"]
    level: avance
    explanation: |
      `process.nextTick` a sa **propre file**, encore plus prioritaire que la
      file des microtâches des promesses. Concrètement : tous les
      `process.nextTick` en attente sont exécutés avant que la moindre
      callback `.then()` de promesse ne soit traitée, quel que soit l'ordre
      d'écriture dans le code.
  - prompt: |
      À quelle phase de l'event loop les callbacks `setImmediate(...)`
      s'exécutent-ils ?
    options:
      - |
        À la phase **check**, juste après la phase **poll** (I/O) du tour
        courant.
      - |
        À la phase **timers**, comme `setTimeout`.
      - |
        `setImmediate` n'appartient à aucune phase : il s'exécute de façon
        synchrone, avant tout le reste.
    answer: 0
    tags: ["setimmediate", "phases-event-loop"]
    level: avance
    explanation: |
      L'event loop enchaîne les phases **timers → pending callbacks → poll →
      check → close callbacks**. `setImmediate` a sa propre phase dédiée
      (**check**), exécutée juste après la phase **poll** (où arrivent les
      événements I/O) du même tour de boucle — d'où son nom : il s'exécute
      « immédiatement » après le traitement des I/O en cours, sans attendre un
      nouveau tour complet comme le ferait un `setTimeout(fn, 0)`.
---

Sept questions pour ancrer les notions clés : le rôle de V8/libuv, la rupture
de modèle avec PHP-FPM (process long-vivant vs worker jetable), le danger de
bloquer le thread unique, et l'ordre précis microtâches/macrotâches/phases de
l'event loop.
