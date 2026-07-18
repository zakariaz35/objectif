---
title: "Cartes mémo — TypoScript"
type: flashcards
cards:
  - q: |
      Que signifie `page = PAGE` dans un fichier TypoScript setup ?
    a: |
      C'est la déclaration de l'**objet racine du rendu frontend**. `page` est la
      variable conventionnelle ; `PAGE` est le type de cObject qui rend une page HTML
      complète. Sans cette ligne, TYPO3 ne sait pas comment démarrer le rendu. Tout ce
      qui suit (`page.10`, `page.includeCSS`…) configure cet objet racine.
  - q: |
      Quelle est la différence entre `constants.typoscript` et `setup.typoscript` ?
    a: |
      - `constants.typoscript` : déclare des variables éditables dans le backend
        (Constants Editor). Exemples : couleur primaire, nombre d'items par page.
      - `setup.typoscript` : la configuration **effective** du rendu. Il peut
        référencer les constantes avec `{$ma.constante}`. Les éditeurs non-techniques
        modifient les constants ; les développeurs modifient le setup.
  - q: |
      À quoi sert `stdWrap.wrap` et quelle est la signification du caractère `|` ?
    a: |
      `wrap` entoure la valeur rendue avec un préfixe et un suffixe séparés par `|`.
      Le `|` est remplacé par la valeur. Ex : `wrap = <p>|</p>` avec `value = Hello`
      produit `<p>Hello</p>`. Si on écrit `wrap = <div class="x">|</div>`, le `|`
      est la position de la valeur entre les deux chaînes.
  - q: |
      Comment déléguer le rendu d'une page à un template Fluid en TypoScript ?
    a: |
      ```typoscript
      page = PAGE
      page.10 = FLUIDTEMPLATE
      page.10 {
          templateName = Default
          templateRootPaths.0 = EXT:my_ext/Resources/Private/Templates/Page/
          partialRootPaths.0  = EXT:my_ext/Resources/Private/Partials/
          layoutRootPaths.0   = EXT:my_ext/Resources/Private/Layouts/
      }
      ```
      `FLUIDTEMPLATE` est le cObject standard depuis TYPO3 8 pour tout rendu Fluid.
  - q: |
      Qu'est-ce que `colPos` dans l'objet CONTENT TypoScript ?
    a: |
      `colPos` est le numéro de **colonne de mise en page** dans laquelle un content
      element a été placé par l'éditeur. La colonne 0 est « Normal » (corps principal),
      1 est conventionnellement « droite », 2 « gauche »… Ces numéros correspondent aux
      colonnes définies dans le backend layout (grille de mise en page).
---

Lis, réfléchis, révèle, auto-évalue.
