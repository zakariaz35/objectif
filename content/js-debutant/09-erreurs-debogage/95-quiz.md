---
title: "Quiz — Erreurs & débogage"
type: quiz
questions:
  - prompt: |
      Ce code s'exécute sans aucun message rouge, mais affiche `40` alors qu'on attendait
      la moyenne `20`. De quelle famille d'erreur s'agit-il ?

      ```js
      function moyenne(a, b, c) {
        return a + b + c / 3
      }
      console.log(moyenne(10, 20, 30))   // 40
      ```
    options:
      - |
        Une **erreur de syntaxe** : le code est mal écrit
      - |
        Une **erreur d'exécution** : le programme plante en cours de route
      - |
        Une **erreur de logique** : ça tourne, mais le résultat est faux (priorité des opérations oubliée)
    answer: 2
    explanation: |
      Aucun crash, aucun message : le programme s'exécute jusqu'au bout. Le problème est dans
      le **calcul** : seul `c` est divisé par 3 (`c / 3` avant l'addition). Il fallait
      `(a + b + c) / 3`. C'est une **erreur de logique**, la plus sournoise justement parce
      que rien ne t'alerte : c'est à toi de la repérer en testant avec des valeurs dont tu
      connais le résultat attendu.
  - prompt: |
      Qu'affiche ce code ?

      ```js
      function lire(valeur) {
        try {
          if (valeur < 0) {
            throw new Error("négatif")
          }
          return valeur
        } catch (e) {
          return 0
        } finally {
          console.log("fini")
        }
      }
      console.log(lire(-5))
      ```
    options:
      - |
        `fini` puis `0`
      - |
        `0` seulement (le `finally` est sauté quand il y a une erreur)
      - |
        `fini` puis `-5`
    answer: 0
    explanation: |
      `valeur` vaut `-5`, donc le `throw` se déclenche : on saute dans le `catch`, qui prépare
      la valeur de retour `0`. Mais **avant** que la fonction ne rende quoi que ce soit, le
      bloc **`finally` s'exécute dans tous les cas** — il affiche donc `"fini"`. Ensuite la
      fonction renvoie `0`, que le `console.log` extérieur affiche. Ordre : `fini`, puis `0`.
  - prompt: |
      Face à cette erreur, où regarder **en priorité** dans ton code ?

      ```
      TypeError: Cannot read properties of undefined (reading 'montant')
          at double (script.js:2)
          at traiter (script.js:5)
          at script.js:7
      ```
    options:
      - |
        À la ligne **7**, car c'est la dernière ligne affichée
      - |
        À la ligne **2** (`double`), le sommet de la *stack trace* : c'est là que ça a cassé
      - |
        Nulle part : un `TypeError` n'indique jamais de ligne précise
    answer: 1
    explanation: |
      La première ligne donne le **type** et le **message** (`TypeError` : on a lu une
      propriété sur `undefined`). Les lignes `at ...` forment la **stack trace**, du plus
      profond vers le plus haut : la **première** (`double`, ligne 2) est l'endroit exact où
      l'erreur s'est produite. `traiter` (ligne 5) puis la ligne 7 sont ceux qui ont mené là.
      On regarde donc **la ligne 2 d'abord**, puis on remonte si besoin.
---

Trois questions pour ancrer l'essentiel : reconnaître une erreur de logique, l'exécution
« dans tous les cas » du `finally`, et la lecture d'une stack trace.
