---
title: "Exercice — la logique pure d'un CartService (TS)"
type: exercise
exercise:
  language: ts
  starter: |
    interface CartItem {
      name: string
      price: number      // unit price
      quantity: number
    }

    // The core logic a CartService would expose, isolated as a pure function.
    // - subtotal = sum of price * quantity for every item
    // - apply discountPercent (e.g. 10 means -10%), default 0
    // - round the final amount to 2 decimals
    // Return 0 for an empty cart.
    function cartTotal(items: CartItem[], discountPercent: number = 0): number {
      // TODO: implement
      return 0
    }
  tests:
    - name: "somme price * quantity"
      code: |
        const items: CartItem[] = [
          { name: 'Book', price: 10, quantity: 2 },
          { name: 'Pen', price: 5.5, quantity: 1 },
        ]
        const total = cartTotal(items)
        console.log('items :', items)
        console.log('total :', total)
        assertEqual(total, 25.5, '10*2 + 5.5*1 = 25.5')
    - name: "applique une remise de 10%"
      code: |
        const items: CartItem[] = [
          { name: 'Book', price: 10, quantity: 2 },
          { name: 'Pen', price: 5.5, quantity: 1 },
        ]
        const total = cartTotal(items, 10)
        console.log('total with -10% :', total)
        assertEqual(total, 22.95, '25.5 - 10% = 22.95')
    - name: "panier vide → 0"
      code: |
        assertEqual(cartTotal([]), 0, 'empty cart costs nothing')
    - name: "arrondit à 2 décimales"
      code: |
        const total = cartTotal([{ name: 'Odd', price: 33.333, quantity: 1 }])
        console.log('rounded :', total)
        assertEqual(total, 33.33, '33.333 rounded to 2 decimals')
---

## Énoncé

Un `CartService` finit toujours par contenir un calcul de **total**. Cette logique est
**pure** (entrée → sortie, sans effet de bord) : on peut donc l'isoler et la tester
directement, exactement ce qui rend un service facile à tester en DI.

Implémente `cartTotal(items, discountPercent = 0)` :

1. **sous-total** = somme de `price * quantity` sur tous les articles ;
2. applique `discountPercent` (ex. `10` = −10 %) ;
3. **arrondis** le résultat à 2 décimales ;
4. un panier vide renvoie `0`.

Indice pour l'arrondi : `Math.round(value * 100) / 100`.

<!--correction-->

## Correction

```ts
function cartTotal(items: CartItem[], discountPercent: number = 0): number {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discounted = subtotal * (1 - discountPercent / 100)
  return Math.round(discounted * 100) / 100
}
```

`reduce` accumule le sous-total (un panier vide donne `0` sans cas particulier). On
applique la remise en multipliant par `1 - discountPercent / 100`, puis on arrondit avec
l'astuce `Math.round(x * 100) / 100`.

Dans un vrai `CartService`, cette fonction serait une **méthode** ; isolée ainsi, elle se
teste sans rien instancier — c'est le bénéfice « testabilité » de la DI vu en pratique.
