---
title: "Quiz — EventEmitter & streams"
type: quiz
questions:
  - prompt: |
      Que se passe-t-il quand on appelle `emitter.emit("order-placed", data)`
      alors que **trois** listeners sont abonnés à `"order-placed"` ?
    options:
      - |
        Les trois listeners s'exécutent **de façon synchrone**, dans l'ordre
        où ils ont été abonnés, avant que `emit` ne rende la main.
      - |
        Un seul listener au hasard est appelé.
      - |
        Les trois listeners s'exécutent en parallèle, sur des threads séparés.
    answer: 0
    tags: ["eventemitter", "emit"]
    level: debutant
    explanation: |
      `emit()` appelle tous les listeners abonnés **synchrones**, dans
      l'ordre d'abonnement, l'un après l'autre — sans rendre la main à
      l'event loop entre chacun. Node est mono-thread (module 1) : il n'y a
      pas d'exécution « en parallèle sur des threads séparés ».
  - prompt: |
      Quelle est la particularité de l'événement `"error"` sur un
      `EventEmitter`, comparée à n'importe quel autre nom d'événement ?
    options:
      - |
        Aucune, `"error"` est un nom d'événement comme un autre.
      - |
        Si aucun listener n'est abonné à `"error"` au moment de l'`emit`,
        Node lève l'erreur (et peut arrêter le process) au lieu de l'ignorer.
      - |
        `"error"` ne peut être émis qu'une seule fois par instance.
    answer: 1
    tags: ["eventemitter", "error-event"]
    level: intermediaire
    explanation: |
      C'est une convention imposée par Node : émettre `"error"` sans listener
      abonné fait remonter l'erreur (potentiellement jusqu'à arrêter le
      process), justement pour qu'une erreur ne puisse jamais passer
      inaperçue. Réflexe : toujours attacher un handler `"error"` sur tout
      `EventEmitter` créé.
  - prompt: |
      Pourquoi les streams permettent-ils de traiter un fichier de plusieurs
      Go sans faire exploser la consommation mémoire du process ?
    options:
      - |
        Parce qu'ils compressent automatiquement les données en mémoire.
      - |
        Parce qu'ils traitent les données par petits morceaux (chunks),
        gardant la mémoire utilisée **constante** quelle que soit la taille
        totale des données.
      - |
        Parce qu'ils délèguent tout le traitement à la base de données.
    answer: 1
    tags: ["streams", "memoire"]
    level: debutant
    explanation: |
      Un stream ne charge jamais l'intégralité des données en mémoire : il
      les fait transiter par petits chunks (par exemple 64 Ko), traités puis
      libérés au fur et à mesure. La consommation mémoire reste ainsi
      constante, que le fichier fasse 1 Ko ou 50 Go.
  - prompt: |
      Un `Readable` stream **hérite** de quelle classe, ce qui explique
      pourquoi il expose `.on("data", ...)`, `.on("end", ...)` ?
    options:
      - "`Promise`"
      - "`EventEmitter`"
      - "`Buffer`"
    answer: 1
    tags: ["streams", "eventemitter"]
    level: intermediaire
    explanation: |
      Tout `Readable` (comme beaucoup d'objets natifs de Node : serveurs
      HTTP, sockets...) hérite d'`EventEmitter`. C'est pour ça qu'on retrouve
      exactement le même vocabulaire (`on`, `once`, `off`) pour s'abonner à
      ses événements (`"data"`, `"end"`, `"error"`).
  - prompt: |
      Qu'est-ce que la **backpressure**, dans le contexte des streams ?
    options:
      - |
        Un mécanisme qui accélère artificiellement une source lente.
      - |
        Le mécanisme par lequel une destination signale à la source de
        ralentir quand son buffer interne est plein, évitant une
        accumulation excessive de données en mémoire.
      - |
        Une erreur réseau qui interrompt définitivement un stream.
    answer: 1
    tags: ["streams", "backpressure"]
    level: intermediaire
    explanation: |
      Si une source produit des chunks plus vite qu'une destination ne peut
      les absorber, les données s'accumuleraient en mémoire sans limite. La
      backpressure permet à la destination de dire « pause » (quand
      `write()` renvoie `false`) puis « reprends » (événement `"drain"`) —
      géré automatiquement par `.pipe()`.
  - prompt: |
      Pourquoi préférer `pipeline()` (de `node:stream/promises`) à des
      `.pipe()` enchaînés à la main sur plusieurs streams ?
    options:
      - |
        `pipeline()` est simplement un alias, sans différence de
        comportement.
      - |
        `pipeline()` garantit qu'en cas d'erreur sur n'importe quel stream
        de la chaîne, **tous** sont proprement fermés — ce que `.pipe()`
        seul ne fait pas de façon fiable.
      - |
        `pipeline()` est plus rapide car il ignore les erreurs.
    answer: 1
    tags: ["streams", "pipeline"]
    level: avance
    explanation: |
      `.pipe()` propage mal les erreurs entre streams intermédiaires (il faut
      écouter `"error"` sur chacun individuellement, sinon risque de fuite de
      ressources). `pipeline()` relie plusieurs streams **et** garantit un
      nettoyage complet en cas d'échec, avec en plus une API `async/await`
      naturelle via `node:stream/promises`.
---

Six questions pour valider : le caractère synchrone d'`emit`, la convention
spéciale de l'événement `"error"`, l'intérêt mémoire des streams, l'héritage
`Readable` → `EventEmitter`, la backpressure, et l'intérêt de `pipeline()`.
