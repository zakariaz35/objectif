---
title: "Cartes mémo — Montées de version & pièges"
type: flashcards
cards:
  - q: |
      Quelle est la première commande à lancer en reprenant un projet Drupal en agence ?
    a: |
      `drush status` pour vérifier les versions (PHP, Drupal, DB), suivi de
      `drush config:status` pour voir l'état de la configuration. Ces deux commandes
      donnent une vue immédiate de la santé du projet avant de toucher à quoi que
      ce soit.
  - q: |
      Comment corriger un fichier `web/core/` modifié en dehors de Composer ?
    a: |
      Identifier la modification (`git diff`), trouver l'issue Drupal correspondante,
      générer un fichier patch, utiliser `cweagans/composer-patches` pour l'appliquer
      via `composer.json`. Réinitialiser le fichier core à sa version originale
      (`git checkout web/core/...`). Le patch sera appliqué automatiquement à chaque
      `composer install`.
  - q: |
      Quelle est la version PHP minimale requise par Drupal 11 ?
    a: |
      **PHP 8.3** minimum. Drupal 10 supportait PHP 8.1+. Vérifier toujours
      la compatibilité PHP avant de lancer une montée de version majeure —
      c'est souvent le premier blocage en prod.
  - q: |
      Quel outil automatise la correction des appels deprecated avant une montée de
      version Drupal ?
    a: |
      **Drupal Rector** (`palantirnet/drupal-rector`) — analyse le code custom et
      applique automatiquement les correctifs pour les deprecated courants (annotations
      → attributs, appels d'API obsolètes, interfaces renommées…). À utiliser avant
      toute montée de version majeure. Compléter avec `phpstan-drupal` pour les
      deprecated non corrigibles automatiquement.
  - q: |
      Pourquoi ne doit-on jamais commiter `web/sites/default/settings.php` avec les
      credentials en clair ?
    a: |
      Le settings.php contient les credentials de base de données, le hash_salt et
      parfois des clés d'API. Si le dépôt est partagé ou expose la configuration
      entre environnements (dev/staging/prod), cela crée une faille de sécurité
      critique. La bonne pratique : settings.php lit les credentials via `getenv()`,
      les valeurs réelles sont dans les variables d'environnement du serveur ou
      dans un `.env` non commité.
---
