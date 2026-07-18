---
title: "Cartes mémo — Fluid"
type: flashcards
cards:
  - q: |
      Quelle est la syntaxe Fluid équivalente à `{% if items|length > 0 %}` en Twig ?
    a: |
      ```html
      <f:if condition="{items -> f:count()} > 0">
          ...
      </f:if>
      ```
      Ou avec then/else :
      ```html
      <f:if condition="{items -> f:count()} > 0">
          <f:then>...</f:then>
          <f:else>No items found.</f:else>
      </f:if>
      ```
  - q: |
      Comment déclarer et utiliser un ViewHelper custom dans un template Fluid ?
    a: |
      1. Créer la classe dans `Classes/ViewHelpers/` avec le namespace PHP de l'extension.
      2. Importer le namespace en haut du template :
         `{namespace acme=Acme\Sitepackage\ViewHelpers}`
      3. Utiliser comme balise : `<acme:nomViewHelper arg="valeur" />`
      Le nom de la balise est dérivé du nom de classe en camelCase → kebab-case.
  - q: |
      Quelle est la différence entre `<f:render partial="...">` et
      `<f:render section="...">`  ?
    a: |
      - `<f:render partial="Navigation/Main" />` : inclut un **fichier Partial** externe
        (dans `Resources/Private/Partials/Navigation/Main.html`).
      - `<f:render section="Main" />` : rend une **section nommée** définie dans le même
        fichier (ou dans le template enfant, quand appelé depuis un Layout).
        C'est le mécanisme d'héritage Fluid : le Layout appelle `<f:render section="Main" />`
        et le Template implémente `<f:section name="Main">`.
  - q: |
      Comment générer un lien vers une page TYPO3 dans Fluid (équivalent `path()` Symfony) ?
    a: |
      ```html
      <!-- Full link with <a> tag -->
      <f:link.page pageUid="42">My link</f:link.page>

      <!-- URL only (for href or src attribute) -->
      <a href="{f:uri.page(pageUid: 42)}">My link</a>

      <!-- With plugin parameters -->
      <f:link.page pageUid="{detailPage}"
                   additionalParams="{tx_news_pi1: {news: article.uid}}">
          Read more
      </f:link.page>
      ```
---

Lis, réfléchis, révèle, auto-évalue.
