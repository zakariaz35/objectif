---
title: "Cartes mémo — Config Management"
type: flashcards
cards:
  - q: |
      Quelle commande Drush exporte la configuration active vers les fichiers YAML ?
      Et dans quel dossier atterrissent ces fichiers ?
    a: |
      `drush cex` (config export). Les fichiers YAML atterrissent dans le dossier
      configuré par `$settings['config_sync_directory']` dans `settings.php` —
      typiquement `config/sync/` à la racine du projet (hors du `docroot`).
  - q: |
      Quelle est la séquence correcte de déploiement Drupal en agence ?
    a: |
      1. `composer install` (télécharge le code PHP)
      2. `drush cim --yes` (applique la configuration)
      3. `drush updb --yes` (applique les hook_update_N)
      4. `drush cr` (vide les caches)
      L'ordre est impératif : `cim` doit précéder `updb` car certains updates dépendent
      de la configuration importée ; `cr` en dernier pour purger les caches avec la
      nouvelle config.
  - q: |
      Quelle est la différence entre `hook_install()` et `hook_update_N()` ?
    a: |
      `hook_install()` : exécuté **une seule fois** lors de la première activation du
      module (`drush en`). Sert à créer des données initiales (termes, permissions…).
      `hook_update_N()` : exécuté lors de `drush updb` quand le numéro N est supérieur
      au numéro enregistré. Équivalent des migrations — pour les changements de schema
      ou de données après la première installation.
  - q: |
      À quoi sert `$config['system.site']['name'] = 'Dev';` dans settings.php ?
    a: |
      C'est le **settings override system** : il surcharge une valeur de configuration
      pour cet environnement **sans l'exporter**. La surcharge n'apparaît pas dans
      `drush cex` et ne pollue pas les fichiers YAML versionnés. Utile pour les
      différences légitimes entre envs (nom du site, hôte SMTP, clés d'API).
  - q: |
      Tu reprends un projet et `drush config:status` montre « Only in DB » pour
      plusieurs configurations. Que fais-tu avant de commencer à travailler ?
    a: |
      Tu exportes d'abord la configuration existante (`drush cex`) et tu commites ces
      fichiers YAML dans Git pour créer une **baseline propre**. Sans ça, le prochain
      `drush cim` sur un autre environnement supprimera toutes les configurations
      « Only in DB » qui n'ont jamais été exportées.
---
