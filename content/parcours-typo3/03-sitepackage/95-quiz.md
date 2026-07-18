---
title: "Quiz — SitePackage"
type: quiz
questions:
  - prompt: |
      Quel est le rôle principal d'un sitepackage dans une installation TYPO3 ?
    options:
      - "C'est une extension Composer tierce qui ajoute un thème CSS prêt à l'emploi."
      - "C'est l'extension locale qui encapsule toute la configuration du site : templates Fluid, TypoScript, assets et TCA overrides."
      - "C'est un dossier spécial du core TYPO3 réservé aux fichiers statiques."
      - "C'est un plugin Extbase qui gère l'authentification des éditeurs."
    answer: 1
    tags: [sitepackage, architecture]
    level: debutant
    explanation: >
      Le sitepackage est une extension TYPO3 ordinaire (avec `ext_emconf.php` ou
      `composer.json`) que l'équipe projet crée pour y centraliser tout ce qui est
      spécifique au site : templates Fluid, TypoScript setup/constants, assets (CSS, JS,
      images), overrides TCA et configuration de backend layouts. Ce n'est pas une
      extension tierce ni un dossier core — c'est la convention agence pour séparer
      « configuration du site » des « fonctionnalités de plugins ».
  - prompt: |
      Dans la structure d'un sitepackage TYPO3, où se trouvent les fichiers de templates
      Fluid des pages (layouts, partials, templates) ?
    options:
      - "public/templates/, public/layouts/, public/partials/"
      - "Resources/Public/Templates/, Resources/Public/Layouts/, Resources/Public/Partials/"
      - "Resources/Private/Templates/, Resources/Private/Layouts/, Resources/Private/Partials/"
      - "Configuration/Templates/, Configuration/Layouts/, Configuration/Partials/"
    answer: 2
    tags: [sitepackage, fluid, structure]
    level: debutant
    explanation: >
      Par convention TYPO3, tout ce qui ne doit pas être accessible directement par le
      navigateur est dans `Resources/Private/`. Les templates Fluid (Templates, Layouts,
      Partials) sont donc dans `Resources/Private/Templates/`, `Resources/Private/Layouts/`
      et `Resources/Private/Partials/`. Les fichiers accessibles publiquement (CSS, JS,
      images compilées) vont dans `Resources/Public/`.
  - prompt: |
      À quel endroit se trouve le fichier de Site Configuration qui déclare le domaine,
      les langues et les routeEnhancers d'un site TYPO3 ?
    options:
      - "packages/acme_sitepackage/Configuration/Sites/config.yaml"
      - "config/sites/<identifier>/config.yaml à la racine du projet"
      - "public/typo3conf/sites/<identifier>/config.yaml"
      - "vendor/typo3/cms-core/Configuration/Sites/config.yaml"
    answer: 1
    tags: [sitepackage, site-configuration, yaml]
    level: debutant
    explanation: >
      La Site Configuration est stockée dans `config/sites/<identifier>/config.yaml`
      à la racine du projet Composer (au même niveau que `composer.json`). L'identifiant
      est un slug libre (ex. `acme`, `acme-fr`). Ce fichier est versionné dans Git — c'est
      de la configuration d'infrastructure, pas du contenu. Il ne se trouve pas à
      l'intérieur du sitepackage lui-même.
  - prompt: |
      Un routeEnhancer de type `Extbase` est déclaré dans la Site Configuration. Quel
      est son effet sur les URLs du site ?
    options:
      - "Il redirige les requêtes HTTP vers HTTPS automatiquement."
      - "Il transforme les URLs techniques des plugins Extbase (avec paramètres GET) en URLs propres lisibles."
      - "Il active le multilingue en ajoutant un préfixe de langue à toutes les URLs."
      - "Il enregistre l'extension Extbase dans le backend TYPO3."
    answer: 1
    tags: [sitepackage, route-enhancers, extbase]
    level: intermediaire
    explanation: >
      Sans routeEnhancer, une page de détail Extbase produit une URL comme
      `/news?tx_news_pi1[action]=detail&tx_news_pi1[news]=42`. Un routeEnhancer `Extbase`
      déclaré dans `config/sites/<id>/config.yaml` transforme cela en `/news/titre-article`.
      Il n'a pas de rôle dans la redirection HTTPS (géré par le serveur web), ni dans
      l'activation multilingue (gérée par la section `languages`), ni dans
      l'enregistrement backend (géré par `registerPlugin`).
  - prompt: |
      Quelle est la différence principale entre un sitepackage et une extension de plugin
      (ex. acme_blog) dans une architecture TYPO3 agence ?
    options:
      - "Le sitepackage contient le code PHP métier (Models, Controllers, Repositories) ; l'extension de plugin contient les templates."
      - "Le sitepackage encapsule la présentation et la configuration du site (templates, TS, assets) ; l'extension de plugin fournit la logique métier (MVC, TCA, BDD)."
      - "Il n'y a pas de différence, c'est juste une convention de nommage."
      - "Le sitepackage est installé via Composer, l'extension de plugin est copiée manuellement dans typo3conf/ext/."
    answer: 1
    tags: [sitepackage, extbase, architecture]
    level: intermediaire
    explanation: >
      La séparation standard en agence TYPO3 est : le sitepackage (`acme_sitepackage`)
      contient tout ce qui concerne la présentation — templates Fluid, TypoScript, backend
      layouts, CSS/JS, overrides TCA cosmétiques — et ne change que si le design du site
      change. Les extensions métier (`acme_blog`, `acme_news`) contiennent Models,
      Controllers, Repositories, TCA propre et migrations BDD. Cette séparation facilite
      la refonte graphique (nouveau sitepackage) sans toucher à la logique métier.
---
