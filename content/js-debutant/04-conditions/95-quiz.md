---
title: "Quiz — Conditions"
type: quiz
questions:
  - prompt: |
      Que fait ce code ?

      ```js
      if ([]) {
        console.log("A")
      } else {
        console.log("B")
      }
      ```
    options:
      - |
        Il affiche `A` : un tableau vide `[]` est **truthy**
      - |
        Il affiche `B` : un tableau vide est « vide » donc falsy
      - |
        Il déclenche une erreur
    answer: 0
    explanation: |
      Piège classique en JS : un tableau vide `[]` (et un objet vide `{}`) est **truthy**, donc la branche `if` s'exécute et affiche `A`. Les seules valeurs falsy sont `false`, `0`, `""`, `null`, `undefined` et `NaN`. Pour tester si un tableau est vide, on regarde sa longueur : `if (liste.length === 0)`.
  - prompt: |
      Dans une cascade `if / else if`, pourquoi l'ORDRE des conditions est-il important ?
    options:
      - |
        Parce que JavaScript évalue les conditions en ordre aléatoire
      - |
        Parce que l'exécution s'arrête à la PREMIÈRE condition vraie
      - |
        L'ordre n'a aucune importance
    answer: 1
    explanation: |
      Les conditions sont évaluées de haut en bas et l'exécution s'arrête dès qu'une est vraie. Il faut donc trier du plus restrictif au plus large : si `note >= 12` était testé avant `note >= 16`, une note de 18 serait attrapée trop tôt et n'atteindrait jamais « Très bien ».
  - prompt: |
      Dans un `switch`, qu'arrive-t-il si on oublie le `break` à la fin d'un `case` ?
    options:
      - |
        Le `switch` s'arrête automatiquement de toute façon
      - |
        L'exécution « déborde » et exécute aussi le(s) `case` suivant(s)
      - |
        JavaScript signale une erreur de syntaxe
    answer: 1
    explanation: |
      Sans `break`, l'exécution continue sur le `case` suivant (comportement de « fall-through »), ce qui est un bug fréquent. On peut l'exploiter volontairement pour regrouper des cas (`case "samedi": case "dimanche":`), mais sinon il faut penser au `break` à la fin de chaque bloc.
---

Trois questions sur les décisions : le piège truthy/falsy, l'ordre des `else if`, et le `break` du `switch`.
