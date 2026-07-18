---
title: "Exercice — logique de panier (TS)"
type: exercise
exercise:
  language: ts
  starter: |
    interface CartItem {
      id: number
      name: string
      price: number
      quantity: number
    }

    // Pure cart logic — the kind useState would manage in a real component.
    // Implement the three operations below.

    // Add an item to the cart. If it already exists (same id), increment its quantity.
    function addToCart(cart: CartItem[], item: Omit<CartItem, 'quantity'>): CartItem[] {
      // TODO
      return []
    }

    // Remove all entries for a given id.
    function removeFromCart(cart: CartItem[], id: number): CartItem[] {
      // TODO
      return []
    }

    // Compute total price (sum of price * quantity).
    function cartTotal(cart: CartItem[]): number {
      // TODO
      return 0
    }
  tests:
    - name: "ajout d'un nouvel article"
      code: |
        const cart: CartItem[] = []
        const result = addToCart(cart, { id: 1, name: 'Stylo', price: 2 })
        console.log('panier :', result)
        assertEqual(result.length, 1, '1 article dans le panier')
        assertEqual(result[0].quantity, 1, 'quantité initiale = 1')
    - name: "ajout d'un article déjà présent"
      code: |
        const cart: CartItem[] = [{ id: 1, name: 'Stylo', price: 2, quantity: 1 }]
        const result = addToCart(cart, { id: 1, name: 'Stylo', price: 2 })
        console.log('panier :', result)
        assertEqual(result.length, 1, 'toujours 1 ligne (pas de doublon)')
        assertEqual(result[0].quantity, 2, 'quantité incrémentée à 2')
    - name: "suppression d'un article"
      code: |
        const cart: CartItem[] = [
          { id: 1, name: 'Stylo', price: 2, quantity: 2 },
          { id: 2, name: 'Cahier', price: 5, quantity: 1 },
        ]
        const result = removeFromCart(cart, 1)
        assertEqual(result.length, 1, '1 article restant')
        assertEqual(result[0].id, 2, 'le Cahier reste')
    - name: "total du panier"
      code: |
        const cart: CartItem[] = [
          { id: 1, name: 'Stylo', price: 2, quantity: 3 },
          { id: 2, name: 'Cahier', price: 5, quantity: 2 },
        ]
        const total = cartTotal(cart)
        console.log('total :', total)
        assertEqual(total, 16, '2*3 + 5*2 = 16')
---

## Énoncé

> **Durée conseillée : ~20 min.** Dans un composant React, ces trois fonctions
> constitueraient la logique d'un hook `useCart`. Ici on les écrit comme des fonctions
> pures — plus faciles à tester.

Implémente les trois fonctions de gestion de panier :

1. `addToCart` : ajoute un article. S'il existe déjà (même `id`), incrémente sa
   `quantity` au lieu de créer un doublon. **Ne mute pas** le tableau original.
2. `removeFromCart` : retire toutes les lignes ayant le `id` donné.
3. `cartTotal` : retourne la somme `price * quantity`.

Indice pour `addToCart` : `cart.some(i => i.id === item.id)` pour tester l'existence,
puis `cart.map(...)` pour modifier ou `[...cart, { ...item, quantity: 1 }]` pour ajouter.

<!--correction-->

## Correction

```ts
function addToCart(cart: CartItem[], item: Omit<CartItem, 'quantity'>): CartItem[] {
  const exists = cart.some((i) => i.id === item.id)
  if (exists) {
    return cart.map((i) =>
      i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
    )
  }
  return [...cart, { ...item, quantity: 1 }]
}

function removeFromCart(cart: CartItem[], id: number): CartItem[] {
  return cart.filter((i) => i.id !== id)
}

function cartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
}
```

Points clés :
- **Immuabilité** : `map` et `filter` créent de nouveaux tableaux — exactement ce que
  `useState` attend.
- `addToCart` : deux branches (`map` si existe, spread si nouveau) — on ne `push` jamais.
- Dans un vrai composant : `const [cart, setCart] = useState<CartItem[]>([])`, puis
  `setCart(addToCart(cart, item))`.
