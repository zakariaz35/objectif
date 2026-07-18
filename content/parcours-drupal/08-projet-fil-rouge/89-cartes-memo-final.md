---
title: "Cartes mémo — Récapitulatif parcours Drupal"
type: flashcards
cards:
  - q: |
      Cite les 4 mécanismes d'extension de Drupal et pour quel usage chacun est
      approprié.
    a: |
      1. **Services DI** — logique métier injectable, testable unitairement (service métier, repository…)
      2. **Hooks** — points d'extension procéduraux du noyau (`hook_form_alter`, `hook_theme`, `hook_install`…)
      3. **EventSubscribers** — réaction aux événements Symfony (préférer aux hooks pour le nouveau code)
      4. **Plugins** — famille de composants interchangeables (blocs, formatters, widgets, QueueWorkers…)
  - q: |
      Résume le cycle de vie d'une requête Drupal en 5 étapes.
    a: |
      1. `index.php` crée un `DrupalKernel` et le `Request` Symfony
      2. `DrupalKernel::boot()` initialise le container DI et charge les modules
      3. Le routeur Symfony (`UrlMatcher`) trouve la route correspondante
      4. Le controller est invoqué — retourne un render array ou une Response
      5. Le système de rendu convertit le render array en HTML (cache, Twig, assets)
  - q: |
      Quelle est la séquence de déploiement Drupal en 4 étapes ?
    a: |
      1. `composer install` — code PHP
      2. `drush cim` — configuration
      3. `drush updb` — mises à jour de base de données
      4. `drush cr` — vide les caches
      Dans cet ordre strict, sans exception.
  - q: |
      Comment structurer un module custom d'agence pour faciliter la maintenabilité ?
    a: |
      Un seul module `client_core` avec : logique métier dans `src/Service/` (injectable),
      blocs dans `src/Plugin/Block/` (plugin), reactions événementielles dans
      `src/EventSubscriber/`, hooks procéduraux minimaux dans `.module`, configuration
      dans `config/install/`. Éviter les micro-modules multiples qui fragmentent la
      logique et compliquent la reprise.
  - q: |
      Pourquoi préférer `EntityQuery` avec `->accessCheck(TRUE)` plutôt qu'une requête
      SQL directe ?
    a: |
      `EntityQuery` applique les **contrôles d'accès** Drupal (rôles, permissions,
      modules access control), utilise le **cache statique** d'entités (évite les
      rechargements), et reste agnostique du schéma SQL (qui peut changer entre
      versions). Une requête SQL brute contourne toute sécurité et peut retourner du
      contenu que l'utilisateur courant n'a pas le droit de voir.
---
