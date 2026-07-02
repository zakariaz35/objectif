---
title: "Mini-projet — analyser un jeu de ventes"
type: exercise
exercise:
  language: js
  starter: |
    // MINI-PROJET DE SYNTHÈSE.
    // Tu reçois un jeu de ventes : chaque vente est un OBJET { produit, montant }.
    // Tu vas réutiliser TOUT le parcours : objets, tableaux, boucles, fonctions.

    // 1) Total de tous les montants (accumulation).
    function totalVentes(ventes) {
      // TODO : additionne tous les .montant
      return null
    }

    // 2) Ne garder que les ventes dont le montant est STRICTEMENT supérieur au seuil.
    //    Renvoie un NOUVEAU tableau (filtrage).
    function ventesAuDessus(ventes, seuil) {
      // TODO : filtre sur v.montant > seuil
      return null
    }

    // 3) La vente au plus gros montant (le "top").
    //    Renvoie l'OBJET vente complet. Sur un tableau vide, renvoie null.
    function meilleureVente(ventes) {
      // TODO : parcours et garde celle qui a le plus gros .montant
      return null
    }

    // (Optionnel) essaie avec ce jeu :
    // const jeu = [
    //   { produit: "clavier", montant: 45 },
    //   { produit: "écran",   montant: 200 },
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
          { produit: "écran",   montant: 200 },
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
          { produit: "écran",   montant: 200 },
          { produit: "souris",  montant: 30 },
          { produit: "casque",  montant: 120 },
        ]
        const obtenu = ventesAuDessus(jeu, 100)
        console.log('au-dessus de 100 :', obtenu)
        assertEqual(obtenu, [
          { produit: "écran",  montant: 200 },
          { produit: "casque", montant: 120 },
        ], 'seuls écran (200) et casque (120) dépassent 100')
    - name: "meilleureVente renvoie l'objet au plus gros montant"
      code: |
        const jeu = [
          { produit: "clavier", montant: 45 },
          { produit: "écran",   montant: 200 },
          { produit: "souris",  montant: 30 },
          { produit: "casque",  montant: 120 },
        ]
        const obtenu = meilleureVente(jeu)
        console.log('top vente :', obtenu)
        assertEqual(obtenu, { produit: "écran", montant: 200 }, 'écran est la plus grosse vente')
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
    total = total + v.montant        // accumulation
  }
  return total
}

function ventesAuDessus(ventes, seuil) {
  return ventes.filter((v) => v.montant > seuil)   // filtrage, seuil strict
}

function meilleureVente(ventes) {
  if (ventes.length === 0) {
    return null                      // cas limite d'abord : pas de meilleure vente
  }
  let meilleure = ventes[0]          // on part de la première...
  for (const v of ventes) {
    if (v.montant > meilleure.montant) {
      meilleure = v                  // ...et on garde toute vente plus grosse
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
