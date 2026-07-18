---
title: "Exercice — pièges DAX (contexte & totaux)"
type: exercise
---

## Énoncé

Modèle : `Sales(order_id, order_date, product_id, customer_id, amount, quantity, unit_cost)`,
`Products(product_id, name, category)`, `Customers(customer_id, name, region)`, table `Date` marquée.

Pour chacun des cas suivants, dis si la mesure est **correcte ou erronée**, explique pourquoi, et propose la correction si nécessaire.

**Cas 1 — Marge par ligne**

```text
Margin % = Sales[amount] - Sales[unit_cost] / Sales[amount]
```

**Cas 2 — Part de catégorie**

```text
Category Share % =
DIVIDE ( [Total Sales], SUM ( Sales[amount] ) )
```

**Cas 3 — Clients actifs ce mois**

```text
Active Customers This Month =
CALCULATE (
    DISTINCTCOUNT ( Sales[customer_id] ),
    DATESMTD ( 'Date'[date] )
)
```

On l'utilise dans une **carte** sans slicer de date. Y a-t-il un problème ?

**Cas 4 — Total des ventes Electronics + Furniture**

```text
Elec Or Furniture Sales =
CALCULATE (
    [Total Sales],
    Products[category] = "Electronics",
    Products[category] = "Furniture"
)
```

**Cas 5 — Ratio panier moyen**

```text
Avg Basket = [Total Sales] / [Order Count]
```

Est-ce acceptable ? Que risque-t-on ?

<!--correction-->

## Correction

### Cas 1 — Marge par ligne : ERRONÉE

```text
// WRONG: operator precedence — division applied before subtraction
Margin % = Sales[amount] - Sales[unit_cost] / Sales[amount]
// reads as: amount - (unit_cost / amount)  → completely wrong
```

**Correction** :

```text
// CORRECT: parentheses enforce the right order, and DIVIDE protects from zero
Margin % =
DIVIDE ( Sales[amount] - Sales[unit_cost], Sales[amount] )
```

Deux règles :
- Toujours utiliser des parenthèses pour clarifier l'ordre des opérations.
- Toujours `DIVIDE` pour les ratios (protège la division par zéro).

---

### Cas 2 — Part de catégorie : ERRONÉE (presque)

```text
// WRONG: denominator SUM(Sales[amount]) evaluates in the SAME filter context
// as the numerator [Total Sales] — they are identical → always returns 1 (100%)
Category Share % =
DIVIDE ( [Total Sales], SUM ( Sales[amount] ) )
```

`SUM(Sales[amount])` dans ce contexte = `[Total Sales]` dans ce contexte → ratio toujours = 1.

**Correction** : il faut **retirer le filtre** sur le dénominateur pour obtenir le total global :

```text
// CORRECT: ALL removes the category filter on the denominator
Category Share % =
DIVIDE (
    [Total Sales],
    CALCULATE ( [Total Sales], ALL ( Products[category] ) )
)
```

---

### Cas 3 — Clients actifs : usage potentiellement trompeur

La mesure est **techniquement correcte**, mais affichée dans une carte **sans contexte de date**, `DATESMTD` prend le mois le plus récent de la table `Date` (pas nécessairement « aujourd'hui »). Si la table `Date` couvre jusqu'en décembre 2025, on obtient les clients de décembre 2025 — pas forcément ce qu'on veut.

**Conseil** : accompagner cette mesure d'un slicer de date sur la page, ou utiliser `TODAY()` pour ancrer le calcul :

```text
Active Customers This Month =
CALCULATE (
    DISTINCTCOUNT ( Sales[customer_id] ),
    DATESMTD ( 'Date'[date] ),
    'Date'[date] <= TODAY()
)
```

---

### Cas 4 — OR dans CALCULATE : ERRONÉE

```text
// WRONG: two separate filter arguments = AND → no row can be BOTH Electronics AND Furniture
CALCULATE (
    [Total Sales],
    Products[category] = "Electronics",
    Products[category] = "Furniture"
)
// → returns BLANK (no product belongs to both categories simultaneously)
```

**Correction** : pour un `OR`, utilise `FILTER` avec `||` :

```text
// CORRECT: filter on the Products table with OR condition
Elec Or Furniture Sales =
CALCULATE (
    [Total Sales],
    FILTER (
        ALL ( Products[category] ),
        Products[category] = "Electronics" || Products[category] = "Furniture"
    )
)
```

ou, plus concis avec `IN` :

```text
Elec Or Furniture Sales =
CALCULATE (
    [Total Sales],
    Products[category] IN { "Electronics", "Furniture" }
)
```

---

### Cas 5 — Division nue : acceptable mais risqué

```text
Avg Basket = [Total Sales] / [Order Count]
```

C'est **fonctionnel** si `[Order Count]` n'est jamais zéro. Mais si un contexte filtre un mois sans commande, on obtient une **erreur de division par zéro** visible dans le rapport.

**Correction recommandée** :

```text
// SAFE: DIVIDE returns BLANK (not an error) when denominator = 0
Avg Basket = DIVIDE ( [Total Sales], [Order Count] )
```

> **À retenir** — Les quatre pièges DAX les plus fréquents : (1) précédence des opérateurs → toujours parenthèses + `DIVIDE`, (2) dénominateur dans le même contexte → oublier `ALL`, (3) plusieurs filtres CALCULATE = `AND` pas `OR` → utiliser `FILTER + ||` ou `IN`, (4) division nue → toujours `DIVIDE`.
