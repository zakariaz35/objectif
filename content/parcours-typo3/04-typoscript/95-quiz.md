---
title: "Quiz — TypoScript"
type: quiz
questions:
  - prompt: |
      Un développeur écrit `page.10 = FLUIDTEMPLATE` dans son setup TypoScript. Que
      signifie le `10` dans cette notation ?
    options:
      - "C'est l'identifiant unique de la page TYPO3 (uid=10)."
      - "C'est un numéro d'ordre : le rendu numéroté 10 est le premier item du PAGE object. D'autres rendus peuvent être ajoutés avec 20, 30…"
      - "C'est obligatoirement 10, c'est une valeur fixe dans le core."
      - "C'est la colonne CSS grid où le template sera rendu."
    answer: 1
    tags: [typoscript, cobject, page]
    level: debutant
    explanation: >
      Dans un cObject de type PAGE (ou COA), les propriétés numériques sont des
      rendus ordonnés. `10` est simplement le premier dans l'ordre (10, 20, 30…).
      Cette convention laisse de la place pour insérer des éléments entre deux
      rendus existants (ex. ajouter un `15` entre `10` et `20`) sans renuméroter.
      Ce n'est pas un uid de page ni une colonne CSS.
  - prompt: |
      Quelle propriété stdWrap permet de récupérer la valeur d'un champ de la base
      de données (record courant, ex. le titre de la page actuelle) ?
    options:
      - "stdWrap.value = title"
      - "stdWrap.data = page:title"
      - "stdWrap.field = title"
      - "stdWrap.get = title"
    answer: 2
    tags: [typoscript, stdwrap]
    level: debutant
    explanation: >
      `stdWrap.field = title` lit le champ `title` du record courant (la page en cours
      de rendu dans ce contexte). `data = page:title` serait aussi valide avec la
      syntaxe `data`, mais `field` est la propriété la plus directe pour lire un champ
      du record principal. `value` impose une valeur statique, `get` n'existe pas.
  - prompt: |
      Comment inclure un fichier TypoScript externe dans un autre fichier setup en
      TYPO3 12 ?
    options:
      - "<INCLUDE_TYPOSCRIPT: source=\"FILE:EXT:my_ext/Config/setup.typoscript\">"
      - "@import 'EXT:my_ext/Configuration/TypoScript/setup.typoscript'"
      - "include(EXT:my_ext/Configuration/TypoScript/setup.typoscript)"
      - "require_once 'EXT:my_ext/Configuration/TypoScript/setup.typoscript'"
    answer: 1
    tags: [typoscript, import]
    level: debutant
    explanation: >
      Depuis TYPO3 9, la syntaxe `@import` est le standard pour inclure des fichiers
      TypoScript. Elle supporte les wildcards (`*.typoscript`). L'ancienne syntaxe
      `<INCLUDE_TYPOSCRIPT:...>` est dépréciée depuis TYPO3 10. `include()` et
      `require_once` sont du PHP, pas du TypoScript.
  - prompt: |
      Un éditeur veut modifier le nombre d'actualités affichées par page (valeur
      exposée dans le Constants Editor). Où cette valeur doit-elle être déclarée ?
    options:
      - "Dans le fichier setup.typoscript directement, comme valeur fixe."
      - "Dans le fichier constants.typoscript, puis référencée dans setup.typoscript avec {$...}."
      - "Dans la table tt_content en base de données."
      - "Dans le fichier .env du serveur."
    answer: 1
    tags: [typoscript, constants]
    level: debutant
    explanation: >
      Les valeurs que les éditeurs/administrateurs doivent pouvoir modifier sans
      toucher au code source se déclarent dans `constants.typoscript`. Elles
      apparaissent alors dans le Constants Editor du backend (Web > Template > Edit
      Constants). Dans `setup.typoscript`, on les référence avec `{$chemin.de.la.constante}`.
  - prompt: |
      Quel cObject TypoScript est utilisé pour rendre les content elements d'une
      colonne de page ?
    options:
      - "FLUIDTEMPLATE avec `templateName = ContentColumn`"
      - "USER avec une userFunc personnalisée"
      - "CONTENT avec `table = tt_content` et `select.where = {#colPos} = 0`"
      - "RECORDS avec un UID de page"
    answer: 2
    tags: [typoscript, content, cobject]
    level: intermediaire
    explanation: >
      `CONTENT` est le cObject dédié à récupérer et rendre des enregistrements d'une
      table. Pour les content elements, on cible `tt_content` et on filtre par colonne
      avec `select.where = {#colPos} = 0` (colonne 0 = corps principal). `FLUIDTEMPLATE`
      rend un template mais ne récupère pas automatiquement les content elements.
      `RECORDS` récupère des enregistrements spécifiques par UID, pas par colonne.
---

Vérifie ta compréhension de TypoScript avant d'attaquer Fluid.
