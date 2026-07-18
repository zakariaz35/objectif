---
title: "Quiz final — Parcours Drupal complet"
type: quiz
strategy: random
draw: 8
questions:
  - prompt: |
      Dans le projet vitrine, le bloc `FeaturedProjectsBlock` doit être invalidé
      dès qu'un projet est publié ou modifié. Quelle valeur de cache tag utilise-t-on ?
    options:
      - "['node_list']  — invalide sur tout changement de nœud"
      - "['node_list:project']  — invalide uniquement quand un nœud de type project change"
      - "['node:project']  — invalide par bundle"
      - "['project_list']  — tag custom à déclarer manuellement"
    answer: 1
    tags: [cache, render-array, performance]
    level: intermediaire
    explanation: >
      Le tag node_list:project est la forme granulaire : il n'est invalidé que lorsqu'un
      nœud de type project est créé, modifié ou supprimé. node_list (sans bundle) serait
      invalidé lors de tout changement de nœud, quelle que soit sa nature — trop large
      et inutilement invalidant pour les perfs.

  - prompt: |
      Un service Drupal `agency_core.project_service` est déclaré dans
      `agency_core.services.yml`. Comment l'injecter dans un EventSubscriber ?
    options:
      - "Appeler \\Drupal::service('agency_core.project_service') dans la méthode onEntityUpdate"
      - "Déclarer le service comme argument dans le constructeur de l'EventSubscriber et le résoudre dans agency_core.services.yml"
      - "Implémenter ServiceSubscriberInterface et déclarer getSubscribedServices()"
      - "Utiliser @inject dans l'annotation de la classe"
    answer: 1
    tags: [services, di, event-subscriber]
    level: intermediaire
    explanation: >
      L'injection par constructeur + déclaration dans services.yml (option 2) est la
      bonne pratique : le service est injectable et mockable dans les tests. L'appel
      statique (option 1) est déconseillé dans les classes. ServiceSubscriberInterface
      (option 3) est un autre pattern de lazy injection, moins courant dans ce contexte.

  - prompt: |
      Après un merge Git qui ramène des modifications dans `config/sync/`, quelle
      commande applique ces changements à la base de données locale ?
    options:
      - "drush config:export"
      - "drush config:import"
      - "drush updatedb"
      - "drush cache:rebuild"
    answer: 1
    tags: [config-management, drush, workflow]
    level: debutant
    explanation: >
      drush config:import (cim) lit les fichiers YAML de config/sync/ et les applique
      à la base de données active. C'est la commande à lancer après chaque git pull
      qui modifie la configuration. drush cex (export) va dans l'autre sens.

  - prompt: |
      Comment déclarer une route dans Drupal qui nécessite la permission 'manage projects' ?
    options:
      - "Ajouter un _access: my_module.access_checker dans requirements"
      - "Ajouter _permission: 'manage projects' dans la section requirements du fichier routing.yml"
      - "Vérifier la permission dans le controller avec if (!$this->currentUser()->hasPermission(...)) throw new AccessDeniedHttpException()"
      - "Configurer l'accès dans la méthode access() du controller"
    answer: 1
    tags: [routing, permissions, access-control]
    level: debutant
    explanation: >
      La clé _permission dans requirements est le mécanisme standard Drupal : la
      vérification se fait avant même d'instancier le controller, et retourne
      automatiquement un 403. Les autres options fonctionnent mais sont moins élégantes
      et moins DRY. La vérification dans le controller (option 3) peut avoir sa place
      pour de la logique d'accès complexe, mais pas comme remplacement de _permission.

  - prompt: |
      Un Paragraph type "HeroBanner" a été ajouté en UI sur l'environnement staging.
      L'équipe veut l'avoir en dev. Comment procéder ?
    options:
      - "Copier la base de données de staging vers dev"
      - "Recréer le Paragraph type manuellement en dev dans l'interface admin"
      - "drush cex sur staging → committer les YAMLs → git pull en dev → drush cim"
      - "Exporter uniquement le YAML du Paragraph type et l'importer manuellement en dev"
    answer: 2
    tags: [config-management, paragraphs, workflow]
    level: intermediaire
    explanation: >
      Le flux correct est toujours : cex sur l'env de source → commit Git → git pull
      sur l'env de destination → cim. L'option 4 est techniquement possible mais
      fragile (les dépendances entre fichiers YAML sont nombreuses pour un Paragraph
      type : field storage, field config, form display, view display…). Copier la DB
      (option 1) écrase le contenu.

  - prompt: |
      Que fait le tag de cache `contexts: ['user.permissions']` sur un render array ?
    options:
      - "Il vérifie que l'utilisateur a les bonnes permissions pour voir le contenu"
      - "Il crée une entrée de cache séparée pour chaque combinaison de permissions de l'utilisateur courant"
      - "Il désactive le cache pour les utilisateurs connectés"
      - "Il partage le cache entre tous les utilisateurs qui ont le même rôle"
    answer: 1
    tags: [cache, render-array, contexts]
    level: intermediaire
    explanation: >
      Un cache context crée des variantes de cache : avec user.permissions, Drupal
      stocke une version du rendu par combinaison unique de permissions. C'est nécessaire
      quand le rendu dépend des permissions de l'utilisateur (ex. afficher ou non un
      bouton "Edit"). Sans ce context, la version cachée pour l'admin pourrait être
      servie à un anonyme.

  - prompt: |
      Dans un `hook_update_N`, quelle contrainte doit respecter le numéro N ?
    options:
      - "Il doit être exactement le numéro de version du module (ex. 10117 pour la v1.17)"
      - "Il doit être unique et toujours supérieur aux numéros déjà exécutés dans ce module"
      - "Il doit correspondre au numéro de la release Drupal core (ex. 10003 pour D10.3)"
      - "Il peut être réutilisé si l'update précédent a échoué"
    answer: 1
    tags: [hook-update, migrations, modules]
    level: intermediaire
    explanation: >
      Drupal enregistre les numéros d'update exécutés par module. Un hook_update_N ne
      sera exécuté qu'une seule fois, sur chaque environnement. Les numéros doivent
      être croissants pour garantir l'ordre d'exécution. Pour D10, la convention est
      de commencer à 10001. On ne réutilise jamais un numéro — même si l'update a
      échoué, on crée le correctif dans un numéro N+1.

  - prompt: |
      Quel est le rôle de `$settings['config_sync_directory']` dans settings.php ?
    options:
      - "Il définit le chemin vers le dossier contenant les fichiers de configuration exportés par drush cex"
      - "Il active la synchronisation automatique de la configuration au démarrage"
      - "Il spécifie le dossier de sauvegarde des fichiers uploadés"
      - "Il définit le dossier de cache de la configuration compilée"
    answer: 0
    tags: [config-management, settings, deployment]
    level: debutant
    explanation: >
      $settings['config_sync_directory'] pointe vers le dossier où drush cex exporte
      (et où drush cim lit) les fichiers YAML de configuration. Typiquement '../config/sync'
      (hors du docroot). Ce setting est obligatoire pour que le Config Management
      fonctionne. Note : dans Drupal 8/9, c'était $config_directories[CONFIG_SYNC_DIRECTORY].
---
