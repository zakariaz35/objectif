---
title: "Exercice interactif — HAVING en TypeScript"
type: exercise
exercise:
  language: ts
  starter: |
    interface Order {
      orderId: number
      category: string
      amount: number
    }

    interface GroupRow {
      category: string
      nbOrders: number
      totalRevenue: number
    }

    // Equivalent of:
    //   SELECT category, COUNT(*) AS nbOrders, SUM(amount) AS totalRevenue
    //   FROM orders
    //   GROUP BY category
    //   HAVING COUNT(*) >= minOrders AND SUM(amount) >= minRevenue
    //   ORDER BY totalRevenue DESC
    // Returns only groups satisfying BOTH conditions, sorted by totalRevenue descending.
    function groupsWithHaving(
      orders: Order[],
      minOrders: number,
      minRevenue: number,
    ): GroupRow[] {
      // TODO: group, aggregate, then filter groups (HAVING), sort desc by totalRevenue
      return []
    }
  tests:
    - name: "HAVING filtre les groupes pas les lignes"
      code: |
        const orders: Order[] = [
          { orderId: 1, category: 'Office',   amount: 100 },
          { orderId: 2, category: 'Office',   amount: 200 },
          { orderId: 3, category: 'Office',   amount: 50  },
          { orderId: 4, category: 'Hardware', amount: 900 },
          { orderId: 5, category: 'Software', amount: 10  },
        ]
        // minOrders=2, minRevenue=300
        // Office: 3 cmds, 350 → passe (3>=2 ET 350>=300)
        // Hardware: 1 cmd, 900 → échoue (1 < 2)
        // Software: 1 cmd, 10  → échoue
        const got = groupsWithHaving(orders, 2, 300)
        console.log('input  :', orders)
        console.log('résultat HAVING (minOrders=2, minRevenue=300) :', got)
        assertEqual(got.length, 1, 'seul Office passe les deux conditions')
        assertEqual(got[0].category, 'Office', 'Office est retenu')
        assertEqual(got[0].totalRevenue, 350, 'totalRevenue = 100+200+50')
        assertEqual(got[0].nbOrders, 3, 'nbOrders = 3')
    - name: "filtre sur CA uniquement"
      code: |
        const orders: Order[] = [
          { orderId: 1, category: 'Office',   amount: 100 },
          { orderId: 2, category: 'Office',   amount: 200 },
          { orderId: 3, category: 'Hardware', amount: 900 },
          { orderId: 4, category: 'Software', amount: 10  },
        ]
        // minOrders=1, minRevenue=500 → Hardware (900) passe seul
        const got = groupsWithHaving(orders, 1, 500)
        console.log('résultat HAVING (minOrders=1, minRevenue=500) :', got)
        assertEqual(got.length, 1, 'seul Hardware passe (CA >= 500)')
        assertEqual(got[0].category, 'Hardware', 'Hardware retenu')
    - name: "tri par CA décroissant"
      code: |
        const orders: Order[] = [
          { orderId: 1, category: 'Office',   amount: 400 },
          { orderId: 2, category: 'Hardware', amount: 600 },
          { orderId: 3, category: 'Software', amount: 200 },
        ]
        const got = groupsWithHaving(orders, 1, 0)
        console.log('résultat trié par CA desc :', got.map((r) => r.category))
        assertEqual(got[0].category, 'Hardware', 'CA le plus élevé en premier')
        assertEqual(got[2].category, 'Software', 'CA le plus faible en dernier')
    - name: "table vide → []"
      code: |
        assertEqual(groupsWithHaving([], 1, 0), [], 'aucune commande → aucun groupe')
---

## Énoncé

Implémente `groupsWithHaving` : groupe par `category`, calcule `COUNT(*)` (→
`nbOrders`) et `SUM(amount)` (→ `totalRevenue`), puis **filtre les groupes** qui ne
satisfont pas `nbOrders >= minOrders AND totalRevenue >= minRevenue`. Trie le résultat
par `totalRevenue` décroissant.

C'est l'équivalent TypeScript de :

```sql
SELECT category, COUNT(*) AS nbOrders, SUM(amount) AS totalRevenue
FROM orders
GROUP BY category
HAVING COUNT(*) >= minOrders AND SUM(amount) >= minRevenue
ORDER BY totalRevenue DESC;
```

La clé du raisonnement : le `HAVING` s'applique **après** l'agrégation — d'abord on
groupe et on cumule, ensuite on filtre sur les valeurs calculées.

<!--correction-->

## Correction

```ts
function groupsWithHaving(
  orders: Order[],
  minOrders: number,
  minRevenue: number,
): GroupRow[] {
  // Step 1 — GROUP BY category (aggregate)
  const groups = new Map<string, GroupRow>()
  for (const order of orders) {
    const g = groups.get(order.category) ?? {
      category: order.category,
      nbOrders: 0,
      totalRevenue: 0,
    }
    g.nbOrders++
    g.totalRevenue += order.amount
    groups.set(order.category, g)
  }

  // Step 2 — HAVING (filter on aggregated values)
  return Array.from(groups.values())
    .filter((g) => g.nbOrders >= minOrders && g.totalRevenue >= minRevenue)
    .sort((a, b) => b.totalRevenue - a.totalRevenue) // ORDER BY totalRevenue DESC
}
```

Les deux étapes sont intentionnellement séparées pour refléter l'ordre logique SQL :
d'abord `GROUP BY` (accumulation dans la `Map`), puis `HAVING` (`.filter` sur les
agrégats). Mettre le filtre dans la boucle serait l'équivalent d'un `WHERE` — il
agirait **avant** l'agrégation, ce qui changerait le résultat.
