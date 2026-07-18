---
title: "Quiz — Extbase & plugins"
type: quiz
questions:
  - prompt: |
      Un développeur crée un Model Extbase avec une propriété `$publishDate` de type
      `\DateTime`. La colonne SQL correspondante s'appelle `publish_date`. Que doit-il
      faire pour que le mapping fonctionne ?
    options:
      - "Ajouter un attribut PHP #[ORM\\Column(name: 'publish_date')] sur la propriété."
      - "Rien de spécial : Extbase convertit automatiquement publish_date (SQL) en publishDate (PHP) via le TCA."
      - "Déclarer un getter getPublish_date() en snake_case pour forcer le mapping."
      - "Ajouter un fichier Configuration/Extbase/Mapping/Article.yaml décrivant le mapping."
    answer: 1
    tags: [extbase, model, mapping]
    level: debutant
    explanation: >
      Extbase convertit automatiquement les noms de colonnes snake_case en camelCase pour
      les propriétés PHP. `publish_date` → `publishDate` fonctionne sans aucune annotation.
      Le mapping est piloté par le TCA (pas par des attributs Doctrine ni des fichiers YAML
      de mapping — ces approches n'existent pas en Extbase natif).
  - prompt: |
      Quelle méthode d'un Repository Extbase retourne un QueryResult iterable de tous
      les enregistrements non-cachés, non-supprimés d'une table ?
    options:
      - "findAll() — méthode héritée de AbstractRepository, applique automatiquement les filtres hidden/deleted du TCA."
      - "fetchAll() — méthode Doctrine DBAL bas niveau."
      - "getAll() — méthode magique générée par Extbase."
      - "findAll() mais seulement si le Repository est en mode 'ignoreEnableFields'."
    answer: 0
    tags: [extbase, repository]
    level: debutant
    explanation: >
      `findAll()` est héritée de `AbstractRepository` et applique automatiquement les
      contraintes d'activation définies dans `ctrl.enablecolumns` du TCA (hidden, deleted,
      starttime, endtime). C'est la méthode de base — pas besoin de `WHERE deleted=0`.
      `fetchAll()` est DBAL, pas Extbase. Il n'existe pas de `getAll()` magique.
  - prompt: |
      Dans quel fichier enregistre-t-on un plugin Extbase pour qu'il apparaisse dans le
      sélecteur de type de plugin du backend (liste déroulante « Type de plugin ») ?
    options:
      - "ext_localconf.php, via configurePlugin()"
      - "ext_tables.php, via addPlugin()"
      - "Configuration/TCA/Overrides/tt_content.php, via ExtensionUtility::registerPlugin()"
      - "Configuration/Services.yaml, avec un tag 'plugin.registration'"
    answer: 2
    tags: [extbase, plugins, tca]
    level: debutant
    explanation: >
      `registerPlugin()` est appelé dans `Configuration/TCA/Overrides/tt_content.php` —
      c'est l'override TCA qui ajoute l'option dans le sélecteur backend. `configurePlugin()`
      dans `ext_localconf.php` déclare les controllers/actions disponibles (nécessaire aussi,
      mais différent). `ext_tables.php` et `Services.yaml` ne sont pas le bon endroit.
  - prompt: |
      Tu veux que l'action `searchAction` de ton plugin ne soit jamais mise en cache
      (car elle dépend d'un paramètre de recherche GET). Comment le déclares-tu ?
    options:
      - "Dans configurePlugin(), lister searchAction dans le 4e paramètre (non-cacheable actions)."
      - "Ajouter @noCaching dans le docblock de la méthode searchAction."
      - "Préfixer l'action avec _ : _searchAction()."
      - "Dans setup.typoscript, ajouter plugin.tx_monext.no_cache = 1."
    answer: 0
    tags: [extbase, cache, plugins]
    level: intermediaire
    explanation: >
      `configurePlugin()` accepte un 4e paramètre : le tableau des actions non-cacheables.
      Example : `configurePlugin('MonExt', 'Plugin', ['Controller' => 'list, search'],
      ['Controller' => 'search'])`. L'action `search` sera exécutée à chaque requête.
      Il n'existe pas d'annotation `@noCaching` ni de préfixe `_` pour les actions TYPO3.
      TypoScript `no_cache = 1` désactiverait le cache de la page entière, ce qui est
      beaucoup trop agressif.
---

Vérifie ta compréhension d'Extbase avant d'attaquer le déploiement.
