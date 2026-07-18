---
title: "Quiz — Données avec Spring Data JPA"
type: quiz
questions:
  - prompt: |
      Avec Spring Boot 3, quel package faut-il importer pour `@Entity`,
      `@Id`, `@Column` ?
    options:
      - "`javax.persistence.*`"
      - "`jakarta.persistence.*`"
      - "`org.hibernate.annotations.*`"
    answer: 1
    tags: ["jakarta", "javax", "erreur-frequente"]
    level: debutant
    explanation: |
      Depuis Jakarta EE 9+ (et Spring Boot 3), tous les packages sont passés
      de `javax.*` à `jakarta.*`. Un import `javax.persistence` ne compile
      même pas avec Spring Boot 3 — le piège le plus fréquent pour qui
      vient d'un ancien tutoriel.
  - prompt: |
      Que fournit `JpaRepository<Product, Long>` sans aucune implémentation
      à écrire ?
    options:
      - "Uniquement une méthode `findById`."
      - "Le CRUD complet : `save`, `findById`, `findAll`, `deleteById`, `count`..."
      - "Rien : il faut toujours écrire l'implémentation soi-même."
    answer: 1
    tags: ["jparepository", "crud"]
    level: debutant
    explanation: |
      `JpaRepository` fournit tout le CRUD de base — l'équivalent de ce que
      `ServiceEntityRepository` apporte déjà en Symfony/Doctrine.
  - prompt: |
      Que génère une méthode `findByCategoryAndPriceLessThan(String, double)`
      dans une interface `JpaRepository` ?
    options:
      - "Une erreur de compilation : il faut toujours écrire `@Query`."
      - |
        La requête correspondante, générée automatiquement à partir du nom
        de la méthode — sans une seule ligne de SQL/JPQL.
      - "Une exception au runtime, systématiquement."
    answer: 1
    tags: ["methodes-derivees"]
    level: debutant
    explanation: |
      Spring Data analyse le nom de la méthode et construit la requête
      correspondante — un principe qui va plus loin que le `findBy()`
      associatif de Doctrine.
  - prompt: |
      Quel est le fetch type PAR DÉFAUT d'une relation `@ManyToOne` en
      JPA — et pourquoi ce point surprend les développeurs Doctrine ?
    options:
      - |
        `EAGER` par défaut, alors que Doctrine charge systématiquement ses
        relations en lazy (via des proxies) — l'inverse de ce à quoi on
        s'attend.
      - "`LAZY` par défaut, exactement comme Doctrine."
      - "Il n'y a pas de fetch type par défaut : il doit toujours être précisé."
    answer: 0
    tags: ["fetch-type", "eager-lazy", "erreur-frequente"]
    level: intermediaire
    explanation: |
      `@ManyToOne`/`@OneToOne` sont EAGER par défaut en JPA, contrairement à
      Doctrine (toujours lazy). Un vrai projet force presque toujours
      `FetchType.LAZY` explicitement sur ces relations.
  - prompt: |
      Quelle est la cause classique d'un problème « N+1 requêtes » avec une
      relation `@OneToMany` en `LAZY` ?
    options:
      - |
        Accéder à la collection dans une boucle déclenche une requête SQL
        par itération, faute de jointure explicite.
      - "Le problème N+1 n'existe pas avec JPA, contrairement à Doctrine."
      - "C'est toujours causé par un `@ManyToOne` mal configuré, jamais par un `@OneToMany`."
    answer: 0
    tags: ["n-plus-1", "performance"]
    level: intermediaire
    explanation: |
      Exactement le même piège qu'en Doctrine : une jointure explicite
      (`JOIN FETCH` en JPQL, `addSelect` en DQL) évite les requêtes
      répétées.
  - prompt: |
      Que se passe-t-il si une méthode annotée `@Transactional` lève une
      exception CHECKED (`throws Exception`), sans préciser `rollbackFor` ?
    options:
      - "La transaction est annulée (rollback), comme pour toute exception."
      - |
        La transaction est VALIDÉE quand même : par défaut, seules les
        exceptions *unchecked* (`RuntimeException`) déclenchent un rollback.
      - "L'application plante immédiatement, sans possibilité de récupération."
    answer: 1
    tags: ["transactional", "rollback", "erreur-frequente"]
    level: avance
    explanation: |
      C'est une surprise fréquente : `@Transactional` ne fait un rollback
      automatique que sur les exceptions *unchecked* (et `Error`). Une
      exception *checked* nécessite `rollbackFor = Exception.class`
      explicitement.
  - prompt: |
      Quel langage utilise `@Query("SELECT p FROM Product p WHERE ...")`
      par défaut (sans `nativeQuery = true`) ?
    options:
      - "Du SQL brut, directement exécuté sur la table `products`."
      - |
        Du JPQL, un langage orienté objet manipulant des entités et leurs
        champs — le pendant quasi identique du DQL Doctrine.
      - "Un DSL propriétaire Spring, sans rapport avec Doctrine."
    answer: 1
    tags: ["jpql", "dql"]
    level: intermediaire
    explanation: |
      JPQL et DQL sont, à quelques détails près, le même langage : orienté
      objet, manipulant des entités (`Product p`) plutôt que des tables
      brutes. `nativeQuery = true` est l'échappatoire vers du SQL natif.
---

Sept questions pour ancrer le piège `jakarta` vs `javax`, les méthodes
dérivées, les fetch types par défaut (EAGER vs LAZY), le N+1 et les
transactions.
