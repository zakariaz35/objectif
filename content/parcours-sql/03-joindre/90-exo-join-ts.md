---
title: "Exercice interactif — JOIN en TypeScript"
type: exercise
exercise:
  language: ts
  starter: |
    interface Order {
      orderId: number
      productId: number
      amount: number
    }
    interface Product {
      productId: number
      name: string
      category: string
    }
    interface JoinedRow {
      orderId: number
      productName: string
      category: string
      amount: number
    }

    // Equivalent of:
    //   SELECT o.orderId, p.name AS productName, p.category, o.amount
    //   FROM orders o
    //   JOIN products p ON p.productId = o.productId      (INNER JOIN)
    // An order whose productId has no matching product is dropped.
    function joinOrders(orders: Order[], products: Product[]): JoinedRow[] {
      // TODO: for each order, find its product and build the joined row
      return []
    }
  tests:
    - name: "inner join nominal"
      code: |
        const products: Product[] = [
          { productId: 10, name: 'Keyboard', category: 'Hardware' },
          { productId: 20, name: 'Notebook', category: 'Office' },
        ]
        const orders: Order[] = [
          { orderId: 1, productId: 10, amount: 100 },
          { orderId: 2, productId: 20, amount: 30 },
        ]
        const got = joinOrders(orders, products)
        console.log('orders   :', orders)
        console.log('products :', products)
        console.log('joined   :', got)
        assertEqual(got, [
          { orderId: 1, productName: 'Keyboard', category: 'Hardware', amount: 100 },
          { orderId: 2, productName: 'Notebook', category: 'Office', amount: 30 },
        ], 'each order enriched with its product')
    - name: "commande sans produit correspondant → exclue (INNER)"
      code: |
        const products: Product[] = [
          { productId: 10, name: 'Keyboard', category: 'Hardware' },
        ]
        const orders: Order[] = [
          { orderId: 1, productId: 10, amount: 100 },
          { orderId: 2, productId: 99, amount: 999 },
        ]
        const got = joinOrders(orders, products)
        console.log('joined :', got)
        assertEqual(got.length, 1, 'the unmatched order is dropped')
        assertEqual(got[0].orderId, 1, 'only the matching order remains')
    - name: "tables vides → []"
      code: |
        assertEqual(joinOrders([], []), [], 'nothing to join')
---

## Énoncé

Refais un `INNER JOIN orders × products` en TypeScript. Pour chaque commande, retrouve
son produit (par `productId`) et construis une ligne `JoinedRow`. Une commande dont le
`productId` n'existe **pas** dans `products` est **exclue** (sémantique INNER).

Indice : indexe d'abord les produits dans une `Map<number, Product>` (l'équivalent d'un
index sur la clé), puis parcours les commandes.

<!--correction-->

## Correction

```ts
function joinOrders(orders: Order[], products: Product[]): JoinedRow[] {
  const byId = new Map(products.map((p) => [p.productId, p]))
  const rows: JoinedRow[] = []
  for (const order of orders) {
    const product = byId.get(order.productId)
    if (!product) continue // no match → dropped (INNER JOIN)
    rows.push({
      orderId: order.orderId,
      productName: product.name,
      category: product.category,
      amount: order.amount,
    })
  }
  return rows
}
```

La `Map` joue le rôle de l'index sur `productId` : la recherche est en temps constant
plutôt qu'un balayage de `products` par commande. Le `if (!product) continue`
matérialise la sémantique **INNER** (pas de correspondance → ligne abandonnée). Pour un
`LEFT JOIN`, on garderait la ligne avec des champs produit à `null`.
