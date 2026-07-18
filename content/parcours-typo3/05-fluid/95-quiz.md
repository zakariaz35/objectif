---
title: "Quiz — Fluid"
type: quiz
questions:
  - prompt: |
      Quelle est la syntaxe Fluid pour afficher le contenu d'une variable `{title}`
      en l'échappant contre les injections XSS ?
    options:
      - "{title | escape}"
      - "{title -> f:format.htmlSpecialChars()}"
      - "{title} directement — Fluid échappe automatiquement les variables."
      - "<f:escape>{title}</f:escape>"
    answer: 2
    tags: [fluid, securite, output]
    level: debutant
    explanation: >
      Fluid échappe automatiquement toutes les variables affichées avec `{variable}`.
      C'est l'inverse de Twig où `{{ variable }}` est auto-échappé mais `{{ variable | raw }}`
      ne l'est pas. En Fluid, pour afficher du HTML brut (non échappé), il faut
      explicitement utiliser `<f:format.raw>{variable}</f:format.raw>` ou le pipe
      `{variable -> f:format.raw()}`. L'auto-échappement est activé par défaut.
  - prompt: |
      Comment passer un argument nommé à un Partial Fluid lors de son inclusion ?
    options:
      - "<f:render partial=\"Navigation/Main\" with=\"{items: items, title: pageTitle}\" />"
      - "<f:render partial=\"Navigation/Main\" arguments=\"{items: items, title: pageTitle}\" />"
      - "<f:include partial=\"Navigation/Main\" items=\"{items}\" title=\"{pageTitle}\" />"
      - "<partial name=\"Navigation/Main\" items=\"{items}\" />"
    answer: 1
    tags: [fluid, partials, arguments]
    level: debutant
    explanation: >
      `<f:render>` avec `arguments="{...}"` est la syntaxe correcte pour passer des
      variables à un partial. `with` n'est pas un attribut valide de `<f:render>` en Fluid.
      `<f:include>` n'existe pas. Les attributs libres sur `<f:render>` ne sont pas
      des passages d'arguments.
  - prompt: |
      Quelle est la syntaxe du « pipe » Fluid pour chaîner deux ViewHelpers sur une
      variable (ex. formater une date puis la tronquer) ?
    options:
      - "{date | f:format.date(format: 'd/m/Y') | f:format.crop(maxChars: 10)}"
      - "{date -> f:format.date(format: 'd/m/Y') -> f:format.crop(maxChars: 10)}"
      - "<f:pipe value=\"{date}\"><f:format.date /></f:pipe>"
      - "{date|date('d/m/Y')|truncate(10)}"
    answer: 1
    tags: [fluid, viewhelpers, pipe]
    level: intermediaire
    explanation: >
      Le pipe Fluid utilise `->` (et non `|` comme en Twig). On enchaîne les ViewHelpers
      de gauche à droite : la sortie du premier devient l'entrée du second. La syntaxe
      `{variable -> vh1() -> vh2()}` est valide et lisible. Les syntaxes avec `|` (Twig)
      ou `<f:pipe>` n'existent pas en Fluid.
  - prompt: |
      Dans un template Fluid, comment déclarer qu'il utilise le Layout nommé « Default » ?
    options:
      - "<f:use layout=\"Default\" />"
      - "<html xmlns:f=\"http://typo3.org/ns/TYPO3/CMS/Fluid/ViewHelpers\" data-namespace-typo3-fluid=\"true\"> <f:layout name=\"Default\" /></html>"
      - "<f:layout name=\"Default\" /> au début du template."
      - "layout: Default dans le front-matter YAML du fichier."
    answer: 2
    tags: [fluid, layouts, templates]
    level: debutant
    explanation: >
      `<f:layout name="Default" />` au début du template suffit pour déclarer le Layout.
      TYPO3 cherchera alors `Resources/Private/Layouts/Default.html`. La balise `<f:use>`
      n'existe pas. Les layouts ne se déclarent pas en YAML front-matter (Fluid n'utilise
      pas de front-matter). La version complète avec xmlns est valide mais non requise
      — elle sert uniquement pour l'auto-complétion dans les IDE.
  - prompt: |
      Tu veux rendre du HTML brut (déjà échappé, provenant d'un champ RTE) dans un
      template Fluid sans double-échappement. Quelle est la syntaxe correcte ?
    options:
      - "{bodytext}"
      - "{bodytext -> f:format.raw()}"
      - "<f:format.html>{bodytext}</f:format.html>"
      - "<f:format.rawHtml value=\"{bodytext}\" />"
    answer: 1
    tags: [fluid, format, rte]
    level: debutant
    explanation: >
      `{bodytext -> f:format.raw()}` désactive l'auto-échappement pour cette variable.
      `{bodytext}` seul double-échapperait le HTML (les `<` deviendraient `&lt;`).
      `<f:format.html>` parse et nettoie le HTML selon une configuration RTE mais ne fait
      pas que le passer tel quel. `<f:format.rawHtml>` n'existe pas en Fluid core.
---

Vérifie ta compréhension de Fluid avant d'attaquer le TCA.
