---
title: "Quiz — Fonctions"
type: quiz
questions:
  - prompt: |
      Que vaut `resultat` après ce code ?

      ```js
      function appliquerRemise(montant, pourcentage) {
        if (pourcentage <= 0) {
          return montant
        }
        return montant * (1 - pourcentage / 100)
      }

      const resultat = appliquerRemise(200, 0)
      ```
    options:
      - |
        `200` : le premier `return` a arrêté la fonction avant le calcul de remise
      - |
        `0` : une remise de 0 % ramène le montant à zéro
      - |
        `undefined` : la fonction ne renvoie rien quand le pourcentage vaut 0
    answer: 0
    explanation: |
      `pourcentage` vaut `0`, donc la condition `pourcentage <= 0` est **vraie** : la ligne
      `return montant` s'exécute et **arrête** aussitôt la fonction. La seconde ligne
      (`return montant * ...`) n'est **jamais** atteinte. C'est tout l'intérêt du `return`
      précoce : traiter un cas particulier et sortir. Résultat : `200`, le montant inchangé.
  - prompt: |
      Ces deux écritures sont-elles équivalentes ?

      ```js
      function doubler(x) {
        return x * 2
      }

      const doubler2 = (x) => x * 2
      ```
    options:
      - |
        Non : la fonction fléchée ne renvoie rien car il manque le mot-clé `return`
      - |
        Oui : une fléchée à **une seule expression** renvoie automatiquement sa valeur (return implicite)
      - |
        Non : une fonction fléchée ne peut pas prendre de paramètre
    answer: 1
    explanation: |
      Les deux font exactement la même chose. Quand le corps d'une fléchée est **une seule
      expression** (pas d'accolades), sa valeur est **renvoyée automatiquement** : c'est le
      *return implicite*. Il faudrait un `return` explicite **seulement** si on ajoutait des
      accolades : `(x) => { return x * 2 }`. Et bien sûr une fléchée accepte des paramètres
      (`x` ici) — c'est le rôle de ce qui précède la flèche `=>`.
  - prompt: |
      Pourquoi ce code provoque-t-il une erreur `ReferenceError: taux is not defined` ?

      ```js
      function calculerTva(montant) {
        const taux = 0.2
        return montant * taux
      }

      calculerTva(100)
      console.log(taux)
      ```
    options:
      - |
        Parce que `taux` est **local** à la fonction : il n'existe pas en dehors d'elle (portée)
      - |
        Parce qu'on a oublié d'exporter la variable `taux`
      - |
        Parce que `const` interdit de lire une variable après l'avoir utilisée
    answer: 0
    explanation: |
      `taux` est déclaré **à l'intérieur** de `calculerTva` : sa **portée** est locale. Il
      naît quand la fonction démarre et meurt quand elle se termine ; le reste du programme
      ne le voit pas. D'où l'erreur au `console.log(taux)` hors de la fonction. Cette étanchéité
      n'est pas une gêne : c'est une **protection** qui empêche les variables de fonctions
      différentes de se marcher dessus.
---

Trois questions pour ancrer l'essentiel : le `return` qui arrête la fonction, la fonction
fléchée à return implicite, et la portée locale d'une variable.
