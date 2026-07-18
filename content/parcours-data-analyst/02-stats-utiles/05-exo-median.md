---
title: "Exercice — median(values)"
type: exercise
exercise:
  language: ts
  starter: |
    // Returns the median of an array of numbers.
    // - empty array -> null
    // - odd length  -> the middle value (after sorting)
    // - even length -> the average of the two middle values
    // Does not modify the input array.
    function median(values: number[]): number | null {
      // TODO: implement
      return null
    }
  tests:
    - name: "effectif impair"
      code: |
        const values = [10, 30, 20]
        const got = median(values)
        console.log('input:', values)
        console.log('median:', got)
        assertEqual(got, 20, 'sorted middle value is 20')
    - name: "effectif pair"
      code: |
        assertEqual(median([1, 2, 3, 4]), 2.5, 'average of the two middle values (2 and 3)')
    - name: "une seule valeur"
      code: |
        assertEqual(median([5]), 5, 'a single element is its own median')
    - name: "tableau vide"
      code: |
        assertEqual(median([]), null, 'no median for an empty array')
    - name: "robuste à un extrême"
      code: |
        const got = median([7, 7, 7, 1000])
        console.log('robust median:', got)
        assertEqual(got, 7, 'the outlier 1000 does not shift the median')
    - name: "ne modifie pas l'entrée"
      code: |
        const values = [3, 1, 2]
        median(values)
        assertEqual(values, [3, 1, 2], 'the original array stays unchanged')
---

## Énoncé

La médiane est l'outil de résumé **robuste aux extrêmes** vu en début de module.
Implémente `median(values)` :

- **tableau vide** → `null` ;
- **effectif impair** → la valeur centrale après tri ;
- **effectif pair** → la **moyenne des deux valeurs centrales** ;
- ne **modifie pas** le tableau reçu (trie une copie).

> Astuce : `Math.floor(sorted.length / 2)` donne l'indice du milieu.

<!--correction-->

## Correction

```ts
function median(values: number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}
```

On trie une **copie** (`[...values]`) pour ne pas muter l'entrée. Le tri par défaut de
JavaScript étant lexicographique, on passe un comparateur `(a, b) => a - b` pour un tri
**numérique**. Le `% 2` distingue les cas pair / impair.
