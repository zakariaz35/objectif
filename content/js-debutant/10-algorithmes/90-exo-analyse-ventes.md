---
title: "Mini-projet — analyser un jeu de ventes"
type: exercise
exercise:
  language: js
  starter: |
    // SYNTHESIS MINI-PROJECT.
    // You receive a sales dataset: each sale is an OBJECT { produit, montant }.
    // You will reuse EVERYTHING from the course: objects, arrays, loops, functions.

    // 1) Total of all amounts (accumulation).
    function totalVentes(ventes) {
      // TODO: sum all .montant
      return null
    }

    // 2) Keep only sales whose amount is STRICTLY above the threshold.
    //    Return a NEW array (filtering).
    function ventesAuDessus(ventes, seuil) {
      // TODO: filter on v.montant > seuil
      return null
    }

    // 3) The sale with the highest amount (the "top").
    //    Return the complete sale OBJECT. For an empty array, return null.
    function meilleureVente(ventes) {
      // TODO: iterate and keep the one with the highest .montant
      return null
    }

    // (Optional) try with this dataset:
    // const jeu = [
    //   { produit: "clavier", montant: 45 },
    //   { produit: "screen",  montant: 200 },
    //   { produit: "souris",  montant: 30 },
    //   { produit: "casque",  montant: 120 },
    // ]
    // console.log(totalVentes(jeu))
    // console.log(ventesAuDessus(jeu, 100))
    // console.log(meilleureVente(jeu))
  tests:
    - name: "totalVentes additionne les montants"
      code: |
        const jeu = [
          { produit: "clavier", montant: 45 },
          { produit: "screen",  montant: 200 },
          { produit: "souris",  montant: 30 },
          { produit: "casque",  montant: 120 },
        ]
        const obtenu = totalVentes(jeu)
        console.log('total :', obtenu)
        assertEqual(obtenu, 395, '45 + 200 + 30 + 120 = 395')
    - name: "totalVentes d'un jeu vide vaut 0"
      code: |
        assertEqual(totalVentes([]), 0, 'aucune vente : total de 0')
    - name: "ventesAuDessus filtre sur le seuil (strict)"
      code: |
        const jeu = [
          { produit: "clavier", montant: 45 },
          { produit: "screen",  montant: 200 },
          { produit: "souris",  montant: 30 },
          { produit: "casque",  montant: 120 },
        ]
        const obtenu = ventesAuDessus(jeu, 100)
        console.log('au-dessus de 100 :', obtenu)
        assertEqual(obtenu, [
          { produit: "screen", montant: 200 },
          { produit: "casque", montant: 120 },
        ], 'only screen (200) and casque (120) exceed 100')
    - name: "meilleureVente renvoie l'objet au plus gros montant"
      code: |
        const jeu = [
          { produit: "clavier", montant: 45 },
          { produit: "screen",  montant: 200 },
          { produit: "souris",  montant: 30 },
          { produit: "casque",  montant: 120 },
        ]
        const obtenu = meilleureVente(jeu)
        console.log('top vente :', obtenu)
        assertEqual(obtenu, { produit: "screen", montant: 200 }, 'screen is the top sale')
    - name: "meilleureVente d'un jeu vide vaut null"
      code: |
        assertEqual(meilleureVente([]), null, 'aucune vente : pas de meilleure vente')
---

> ⏱️ **Durée conseillée : ~40 min.** Prends ton temps — l'objectif est de **comprendre**, pas d'aller vite. N'hésite pas à relire, modifier et relancer le code.

## Énoncé

Le grand oral : un **mini-projet** qui rassemble tout le parcours. On te donne un jeu de
ventes où chaque vente est un **objet** `{ produit, montant }`. Tu vas écrire trois fonctions
d'analyse, chacune un motif du cours.

1. `totalVentes(ventes)` : renvoie la **somme** de tous les `montant` (motif **accumulation**).
2. `ventesAuDessus(ventes, seuil)` : renvoie un **nouveau** tableau ne gardant que les ventes
   dont `montant` est **strictement supérieur** à `seuil` (motif **filtrage**).
3. `meilleureVente(ventes)` : renvoie l'**objet vente** ayant le plus gros `montant` (motif
   **recherche du max**). Sur un tableau **vide**, renvoie `null`.

Réflexes utiles (tout vient des modules précédents) :

- **Accumulation** : `let total = 0` déclaré **avant** la boucle, puis `total += v.montant`
  pour chaque vente. Un tableau vide doit donner `0`.
- **Filtrage** : `ventes.filter((v) => v.montant > seuil)` renvoie un nouveau tableau. Le
  test est **strict** (`>`, pas `>=`).
- **Recherche du max** : traite d'abord le **cas limite** (`ventes.length === 0` → `null`),
  puis parcours en gardant la meilleure vue jusqu'ici. C'est un accumulateur… d'objet.
- **Pense d'abord au pseudo-code** si tu bloques : écris la méthode en français, puis traduis.

<!--correction-->

## Correction

```js
function totalVentes(ventes) {
  let total = 0
  for (const v of ventes) {
    total = total + v.montant        // accumulate
  }
  return total
}

function ventesAuDessus(ventes, seuil) {
  return ventes.filter((v) => v.montant > seuil)   // filter, strict threshold
}

function meilleureVente(ventes) {
  if (ventes.length === 0) {
    return null                      // edge case first: no best sale
  }
  let meilleure = ventes[0]          // start from the first one...
  for (const v of ventes) {
    if (v.montant > meilleure.montant) {
      meilleure = v                  // ...and keep any larger sale
    }
  }
  return meilleure
}
```

- **`totalVentes`** applique le patron **accumulateur** vu au module Boucles : `total` part de
  `0` (donc un jeu vide donne bien `0`), puis on cumule chaque `v.montant`. On lit la propriété
  d'un objet avec le point (`v.montant`), comme au module Objets.
- **`ventesAuDessus`** délègue à **`filter`** (module Tableaux) : le test porte sur `v.montant`,
  en **strict**. Le résultat est un **nouveau** tableau — l'original reste intact.
- **`meilleureVente`** traite le **cas limite en premier** (tableau vide → `null`, sinon
  `ventes[0]` planterait), puis fait une **recherche du maximum** : on retient la meilleure
  vente rencontrée, et on la remplace dès qu'on en croise une plus grosse. C'est une
  accumulation, mais d'un **objet** entier plutôt que d'un nombre.

> Tu viens d'assembler **objets + tableaux + boucles + fonctions + cas limites** pour résoudre
> un vrai problème d'analyse de données. C'est exactement la démarche du cours :
> décomposer en trois sous-questions, choisir un motif pour chacune, coder, tester. En SQL,
> ces trois fonctions seraient `SUM(montant)`, `WHERE montant > seuil`, et
> `ORDER BY montant DESC LIMIT 1` — même pensée, autre notation. Bravo, tu es remis en selle !
