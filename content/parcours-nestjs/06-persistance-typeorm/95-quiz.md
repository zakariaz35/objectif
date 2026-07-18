---
title: "Quiz — Persistance avec TypeORM"
type: quiz
questions:
  - prompt: |
      Pourquoi TypeORM est-il présenté ici comme le point d'entrée le plus
      naturel venant de Doctrine ?
    options:
      - |
        Parce qu'il fonctionne avec des entités décorées, un Repository et
        un EntityManager — un modèle très proche de Doctrine.
      - "Parce que c'est le seul ORM supporté officiellement par NestJS."
      - "Parce qu'il ne nécessite aucune configuration de connexion à la base."
    answer: 0
    tags: ["typeorm", "doctrine", "passerelle"]
    level: debutant
    explanation: |
      TypeORM et Doctrine partagent la même philosophie (entités décorées,
      Repository, EntityManager). Prisma (mentionné en alternative) suit
      une approche différente (schéma externe + client généré) : Nest
      supporte plusieurs ORM/ODM, TypeORM n'est pas le seul.
  - prompt: |
      À quoi correspond `@PrimaryGeneratedColumn()` côté Doctrine ?
    options:
      - "`#[ORM\\Column(type: 'text')]`"
      - "`#[ORM\\Id] + #[ORM\\GeneratedValue]`"
      - "`#[ORM\\JoinColumn]`"
    answer: 1
    tags: ["entites", "doctrine"]
    level: debutant
    explanation: |
      `@PrimaryGeneratedColumn()` combine, en un seul décorateur, la
      déclaration de clé primaire ET sa génération automatique — deux
      attributs distincts côté Doctrine.
  - prompt: |
      Pourquoi éviter `synchronize: true` dès qu'un projet a une vraie base
      de données ?
    options:
      - |
        Parce qu'il recrée/modifie automatiquement le schéma à chaque
        démarrage, avec un risque réel de perte de données.
      - "Parce que cette option ralentit uniquement les tests unitaires."
      - "Parce qu'elle est incompatible avec PostgreSQL."
    answer: 0
    tags: ["synchronize", "migrations", "erreur-frequente"]
    level: intermediaire
    explanation: |
      `synchronize: true` modifie le schéma automatiquement à partir des
      entités : pratique en tout début de prototype, risqué dès qu'une
      vraie base contient des données. Les migrations explicites (comme
      `doctrine:migrations`) prennent le relais.
  - prompt: |
      Que se passe-t-il si on appelle `repository.create(data)` SANS
      appeler ensuite `.save(...)` ?
    options:
      - |
        Rien n'est écrit en base : `.create()` construit seulement une
        instance en mémoire.
      - "L'entité est automatiquement persistée après un court délai."
      - "Une erreur est levée immédiatement par TypeORM."
    answer: 0
    tags: ["repository", "save", "erreur-frequente"]
    level: intermediaire
    explanation: |
      `.create()` ne fait que construire l'objet ; seul `.save(...)`
      déclenche réellement l'INSERT/UPDATE — le même piège que `new
      Product()` sans `$entityManager->persist()` + `flush()` en Doctrine.
  - prompt: |
      Comment déclare-t-on qu'un `Product` a plusieurs `Order` associées ?
    options:
      - "`@ManyToOne(() => Order)` posé sur `Product`."
      - "`@OneToMany(() => Order, (order) => order.product)` posé sur `Product`."
      - "`@JoinColumn()` posé sur `Product`."
    answer: 1
    tags: ["relations"]
    level: intermediaire
    explanation: |
      `@OneToMany` décrit le côté « plusieurs » d'une relation, l'inverse
      de `@ManyToOne` posé côté `Order` — exactement la même paire que
      `#[ORM\OneToMany(mappedBy: ...)]` / `#[ORM\ManyToOne]` en Doctrine.
  - prompt: |
      Une relation TypeORM déclarée SANS `eager: true` ni `relations:
      {...}` explicite dans la requête est-elle chargée automatiquement ?
    options:
      - "Oui, toutes les relations sont chargées par défaut (eager loading)."
      - |
        Non : elle est chargée à la demande (lazy), comme le comportement
        par défaut de Doctrine.
      - "Cela dépend uniquement du type de base de données utilisée."
    answer: 1
    tags: ["relations", "lazy-loading"]
    level: avance
    explanation: |
      Comme Doctrine, TypeORM ne charge pas les relations par défaut :
      il faut soit `eager: true` sur la relation, soit `relations: {...}`
      explicitement dans la requête — sinon la relation reste absente du
      résultat.
  - prompt: |
      Quelle est la bonne pratique pour appliquer un changement de schéma
      sur un projet en production ?
    options:
      - |
        Générer une migration, relire le SQL produit, la committer, puis
        l'appliquer explicitement au déploiement.
      - "Activer `synchronize: true` juste le temps du déploiement."
      - "Modifier directement la base de données en production, à la main."
    answer: 0
    tags: ["migrations", "bonnes-pratiques"]
    level: avance
    explanation: |
      Une migration versionnée, relue avant application, est la seule
      approche sûre en production — exactement le flux
      `doctrine:migrations:diff` puis `doctrine:migrations:migrate`
      côté Symfony.
---

Sept questions pour vérifier le mapping d'entités TypeORM/Doctrine, le
contrat du Repository (`create`/`save`), les relations, et la discipline
des migrations en production.
