---
title: "Exercice — prix TTC, remise et comparaisons"
type: exercise
exercise:
  language: js
  starter: |
    // 1) Calcule le prix TTC à partir d'un prix HT et d'un taux de TVA (en %).
    //    Exemple : prixTTC(100, 20) doit valoir 120.
    function prixTTC(prixHT, tauxTVA) {
      // TODO : ajoute la TVA au prix HT
      return null
    }

    // 2) Applique une remise (en %) à un prix.
    //    Exemple : appliquerRemise(200, 25) doit valoir 150 (25 % de moins).
    function appliquerRemise(prix, remisePourcent) {
      // TODO : retire le pourcentage de remise du prix
      return null
    }

    // 3) Renvoie true si le montant dépasse STRICTEMENT le seuil de livraison gratuite (50 €).
    //    Utilise l'égalité/comparaison STRICTE (===, >, etc.).
    function livraisonGratuite(montant) {
      // TODO : true si montant > 50, false sinon
      return null
    }

    // (Optionnel) essaie tes fonctions :
    // console.log(prixTTC(100, 20))
    // console.log(appliquerRemise(200, 25))
    // console.log(livraisonGratuite(60))
  tests:
    - name: "prix TTC avec 20 % de TVA"
      code: |
        const obtenu = prixTTC(100, 20)
        console.log('HT :', 100, '| TVA % :', 20, '| TTC :', obtenu)
        assertEqual(obtenu, 120, '100 HT + 20 % de TVA = 120 TTC')
    - name: "prix TTC avec 0 % de TVA"
      code: |
        assertEqual(prixTTC(80, 0), 80, 'sans TVA, le TTC égale le HT')
    - name: "remise de 25 % sur 200"
      code: |
        const obtenu = appliquerRemise(200, 25)
        console.log('prix :', 200, '| remise % :', 25, '| après remise :', obtenu)
        assertEqual(obtenu, 150, '200 moins 25 % = 150')
    - name: "remise de 0 %"
      code: |
        assertEqual(appliquerRemise(99, 0), 99, 'sans remise, le prix ne change pas')
    - name: "livraison gratuite au-dessus de 50"
      code: |
        console.log('montant 60 →', livraisonGratuite(60))
        console.log('montant 50 →', livraisonGratuite(50))
        assertEqual(livraisonGratuite(60), true, '60 > 50 : livraison gratuite')
        assertEqual(livraisonGratuite(50), false, '50 pile ne suffit pas (comparaison stricte)')
        assertEqual(livraisonGratuite(20), false, '20 est en dessous du seuil')
---

> ⏱️ **Durée conseillée : ~15 min.** Prends ton temps — l'objectif est de **comprendre**, pas d'aller vite. N'hésite pas à relire, modifier et relancer le code.

## Énoncé

On reste dans un contexte concret : un panier avec prix, TVA et remise.

1. `prixTTC(prixHT, tauxTVA)` — renvoie le prix **TTC**. Le taux est un pourcentage
   (`20` = 20 %). Rappel : ajouter 20 % revient à multiplier par `1.2`, soit
   `prixHT * (1 + tauxTVA / 100)`.
2. `appliquerRemise(prix, remisePourcent)` — renvoie le prix **après remise**.
   Retirer 25 % revient à garder 75 %, soit `prix * (1 - remisePourcent / 100)`.
3. `livraisonGratuite(montant)` — renvoie `true` si le montant est **strictement
   supérieur** à `50`, `false` sinon. Pense à utiliser `>` (et, plus largement, les
   comparaisons **strictes**).

Fais bien attention aux **parenthèses** dans les calculs (priorité des opérateurs) et
au mot « **strictement** » : `50` ne doit **pas** déclencher la livraison gratuite.

<!--correction-->

## Correction

```js
function prixTTC(prixHT, tauxTVA) {
  return prixHT * (1 + tauxTVA / 100)
}

function appliquerRemise(prix, remisePourcent) {
  return prix * (1 - remisePourcent / 100)
}

function livraisonGratuite(montant) {
  return montant > 50
}
```

- `prixTTC` : `tauxTVA / 100` transforme `20` en `0.2` ; `(1 + 0.2)` donne le coefficient
  `1.2`. Les **parenthèses** sont indispensables, sinon la priorité des opérateurs
  calculerait `prixHT * 1 + tauxTVA / 100` (faux).
- `appliquerRemise` : garder « 100 % moins la remise » revient à multiplier par
  `(1 - remisePourcent / 100)`. Pour 25 % : `1 - 0.25 = 0.75`.
- `livraisonGratuite` : une comparaison **est déjà** un booléen. Pas besoin d'écrire
  `if (montant > 50) return true else return false` — `return montant > 50` suffit et
  c'est le réflexe idiomatique. `>` est strict : `50 > 50` vaut `false`, exactement ce
  qu'on veut.
