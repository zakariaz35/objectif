---
title: "Exercice — normaliser une ligne (TS)"
type: exercise
exercise:
  language: ts
  starter: |
    // Cleaning helpers, the same logic as pandas str.title() and fillna(0).

    // normalizeRegion: trim spaces, then Title Case ("north " -> "North").
    function normalizeRegion(region: string): string {
      // TODO: implement
      return region
    }

    // cleanDiscount: a missing discount (null or undefined) becomes 0,
    // otherwise keep the value as-is.
    function cleanDiscount(discount: number | null | undefined): number {
      // TODO: implement
      return 0
    }
  tests:
    - name: "trim + Title Case"
      code: |
        console.log('input  :', JSON.stringify(' north '))
        console.log('output :', normalizeRegion(' north '))
        assertEqual(normalizeRegion(' north '), 'North', 'spaces trimmed, first letter up')
    - name: "passe une casse mixte à Title Case"
      code: |
        assertEqual(normalizeRegion('SOUTH'), 'South', 'SOUTH -> South')
        assertEqual(normalizeRegion('East'), 'East', 'East stays East')
    - name: "discount manquant devient 0"
      code: |
        console.log('null      ->', cleanDiscount(null))
        console.log('undefined ->', cleanDiscount(undefined))
        assertEqual(cleanDiscount(null), 0, 'null -> 0')
        assertEqual(cleanDiscount(undefined), 0, 'undefined -> 0')
    - name: "discount présent est conservé"
      code: |
        assertEqual(cleanDiscount(0.1), 0.1, 'existing value kept')
        assertEqual(cleanDiscount(0), 0, 'a real zero stays zero')
---

## Énoncé

Implémente deux helpers de nettoyage :

1. `normalizeRegion(region)` : enlève les espaces autour (`trim`) puis met en **Title
   Case** (`north ` → `North`, `SOUTH` → `South`).
2. `cleanDiscount(discount)` : si la valeur est `null` ou `undefined`, renvoie `0` ;
   sinon renvoie la valeur telle quelle (attention : un vrai `0` doit rester `0`).

Indices :
- Title Case : `s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()`.
- Pour distinguer « manquant » de `0`, teste `== null` (vrai pour `null` **et**
  `undefined`, faux pour `0`).

<!--correction-->

## Correction

```ts
function normalizeRegion(region: string): string {
  const r = region.trim().toLowerCase()
  return r.charAt(0).toUpperCase() + r.slice(1)
}

function cleanDiscount(discount: number | null | undefined): number {
  return discount == null ? 0 : discount
}
```

`normalizeRegion` met d'abord tout en minuscules (pour gérer `SOUTH`), puis remonte la
première lettre. `cleanDiscount` utilise `== null` (avec deux `=`) qui couvre `null` et
`undefined` mais pas `0` — exactement le `fillna(0)` de pandas.
