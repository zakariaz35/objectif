---
title: "Quiz — Variables & types"
type: quiz
questions:
  - prompt: "Après `let a = 3 ; let b = a ; b = 9`, que vaut `a` ?"
    options:
      - "9"
      - "3"
      - "undefined"
    answer: 1
    explanation: "`a` est un primitif (`number`) : `b = a` copie la **valeur**. Modifier `b` n'a aucun effet sur `a`, qui reste `3`."
  - prompt: "Après `const o1 = { x: 1 } ; const o2 = o1 ; o2.x = 9`, que vaut `o1.x` ?"
    options:
      - "1"
      - "9"
      - "Erreur : o1 est une const"
    answer: 1
    explanation: "Un objet est partagé **par référence** : `o2 = o1` copie l'adresse de la boîte, pas son contenu. `o1` et `o2` désignent la même boîte, donc `o1.x` vaut `9`. `const` fige l'étiquette, pas le contenu."
  - prompt: "Que renvoie `typeof []` en JavaScript ?"
    options:
      - "\"array\""
      - "\"object\""
      - "\"list\""
    answer: 1
    explanation: "En JS, un tableau **est** un objet : `typeof []` vaut `\"object\"`. Pour tester un tableau, on utilise `Array.isArray(x)`."
---

Teste ta compréhension des variables, des types et — surtout — de la différence valeur vs référence.
