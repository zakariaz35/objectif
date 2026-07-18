---
title: "Exercice — turnoverRate (RH)"
type: exercise
exercise:
  language: ts
  starter: |
    // Staff turnover rate, in %.
    // turnover = departures / average headcount * 100
    // average headcount = (headcountStart + headcountEnd) / 2
    // If average headcount is 0 -> null.
    function turnoverRate(
      departures: number,
      headcountStart: number,
      headcountEnd: number,
    ): number | null {
      // TODO: implement
      return null
    }
  tests:
    - name: "effectif stable"
      code: |
        const got = turnoverRate(5, 100, 100)
        console.log('turnover %:', got)
        assertEqual(got, 5, '5 departures out of 100 = 5%')
    - name: "effectif variable -> on prend la moyenne"
      code: |
        // average headcount = (90 + 110) / 2 = 100
        assertEqual(turnoverRate(10, 90, 110), 10, '10 / 100 = 10%')
    - name: "aucun départ"
      code: |
        assertEqual(turnoverRate(0, 50, 50), 0, '0 departures -> 0%')
    - name: "effectif moyen nul"
      code: |
        assertEqual(turnoverRate(0, 0, 0), null, 'no staff -> null')
---

## Énoncé

Implémente `turnoverRate(departures, headcountStart, headcountEnd)` — le taux de rotation
du personnel en % :

```
effectif moyen = (headcountStart + headcountEnd) / 2
turnover (%)   = departures / effectif moyen × 100
```

On rapporte les départs à l'**effectif moyen** (pas de début, pas de fin) parce que
l'effectif bouge sur la période. Si l'effectif moyen vaut `0` → `null`.

<!--correction-->

## Correction

```ts
function turnoverRate(
  departures: number,
  headcountStart: number,
  headcountEnd: number,
): number | null {
  const avg = (headcountStart + headcountEnd) / 2
  if (avg === 0) return null
  return (departures / avg) * 100
}
```

Le seul piège métier est le **dénominateur** : utiliser l'effectif moyen, pas l'effectif de
début ni de fin, sinon le taux est biaisé dès que les effectifs varient.
