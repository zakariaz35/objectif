---
title: "Quiz — Système de plugins"
type: quiz
questions:
  - prompt: |
      Un développeur veut créer un nouveau type de bloc affiché dans la sidebar.
      Quelle est la démarche correcte ?
    options:
      - "Déclarer une entrée dans my_module.services.yml avec le tag block.plugin"
      - "Créer une classe dans src/Plugin/Block/ implémentant BlockBase avec l'attribut #[Block(id:'...', admin_label:'...')]"
      - "Implémenter hook_block_info() dans le fichier .module"
      - "Créer un fichier my_module.blocks.yml listant le nouveau bloc"
    answer: 1
    tags: [plugins, block, attributes]
    level: debutant
    explanation: >
      La bonne pratique Drupal 10 est la classe dans src/Plugin/Block/ avec l'attribut PHP 8
      #[Block]. Le tag services (option 1) n'est pas la façon dont les plugins Block
      sont découverts. hook_block_info() (option 3) est l'ancienne API Drupal 7.
      Il n'existe pas de fichier .blocks.yml (option 4).

  - prompt: |
      Dans quel cas utilise-t-on un plugin FieldFormatter custom ?
    options:
      - "Pour modifier le schéma de stockage SQL d'un champ"
      - "Pour personnaliser le rendu d'un champ existant dans les templates de page"
      - "Pour ajouter un nouveau widget de saisie dans les formulaires d'édition"
      - "Pour définir un nouveau type de données avec ses propres colonnes SQL"
    answer: 1
    tags: [field-formatter, plugins, theming]
    level: debutant
    explanation: >
      Un FieldFormatter contrôle l'affichage (le rendu) d'un champ — c'est l'option 2.
      Modifier le schéma SQL est le rôle du FieldType (option 4). Ajouter un widget
      de saisie est le rôle du FieldWidget (option 3). On ne modifie pas directement
      les templates via un FieldFormatter, mais on retourne un render array rendu
      ensuite par Twig.

  - prompt: |
      Un QueueWorker est défini avec `cron: ['time' => 60]`. La file contient 200
      éléments. Que se passe-t-il lors d'une exécution du cron qui prend plus de
      60 secondes ?
    options:
      - "Le cron expire et tous les éléments non traités sont supprimés de la file"
      - "Le cron arrête de traiter cette file après 60 secondes et reprend au prochain cron — les éléments non traités restent en file"
      - "Drupal relance automatiquement le cron pour finir la file"
      - "La valeur 60 est une limite de timeout par item, pas pour l'ensemble de la file"
    answer: 1
    tags: [queue, cron, queueworker]
    level: intermediaire
    explanation: >
      Le paramètre `time` est la durée maximale allouée à cette file lors d'une
      exécution de cron. Passé ce temps, Drupal arrête proprement et les éléments
      restants sont conservés pour la prochaine exécution. Aucun élément n'est supprimé
      (option 1 fausse). Drupal ne relance pas le cron automatiquement (option 3).

  - prompt: |
      Pour injecter entity_type.manager dans un plugin Block, quelle interface
      doit implémenter la classe ?
    options:
      - "ServiceSubscriberInterface"
      - "ContainerFactoryPluginInterface"
      - "ContainerAwareInterface"
      - "L'injection est automatique dans les plugins, aucune interface requise"
    answer: 1
    tags: [plugins, di, container]
    level: intermediaire
    explanation: >
      ContainerFactoryPluginInterface impose la méthode statique create() qui reçoit
      le ContainerInterface et instancie le plugin avec ses dépendances résolues.
      C'est le pattern standard pour l'injection dans les plugins Drupal.
      ServiceSubscriberInterface (option 1) est un pattern différent.
      L'autowiring automatique (option 4) n'existe pas dans les plugins Drupal sans
      configuration supplémentaire.
---
