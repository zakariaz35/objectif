---
title: "Exercice — la logique d'un filtre (TS)"
type: exercise
exercise:
  language: ts
  starter: |
    // The pure logic behind a filtering `computed` (case-insensitive).
    function search(items: string[], q: string): string[] {
      // TODO: keep the items that contain q (case-insensitive)
      return []
    }
  tests:
    - name: "filtre insensible à la casse"
      code: |
        const fruits = ['Apple', 'Banana', 'Cherry', 'Mango']
        const r = search(fruits, 'an')
        console.log('search "an" :', r)
        assertEqual(r, ['Banana', 'Mango'], 'Banana and Mango contain "an"')
    - name: "requête vide → tout"
      code: |
        assertEqual(search(['a', 'b'], ''), ['a', 'b'], 'empty filters nothing')
---

## Énoncé

Écris la logique **pure** d'un filtre de recherche (celle qu'on mettrait dans un
`computed`). `search(items, q)` renvoie les chaînes qui **contiennent** `q`, **sans
tenir compte de la casse**.

Indice : `items.filter(...)` + `.toLowerCase().includes(...)`.

<!--correction-->

## Correction

```ts
function search(items: string[], q: string): string[] {
  const term = q.toLowerCase()
  return items.filter((item) => item.toLowerCase().includes(term))
}
```

C'est exactement la logique du `computed` filtré vu dans la leçon « Props & v-model » —
isolée ici pour la tester. Une requête vide renvoie tout (`''` est inclus partout).
