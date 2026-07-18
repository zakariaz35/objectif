---
title: "Cartes mémo — Extbase & plugins"
type: flashcards
cards:
  - q: |
      En Extbase, comment le mapping entre les colonnes SQL et les propriétés PHP du
      Model est-il déclaré ?
    a: |
      Via le **TCA** (`Configuration/TCA/<table>.php`), pas via des attributs PHP ou
      des annotations Doctrine. Extbase lit le TCA pour savoir quelles colonnes mapper
      sur quelles propriétés. La conversion de casse est automatique : `publish_date`
      (SQL) → `publishDate` (PHP). Ne jamais écrire un `@ORM\Column` en Extbase.
  - q: |
      Quelle est la différence entre `configurePlugin` et `registerPlugin` en Extbase ?
    a: |
      - `configurePlugin` (dans `ext_localconf.php`) : déclare le **comportement** du
        plugin — quels controllers/actions sont disponibles, lesquels sont non-cacheables.
        C'est obligatoire pour que TYPO3 reconnaisse et exécute le plugin.
      - `registerPlugin` (dans `TCA/Overrides/tt_content.php`) : **ajoute le plugin
        dans le sélecteur backend** (liste déroulante « Type de plugin »). Sans lui, le
        plugin tourne mais l'éditeur ne peut pas le choisir dans l'interface.
  - q: |
      Pourquoi déclarer une action comme non-cacheable dans `configurePlugin` ?
    a: |
      Parce que son rendu **dépend de paramètres de requête** (ex. un formulaire, une
      action de traitement, une recherche, une page de pagination par argument GET). Si
      TYPO3 mettait la page en cache, tous les utilisateurs verraient le résultat du
      premier appel. Les actions non-cacheables sont exécutées à chaque requête via un
      `HMENU` ou un `no_cache` partiel.
  - q: |
      Qu'est-ce que `ObjectStorage` et pourquoi doit-il être initialisé dans le
      constructeur d'un Model Extbase ?
    a: |
      `ObjectStorage` est l'équivalent Extbase de `Doctrine\Common\Collections\ArrayCollection` :
      un conteneur lazy-loadé pour les relations. Il doit être instancié dans `__construct()`
      (`$this->tags = new ObjectStorage()`) car Extbase ne le crée pas automatiquement —
      si la propriété est `null` au premier accès avant hydratation, une erreur est levée.
  - q: |
      Comment accéder aux valeurs du FlexForm d'un plugin dans l'ActionController ?
    a: |
      Via `$this->settings['maClef']` — Extbase désérialise automatiquement le XML du
      FlexForm stocké dans `tt_content.pi_flexform` et l'injecte dans `$this->settings`
      si les clés XML du FlexForm suivent la convention `settings.<nomClef>`. Pas besoin
      de parser le XML manuellement.
---

Lis, réfléchis, révèle, auto-évalue.
