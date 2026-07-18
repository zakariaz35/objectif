---
title: "Exercice — manipuler un tableau d'objets (jeu de ventes)"
type: exercise
exercise:
  language: js
  starter: |
    // A mini dataset: each object is a ROW (produit, montant, categorie).
    // This is exactly what a SELECT * FROM ventes would return.

    // 1) Returns the amount of the sale at the given index (field access on an object).
    function montantDeLaVente(ventes, index) {
      // TODO: return the `montant` field of the sale at `index`
      return null
    }

    // 2) Returns a NEW array keeping only sales in a given category.
    function ventesDeCategorie(ventes, categorie) {
      // TODO: filter on the `categorie` field
      return null
    }

    // 3) Returns the TOTAL of amounts for sales in a given category.
    //    Hint: reuse ventesDeCategorie, then sum the `montant` field.
    function totalCategorie(ventes, categorie) {
      // TODO: filter by category, then sum the amounts
      return null
    }

    // (Optional) try with this dataset:
    // const ventes = [
    //   { produit: "Clavier", montant: 120, categorie: "info" },
    //   { produit: "Coffee", montant: 8, categorie: "resto" },
    // ]
    // console.log(totalCategorie(ventes, "info"))
  tests:
    - name: "lit le montant d'une ligne"
      code: |
        const ventes = [
          { produit: "Clavier", montant: 120, categorie: "info" },
          { produit: "Coffee", montant: 8, categorie: "resto" },
          { produit: "Écran", montant: 200, categorie: "info" },
        ]
        const obtenu = montantDeLaVente(ventes, 2)
        console.log('vente index 2 :', ventes[2])
        console.log('montant       :', obtenu)
        assertEqual(obtenu, 200, 'la vente d’index 2 (Écran) a un montant de 200')
    - name: "filtre par catégorie"
      code: |
        const ventes = [
          { produit: "Clavier", montant: 120, categorie: "info" },
          { produit: "Coffee", montant: 8, categorie: "resto" },
          { produit: "Écran", montant: 200, categorie: "info" },
          { produit: "Tea", montant: 6, categorie: "resto" },
        ]
        const obtenu = ventesDeCategorie(ventes, "resto")
        console.log('catégorie resto :', obtenu)
        assertEqual(obtenu, [
          { produit: "Coffee", montant: 8, categorie: "resto" },
          { produit: "Tea", montant: 6, categorie: "resto" },
        ], 'on ne garde que les lignes de catégorie "resto"')
    - name: "total d'une catégorie"
      code: |
        const ventes = [
          { produit: "Clavier", montant: 120, categorie: "info" },
          { produit: "Coffee", montant: 8, categorie: "resto" },
          { produit: "Écran", montant: 200, categorie: "info" },
          { produit: "Tea", montant: 6, categorie: "resto" },
        ]
        const obtenu = totalCategorie(ventes, "info")
        console.log('total info :', obtenu)
        assertEqual(obtenu, 320, '120 + 200 = 320 pour la catégorie "info"')
    - name: "catégorie absente : total de 0"
      code: |
        const ventes = [
          { produit: "Coffee", montant: 8, categorie: "resto" },
        ]
        assertEqual(totalCategorie(ventes, "info"), 0, 'aucune ligne dans cette catégorie → 0')
---

> ⏱️ **Durée conseillée : ~20 min.** Prends ton temps — l'objectif est de **comprendre**, pas d'aller vite. N'hésite pas à relire, modifier et relancer le code.

## Énoncé

Profil BI, tu vas te sentir chez toi : on manipule une **table** représentée par un
**tableau d'objets**. Chaque objet est une **ligne** (`produit`, `montant`, `categorie`).

1. `montantDeLaVente(ventes, index)` : renvoie le **champ `montant`** de la vente située à
   la position `index`. (Accès combiné : `ventes[index]` donne l'objet, `.montant` donne
   le champ.)
2. `ventesDeCategorie(ventes, categorie)` : renvoie un **nouveau** tableau ne gardant que
   les lignes dont le champ `categorie` **égale** l'argument (utilise `filter`).
3. `totalCategorie(ventes, categorie)` : renvoie le **total des montants** des ventes de
   cette catégorie (réutilise la fonction précédente, puis `reduce`).

Réflexes utiles :

- Pour lire un champ d'un objet dans un tableau : `ventes[index].montant`.
- Compare des chaînes avec `===` (égalité stricte). *Pourquoi strict ?* Pour éviter les
  conversions de type surprenantes du `==` — on veut « exactement cette catégorie ».
- `reduce((somme, v) => somme + v.montant, 0)` cumule le champ `montant` de chaque ligne ;
  le `0` de départ garantit un total de `0` quand aucune ligne ne correspond.

<!--correction-->

## Correction

```js
function montantDeLaVente(ventes, index) {
  return ventes[index].montant
}

function ventesDeCategorie(ventes, categorie) {
  return ventes.filter((v) => v.categorie === categorie)
}

function totalCategorie(ventes, categorie) {
  return ventesDeCategorie(ventes, categorie)
    .reduce((somme, v) => somme + v.montant, 0)
}
```

- **`montantDeLaVente`** combine les deux accès : `ventes[index]` récupère l'**objet**
  (la ligne), puis `.montant` en lit le **champ** (la colonne). Tableau (index) + objet
  (clé) : les deux structures travaillent ensemble.
- **`ventesDeCategorie`** filtre sur `v.categorie === categorie`. Le `===` strict évite
  qu'une valeur d'un autre type soit considérée égale par erreur.
- **`totalCategorie`** **réutilise** le filtre (pas de duplication) puis `reduce` pour
  sommer le champ `montant`. La valeur de départ `0` rend le cas « catégorie absente »
  propre : on obtient `0`, pas d'erreur.

> C'est précisément un `SELECT SUM(montant) FROM ventes WHERE categorie = 'info'` :
> `filter` = `WHERE`, `reduce` sur `montant` = `SUM`. Penser « table de données » rend
> ce genre de manipulation naturel.
