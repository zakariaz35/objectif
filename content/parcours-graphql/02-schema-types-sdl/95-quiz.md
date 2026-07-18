---
title: "Quiz — le schéma & les types (SDL)"
type: quiz
questions:
  - prompt: |
      Que signifie exactement le `!` après `String` dans `title: String!` ?
    options:
      - "Que le champ est obligatoire dans la requête du client."
      - |
        Que le serveur s'engage à ne JAMAIS renvoyer `null` pour ce champ —
        un contrat vérifié à l'exécution, pas juste au niveau des types.
      - "Que le champ ne peut être modifié qu'une seule fois."
    answer: 1
    tags: ["non-null", "contrat"]
    level: debutant
    explanation: |
      Le `!` est un engagement d'exécution : si le resolver associé renvoie
      `null` pour un champ marqué `!`, GraphQL traite ça comme une ERREUR,
      pas comme une valeur manquante ordinaire.
  - prompt: |
      Quelle écriture décrit « une liste qui existe toujours (jamais
      `null`), dont chaque élément existe toujours (jamais `null`), mais qui
      peut être vide » ?
    options:
      - "[String]"
      - "[String]!"
      - "[String!]!"
    answer: 2
    tags: ["listes", "non-null"]
    level: intermediaire
    explanation: |
      `[String!]!` : le `!` final contraint la LISTE elle-même (jamais
      `null`), le `!` collé à `String` contraint chaque ÉLÉMENT (jamais
      `null`). Une liste vide `[]` reste valide dans les deux cas : ce n'est
      pas la même chose qu'une liste `null`.
  - prompt: |
      Peut-on utiliser un type `input` comme type de RETOUR d'un champ ?
    options:
      - "Oui, sans aucune restriction."
      - |
        Non : un `input` est réservé aux ARGUMENTS (query/mutation), jamais
        à un type de retour, même s'il ressemble à un `type` classique.
      - "Oui, mais uniquement pour les mutations."
    answer: 1
    tags: ["input", "schema"]
    level: intermediaire
    explanation: |
      GraphQL sépare strictement les types d'ENTRÉE (`input`, utilisables
      comme arguments) des types de SORTIE (`type`, utilisables comme
      valeurs de retour) — même si leurs champs se ressemblent souvent.
  - prompt: |
      Quand préfère-t-on une `interface` à une `union` pour représenter
      plusieurs types différents ?
    options:
      - |
        Quand ces types partagent au moins un champ commun (`id`, `title`
        par exemple) en plus de leurs champs spécifiques.
      - "Quand ces types n'ont strictement rien en commun."
      - "Une interface et une union sont strictement interchangeables."
    answer: 0
    tags: ["interface", "union"]
    level: intermediaire
    explanation: |
      `interface` suppose un socle de champs COMMUNS à toutes ses
      implémentations. `union` regroupe des types qui n'ont RIEN en commun
      — dans ce cas, seul `__typename` permet de savoir quel type concret a
      été renvoyé.
  - prompt: |
      Pourquoi transmettre les valeurs dynamiques d'une requête via
      `variables` plutôt que de les insérer directement dans le texte de la
      requête ?
    options:
      - "Ça n'a aucune importance, c'est juste une question de style."
      - |
        Pour séparer le texte fixe de la requête (réutilisable, analysable)
        des valeurs dynamiques — un principe similaire aux requêtes SQL
        préparées.
      - "Parce que le SDL interdit les valeurs littérales dans une requête."
    answer: 1
    tags: ["variables", "requete"]
    level: debutant
    explanation: |
      Les variables évitent de reconstruire une chaîne de requête à chaque
      appel (donc plus facile à mettre en cache/analyser côté outillage), et
      évitent le même genre de piège que la concaténation de valeurs dans du
      SQL brut.
  - prompt: |
      Pourquoi utilise-t-on un ALIAS quand on appelle deux fois le même
      champ avec des arguments différents dans une seule requête ?
    options:
      - "Pour améliorer les performances du serveur."
      - |
        Parce que sans alias, les deux appels produiraient la MÊME clé dans
        la réponse JSON — un conflit que le serveur ne peut pas résoudre.
      - "L'alias est obligatoire dès qu'on utilise des variables."
    answer: 1
    tags: ["alias", "requete"]
    level: intermediaire
    explanation: |
      Deux appels au champ `book(...)` avec des arguments différents
      produiraient tous les deux une clé `book` dans la réponse — un alias
      (`dune: book(id: "1")`) donne à chaque appel sa propre clé.
  - prompt: |
      Quelle affirmation sur `Query` vs `Mutation` est correcte ?
    options:
      - |
        Les champs d'une `Mutation` sont exécutés SÉQUENTIELLEMENT (l'un
        après l'autre), contrairement aux champs d'une `Query`.
      - "Query et Mutation s'exécutent toujours en parallèle, sans différence."
      - "Mutation est réservée aux suppressions, Query à tout le reste."
    answer: 0
    tags: ["query", "mutation"]
    level: avance
    explanation: |
      GraphQL garantit que les champs racines d'une `Mutation` s'exécutent
      dans l'ORDRE où ils apparaissent dans la requête, un par un — pour
      éviter des effets de bord imprévisibles si plusieurs mutations sont
      envoyées ensemble. Les champs d'une `Query`, elle, peuvent être résolus
      en parallèle.
---

Sept questions sur le cœur « langage » de GraphQL : non-null, listes, `input`
vs `type`, `interface` vs `union`, variables et alias.
