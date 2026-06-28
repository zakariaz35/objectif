---
title: "Exercice interactif — LEFT JOIN en TypeScript"
type: exercise
exercise:
  language: ts
  starter: |
    interface Customer {
      customerId: number
      name: string
    }
    interface Order {
      orderId: number
      customerId: number
      amount: number
    }
    interface LeftJoinRow {
      customerId: number
      name: string
      orderId: number | null  // null when the customer has no order
    }

    // Equivalent of:
    //   SELECT c.customerId, c.name, o.orderId
    //   FROM customers AS c
    //   LEFT JOIN orders AS o ON o.customerId = c.customerId
    // Every customer appears at least once.
    // Customers with no order get orderId = null.
    // Customers with multiple orders get one row per order.
    function leftJoinCustomers(customers: Customer[], orders: Order[]): LeftJoinRow[] {
      // TODO: implement LEFT JOIN semantics
      return []
    }
  tests:
    - name: "client sans commande → orderId null"
      code: |
        const customers: Customer[] = [
          { customerId: 1, name: 'Alice' },
          { customerId: 2, name: 'Bob' },   // no order
          { customerId: 3, name: 'Carol' },
        ]
        const orders: Order[] = [
          { orderId: 10, customerId: 1, amount: 100 },
          { orderId: 20, customerId: 1, amount: 200 },
          { orderId: 30, customerId: 3, amount: 50  },
        ]
        const got = leftJoinCustomers(customers, orders)
        console.log('customers :', customers)
        console.log('orders    :', orders)
        console.log('joined    :', got)
        // Alice → 2 rows, Bob → 1 row (null), Carol → 1 row
        assertEqual(got.length, 4, '4 lignes : Alice×2, Bob×1, Carol×1')
        const bob = got.find((r) => r.name === 'Bob')
        assertEqual(bob?.orderId, null, 'Bob : orderId doit être null')
    - name: "trouver les clients sans commande (WHERE orderId IS NULL)"
      code: |
        const customers: Customer[] = [
          { customerId: 1, name: 'Alice' },
          { customerId: 2, name: 'Bob' },
          { customerId: 3, name: 'Carol' },
        ]
        const orders: Order[] = [
          { orderId: 10, customerId: 1, amount: 100 },
          { orderId: 30, customerId: 3, amount: 50  },
        ]
        const allRows = leftJoinCustomers(customers, orders)
        // simulate: WHERE o.orderId IS NULL
        const withoutOrder = allRows.filter((r) => r.orderId === null)
        console.log('clients sans commande :', withoutOrder)
        assertEqual(withoutOrder.length, 1, 'un seul client sans commande')
        assertEqual(withoutOrder[0].name, 'Bob', 'Bob n\'a pas commandé')
    - name: "aucune commande → tous les clients avec orderId null"
      code: |
        const customers: Customer[] = [
          { customerId: 1, name: 'Alice' },
          { customerId: 2, name: 'Bob' },
        ]
        const got = leftJoinCustomers(customers, [])
        console.log('résultat sans commandes :', got)
        assertEqual(got.length, 2, 'les 2 clients présents même sans commandes')
        assert(got.every((r) => r.orderId === null), 'tous les orderId sont null')
---

## Énoncé

Implémente `leftJoinCustomers` : pour chaque client, récupère ses commandes (par
`customerId`) et construis une ligne `LeftJoinRow`. Un client **sans commande** doit
quand même apparaître — avec `orderId = null` (sémantique LEFT JOIN). Un client avec
**plusieurs commandes** produit **plusieurs lignes**.

C'est l'équivalent TypeScript de :

```sql
SELECT c.customerId, c.name, o.orderId
FROM customers AS c
LEFT JOIN orders AS o ON o.customerId = c.customerId;
```

Indice : indexe les commandes par `customerId` dans une `Map<number, Order[]>`. Pour
chaque client, si la `Map` ne contient rien, génère une ligne avec `orderId: null`.

<!--correction-->

## Correction

```ts
function leftJoinCustomers(customers: Customer[], orders: Order[]): LeftJoinRow[] {
  // Index orders by customerId (like a join key)
  const ordersByCustomer = new Map<number, Order[]>()
  for (const order of orders) {
    const list = ordersByCustomer.get(order.customerId) ?? []
    list.push(order)
    ordersByCustomer.set(order.customerId, list)
  }

  const rows: LeftJoinRow[] = []
  for (const customer of customers) {
    const customerOrders = ordersByCustomer.get(customer.customerId) ?? []
    if (customerOrders.length === 0) {
      // LEFT JOIN: customer with no order → one row with null on the right side
      rows.push({ customerId: customer.customerId, name: customer.name, orderId: null })
    } else {
      for (const order of customerOrders) {
        rows.push({
          customerId: customer.customerId,
          name: customer.name,
          orderId: order.orderId,
        })
      }
    }
  }
  return rows
}
```

La branche `customerOrders.length === 0` matérialise la sémantique LEFT JOIN : la ligne
de gauche (client) est **toujours conservée**, même quand il n'y a pas de correspondance
à droite. La valeur `null` côté `orderId` correspond au `NULL` renvoyé par SQL pour
les colonnes de la table de droite quand il n'y a pas de match. Pour isoler les clients
sans commande, on filtre ensuite `WHERE orderId === null`.
