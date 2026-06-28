---
title: "Exercice — typer (et exécuter) un panier"
type: exercise
exercise:
  language: ts
  starter: |
    interface Item {
      name: string
      priceCents: number
      quantity: number
    }

    function totalCents(items: Item[]): number {
      // TODO: sum of priceCents * quantity for each item
      return 0
    }
  tests:
    - name: "panier de 2 lignes"
      code: |
        const cart: Item[] = [
          { name: 'Coffee', priceCents: 1000, quantity: 2 },
          { name: 'Tea', priceCents: 500, quantity: 3 },
        ]
        console.log('cart :', cart)
        const total = totalCents(cart)
        console.log('total (cents) :', total)
        assertEqual(total, 3500, '2×1000 + 3×500 = 3500')
    - name: "panier vide → 0"
      code: |
        assertEqual(totalCents([]), 0, 'an empty cart costs 0')
---

## Énoncé

Complète `totalCents` pour qu'elle renvoie la **somme** de `priceCents × quantity` de
chaque article. Le code est en **TypeScript** : les types sont là pour t'aider (l'éditeur
te prévient si tu te trompes), et il est **réellement exécuté** (transpilé en JS).

Indice : `items.reduce(...)`.

<!--correction-->

## Correction

```ts
function totalCents(items: Item[]): number {
  return items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0)
}
```

`reduce` accumule le total ligne par ligne. Le typage `Item[]` → `number` documente
l'intention et fait que l'éditeur **autocomplète** `i.priceCents`.
