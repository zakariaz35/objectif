---
title: "Quiz — Gestion d'erreurs & debugging"
type: quiz
questions:
  - prompt: |
      Un fichier de configuration optionnel est absent au démarrage de
      l'application : de quel type d'erreur s'agit-il ?
    options:
      - "Une erreur opérationnelle : situation anormale mais attendue, à gérer proprement."
      - "Une erreur de programmeur : un bug à corriger dans le code source."
      - "Ni l'une ni l'autre, ce n'est pas vraiment une erreur."
    answer: 0
    tags: ["erreurs-operationnelles", "classification"]
    level: debutant
    explanation: |
      Un fichier manquant est une situation **anormale mais prévisible**
      dans le fonctionnement normal du système — exactement la définition
      d'une erreur opérationnelle. Elle doit être **gérée** (par exemple
      avec une valeur par défaut), pas masquée comme un bug de code.
  - prompt: |
      Pourquoi est-il dangereux d'attraper systématiquement TOUTE erreur
      (y compris des `TypeError` de bug interne) dans un `try/catch` qui
      renvoie silencieusement une valeur de repli ?
    options:
      - |
        Ce n'est jamais dangereux : un `try/catch` large est toujours une
        bonne pratique défensive.
      - |
        Cela masque un vrai bug de programmation, qui resurgira ailleurs,
        plus tard, plus difficile à diagnostiquer — au lieu d'être corrigé
        à sa source.
      - |
        Cela ralentit significativement les performances du process.
    answer: 1
    tags: ["try-catch", "erreur-frequente"]
    level: intermediaire
    explanation: |
      Un `try/catch` doit cibler des erreurs **opérationnelles attendues**
      (avec `instanceof` sur un type précis), pas servir de filet universel.
      Avaler un bug de programmation en silence ne le corrige pas : il
      resurgira, dans un contexte différent, sans que le message d'erreur
      d'origine soit disponible pour le diagnostiquer.
  - prompt: |
      Que se passe-t-il, par convention Node, face à une exception non
      attrapée (`process.on("uncaughtException", ...)`)  ?
    options:
      - |
        Il est recommandé de logger l'erreur puis d'appeler
        `process.exit(1)`, en laissant un gestionnaire de process
        redémarrer proprement — plutôt que de continuer.
      - |
        Il faut toujours ignorer l'événement et continuer à servir les
        requêtes normalement.
      - |
        Node relance automatiquement la fonction fautive une seconde fois.
    answer: 0
    tags: ["uncaughtexception", "process"]
    level: avance
    explanation: |
      L'état du process peut être corrompu après une exception non
      attrapée (contrairement à PHP-FPM où seul un worker isolé est
      affecté). La bonne pratique est de logger puis de laisser le process
      **mourir** (`process.exit(1)`), un gestionnaire externe (PM2,
      Kubernetes...) le redémarrant dans un état propre.
  - prompt: |
      Pourquoi étendre la classe native `Error` pour une erreur custom,
      plutôt que d'utiliser un simple objet `{ message: "..." }` ?
    options:
      - |
        Parce qu'`Error` fournit la stack trace (`err.stack`), essentielle
        pour localiser l'origine réelle du problème.
      - |
        Un objet simple fonctionne exactement pareil, c'est une question de
        style uniquement.
      - |
        Parce que `throw` refuse tout objet qui n'étend pas `Error`.
    answer: 0
    tags: ["erreurs-custom", "stack-trace"]
    level: intermediaire
    explanation: |
      `Error` (et ses sous-classes) capture automatiquement la **stack
      trace** au moment de la création — la piste la plus utile pour
      remonter à la ligne fautive. `throw` accepte techniquement n'importe
      quelle valeur, mais se priver de la stack trace rend le debug bien
      plus difficile.
  - prompt: |
      Quel est l'intérêt de tester `err instanceof NotFoundError` plutôt
      que `err.message === "User not found"` ?
    options:
      - |
        Un test par type est plus **robuste** : il ne dépend pas du texte
        exact du message, qui peut changer sans casser la logique de
        gestion d'erreur.
      - |
        Les deux approches sont rigoureusement équivalentes en pratique.
      - |
        `instanceof` est plus rapide à l'exécution, c'est uniquement une
        question de performance.
    answer: 0
    tags: ["erreurs-custom", "instanceof"]
    level: intermediaire
    explanation: |
      Un test sur le **type** de l'erreur (`instanceof`) reste correct même
      si le texte du message évolue (traduction, reformulation) — un test
      sur le message est fragile et se casse silencieusement au moindre
      changement de formulation.
  - prompt: |
      À quoi sert le flag `node --inspect server.js` ?
    options:
      - |
        Il ouvre un port de debug compatible Chrome DevTools : points
        d'arrêt, inspection de variables, pas-à-pas — intégré au runtime.
      - |
        Il affiche uniquement la version de Node installée.
      - |
        Il force le serveur à s'arrêter après la première requête reçue.
    answer: 0
    tags: ["debugging", "inspect"]
    level: debutant
    explanation: |
      `--inspect` ouvre un port de débogage que Chrome DevTools (ou
      l'intégration VS Code) peut attacher : points d'arrêt, inspection en
      direct, pas-à-pas — l'équivalent conceptuel de Xdebug côté PHP, mais
      intégré au runtime, sans extension à installer.
  - prompt: |
      Quel est l'équivalent le plus proche, côté Symfony, des logs
      structurés (JSON, niveaux de sévérité, contexte enrichi) qu'on met en
      place en production Node (via `pino`/`winston`) ?
    options:
      - "Le profiler de développement Symfony (Symfony Web Debug Toolbar)."
      - "Monolog : niveaux de sévérité, formats structurés, contexte enrichi par ligne."
      - "Le composant Symfony Validator."
    answer: 1
    tags: ["logs", "monolog", "passerelle"]
    level: intermediaire
    explanation: |
      Monolog structure les logs Symfony avec des niveaux (`debug`, `info`,
      `warning`, `error`...), un format cohérent et un contexte enrichi par
      entrée — exactement la philosophie que `pino`/`winston` apportent côté
      Node, avec en plus des « transports » vers différentes destinations.
---

Sept questions pour valider les réflexes du module : distinguer erreur
opérationnelle et erreur de programmeur, ne jamais masquer un bug, la
stratégie « logger puis quitter » face à une erreur non gérée, l'intérêt des
erreurs custom typées, et les outils de debug/logging.
