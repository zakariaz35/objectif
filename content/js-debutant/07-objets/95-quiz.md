---
title: "Quiz — Objets"
type: quiz
questions:
  - prompt: |
      Soit l'objet suivant. Quelles deux écritures renvoient toutes les deux `"Ada"` ?

      ```js
      const perso = { nom: "Ada", age: 42 }
      ```
    options:
      - |
        `perso.nom` et `perso["nom"]`
      - |
        `perso.0` et `perso[0]`
      - |
        `perso(nom)` et `perso->nom`
    answer: 0
    explanation: |
      On accède à une valeur d'objet par sa **clé**, avec la notation point `perso.nom`
      (clé connue) ou la notation crochets `perso["nom"]` (clé éventuellement dynamique).
      Un objet n'a **pas** d'index numérique comme un tableau, donc `perso[0]` ne renvoie
      rien d'utile. La flèche `->` est la syntaxe de PHP, pas de JS.
  - prompt: |
      Que va afficher ce code ?

      ```js
      const perso = { nom: "Ada", age: 42 }
      perso.age = 43
      perso.ville = "Londres"
      console.log(perso.ville, perso.age)
      ```
    options:
      - |
        Erreur : `perso` est `const`, on ne peut rien modifier
      - |
        `Londres 43`
      - |
        `undefined 42`
    answer: 1
    explanation: |
      `const` fige l'**étiquette** de la variable, pas le **contenu** de l'objet. On peut
      donc **modifier** une propriété existante (`age` passe à `43`) et **ajouter** une
      nouvelle propriété (`ville`). L'affichage est donc `Londres 43`. C'est le même
      principe que pour les tableaux `const`.
  - prompt: |
      On a un tableau d'objets (une « table »). Comment lire le montant de la 1ʳᵉ ligne ?

      ```js
      const ventes = [
        { produit: "Clavier", montant: 120 },
        { produit: "Café", montant: 8 },
      ]
      ```
    options:
      - |
        `ventes.montant`
      - |
        `ventes[0].montant`
      - |
        `ventes["montant"][0]`
    answer: 1
    explanation: |
      On combine les deux accès : `ventes[0]` récupère l'**objet** de la première ligne
      (l'index commence à 0), puis `.montant` en lit le **champ** → `120`. `ventes.montant`
      échoue car le montant est une propriété de **chaque ligne**, pas du tableau lui-même.
      Tableau (index) + objet (clé) : les deux structures se combinent.
---

Trois questions pour valider l'essentiel des objets : l'accès par clé (point et crochets),
le fait qu'un objet `const` reste modifiable, et la lecture d'un champ dans un tableau
d'objets (une table de données).
