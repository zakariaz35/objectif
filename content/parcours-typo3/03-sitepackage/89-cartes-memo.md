---
title: "Cartes mémo — SitePackage"
type: flashcards
cards:
  - q: |
      Pourquoi mettre les templates dans une extension SitePackage plutôt que dans
      `fileadmin/` ?
    a: |
      `fileadmin/` est destiné aux **fichiers des éditeurs** (images, PDF, médias) et
      est souvent exclu de Git. Les templates sont du **code source** : ils doivent être
      versionnés, déployables, et maintenus par les développeurs. Un SitePackage est une
      extension PHP normale avec namespace, autoload et Git. Modifier `fileadmin/`
      directement était l'ancienne pratique (TYPO3 < 9) — ne jamais la reproduire.
  - q: |
      Comment enregistrer une extension locale (dans `packages/`) avec Composer ?
    a: |
      Dans le `composer.json` principal, ajouter un repository de type `path` :
      ```json
      { "repositories": [{ "type": "path", "url": "packages/*" }] }
      ```
      Puis `composer require acme/sitepackage:@dev`. Le `@dev` indique d'utiliser la
      version locale telle quelle, sans contrainte de version.
  - q: |
      Quelle est la différence entre un Layout Fluid, un Template et un Partial ?
    a: |
      - **Layout** : structure HTML globale de la page (`<html>`, `<head>`, `<body>`,
        navigation principale). Réutilisé par tous les templates.
      - **Template** : rendu spécifique d'un type de page ou d'un plugin (ex.
        `Page/Default.html`, `News/List.html`).
      - **Partial** : fragment réutilisable dans plusieurs templates ou layouts (ex.
        menu de navigation, bouton d'appel à l'action).
  - q: |
      Qu'est-ce que `rootPageId` dans `config/sites/<id>/config.yaml` ?
    a: |
      L'`uid` de la **page racine** du site dans l'arbre de pages TYPO3. Toutes les
      pages enfants de cette page appartiennent à ce site. Dans une installation
      multi-sites (plusieurs clients), chaque site a son propre `rootPageId` pointant
      vers une sous-arborescence distincte.
  - q: |
      Qu'est-ce qu'un `routeEnhancer` de type `Extbase` et pourquoi l'utiliser ?
    a: |
      Il transforme les paramètres de plugin Extbase (longs, moches, peu SEO-friendly)
      en URLs propres. Sans lui : `/news?tx_news_pi1[news]=42`. Avec lui :
      `/actualites/mon-titre-darticle`. Il est déclaré dans la Site Configuration
      (YAML), pas dans le TypoScript.
---

Lis, réfléchis, révèle, auto-évalue.
