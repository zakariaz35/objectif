---
title: "Exercice — analyser des paramètres d'URL (TS)"
type: exercise
exercise:
  language: ts
  starter: |
    // Simulates what useParams() + useSearchParams() give you in React Router.

    interface RouteParams {
      id: string
    }

    interface SearchParams {
      sort?: string
      page?: string
      filter?: string
    }

    interface ParsedRoute {
      id: number           // converted from string
      sort: 'asc' | 'desc' // default: 'asc'
      page: number         // default: 1, minimum: 1
      filter: string       // default: ''
    }

    // Parse and validate route + search params the way a React component would.
    function parseRoute(params: RouteParams, search: SearchParams): ParsedRoute {
      // TODO: parse id (Number), sort (validate 'asc'|'desc', default 'asc'),
      //       page (Number, min 1, default 1), filter (default '')
      return { id: 0, sort: 'asc', page: 1, filter: '' }
    }
  tests:
    - name: "paramètres valides complets"
      code: |
        const result = parseRoute(
          { id: '42' },
          { sort: 'desc', page: '3', filter: 'react' }
        )
        console.log('parsed :', result)
        assertEqual(result.id, 42, 'id converti en number')
        assertEqual(result.sort, 'desc', 'sort = desc')
        assertEqual(result.page, 3, 'page = 3')
        assertEqual(result.filter, 'react', 'filter = react')
    - name: "valeurs par défaut"
      code: |
        const result = parseRoute({ id: '1' }, {})
        assertEqual(result.sort, 'asc', 'sort par défaut = asc')
        assertEqual(result.page, 1, 'page par défaut = 1')
        assertEqual(result.filter, '', 'filter par défaut vide')
    - name: "sort invalide → fallback asc"
      code: |
        const result = parseRoute({ id: '5' }, { sort: 'random' })
        assertEqual(result.sort, 'asc', 'valeur invalide → asc')
    - name: "page < 1 → clampée à 1"
      code: |
        const result = parseRoute({ id: '7' }, { page: '0' })
        assertEqual(result.page, 1, 'page 0 → clampée à 1')
---

## Énoncé

> **Durée conseillée : ~15 min.** Dans React Router, `useParams()` retourne des strings —
> à toi de les convertir et valider. Cette fonction isole cette logique de parsing en TS pur.

Implémente `parseRoute` selon les règles :

- `id` : converti en `number` avec `Number()`.
- `sort` : `'asc'` ou `'desc'` uniquement — toute autre valeur (ou absente) → `'asc'`.
- `page` : converti en `number`, minimum `1` (si `0` ou négatif, renvoie `1`).
- `filter` : la chaîne telle quelle, ou `''` si absente.

<!--correction-->

## Correction

```ts
function parseRoute(params: RouteParams, search: SearchParams): ParsedRoute {
  const id = Number(params.id)

  const sort: 'asc' | 'desc' =
    search.sort === 'asc' || search.sort === 'desc' ? search.sort : 'asc'

  const rawPage = Number(search.page ?? 1)
  const page = rawPage >= 1 ? rawPage : 1

  const filter = search.filter ?? ''

  return { id, sort, page, filter }
}
```

Dans un composant React Router :

```tsx
function ProductsPage() {
  const params = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()

  const parsed = parseRoute(
    { id: params.id ?? '0' },
    {
      sort: searchParams.get('sort') ?? undefined,
      page: searchParams.get('page') ?? undefined,
      filter: searchParams.get('filter') ?? undefined,
    }
  )
}
```
