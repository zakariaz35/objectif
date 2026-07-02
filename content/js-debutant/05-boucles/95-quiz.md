---
title: "Quiz — Boucles"
type: quiz
questions:
  - prompt: |
      Combien de tours effectue cette boucle, et quelle est la dernière valeur affichée de `i` ?

      ```js
      for (let i = 0; i < 4; i++) {
        console.log(i)
      }
      ```
    options:
      - |
        4 tours, dernière valeur affichée : `4`
      - |
        4 tours, dernière valeur affichée : `3`
      - |
        5 tours, dernière valeur affichée : `4`
    answer: 1
    explanation: |
      La boucle démarre à `i = 0` et continue **tant que** `i < 4`. Elle affiche donc
      `0, 1, 2, 3` : **4 tours**, et la dernière valeur affichée est **`3`**. Quand `i`
      devient `4`, la condition `i < 4` est fausse : on sort **sans** afficher `4`. C'est
      le réflexe « départ à 0 » : `i < n` correspond à `n` tours, de `0` à `n-1`.
  - prompt: |
      Pourquoi ce `while` tourne-t-il à l'infini ?

      ```js
      let n = 0
      while (n < 3) {
        console.log("encore")
      }
      ```
    options:
      - |
        Parce que `while` ne sait pas compter les tours
      - |
        Parce que rien dans le corps ne fait évoluer `n` : `n < 3` reste toujours vrai
      - |
        Parce qu'il faudrait remplacer `<` par `<=`
    answer: 1
    explanation: |
      Une boucle a besoin que **quelque chose fasse progresser l'état vers la condition
      d'arrêt**. Ici `n` vaut toujours `0`, donc `n < 3` reste éternellement vrai. Il
      manque un `n++` (ou `n = n + 1`) dans le corps. Dans un `for`, c'est l'incrément
      `i++` qui joue ce rôle automatiquement — d'où sa relative sécurité.
  - prompt: |
      Tu veux **additionner** tous les montants d'un tableau `ventes`, sans te soucier
      de la position de chaque élément. Quelle écriture est la plus adaptée ?
    options:
      - |
        `for (const montant of ventes) { total += montant }`
      - |
        `if (ventes) { total = ventes }`
      - |
        `while (ventes) { total += ventes }`
    answer: 0
    explanation: |
      Le **`for...of`** parcourt directement chaque valeur du tableau (`≈ foreach` en PHP,
      `for x in ventes` en Python) : c'est le plus lisible quand on n'a pas besoin de
      l'index. Le `if` ne répète rien (ce n'est pas une boucle), et le `while (ventes)`
      proposé n'itère pas sur les éléments et tournerait à l'infini (un tableau non vide
      est toujours *truthy*).
---

Trois questions pour vérifier les réflexes clés : compter les tours (départ à 0), repérer
une boucle infinie, et choisir la bonne boucle pour parcourir un tableau.
