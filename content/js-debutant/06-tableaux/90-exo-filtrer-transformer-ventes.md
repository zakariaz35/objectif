---
title: "Exercice — filtrer puis transformer un tableau de ventes"
type: exercise
exercise:
  language: js
  starter: |
    // On te donne un tableau de montants de ventes (en euros).
    // Tu vas construire un petit pipeline de traitement de données.

    // 1) Renvoie un NOUVEAU tableau ne gardant que les ventes STRICTEMENT supérieures au seuil.
    function ventesAuDessus(ventes, seuil) {
      // TODO : utilise filter
      return null
    }

    // 2) Renvoie un NOUVEAU tableau où chaque montant reçoit la TVA (× 1.2, soit +20 %).
    function ajouterTva(ventes) {
      // TODO : utilise map
      return null
    }

    // 3) Renvoie le TOTAL, toutes TVA comprises, des ventes au-dessus du seuil.
    //    Indice : réutilise ventesAuDessus puis ajouterTva, puis additionne (reduce).
    function totalGrossesTtc(ventes, seuil) {
      // TODO : enchaîne les deux fonctions ci-dessus, puis reduce
      return null
    }

    // (Optionnel) essaie :
    // console.log(ventesAuDessus([120, 80, 45, 200, 30], 100))
    // console.log(totalGrossesTtc([120, 80, 45, 200, 30], 100))
  tests:
    - name: "filtre les ventes > 100"
      code: |
        const ventes = [120, 80, 45, 200, 30]
        const obtenu = ventesAuDessus(ventes, 100)
        console.log('entrée :', ventes)
        console.log('gardées (>100) :', obtenu)
        assertEqual(obtenu, [120, 200], 'seuls 120 et 200 dépassent 100')
    - name: "le filtre ne modifie pas l'original"
      code: |
        const ventes = [120, 80, 45, 200, 30]
        ventesAuDessus(ventes, 100)
        assertEqual(ventes, [120, 80, 45, 200, 30], 'filter renvoie un NOUVEAU tableau, l’original est intact')
    - name: "filtre strict (> et non >=)"
      code: |
        assertEqual(ventesAuDessus([50, 100, 150], 100), [150], '100 ne passe pas : on veut STRICTEMENT supérieur')
    - name: "ajoute 20 % de TVA à chaque montant"
      code: |
        const obtenu = ajouterTva([100, 200])
        console.log('avec TVA :', obtenu)
        assertEqual(obtenu, [120, 240], '100 -> 120 et 200 -> 240')
    - name: "total TTC des ventes > 100"
      code: |
        const obtenu = totalGrossesTtc([120, 80, 45, 200, 30], 100)
        console.log('total TTC des grosses ventes :', obtenu)
        assertEqual(obtenu, 384, '(120 + 200) * 1.2 = 384')
    - name: "total de 0 si aucune vente ne passe le seuil"
      code: |
        assertEqual(totalGrossesTtc([10, 20, 30], 100), 0, 'aucune vente au-dessus : total de 0')
---

> ⏱️ **Durée conseillée : ~20 min.** Prends ton temps — l'objectif est de **comprendre**, pas d'aller vite. N'hésite pas à relire, modifier et relancer le code.

## Énoncé

Profil data : ce mini-pipeline est exactement ce que tu ferais avec un `SELECT … WHERE …`.
On l'écrit ici avec `filter`, `map` et `reduce`.

1. `ventesAuDessus(ventes, seuil)` : renvoie un **nouveau** tableau ne gardant que les
   montants **strictement supérieurs** à `seuil` (utilise `filter`).
2. `ajouterTva(ventes)` : renvoie un **nouveau** tableau où chaque montant est multiplié
   par `1.2` (utilise `map`).
3. `totalGrossesTtc(ventes, seuil)` : **réutilise** les deux fonctions précédentes pour
   filtrer puis appliquer la TVA, puis **additionne** le tout avec `reduce`.

Réflexes utiles :

- `filter((m) => m > seuil)` garde les éléments pour lesquels le test est vrai.
- `map((m) => m * 1.2)` transforme chaque élément.
- `reduce((somme, m) => somme + m, 0)` condense en une valeur ; le `0` est la valeur de
  départ de l'accumulateur — *pourquoi* ? Sans elle, un tableau vide provoquerait une
  erreur ; avec `0`, un tableau vide donne proprement `0`.
- `filter` et `map` renvoient **toujours un nouveau tableau** : l'original n'est jamais
  modifié (c'est *pourquoi* un test vérifie que `ventes` reste intact).

<!--correction-->

## Correction

```js
function ventesAuDessus(ventes, seuil) {
  return ventes.filter((m) => m > seuil)
}

function ajouterTva(ventes) {
  return ventes.map((m) => m * 1.2)
}

function totalGrossesTtc(ventes, seuil) {
  return ajouterTva(ventesAuDessus(ventes, seuil))
    .reduce((somme, m) => somme + m, 0)
}
```

- **`ventesAuDessus`** délègue à `filter` : le test `m > seuil` est **strict**, donc une
  vente pile au seuil (`100`) n'est **pas** gardée.
- **`ajouterTva`** délègue à `map` : chaque montant est transformé, la taille du tableau
  ne change pas.
- **`totalGrossesTtc`** **enchaîne** les deux (filtre d'abord, TVA ensuite) puis `reduce`
  pour additionner. La valeur de départ `0` garantit que le résultat vaut `0` quand aucune
  vente ne passe le seuil, sans erreur.

> On aurait pu tout écrire en un seul pipeline chaîné :
> `ventes.filter((m) => m > seuil).map((m) => m * 1.2).reduce((s, m) => s + m, 0)`.
> Découper en fonctions nommées est plus lisible et **testable étape par étape** — c'est le
> réflexe pro. Note aussi que `filter`/`map` ne modifient jamais le tableau d'origine :
> chaque étape produit une nouvelle copie, ce qui évite des bugs de « donnée modifiée sous
> nos pieds ».
