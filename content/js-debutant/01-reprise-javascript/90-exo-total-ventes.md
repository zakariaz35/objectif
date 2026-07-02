---
title: "Exercice — total et moyenne de ventes"
type: exercise
exercise:
  language: js
  starter: |
    // On te donne trois montants de ventes (en euros).
    // Écris une fonction qui renvoie leur TOTAL.
    function totalVentes(v1, v2, v3) {
      // TODO : additionne les trois montants et renvoie la somme
      return null
    }

    // Écris une fonction qui renvoie la MOYENNE des trois ventes.
    // Indice : réutilise totalVentes, puis divise par 3.
    function moyenneVentes(v1, v2, v3) {
      // TODO : calcule la moyenne des trois montants
      return null
    }

    // (Optionnel) essaie tes fonctions — la sortie s'affiche dans « Sortie (console) » :
    // console.log(totalVentes(120, 80, 45))
    // console.log(moyenneVentes(120, 80, 45))
  tests:
    - name: "total de 120 + 80 + 45"
      code: |
        const obtenu = totalVentes(120, 80, 45)
        console.log('ventes :', 120, 80, 45)
        console.log('total  :', obtenu)
        assertEqual(obtenu, 245, 'la somme doit valoir 245')
    - name: "total avec des zéros"
      code: |
        assertEqual(totalVentes(0, 0, 0), 0, 'zéro partout donne un total de 0')
        assertEqual(totalVentes(10, 0, 5), 15, '10 + 0 + 5 = 15')
    - name: "moyenne de 120 + 80 + 45"
      code: |
        const obtenu = moyenneVentes(120, 80, 45)
        console.log('moyenne :', obtenu)
        assertEqual(obtenu, 245 / 3, 'la moyenne doit valoir le total divisé par 3')
    - name: "moyenne de trois montants égaux"
      code: |
        assertEqual(moyenneVentes(50, 50, 50), 50, 'trois fois 50 donne une moyenne de 50')
---

> ⏱️ **Durée conseillée : ~15 min.** Prends ton temps — l'objectif est de **comprendre**, pas d'aller vite. N'hésite pas à relire, modifier et relancer le code.

## Énoncé

On reprend le fil rouge « données de ventes ». On te donne **trois montants** de ventes,
passés en arguments.

1. Complète `totalVentes(v1, v2, v3)` pour qu'elle **renvoie** la somme des trois montants.
2. Complète `moyenneVentes(v1, v2, v3)` pour qu'elle **renvoie** la moyenne des trois montants.

Deux réflexes utiles :

- On **additionne** avec `+` et on **divise** avec `/`.
- Une fonction **renvoie** une valeur avec le mot-clé `return`. C'est différent de
  l'afficher avec `console.log` : ici, les tests ont besoin que la valeur soit **renvoyée**
  pour la vérifier.

Indice pour la moyenne : tu peux réutiliser `totalVentes(v1, v2, v3)` puis diviser par `3`.

<!--correction-->

## Correction

```js
function totalVentes(v1, v2, v3) {
  return v1 + v2 + v3
}

function moyenneVentes(v1, v2, v3) {
  return totalVentes(v1, v2, v3) / 3
}
```

- `totalVentes` additionne simplement les trois montants et **renvoie** la somme avec `return`.
- `moyenneVentes` **réutilise** `totalVentes` (on ne réécrit pas l'addition — c'est le
  réflexe « ne pas se répéter »), puis divise par `3`. On aurait aussi pu écrire
  `return (v1 + v2 + v3) / 3`, mais réutiliser une fonction existante est plus propre et
  plus lisible.

> Note : `return` **renvoie** la valeur à qui a appelé la fonction ; `console.log` ne fait
> qu'**afficher**. Pour qu'un test puisse vérifier un résultat, il faut le `return`.
