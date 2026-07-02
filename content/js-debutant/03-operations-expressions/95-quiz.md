---
title: "Quiz — Opérations & expressions"
type: quiz
questions:
  - prompt: |
      Que vaut l'expression `5 === "5"` en JavaScript ?
    options:
      - |
        `true`
      - |
        `false`
      - |
        Une erreur de type
    answer: 1
    explanation: |
      `===` est l'égalité **stricte** : elle ne convertit pas les types. Un `number` (`5`) et une `string` (`"5"`) sont de types différents, donc le résultat est `false`. À l'inverse, `5 == "5"` vaudrait `true` (le `==` convertit `"5"` en `5` avant de comparer) — c'est justement pour éviter ces surprises qu'on privilégie `===`.
  - prompt: |
      Que vaut `7 % 3` ?
    options:
      - |
        `2.333...`
      - |
        `2`
      - |
        `1`
    answer: 2
    explanation: |
      `%` est le **modulo** : il renvoie le **reste** de la division entière. 7 = 2 × 3 + 1, donc `7 % 3` vaut `1`. (La division décimale `7 / 3`, elle, donnerait `2.333…`.) Le modulo sert souvent à tester la parité : `n % 2 === 0` est vrai si `n` est pair.
  - prompt: |
      Pourquoi `0.1 + 0.2 === 0.3` renvoie-t-il `false` ?
    options:
      - |
        C'est un bug spécifique à JavaScript
      - |
        Parce que les nombres à virgule sont stockés de façon approximative (IEEE 754), comme dans la plupart des langages
      - |
        Parce qu'il faut utiliser `==` pour les décimaux
    answer: 1
    explanation: |
      Ce n'est pas propre à JS : la norme **IEEE 754** (utilisée aussi par Python, Java, Excel…) ne peut pas représenter exactement certains décimaux comme `0.1`. Le résultat est `0.30000000000000004`, donc différent de `0.3`. On ne compare donc jamais deux flottants avec `===` : on arrondit à l'affichage (`toFixed`) ou on raisonne en entiers (centimes).
---

Trois pièges classiques des opérations en JavaScript : l'égalité stricte, le modulo, et l'imprécision des flottants.
