---
title: "Exercice — prixTTC, appliquerRemise et un tableau de ventes"
type: exercise
exercise:
  language: js
  starter: |
    // "sales" thread: we build three small single-responsibility functions,
    // then combine them on an array of amounts.

    // 1) Returns the VAT-inclusive price from a pre-tax amount (20% VAT, i.e. × 1.2).
    function prixTTC(ht) {
      // TODO: return the pre-tax amount increased by 20%
      return null
    }

    // 2) Returns the amount after discount (percentage between 0 and 100).
    //    Edge case: if the percentage is <= 0, return the amount unchanged.
    function appliquerRemise(montant, pourcentage) {
      // TODO: handle the pourcentage <= 0 case first (return montant),
      //       otherwise apply the discount
      return null
    }

    // 3) Takes an ARRAY of pre-tax amounts and returns a NEW array
    //    where each amount has first the discount, then the VAT applied.
    //    Hint: reuse appliquerRemise and prixTTC inside a map.
    function facturerVentes(ventesHt, remisePct) {
      // TODO: transform each amount (discount then VAT)
      return null
    }

    // (Optionnel) essaie :
    // console.log(prixTTC(100))
    // console.log(appliquerRemise(200, 10))
    // console.log(facturerVentes([100, 200], 10))
  tests:
    - name: "prixTTC ajoute 20 %"
      code: |
        console.log('prixTTC(100) =', prixTTC(100))
        assertEqual(prixTTC(100), 120, '100 HT -> 120 TTC (× 1.2)')
        assertEqual(prixTTC(200), 240, '200 HT -> 240 TTC')
    - name: "appliquerRemise applique le pourcentage"
      code: |
        const obtenu = appliquerRemise(200, 10)
        console.log('appliquerRemise(200, 10) =', obtenu)
        assertEqual(obtenu, 180, '10 % de remise sur 200 -> 180')
    - name: "appliquerRemise avec 0 % rend le montant inchangé"
      code: |
        assertEqual(appliquerRemise(200, 0), 200, 'pourcentage <= 0 : on rend le montant tel quel')
    - name: "facturerVentes combine remise puis TVA sur chaque montant"
      code: |
        const obtenu = facturerVentes([100, 200], 10)
        console.log('facturerVentes([100, 200], 10) =', obtenu)
        assertEqual(obtenu, [108, 216], '100 -> 90 -> 108 ; 200 -> 180 -> 216')
    - name: "facturerVentes ne modifie pas le tableau d'origine"
      code: |
        const ventes = [100, 200]
        facturerVentes(ventes, 10)
        assertEqual(ventes, [100, 200], 'map renvoie un NOUVEAU tableau, l’original reste intact')
---

> ⏱️ **Durée conseillée : ~25 min.** Prends ton temps — l'objectif est de **comprendre**, pas d'aller vite. N'hésite pas à relire, modifier et relancer le code.

## Énoncé

On reprend le fil rouge « ventes », mais cette fois en **décomposant** le calcul en petites
fonctions, comme vu dans le cours. Chaque fonction a **une seule responsabilité**.

1. `prixTTC(ht)` : renvoie le montant HT avec **20 % de TVA** (× `1.2`).
2. `appliquerRemise(montant, pourcentage)` : renvoie le montant après remise. **Cas
   particulier d'abord** : si `pourcentage <= 0`, renvoie le montant **inchangé** (et sors
   tout de suite avec `return`). Sinon, applique la remise : `montant * (1 - pourcentage / 100)`.
3. `facturerVentes(ventesHt, remisePct)` : prend un **tableau** de montants HT et renvoie un
   **nouveau** tableau où chaque montant reçoit d'abord la **remise**, puis la **TVA**.
   Réutilise les deux fonctions précédentes dans un `map`.

Réflexes utiles :

- Une fonction **fléchée** convient bien pour `prixTTC` : `const prixTTC = (ht) => ht * 1.2`.
  La version `function prixTTC(ht) { return ... }` marche tout aussi bien.
- Le **`return` du cas particulier** (`pourcentage <= 0`) **arrête** la fonction : la ligne
  du calcul de remise n'est alors jamais atteinte. C'est *pourquoi* on le place en premier.
- Dans `facturerVentes`, **réutilise** tes fonctions : `ventesHt.map((ht) => prixTTC(appliquerRemise(ht, remisePct)))`.
  On ne réécrit jamais un calcul qu'une fonction sait déjà faire.
- `map` renvoie **toujours** un nouveau tableau : l'original n'est pas touché (c'est
  *pourquoi* un test le vérifie).

<!--correction-->

## Correction

```js
const prixTTC = (ht) => ht * 1.2

function appliquerRemise(montant, pourcentage) {
  if (pourcentage <= 0) {
    return montant                              // edge case: immediate exit
  }
  return montant * (1 - pourcentage / 100)
}

function facturerVentes(ventesHt, remisePct) {
  return ventesHt.map((ht) => prixTTC(appliquerRemise(ht, remisePct)))
}
```

- **`prixTTC`** est écrite en fléchée : une seule expression, donc `return` implicite. Elle
  fait une seule chose (ajouter la TVA), ce qui la rend réutilisable partout.
- **`appliquerRemise`** traite le **cas limite en premier** : si `pourcentage <= 0`, le
  `return montant` **arrête** la fonction avant même d'atteindre le calcul de remise. C'est
  le patron « garde d'entrée » — plus lisible qu'un gros `if/else`.
- **`facturerVentes`** **compose** les deux fonctions à l'intérieur d'un `map` : pour chaque
  `ht`, on applique d'abord la remise, **puis** la TVA (l'ordre compte : `100 → 90 → 108`).
  Le `map` produit un nouveau tableau, donc `ventesHt` reste intact.

> C'est exactement l'esprit du module Fonctions : un gros calcul (« facturer un lot de
> ventes ») découpé en briques nommées, testées une à une, puis assemblées. Le jour où la
> TVA change, tu ne corriges que `prixTTC`.
