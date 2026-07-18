---
title: "Quiz — Validation & DTO"
type: quiz
questions:
  - prompt: |
      Quelle est la différence entre `@NotNull` et `@NotBlank` en Bean
      Validation ?
    options:
      - "Aucune, ce sont des synonymes stricts."
      - |
        `@NotNull` refuse `null` mais accepte une chaîne vide `\"\"`,
        `@NotBlank` refuse en plus les chaînes vides ou composées
        uniquement d'espaces.
      - "`@NotBlank` ne s'applique qu'aux nombres, jamais aux chaînes."
    answer: 1
    tags: ["notnull", "notblank"]
    level: debutant
    explanation: |
      Même nuance que `#[Assert\NotNull]` vs `#[Assert\NotBlank]` côté
      Symfony : `@NotBlank` est la contrainte la plus utilisée sur des
      champs texte obligatoires.
  - prompt: |
      Que se passe-t-il si on OUBLIE `@Valid` avant un `@RequestBody` dont
      le type porte des contraintes Bean Validation ?
    options:
      - |
        Les contraintes sont silencieusement ignorées : le DTO est bindé
        mais jamais validé.
      - "Spring lève une erreur de compilation."
      - "La validation s'exécute quand même, `@Valid` n'étant qu'optionnel pour la lisibilité."
    answer: 0
    tags: ["valid", "erreur-frequente"]
    level: debutant
    explanation: |
      Sans `@Valid`, aucune vérification n'a lieu — un piège silencieux
      puisque le code compile et fonctionne en apparence avec des données
      valides en développement.
  - prompt: |
      Dans un contrôleur Symfony, comment déclenchait-on traditionnellement
      la validation d'un DTO AVANT l'équivalent automatique de Spring
      `@Valid` ?
    options:
      - "En appelant explicitement `$validator->validate($dto)` et en vérifiant le nombre d'erreurs."
      - "La validation Symfony a toujours été 100% automatique, sans appel explicite possible."
      - "Il n'existe aucun mécanisme de validation en Symfony."
    answer: 0
    tags: ["symfony", "validator"]
    level: debutant
    explanation: |
      L'appel au `Validator` Symfony est explicite (`$validator->validate(...)`),
      contrairement à `@Valid` qui déclenche la validation automatiquement
      avant l'entrée dans la méthode du contrôleur.
  - prompt: |
      Pourquoi préférer un DTO dédié plutôt que d'exposer directement une
      entité JPA en entrée d'un contrôleur `POST` ?
    options:
      - |
        Pour éviter l'overposting (un client pourrait envoyer un champ
        sensible que l'entité accepterait silencieusement) et masquer les
        détails internes de persistance.
      - "Les entités JPA ne peuvent techniquement pas être désérialisées depuis du JSON."
      - "Un DTO est obligatoire dans Spring Boot : le framework refuse de binder une entité directement."
    answer: 0
    tags: ["dto", "overposting", "securite"]
    level: intermediaire
    explanation: |
      C'est un choix de conception, pas une contrainte technique — le même
      raisonnement qui pousse à ne jamais binder directement une entité
      Doctrine sur une requête HTTP.
  - prompt: |
      Quel type Java est le plus adapté pour représenter un DTO immuable
      (input ou output) ?
    options:
      - "Une classe abstraite avec des champs `protected`."
      - "Un `record`, qui génère constructeur, accesseurs, `equals`/`hashCode` automatiquement."
      - "Une `interface` avec des méthodes par défaut."
    answer: 1
    tags: ["record", "dto"]
    level: debutant
    explanation: |
      Depuis Java 16, `record` est le choix idiomatique pour un DTO
      immuable — concis et sans boilerplate.
  - prompt: |
      Sans gestionnaire d'exception personnalisé, quelle exception Spring
      lève-t-il automatiquement quand `@Valid` détecte une contrainte
      violée sur un `@RequestBody` ?
    options:
      - "`IllegalArgumentException`"
      - "`MethodArgumentNotValidException`"
      - "`ConstraintViolationException`"
    answer: 1
    tags: ["methodargumentnotvalidexception"]
    level: intermediaire
    explanation: |
      `MethodArgumentNotValidException` est l'exception levée pour un
      `@RequestBody` invalide ; `ConstraintViolationException` concerne
      plutôt la validation de paramètres de méthode isolés
      (`@Validated` sur un service, par exemple).
  - prompt: |
      Sur une API REST pure, quel est l'équivalent Symfony le plus juste
      d'un DTO Spring validé par Bean Validation ?
    options:
      - |
        Un `Form` Symfony complet, avec son rendu HTML Twig inclus.
      - |
        Un DTO désérialisé par le composant Serializer et validé par le
        composant Validator — sans la partie rendu de formulaire HTML, qui
        n'a pas d'utilité sur une API JSON.
      - "Il n'existe aucun équivalent, Symfony ne validant que des entités."
    answer: 1
    tags: ["form-symfony", "nuance"]
    level: avance
    explanation: |
      Un `Form` Symfony fait plus qu'un DTO : il gère aussi la
      transformation et le rendu HTML. Sur une API REST, l'équivalent
      pertinent est Serializer + Validator, pas Form dans son ensemble.
---

Sept questions sur les contraintes Bean Validation, `@Valid`, la gestion
centralisée des erreurs et le rôle des DTO — avec la nuance importante sur
les Forms Symfony.
