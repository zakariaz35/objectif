---
title: "Exercice — logique de pagination (TS)"
type: exercise
exercise:
  language: ts
  starter: |
    interface Page<T> {
      items: T[]
      totalPages: number
    }

    // Logique pure (le genre qu'on mettrait dans un composable usePagination).
    function paginate<T>(items: T[], page: number, perPage: number): Page<T> {
      // TODO : renvoyer la tranche de la page demandée + le nombre total de pages
      return { items: [], totalPages: 0 }
    }
  tests:
    - name: "page 1, 2 par page"
      code: |
        const data = [1, 2, 3, 4, 5]
        const r = paginate(data, 1, 2)
        console.log('page 1 :', r)
        assertEqual(r.items, [1, 2], 'items de la page 1')
        assertEqual(r.totalPages, 3, '5 éléments / 2 par page → 3 pages')
    - name: "dernière page (incomplète)"
      code: |
        const r = paginate([1, 2, 3, 4, 5], 3, 2)
        console.log('page 3 :', r.items)
        assertEqual(r.items, [5], 'la dernière page n’a qu’un élément')
---

## Énoncé

Écris la logique **pure** d'une pagination (celle qu'on extrairait dans un composable
`usePagination`). `paginate(items, page, perPage)` doit renvoyer :

- `items` : la **tranche** correspondant à la page (les pages commencent à **1**) ;
- `totalPages` : le nombre total de pages.

Indices : `items.slice(début, fin)` et `Math.ceil(total / perPage)`.

<!--correction-->

## Correction

```ts
function paginate<T>(items: T[], page: number, perPage: number): Page<T> {
  const debut = (page - 1) * perPage
  return {
    items: items.slice(debut, debut + perPage),
    totalPages: Math.ceil(items.length / perPage),
  }
}
```

La logique est **pure** (mêmes entrées → mêmes sorties), donc facile à tester ici. Dans un
vrai projet, un composable `usePagination` envelopperait ça avec un `ref(page)` réactif.
