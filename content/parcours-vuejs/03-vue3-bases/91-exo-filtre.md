---
title: "Exercice — la logique d'un filtre (TS)"
type: exercise
exercise:
  language: ts
  starter: |
    // La logique pure derrière un `computed` de filtrage (insensible à la casse).
    function rechercher(items: string[], q: string): string[] {
      // TODO : garder les items qui contiennent q (sans tenir compte de la casse)
      return []
    }
  tests:
    - name: "filtre insensible à la casse"
      code: |
        const fruits = ['Pomme', 'Banane', 'Cerise', 'Mangue']
        const r = rechercher(fruits, 'an')
        console.log('recherche "an" :', r)
        assertEqual(r, ['Banane', 'Mangue'], 'Banane et Mangue contiennent "an"')
    - name: "requête vide → tout"
      code: |
        assertEqual(rechercher(['a', 'b'], ''), ['a', 'b'], 'vide ne filtre rien')
---

## Énoncé

Écris la logique **pure** d'un filtre de recherche (celle qu'on mettrait dans un
`computed`). `rechercher(items, q)` renvoie les chaînes qui **contiennent** `q`, **sans
tenir compte de la casse**.

Indice : `items.filter(...)` + `.toLowerCase().includes(...)`.

<!--correction-->

## Correction

```ts
function rechercher(items: string[], q: string): string[] {
  const terme = q.toLowerCase()
  return items.filter((item) => item.toLowerCase().includes(terme))
}
```

C'est exactement la logique du `computed` filtré vu dans la leçon « Props & v-model » —
isolée ici pour la tester. Une requête vide renvoie tout (`''` est inclus partout).
