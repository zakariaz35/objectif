---
title: "Exercice — somme et moyenne d'un tableau de ventes"
type: exercise
exercise:
  language: js
  starter: |
    // On te donne un TABLEAU de montants de ventes (en euros), de taille quelconque.
    // Écris une fonction qui renvoie leur TOTAL, en parcourant le tableau avec une boucle.
    function totalVentes(ventes) {
      let total = 0
      // TODO : parcours chaque montant de `ventes` (une boucle for...of est idéale)
      //        et ajoute-le à `total`.
      return total
    }

    // Écris une fonction qui renvoie la MOYENNE des ventes.
    // Indice : réutilise totalVentes, puis divise par le nombre d'éléments (ventes.length).
    function moyenneVentes(ventes) {
      // TODO : calcule la moyenne. Attention au cas du tableau vide !
      return null
    }

    // (Optionnel) essaie tes fonctions :
    // console.log(totalVentes([120, 80, 45, 200, 30]))
    // console.log(moyenneVentes([120, 80, 45, 200, 30]))
  tests:
    - name: "total de [120, 80, 45, 200, 30]"
      code: |
        const ventes = [120, 80, 45, 200, 30]
        const obtenu = totalVentes(ventes)
        console.log('ventes :', ventes)
        console.log('total  :', obtenu)
        assertEqual(obtenu, 475, 'la somme doit valoir 475')
    - name: "total marche avec une autre taille"
      code: |
        assertEqual(totalVentes([10, 5]), 15, '10 + 5 = 15')
        assertEqual(totalVentes([7]), 7, 'un seul élément : le total est cet élément')
    - name: "total d'un tableau vide vaut 0"
      code: |
        assertEqual(totalVentes([]), 0, 'aucune vente : total de 0 (accumulateur parti de 0)')
    - name: "moyenne de [120, 80, 45, 200, 30]"
      code: |
        const obtenu = moyenneVentes([120, 80, 45, 200, 30])
        console.log('moyenne :', obtenu)
        assertEqual(obtenu, 475 / 5, 'la moyenne = total / nombre de ventes')
    - name: "moyenne de montants égaux"
      code: |
        assertEqual(moyenneVentes([50, 50, 50]), 50, 'trois fois 50 → moyenne de 50')
    - name: "moyenne d'un tableau vide vaut 0 (pas d'erreur)"
      code: |
        assertEqual(moyenneVentes([]), 0, 'tableau vide : renvoyer 0 plutôt que diviser par 0')
---

> ⏱️ **Durée conseillée : ~20 min.** Prends ton temps — l'objectif est de **comprendre**, pas d'aller vite. N'hésite pas à relire, modifier et relancer le code.

## Énoncé

On reprend le fil rouge « données de ventes », mais cette fois les montants arrivent
dans un **tableau** de taille inconnue. Une boucle est donc indispensable.

1. Complète `totalVentes(ventes)` : **parcours** le tableau avec une boucle et **cumule**
   chaque montant dans l'accumulateur `total` (déjà initialisé à `0`), puis renvoie-le.
2. Complète `moyenneVentes(ventes)` : renvoie la **moyenne** des montants.

Réflexes utiles :

- Le patron **accumulateur** : `total` est déclaré **avant** la boucle, on lui ajoute
  chaque élément dans le corps. Une boucle `for...of` (`for (const m of ventes)`) est la
  plus lisible ici.
- Le nombre d'éléments d'un tableau est donné par `ventes.length`.
- **Cas du tableau vide** : diviser par `0` donne un résultat aberrant (`NaN`). Pense à
  renvoyer `0` quand `ventes.length === 0` — c'est *pourquoi* on teste ce cas à part.

<!--correction-->

## Correction

```js
function totalVentes(ventes) {
  let total = 0
  for (const montant of ventes) {   // pour chaque montant du tableau
    total = total + montant         // on cumule (accumulateur)
  }
  return total
}

function moyenneVentes(ventes) {
  if (ventes.length === 0) {
    return 0                        // garde-fou : pas de division par 0
  }
  return totalVentes(ventes) / ventes.length
}
```

- **`totalVentes`** applique le patron accumulateur : `total` part de `0` *avant* la
  boucle (sinon il serait remis à zéro à chaque tour et n'accumulerait rien), puis on lui
  ajoute chaque `montant`. Le `for...of` évite de manipuler un index `i` — moins de risque
  d'erreur de borne.
- **`moyenneVentes`** commence par le **garde-fou** `ventes.length === 0` : sans lui,
  `475 / 0` donnerait `NaN`. C'est le réflexe « traiter le cas limite d'abord ». Ensuite on
  **réutilise** `totalVentes` (on ne réécrit pas l'addition) et on divise par le nombre
  d'éléments.

> On aurait pu écrire un `for (let i = 0; i < ventes.length; i++)` classique avec
> `total += ventes[i]` — c'est correct aussi. Le `for...of` est juste plus lisible tant
> qu'on n'a pas besoin de la **position** de l'élément.
