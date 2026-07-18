---
title: "Quiz — Config Management"
type: quiz
questions:
  - prompt: |
      Un développeur a ajouté un nouveau type de contenu sur son environnement local
      et veut le déployer en production. Quelle est la bonne séquence ?
    options:
      - "Créer le type de contenu directement en prod via l'interface admin"
      - "drush cex → git commit → git push → (CI) drush cim"
      - "Copier la base de données de dev vers prod"
      - "Exporter la base et importer uniquement les tables node_type_*"
    answer: 1
    tags: [config-management, workflow, deployment]
    level: debutant
    explanation: >
      La bonne pratique est d'exporter la configuration en YAML (drush cex), la commiter
      dans Git et l'importer en prod via le pipeline CI (drush cim). Créer directement
      en prod (option 1) contourne le versioning. Copier la base entière (option 3)
      écrase le contenu. Les tables SQL de config sont un détail d'implémentation
      qu'on ne manipule jamais directement.

  - prompt: |
      Lors du déploiement, dans quel ordre doit-on exécuter ces commandes ?
      A) drush cr  B) drush cim  C) composer install  D) drush updb
    options:
      - "A → B → C → D"
      - "C → B → D → A"
      - "B → C → D → A"
      - "C → D → B → A"
    answer: 1
    tags: [deployment, drush, composer]
    level: intermediaire
    explanation: >
      L'ordre correct est C (composer install — code PHP disponible) → B (cim — config
      appliquée) → D (updb — migrations avec la nouvelle config) → A (cr — cache purgé
      avec le nouvel état). Faire cr avant cim (option 3/4) peut reconstruire un cache
      incohérent. Faire updb avant cim peut échouer si un update dépend d'un nouveau
      champ de config.

  - prompt: |
      Un hook_update_N a déjà été exécuté en production. Une erreur est découverte dans
      ce hook. Que fait-on ?
    options:
      - "On modifie le hook_update_N existant et on relance drush updb"
      - "On crée un nouveau hook_update_N avec un numéro supérieur qui corrige l'état"
      - "On réinitialise le compteur d'updates avec drush updatedb:reset"
      - "On restaure la base de prod à partir du backup et on corrige l'erreur"
    answer: 1
    tags: [hook-update, migrations, best-practices]
    level: intermediaire
    explanation: >
      Un hook_update_N déjà exécuté ne sera jamais réexécuté par Drupal (il enregistre
      les numéros exécutés). La seule bonne approche est de créer un nouveau
      hook_update_N avec le numéro suivant pour corriger l'état. Modifier l'existant
      (option 1) n'aura aucun effet sur les serveurs où il a déjà tourné.

  - prompt: |
      À quoi sert la valeur `$config['my_module.settings']['api_key'] = getenv('API_KEY')`
      dans settings.php ?
    options:
      - "Elle écrit la valeur de la variable d'environnement dans la base de données Drupal"
      - "Elle surcharge la configuration exportée pour cet environnement sans modifier les fichiers YAML versionnés"
      - "Elle remplace la valeur dans config/sync/my_module.settings.yml"
      - "Elle n'a aucun effet car les variables d'environnement ne sont pas supportées dans settings.php"
    answer: 1
    tags: [settings-override, config, environment]
    level: debutant
    explanation: >
      Le settings override system de Drupal permet de surcharger des valeurs de config
      par environnement sans modifier les YAML versionnés. C'est le mécanisme standard
      pour les secrets et les valeurs spécifiques à un environnement. Ces surcharges
      ne sont jamais exportées par drush cex.
---
