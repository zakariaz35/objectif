---
title: "Quiz — Patterns événementiels"
type: quiz
questions:
  - prompt: |
      Quelle est la différence principale entre event notification et event-carried
      state transfer ?
    options:
      - |
        Event notification transporte l'état complet ; event-carried state transfer ne
        transporte qu'un identifiant.
      - |
        Event notification ne transporte qu'un identifiant (nécessitant un rappel pour
        les détails) ; event-carried state transfer transporte l'état complet nécessaire
        au traitement.
      - |
        Les deux styles sont strictement équivalents en pratique.
    answer: 1
    tags: [event-driven, notification]
    level: débutant
    explanation: |
      Event notification réintroduit un couplage temporel via un appel de rappel vers le
      service source. Event-carried state transfer porte toutes les données nécessaires,
      réalisant un découplage réel — c'est le style à privilégier sur Kafka.
  - prompt: |
      Pourquoi le « dual write » (écrire en base ET publier sur Kafka séparément) est-il
      structurellement risqué ?
    options:
      - |
        Parce que Kafka est plus lent qu'une base de données.
      - |
        Parce qu'aucune transaction commune ne lie les deux écritures : l'une peut
        réussir et l'autre échouer, sans mécanisme natif pour l'empêcher.
      - |
        Parce que Kafka n'accepte pas les écritures provenant de plusieurs services.
    answer: 1
    tags: [outbox, dual-write]
    level: intermédiaire
    explanation: |
      La base de données et Kafka sont deux systèmes indépendants sans transaction
      partagée — un crash ou une panne entre les deux écritures produit une incohérence
      qu'aucun try/catch local ne peut totalement éliminer.
  - prompt: |
      Comment l'outbox pattern élimine-t-il le risque de dual write ?
    options:
      - |
        En rendant l'écriture Kafka elle-même transactionnelle avec la base de données.
      - |
        En remplaçant les deux écritures séparées par une seule écriture (donnée métier +
        ligne outbox) dans la même transaction et la même base ; un relay séparé publie
        ensuite vers Kafka.
      - |
        En désactivant les transactions côté base de données pour accélérer l'écriture.
    answer: 1
    tags: [outbox, pattern]
    level: intermédiaire
    explanation: |
      L'outbox pattern déplace le problème : au lieu de synchroniser deux systèmes
      distincts, on écrit une seule fois, dans une seule base, puis un relay (polling ou
      CDC) se charge, indépendamment, de publier vers Kafka.
  - prompt: |
      En mode de compatibilité BACKWARD sur un Schema Registry, quelle évolution de
      schéma est typiquement autorisée ?
    options:
      - |
        Renommer un champ existant.
      - |
        Ajouter un nouveau champ optionnel avec une valeur par défaut.
      - |
        Changer le type d'un champ existant sans valeur par défaut.
    answer: 1
    tags: [schema-registry, compatibilite]
    level: avancé
    explanation: |
      BACKWARD garantit qu'un nouveau schéma peut lire des données écrites avec l'ancien
      schéma. Ajouter un champ avec une valeur par défaut est sûr ; renommer ou changer un
      type casse généralement cette compatibilité.
  - prompt: |
      Quel est le lien entre Kafka et l'event sourcing ?
    options:
      - |
        Kafka impose l'event sourcing dès qu'on l'utilise en production.
      - |
        Le modèle de log rejouable de Kafka facilite l'event sourcing (stocker la
        séquence d'événements comme source de vérité), sans l'imposer.
      - |
        Event sourcing et Kafka sont deux concepts totalement indépendants, sans lien.
    answer: 1
    tags: [event-sourcing, cqrs]
    level: avancé
    explanation: |
      Le fait qu'un message Kafka survive à sa lecture (module 1) rend naturel de stocker
      une séquence d'événements comme source de vérité — mais la grande majorité des
      usages de Kafka en production restent de l'event-driven classique, sans event
      sourcing complet.
  - prompt: |
      Dans une architecture CQRS appuyée sur Kafka, quel est le rôle typique d'un
      « projecteur » ?
    options:
      - |
        Valider les commandes avant qu'elles ne modifient l'état.
      - |
        Consommer les événements publiés par le modèle d'écriture pour construire une
        vue de lecture dédiée et dénormalisée.
      - |
        Remplacer le rôle du Schema Registry.
    answer: 1
    tags: [cqrs, projecteur]
    level: intermédiaire
    explanation: |
      Le projecteur consomme le flux d'événements publié côté écriture et construit, de
      façon découplée, une vue de lecture optimisée pour un cas d'usage précis (recherche,
      affichage, agrégation) — souvent dans un stockage différent du modèle d'écriture.
---
