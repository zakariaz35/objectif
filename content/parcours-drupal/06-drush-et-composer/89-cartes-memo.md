---
title: "Cartes mémo — Drush & Composer"
type: flashcards
cards:
  - q: |
      Quelle est la différence entre `drush pm:enable my_module` et
      `composer require drupal/my_module` ?
    a: |
      `composer require` télécharge et installe le **code PHP** dans `vendor/` ou
      `web/modules/contrib/`. `drush pm:enable` **active le module dans Drupal** :
      exécute `hook_install()`, crée les tables, met à jour `core.extension.yml`.
      Les deux étapes sont obligatoires dans cet ordre. `drush pm:enable` seul
      échoue si le code n'est pas présent.
  - q: |
      Pourquoi ne faut-il jamais commiter `web/modules/contrib/` dans Git ?
    a: |
      Ces fichiers sont gérés par Composer — ils sont dérivés de `composer.lock`.
      Les commiter dans Git crée des conflits, alourdit le dépôt inutilement, et
      rend les mises à jour de modules dangereuses (conflit entre Git et Composer).
      Le `composer.lock` suffit à garantir des builds reproductibles.
  - q: |
      Comment appliquer un patch de l'issue Drupal #3456789 sur le core sans modifier
      les fichiers de `web/core/` ?
    a: |
      Via `cweagans/composer-patches` : ajouter la section `patches` dans
      `composer.json` avec l'URL ou le chemin local du patch, et exécuter
      `composer install`. Le patch est appliqué automatiquement à chaque installation
      ou mise à jour. Documenter l'issue Drupal en commentaire pour faciliter la
      suppression quand le bug est corrigé upstream.
  - q: |
      Que fait `drush user:login` et dans quel contexte l'utiliser ?
    a: |
      Génère un **lien de connexion temporaire** (one-time login) pour l'admin,
      sans connaître le mot de passe. Très utile en dev/staging pour accéder
      rapidement à l'interface admin d'un site fraîchement installé ou après une
      migration de base. À ne jamais utiliser en prod sans raison valable (le lien
      expire après utilisation).
  - q: |
      Quelle commande vérifie si la configuration en base de données diverge des
      fichiers YAML exportés ?
    a: |
      `drush config:status` — affiche les différences entre la config active (base)
      et les fichiers de `config/sync/`. Les statuts possibles : « Only in DB »,
      « Only in sync dir », « Different », « Identical ». À lancer en priorité lors
      de toute reprise de projet.
---
