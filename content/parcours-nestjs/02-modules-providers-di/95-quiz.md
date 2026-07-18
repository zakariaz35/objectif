---
title: "Quiz — Modules, providers & injection de dépendances"
type: quiz
questions:
  - prompt: |
      Un provider déclaré dans les `providers` d'un module, sans être listé
      dans `exports`, est-il utilisable dans un AUTRE module qui l'importe ?
    options:
      - "Oui, tout provider est automatiquement public dans toute l'application."
      - |
        Non : il reste privé à son module tant qu'il n'est pas explicitement
        listé dans `exports`.
      - "Seulement s'il est marqué `@Global()`, jamais autrement."
    answer: 1
    tags: ["module", "exports", "encapsulation"]
    level: debutant
    explanation: |
      Contrairement à l'autowiring Symfony (services publics par défaut au
      conteneur), Nest encapsule strictement : un provider n'est visible
      hors de son module que s'il figure dans `exports`.
  - prompt: |
      Que doit faire un module A pour utiliser un service exporté par un
      module B ?
    options:
      - |
        Rien : Nest recherche automatiquement dans tous les modules de
        l'application.
      - "Importer le module B dans ses propres `imports`."
      - "Redéclarer le même service dans ses propres `providers`."
    answer: 1
    tags: ["module", "imports"]
    level: debutant
    explanation: |
      Un provider exporté par B n'est utilisable par A que si A liste B
      dans `imports` — les deux conditions (export côté B, import côté A)
      sont nécessaires.
  - prompt: |
      Quel est l'équivalent Symfony le plus direct de `@Injectable()` posé
      sur une classe ?
    options:
      - |
        Un service déclaré et autowiré, résolu automatiquement par le
        conteneur à partir de son constructeur typé.
      - "Une classe abstraite PHP."
      - "Un `trait` PHP."
    answer: 0
    tags: ["injectable", "autowiring", "symfony"]
    level: debutant
    explanation: |
      `@Injectable()` marque une classe comme provider que Nest peut
      instancier et injecter automatiquement — le principe même de
      l'autowiring Symfony, résolu à partir des types du constructeur.
  - prompt: |
      Pourquoi utilise-t-on `@Inject(TOKEN)` pour un provider `useValue`
      (ex. un nombre de configuration), alors qu'on n'en a pas besoin pour
      injecter une classe ?
    options:
      - |
        Parce que TypeScript ne peut pas résoudre un jeton à partir d'un
        simple type primitif (`number`, `string`) : il faut l'identifier
        explicitement par un token.
      - "C'est purement une question de style, sans réelle nécessité."
      - "@Inject() est obligatoire pour absolument tous les providers, y compris les classes."
    answer: 0
    tags: ["providers", "tokens", "inject"]
    level: intermediaire
    explanation: |
      Nest résout par défaut une dépendance de constructeur via son
      **type** (une classe). Un `number` ou une interface n'existe plus au
      runtime : il faut donc un jeton explicite (`string`/`Symbol`) et
      `@Inject(TOKEN)` pour indiquer quel provider injecter.
  - prompt: |
      Quel est le scope PAR DÉFAUT d'un provider NestJS ?
    options:
      - "`Scope.REQUEST` : une nouvelle instance à chaque requête HTTP."
      - "`Scope.TRANSIENT` : une nouvelle instance à chaque point d'injection."
      - "`Scope.DEFAULT` (singleton) : une seule instance pour toute l'application."
    answer: 2
    tags: ["scope", "singleton"]
    level: intermediaire
    explanation: |
      Sauf indication contraire, un provider Nest est un singleton — une
      instance unique, construite une fois au démarrage et partagée par
      toute l'application. C'est aussi le comportement par défaut
      (`shared: true`) des services Symfony.
  - prompt: |
      Pourquoi éviter d'utiliser `Scope.REQUEST` « par défaut, au cas où » ?
    options:
      - |
        Parce que cela recrée toute la chaîne de dépendances à chaque
        requête, avec un coût de performance réel — à réserver aux besoins
        d'état réellement propres à chaque requête.
      - "Parce que `Scope.REQUEST` provoque systématiquement une erreur au démarrage."
      - "Parce que ce scope n'existe plus dans les versions récentes de NestJS."
    answer: 0
    tags: ["scope", "performance", "erreur-frequente"]
    level: avance
    explanation: |
      `Scope.REQUEST` (et tout provider qui en dépend, en cascade) est
      reconstruit à chaque requête HTTP : un coût non négligeable à
      l'échelle. Le singleton (`Scope.DEFAULT`) reste le bon choix par
      défaut, sauf besoin explicite d'un état par-requête.
  - prompt: |
      Deux services `A` et `B` s'injectent mutuellement dans leurs
      constructeurs respectifs. Que se passe-t-il au démarrage, sans
      intervention particulière ?
    options:
      - |
        Nest lève une erreur de dépendance circulaire : impossible de
        construire A avant B si B a lui-même besoin de A (et inversement).
      - "Nest choisit arbitrairement de construire A en premier, sans erreur."
      - "Aucun souci : Nest gère nativement tous les cycles sans configuration."
    answer: 0
    tags: ["dependances-circulaires", "forwardref"]
    level: avance
    explanation: |
      Une dépendance circulaire entre deux providers est, par défaut,
      irrésoluble (ordre de construction impossible à déterminer). Nest
      fournit `forwardRef` comme échappatoire explicite, mais le vrai
      réflexe est souvent de revoir le découpage en modules.
---

Sept questions pour vérifier l'encapsulation par module (`exports`/
`imports`), le principe de l'autowiring Nest (`@Injectable`, tokens), les
scopes de provider, et le piège des dépendances circulaires.
