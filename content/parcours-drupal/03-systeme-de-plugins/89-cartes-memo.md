---
title: "Cartes mémo — Système de plugins"
type: flashcards
cards:
  - q: |
      Quelle est la différence entre un plugin Drupal et un service DI ?
    a: |
      Un **service** est une instance unique (singleton) enregistrée dans le container
      — on l'identifie par un nom de service (`entity_type.manager`).
      Un **plugin** appartient à une **famille** de composants interchangeables du même
      type (tous les blocs, tous les formatters…) — identifié par un `id` dans son
      attribut/annotation. Le PluginManager gère la découverte et l'instanciation
      à la demande.
  - q: |
      Quel namespace et quel répertoire doit respecter un plugin de type Block ?
    a: |
      Namespace : `Drupal\mon_module\Plugin\Block\` — répertoire `src/Plugin/Block/`.
      Le PluginManager du noyau scanne automatiquement ces répertoires dans tous les
      modules actifs. La convention de nommage est suffisante — pas de YAML à déclarer.
  - q: |
      Comment injecter des services dans un plugin Drupal ?
    a: |
      Implémenter `ContainerFactoryPluginInterface` et définir une méthode statique
      `create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition)`
      qui résout les dépendances depuis le container. Le constructeur doit accepter les
      paramètres du plugin (`$configuration`, `$plugin_id`, `$plugin_definition`) en
      plus des dépendances injectées, et appeler `parent::__construct(…)`.
  - q: |
      À quoi sert l'attribut `cron: ['time' => 60]` sur un QueueWorker ?
    a: |
      Il dit au cron Drupal de consacrer **au maximum 60 secondes** à traiter cette
      file lors de chaque exécution. Passé ce délai, le cron arrête et reprendra à la
      prochaine exécution. Sans cette clé, Drupal ne traitera pas la file
      automatiquement via le cron — il faut appeler `drush queue:run` manuellement.
  - q: |
      Quelle est la différence entre les annotations Doctrine et les attributs PHP 8
      pour déclarer un plugin Drupal ?
    a: |
      Les **annotations** (`/** @Block(id = "...") */`) sont le format historique
      (D8/D9). Les **attributs PHP 8** (`#[Block(id: '...')]`) sont disponibles depuis
      Drupal 10.2 et sont le format recommandé désormais. Les deux coexistent ; en
      reprise de projet, tu verras presque toujours les annotations. Les annotations
      Doctrine sont dépréciées dans Drupal 11.
---
