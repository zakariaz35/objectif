---
title: "Cartes mémo — Architecture TYPO3"
type: flashcards
cards:
  - q: |
      En TYPO3, à quoi sert la table `pages` et quel est son équivalent Symfony ?
    a: |
      Elle stocke **chaque entrée de l'arbre de pages** : titre, slug, langue, layout,
      état de publication. Il n'y a pas d'équivalent direct en Symfony — c'est la
      combinaison de `config/routes.yaml` + une table de contenu + les menus de
      navigation, tout réuni dans un seul arbre persisté en BDD.
  - q: |
      Qu'est-ce que le « Composer mode » en TYPO3 et pourquoi est-il le standard depuis v10 ?
    a: |
      En Composer mode, le core TYPO3 et les extensions sont gérés comme des dépendances
      Composer normales (dans `vendor/`). Le document root est `public/`. Cela permet de
      **versionner les dépendances**, d'automatiser les mises à jour, et d'utiliser les
      outils PHP standard (Deployer, CI/CD). Le mode « classic » (sans Composer) est
      considéré legacy depuis TYPO3 10.
  - q: |
      Quelle est la différence entre `Configuration/TCA/ma_table.php` et
      `Configuration/TCA/Overrides/tt_content.php` ?
    a: |
      - `Configuration/TCA/ma_table.php` : définit le TCA **complet** d'une **nouvelle table**
        que ton extension crée.
      - `Configuration/TCA/Overrides/tt_content.php` : **surcharge** le TCA d'une table
        existante (core ou autre extension). C'est le seul moyen propre d'ajouter des
        champs à `tt_content`, `pages`, etc. sans casser les mises à jour.
  - q: |
      Cite les trois fichiers chargés au bootstrap de TYPO3 (avant chaque requête) et
      leur rôle respectif.
    a: |
      1. `ext_localconf.php` : enregistrement des plugins, hooks, icônes — chargé tôt,
         avant la base de données.
      2. Fichiers `Configuration/TCA/` : définissent la structure des tables (mis en cache).
      3. `Configuration/TCA/Overrides/` : appliquent les surcharges dans l'ordre des
         extensions. Le TypoScript, lui, n'est résolu qu'à la requête frontend.
  - q: |
      Première action réflexe sur n'importe quel projet TYPO3 qui bug ?
    a: |
      **Vider le cache** : `vendor/bin/typo3 cache:flush` en CLI, ou Maintenance >
      Flush All Caches dans le backend. TYPO3 met en cache les TCA, le TypoScript, les
      routes — un cache périmé explique 40 % des comportements inexpliqués sur une reprise.
---

Lis, réfléchis, révèle, auto-évalue.
