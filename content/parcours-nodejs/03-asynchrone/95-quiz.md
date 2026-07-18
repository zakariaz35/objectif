---
title: "Quiz — Asynchrone"
type: quiz
questions:
  - prompt: |
      Qu'est-ce qu'un callback « error-first », convention historique de
      nombreuses APIs Node natives (comme `fs`) ?
    options:
      - |
        Un callback dont le **premier argument** est toujours l'erreur
        (`null` si tout s'est bien passé), suivi du résultat.
      - |
        Un callback qui s'exécute uniquement en cas d'erreur.
      - |
        Un callback qui doit être défini avant toute autre fonction du
        fichier.
    answer: 0
    tags: ["callbacks", "convention"]
    level: debutant
    explanation: |
      La convention error-first place systématiquement l'erreur en premier
      argument (`(err, result) => ...`) : `err` vaut `null` en cas de succès.
      C'est une convention **manuelle**, née du fait qu'un callback
      asynchrone ne peut pas simplement `throw` une fois l'appelant reparti.
  - prompt: |
      Une fonction déclarée `async function getUser() { return 42 }` — que
      renvoie l'**appel** `getUser()` ?
    options:
      - "Directement la valeur `42`."
      - "Une `Promise` qui se résout avec `42`."
      - "`undefined`, il faut await dans la même fonction pour avoir 42."
    answer: 1
    tags: ["async-await", "promise"]
    level: debutant
    explanation: |
      Une fonction `async` renvoie **toujours** une `Promise`, même si son
      `return` est une valeur simple — cette valeur est automatiquement
      enveloppée. Il faut soit `await getUser()`, soit `.then(...)`, pour
      accéder à `42`.
  - prompt: |
      Dans une boucle `for (const id of ids) { await fetchUser(id) }`, que se
      passe-t-il en termes de performance si les appels sont indépendants ?
    options:
      - |
        Rien de spécial, Node parallélise automatiquement les `await` d'une
        boucle.
      - |
        Les appels s'exécutent **séquentiellement** : chacun attend que le
        précédent se termine avant de démarrer, gaspillant du temps si les
        appels sont indépendants.
      - |
        La boucle lève une erreur : `await` est interdit dans un `for...of`.
    answer: 1
    tags: ["await", "sequentiel-parallele"]
    level: intermediaire
    explanation: |
      `await` **suspend** la fonction jusqu'à la résolution avant de passer à
      l'itération suivante : les appels s'enchaînent un par un. Si les
      appels sont indépendants, il vaut mieux les démarrer tous
      (`ids.map(fetchUser)`) puis les attendre ensemble avec `Promise.all`.
  - prompt: |
      Quelle est la différence essentielle entre `Promise.all` et
      `Promise.allSettled` ?
    options:
      - |
        `Promise.all` rejette dès le premier échec (perdant les autres
        résultats) ; `Promise.allSettled` ne rejette jamais et donne le
        statut (succès/échec) de chaque promesse.
      - |
        Ce sont deux noms différents pour exactement le même comportement.
      - |
        `Promise.allSettled` ne fonctionne qu'avec des tableaux de moins de
        10 promesses.
    answer: 0
    tags: ["promise-all", "promise-allsettled"]
    level: intermediaire
    explanation: |
      `Promise.all` adopte une logique « tout ou rien » : la première
      promesse rejetée fait immédiatement échouer l'ensemble, sans attendre
      les autres. `Promise.allSettled` attend **toutes** les promesses et
      résout toujours, avec un rapport `{ status, value }` ou
      `{ status, reason }` pour chacune.
  - prompt: |
      Quel combinateur choisir pour interroger 3 serveurs miroirs
      redondants et ne garder que la **première réponse qui réussit**
      (en ignorant les éventuels échecs des autres) ?
    options:
      - "`Promise.race`"
      - "`Promise.any`"
      - "`Promise.all`"
    answer: 1
    tags: ["promise-any", "strategie"]
    level: intermediaire
    explanation: |
      `Promise.any` se règle dès la **première réussite**, en ignorant les
      échecs éventuels — exactement le scénario « essaie plusieurs miroirs,
      prends le premier qui répond ». `Promise.race` se règle sur la première
      **réglée**, succès OU échec (un échec rapide « gagnerait » la course, ce
      qui n'est pas ce qu'on veut ici).
  - prompt: |
      Que se passe-t-il si une promesse est rejetée sans `.catch()` ni
      `try/catch` englobant ?
    options:
      - |
        Node l'ignore silencieusement, sans aucune trace.
      - |
        C'est une « unhandled rejection » : Node émet un avertissement et
        peut, selon la configuration, arrêter le process.
      - |
        La promesse se résout automatiquement avec `undefined`.
    answer: 1
    tags: ["unhandled-rejection", "erreurs"]
    level: avance
    explanation: |
      Une promesse rejetée sans gestionnaire déclenche un événement
      `unhandledRejection` : Node avertit dans les logs, et selon la version
      et la configuration, peut carrément arrêter le process — un vrai risque
      en production si ce n'est jamais surveillé (approfondi au module 8).
  - prompt: |
      Pourquoi ce code ne capture-t-il **jamais** l'erreur de
      `saveToDatabase`, même s'il échoue ?

      ```js
      async function run() {
        try {
          saveToDatabase(data) // missing await!
          console.log("Saved!")
        } catch (err) {
          console.error(err)
        }
      }
      ```
    options:
      - |
        Parce que `saveToDatabase` n'est pas une fonction `async`.
      - |
        Parce qu'il manque `await` devant l'appel : sans lui, le `try/catch`
        ne suit pas la promesse renvoyée, dont un rejet éventuel devient une
        unhandled rejection non liée à ce bloc.
      - |
        Parce que `console.log` doit toujours précéder l'appel asynchrone.
    answer: 1
    tags: ["await", "try-catch", "erreur-frequente"]
    level: avance
    explanation: |
      Sans `await`, `saveToDatabase(data)` est lancé mais son résultat (et son
      éventuel rejet) n'est **jamais rattaché** à ce `try/catch` : le code
      continue immédiatement (`console.log("Saved!")` peut s'afficher AVANT la
      fin réelle de la sauvegarde), et une erreur éventuelle se transforme en
      rejection non gérée, invisible pour ce `catch`.
---

Sept questions couvrant tout le module : callbacks error-first, `async`
renvoie toujours une `Promise`, le piège séquentiel vs parallèle, les
sémantiques exactes de `Promise.all`/`allSettled`/`race`/`any`, et le danger
des rejets non gérés (y compris l'oubli d'un `await`).
