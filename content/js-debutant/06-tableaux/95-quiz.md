---
title: "Quiz — Tableaux"
type: quiz
questions:
  - prompt: |
      Soit le tableau suivant. Que vaut `villes[villes.length - 1]` ?

      ```js
      const villes = ["Paris", "Lyon", "Nice", "Brest"]
      ```
    options:
      - |
        `"Brest"` (le dernier élément)
      - |
        `"Nice"`
      - |
        `undefined`, car `length` vaut 4 et il n'y a pas de case 4
    answer: 0
    explanation: |
      Le tableau a **4** éléments, donc `length` vaut `4`. Comme l'index commence à **0**,
      la dernière case est à l'index `length - 1 = 3`, soit `"Brest"`. C'est le réflexe à
      garder : dernier élément = `t[t.length - 1]`. En revanche `villes[4]` (l'index égal
      à `length`) vaudrait `undefined` : cette case n'existe pas.
  - prompt: |
      Quelle méthode faut-il utiliser pour obtenir un **nouveau tableau plus court** ne
      gardant que les montants supérieurs à 100 ?

      ```js
      const ventes = [120, 80, 45, 200, 30]
      ```
    options:
      - |
        `ventes.map((m) => m > 100)`
      - |
        `ventes.filter((m) => m > 100)`
      - |
        `ventes.reduce((s, m) => s + m, 0)`
    answer: 1
    explanation: |
      **`filter`** garde uniquement les éléments qui passent le test → `[120, 200]`. `map`
      transformerait chaque élément **sans changer la taille** (il renverrait ici
      `[true, false, false, true, false]`). `reduce` condense tout le tableau en **une
      seule** valeur (une somme, par exemple). Chacun répond à une question différente :
      garder, transformer, réduire.
  - prompt: |
      Après ce code, que contient `panier` ?

      ```js
      const panier = ["pain", "lait"]
      panier.push("œufs")
      panier.pop()
      ```
    options:
      - |
        `["pain", "lait", "œufs"]`
      - |
        `["pain", "lait"]`
      - |
        Erreur : on ne peut pas modifier un tableau déclaré avec `const`
    answer: 1
    explanation: |
      `push("œufs")` ajoute à la fin → `["pain", "lait", "œufs"]`, puis `pop()` retire le
      dernier → on revient à `["pain", "lait"]`. Et non, pas d'erreur : `const` fige
      l'**étiquette** de la variable, pas le **contenu** du tableau. On peut donc
      `push`/`pop` sur un tableau `const` sans problème.
---

Trois questions pour ancrer l'essentiel : l'index à partir de 0 (et le dernier élément),
le rôle de `filter` face à `map`/`reduce`, et le fait qu'un tableau `const` reste
modifiable.
