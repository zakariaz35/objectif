---
title: "Quiz — Architecture & modèle mental"
type: quiz
questions:
  - prompt: |
      Un développeur Symfony reprend un projet Drupal 10. Il veut modifier le comportement
      du breadcrumb. Quelle est la bonne approche ?
    options:
      - "Éditer directement le fichier core/lib/Drupal/Core/Breadcrumb/BreadcrumbManager.php"
      - "Créer un service dans son module custom qui implémente BreadcrumbBuilderInterface, le taguer breadcrumb_builder avec une priority supérieure, et le déclarer dans *.services.yml"
      - "Créer un hook_breadcrumb() dans son fichier .module"
      - "Surcharger la classe dans composer.json via la clé autoload-dev"
    answer: 1
    tags: [services, di, breadcrumb]
    level: intermediaire
    explanation: >
      Le noyau Drupal ne se modifie jamais directement. Le mécanisme officiel est le
      service tagué avec une priorité supérieure — identique au pattern de décorateur
      Symfony. Il n'existe pas de hook_breadcrumb() ; l'option autoload-dev est incorrecte
      et dangereuse.

  - prompt: |
      Quelle instruction est préférable pour récupérer un service dans un controller
      Drupal bien structuré ?
    options:
      - "\\Drupal::service('entity_type.manager')"
      - "Injecter EntityTypeManagerInterface via le constructeur + create()"
      - "new EntityTypeManager()"
      - "\\Drupal::entityTypeManager() directement dans la méthode action"
    answer: 1
    tags: [di, controllers, best-practices]
    level: debutant
    explanation: >
      L'injection par constructeur + create() est la bonne pratique : elle rend le
      controller testable (on peut passer un mock). Les appels statiques \Drupal::
      sont tolérés dans le code procédural (.module) mais déconseillés dans les classes.
      `new EntityTypeManager()` ne fonctionnerait pas (dépendances internes non
      initialisées).

  - prompt: |
      Un controller Drupal retourne un tableau PHP (render array) au lieu d'une Response.
      Quel est l'avantage principal ?
    options:
      - "C'est simplement une convention Drupal, il n'y a pas d'avantage technique réel"
      - "Le render array transporte les métadonnées de cache (tags, contexts, max-age) permettant au système de rendu de mettre en cache et invalider de façon granulaire"
      - "Cela permet d'éviter d'instancier l'objet Response, ce qui économise de la mémoire"
      - "Le render array est automatiquement sérialisé en JSON pour les APIs REST"
    answer: 1
    tags: [render-array, cache, performance]
    level: intermediaire
    explanation: >
      L'avantage principal est la gestion granulaire du cache via les tags, contexts et
      max-age transportés dans le render array. Drupal peut invalider précisément les
      fragments de page affectés par un changement de données, sans avoir à regénérer
      toute la page. Le render array n'est pas lié à JSON/REST.

  - prompt: |
      Dans le fichier my_module.routing.yml, à quoi sert la clé `requirements._permission`
      (ex. `_permission: 'access content'`) ?
    options:
      - "Elle définit une regex de validation sur le paramètre d'URL nommé _permission"
      - "Elle déclenche une vérification d'accès Drupal avant d'invoquer le controller : l'utilisateur doit posséder la permission indiquée"
      - "Elle importe automatiquement les permissions déclarées dans my_module.permissions.yml"
      - "Elle n'a pas d'effet ; l'accès se gère uniquement dans le controller via currentUser()"
    answer: 1
    tags: [routing, permissions, access-control]
    level: debutant
    explanation: >
      La clé _permission dans requirements est une extension Drupal du routeur Symfony :
      Drupal évalue la permission avant même d'appeler le controller. Si l'utilisateur
      ne possède pas la permission, une réponse 403 est retournée automatiquement. Gérer
      l'accès uniquement dans le controller (option 4) serait possible mais contourne le
      système et rend le code moins lisible.

  - prompt: |
      Quelle affirmation décrit correctement la différence entre configuration et contenu
      en Drupal ?
    options:
      - "La configuration inclut les nœuds publiés ; le contenu inclut les types de champs"
      - "La configuration décrit la structure du site (types de contenu, champs, vues) — versionnée en YAML ; le contenu (nœuds, users) réside en base de données"
      - "Les deux sont stockés dans la base de données ; la distinction est purement conceptuelle"
      - "La configuration est gérée par Drupal core ; le contenu est géré par les modules contrib"
    answer: 1
    tags: [config-management, workflow, agence]
    level: debutant
    explanation: >
      La distinction configuration/contenu est fondamentale en Drupal : la configuration
      s'exporte via `drush cex` en YAML et se versionne dans Git, ce qui permet de
      reproduire la structure du site entre environnements. Le contenu (nœuds, utilisateurs,
      médias) reste en base et se migre séparément si besoin.
---
