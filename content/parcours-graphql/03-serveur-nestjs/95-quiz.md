---
title: "Quiz — serveur NestJS, exécution & N+1"
type: quiz
questions:
  - prompt: |
      En code-first avec `@nestjs/graphql`, qui est la SOURCE DE VÉRITÉ du
      schéma ?
    options:
      - |
        Les classes TypeScript décorées (`@ObjectType`, `@Resolver`...) ; le
        fichier SDL est généré à partir d'elles, à chaque démarrage.
      - "Un fichier `.graphql` écrit à la main, que les resolvers doivent respecter."
      - "La base de données, dont le schéma GraphQL est déduit automatiquement."
    answer: 0
    tags: ["code-first", "nestjs"]
    level: debutant
    explanation: |
      C'est l'inverse du schema-first : en code-first, tu écris des classes
      TypeScript décorées, et NestJS en déduit le SDL. Le SDL devient une
      PROJECTION régénérée, jamais la source de vérité que tu maintiens
      toi-même.
  - prompt: |
      Un champ `@Field()` (sans `{ nullable: true }`) sur un `@ObjectType`
      NestJS génère quoi dans le SDL ?
    options:
      - "Un champ nullable par défaut, comme dans un SDL écrit à la main."
      - |
        Un champ NON-NULL (`!`) par défaut — l'inverse de la convention du
        SDL écrit à la main, où tout est nullable sauf mention du `!`.
      - "Un champ optionnel côté TypeScript, mais toujours nullable côté SDL."
    answer: 1
    tags: ["code-first", "non-null"]
    level: debutant
    explanation: |
      C'est un piège fréquent : NestJS INVERSE la convention par défaut du
      SDL. Un `@Field()` simple génère un `!` ; il faut ajouter explicitement
      `{ nullable: true }` pour un champ optionnel.
  - prompt: |
      Dans la signature universelle d'un resolver `(parent, args, context,
      info)`, que contient `parent` pour un champ RACINE (ex. `Query.book`) ?
    options:
      - "La valeur renvoyée par le resolver du champ parent dans l'arbre de la requête."
      - "Toujours `undefined` : rien ne précède un champ racine."
      - "L'objet `context` partagé par toute la requête."
    answer: 1
    tags: ["execution", "resolver"]
    level: debutant
    explanation: |
      `parent` porte la valeur renvoyée par le resolver du niveau juste
      au-dessus dans l'arbre de la requête. Un champ RACINE (`Query`,
      `Mutation`) n'a, par définition, rien au-dessus de lui : `parent` y
      vaut `undefined`.
  - prompt: |
      Un champ `title` du SDL n'a AUCUN `@ResolveField` ni méthode associée
      dans le resolver NestJS. Comment sa valeur est-elle produite ?
    options:
      - "Le serveur refuse de démarrer : chaque champ doit avoir un resolver explicite."
      - |
        Par le RESOLVER PAR DÉFAUT de `graphql-js` : un simple accès de
        propriété, `parent.title`.
      - "En interrogeant l'introspection du schéma à chaque requête."
    answer: 1
    tags: ["execution", "resolver-par-defaut"]
    level: intermediaire
    explanation: |
      Sans resolver explicite, GraphQL retombe sur son resolver PAR DÉFAUT :
      un accès de propriété (`parent[fieldName]`). C'est pour ça qu'un champ
      scalar n'a besoin d'aucun code particulier tant que la donnée existe
      déjà sur l'objet renvoyé par le resolver parent.
  - prompt: |
      Une requête `books { author { name } }` renvoie 20 livres. Le resolver
      `Book.author` fait un `findById` individuel par livre. Combien de
      requêtes SQL cela déclenche-t-il au total (en comptant la liste) ?
    options:
      - "1 seule requête, GraphQL regroupe automatiquement les relations."
      - "20 requêtes : une par livre, la liste elle-même ne compte pas."
      - "21 requêtes : 1 pour la liste des livres, + 1 par livre pour son auteur — le fameux N+1."
    answer: 2
    tags: ["n-plus-1", "resolvefield"]
    level: intermediaire
    explanation: |
      C'est exactement le mécanisme du N+1 : 1 requête pour la liste
      (`books`), puis N requêtes individuelles (une par élément), déclenchées
      parce que chaque livre redémarre indépendamment la résolution de son
      propre champ `author`.
  - prompt: |
      Que fait concrètement DataLoader pour résoudre le problème N+1 ?
    options:
      - |
        Il accumule les clés demandées via `.load(...)` pendant le tick
        d'exécution en cours, puis déclenche UNE SEULE `batchFn` groupée.
      - "Il met en cache TOUTES les requêtes précédentes, pour toujours, entre deux requêtes HTTP différentes."
      - "Il réécrit automatiquement le schéma GraphQL pour éviter les relations imbriquées."
    answer: 0
    tags: ["dataloader", "batching"]
    level: intermediaire
    explanation: |
      DataLoader ne réduit jamais le nombre d'APPELS de resolver (toujours N
      appels à `author()`) — il réduit le nombre d'appels RÉELS vers la
      source de données, en les regroupant en une seule `batchFn`. Son cache
      est aussi scopé à UNE requête HTTP, jamais partagé entre requêtes.
  - prompt: |
      Une `batchFn` de DataLoader reçoit `["1", "2", "3"]`. Quelle contrainte
      s'impose sur le tableau qu'elle renvoie ?
    options:
      - "Aucune contrainte particulière : DataLoader retrouve la bonne valeur par recherche."
      - |
        Le tableau doit avoir EXACTEMENT la même longueur, DANS LE MÊME
        ORDRE que les clés reçues — DataLoader redistribue par position, pas
        par ré-appariement.
      - "Le tableau doit être trié par ordre alphabétique des clés, pas l'ordre de réception."
    answer: 1
    tags: ["dataloader", "batchfn"]
    level: avance
    explanation: |
      DataLoader redistribue le résultat d'index `i` à la promesse `i`, SANS
      jamais re-matcher par identifiant. Une `batchFn` qui filtre, trie ou
      renvoie un tableau plus court casse silencieusement cette
      correspondance.
---

Sept questions sur le cœur du module 3 : code-first NestJS, la signature
universelle d'un resolver, le resolver par défaut, le problème N+1 et le
mécanisme de batching de DataLoader.
