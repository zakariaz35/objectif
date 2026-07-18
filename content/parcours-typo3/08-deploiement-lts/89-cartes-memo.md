---
title: "Cartes mémo — Déploiement & LTS"
type: flashcards
cards:
  - q: |
      Quelle version TYPO3 est actuellement LTS (juillet 2026) et jusqu'à quand est-elle
      supportée ?
    a: |
      **TYPO3 12.4 LTS** — support jusqu'en **octobre 2026**. TYPO3 13 LTS (sorti octobre
      2024) est la prochaine LTS active. Les projets sur TYPO3 10 ou 11 sont EOL (end
      of life) : aucun correctif de sécurité. Les faire monter vers 12 ou 13 est urgent.
  - q: |
      Quelle est la première commande CLI à lancer après un `composer update` d'une
      montée de version TYPO3 ?
    a: |
      ```bash
      vendor/bin/typo3 upgrade:run --all   # run all upgrade wizards
      vendor/bin/typo3 database:updateschema  # apply DB schema changes
      vendor/bin/typo3 cache:flush            # flush all caches
      ```
      Dans cet ordre : wizards d'abord (ils transforment les données), puis schéma BDD
      (ajoute/modifie les colonnes), puis vider le cache (indispensable après tout changement).
  - q: |
      Qu'est-ce que le fichier `ENABLE_INSTALL_TOOL` et quel est le risque de le
      laisser en place en production ?
    a: |
      C'est un **flag de déverrouillage de l'Install Tool** : sa présence dans
      `public/typo3conf/` rend l'Install Tool accessible sans authentification backend.
      En production, n'importe qui connaissant l'URL `/typo3/install.php` pourrait
      accéder aux opérations de maintenance (reset de mot de passe admin, flush BDD…).
      Le supprimer après chaque opération d'installation/maintenance.
  - q: |
      Sur une reprise de projet TYPO3 legacy, tu trouves des extensions dans
      `typo3conf/ext/` sans `composer.json`. Quelle est la procédure de migration ?
    a: |
      1. Créer un `composer.json` de type `typo3-cms-extension` dans chaque extension.
      2. Déplacer les extensions dans `packages/`.
      3. Ajouter un repository `type: path` dans `composer.json` principal.
      4. `composer require acme/my-extension:@dev` pour les enregistrer.
      5. `vendor/bin/typo3 extension:setup` pour les activer proprement.
  - q: |
      Qu'est-ce qu'un `routeEnhancer` de type `Extbase` et pourquoi remplace-t-il
      RealURL sur les projets TYPO3 ≥ 10 ?
    a: |
      C'est la **configuration native TYPO3** (depuis v10) pour générer des URLs propres
      à partir des paramètres de plugins Extbase. Elle se déclare dans la Site
      Configuration YAML, sans extension tierce. RealURL (extension legacy) était la
      solution avant v10 — complexe, difficile à maintenir et incompatible avec la
      nouvelle API Site. Sur toute migration ≥ v10 : supprimer RealURL et migrer vers
      les `routeEnhancers`.
---

Lis, réfléchis, révèle, auto-évalue.
