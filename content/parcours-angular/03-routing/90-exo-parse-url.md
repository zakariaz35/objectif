---
title: "Exercice — analyser une URL de route (TS)"
type: exercise
exercise:
  language: ts
  starter: |
    interface ParsedRoute {
      segments: string[]                 // path segments, no empty strings
      query: Record<string, string>      // query params as key → value
    }

    // The kind of work the Router does internally, isolated as a pure function.
    // Given a URL like "/products/42?ref=home&sort=name", return:
    //   { segments: ['products', '42'], query: { ref: 'home', sort: 'name' } }
    // Rules:
    //   - split path on "/" and drop empty segments (so "/" → [])
    //   - a value-less query key keeps an empty string ("?q=" → { q: '' })
    //   - no query part → query is {}
    function parseRoute(url: string): ParsedRoute {
      // TODO: implement
      return { segments: [], query: {} }
    }
  tests:
    - name: "chemin + query params"
      code: |
        const result = parseRoute('/products/42?ref=home&sort=name')
        console.log('url    :', '/products/42?ref=home&sort=name')
        console.log('result :', result)
        assertEqual(
          result,
          { segments: ['products', '42'], query: { ref: 'home', sort: 'name' } },
          'two segments and two query params'
        )
    - name: "racine → aucun segment"
      code: |
        assertEqual(parseRoute('/'), { segments: [], query: {} }, 'root has no segments')
    - name: "chemin sans query"
      code: |
        assertEqual(
          parseRoute('/products'),
          { segments: ['products'], query: {} },
          'one segment, empty query'
        )
    - name: "query param sans valeur"
      code: |
        const result = parseRoute('/search?q=')
        console.log('result :', result)
        assertEqual(
          result,
          { segments: ['search'], query: { q: '' } },
          'value-less key keeps empty string'
        )
---

## Énoncé

Le `Router` décompose une URL en **segments** de chemin et en **query params**. On
reproduit ce travail comme une fonction pure (l'occasion de manier `split`, `filter` et
la construction d'objet).

Implémente `parseRoute(url)` qui transforme une URL en `{ segments, query }` :

1. sépare le chemin sur `'/'` et **enlève les segments vides** (`'/'` → `[]`) ;
2. s'il y a une partie après `'?'`, découpe-la en paires `clé=valeur` (séparées par `&`) ;
3. une clé **sans valeur** garde une chaîne vide (`'?q='` → `{ q: '' }`) ;
4. pas de `'?'` → `query` vaut `{}`.

Indice : `url.split('?')` sépare chemin et query ; `filter((s) => s.length > 0)` enlève
les segments vides ; pour chaque paire, `pair.split('=')`.

<!--correction-->

## Correction

```ts
function parseRoute(url: string): ParsedRoute {
  const [pathPart, queryPart = ''] = url.split('?')

  const segments = pathPart.split('/').filter((s) => s.length > 0)

  const query: Record<string, string> = {}
  if (queryPart.length > 0) {
    for (const pair of queryPart.split('&')) {
      const [key, value = ''] = pair.split('=')
      query[key] = value
    }
  }

  return { segments, query }
}
```

On sépare d'abord chemin et query sur `'?'` (la déstructuration avec valeur par défaut
`= ''` gère l'absence de query). `filter` élimine les segments vides produits par les `/`
de bord. Pour chaque paire `clé=valeur`, la déstructuration `[key, value = '']` couvre le
cas d'une clé sans valeur. C'est, en miniature, ce que fait `ActivatedRoute` pour toi.
