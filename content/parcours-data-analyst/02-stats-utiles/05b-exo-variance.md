---
title: "Exercice — variance & stdDev"
type: exercise
exercise:
  language: ts
  starter: |
    // Returns the population variance of an array of numbers.
    // variance = Σ(xᵢ − mean)² / n
    // Empty array -> null.
    function variance(values: number[]): number | null {
      // TODO: implement
      return null
    }

    // Returns the population standard deviation (√variance).
    // Empty array -> null.
    function stdDev(values: number[]): number | null {
      // TODO: implement
      return null
    }
  tests:
    - name: "variance — série classique"
      code: |
        const values = [2, 4, 4, 4, 5, 5, 7, 9]
        const got = variance(values)
        console.log('values:', values)
        console.log('variance:', got)
        // mean = 5 ; squared diffs = 9,1,1,1,0,0,4,16 ; sum = 32 ; /8 = 4
        assertEqual(got, 4, 'population variance of [2,4,4,4,5,5,7,9] is 4')
    - name: "stdDev — série classique"
      code: |
        const got = stdDev([2, 4, 4, 4, 5, 5, 7, 9])
        console.log('std dev:', got)
        assertEqual(got, 2, 'sqrt(4) = 2')
    - name: "variance — une seule valeur"
      code: |
        assertEqual(variance([7]), 0, 'a single value has no spread -> variance = 0')
    - name: "stdDev — une seule valeur"
      code: |
        assertEqual(stdDev([42]), 0, 'std dev of a single value is 0')
    - name: "variance — tableau vide"
      code: |
        assertEqual(variance([]), null, 'no variance for an empty array')
    - name: "stdDev — tableau vide"
      code: |
        assertEqual(stdDev([]), null, 'no std dev for an empty array')
    - name: "variance — valeurs identiques"
      code: |
        // All values equal the mean -> all squared diffs = 0
        assertEqual(variance([5, 5, 5, 5]), 0, 'no spread when all values are equal')
    - name: "stdDev — délais de livraison"
      code: |
        // Delivery times (days): 2, 3, 3, 4, 4, 4, 5, 7
        // mean = 32/8 = 4
        // squared diffs: 4, 1, 1, 0, 0, 0, 1, 9 ; sum = 16 ; var = 2 ; std = sqrt(2)
        const got = stdDev([2, 3, 3, 4, 4, 4, 5, 7])
        console.log('std dev of delivery times:', got)
        const expected = Math.sqrt(2)
        assert(Math.abs(got! - expected) < 1e-9, 'std dev should be sqrt(2) ≈ 1.414')
---

## Énoncé

La **variance** et l'**écart-type** mesurent à quel point les valeurs s'éparpillent autour
de la moyenne. On calcule ici la **variance de population** (division par `n`, pas `n-1`).

**Formule :**

```
mean     = Σxᵢ / n
variance = Σ(xᵢ − mean)² / n
std dev  = √variance
```

Implémente les deux fonctions :

- `variance(values)` — renvoie la variance, ou `null` si le tableau est vide.
- `stdDev(values)` — renvoie l'écart-type (racine de la variance), ou `null` si vide.

> Astuce : calcule d'abord la **moyenne**, puis fais une deuxième passe pour les
> carrés des écarts.

<!--correction-->

## Correction

```ts
function variance(values: number[]): number | null {
  if (values.length === 0) return null
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length
  const squaredDiffs = values.map(v => (v - mean) ** 2)
  return squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length
}

function stdDev(values: number[]): number | null {
  const v = variance(values)
  return v === null ? null : Math.sqrt(v)
}
```

On divise par `n` (variance de **population**). Si on analysait un **échantillon** d'une
population plus grande, on diviserait par `n − 1` (variance de Bessel). En pratique
analytique, la version population s'utilise quand on a **toutes** les données (les ventes
d'un mois complet, par exemple).
