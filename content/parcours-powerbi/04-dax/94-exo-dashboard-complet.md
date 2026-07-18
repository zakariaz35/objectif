---
title: "Exercice — mesures d'un dashboard vente complet"
type: exercise
---

## Énoncé

Modèle en étoile :
- `Sales(order_id, order_date, product_id, customer_id, amount, quantity, unit_cost)`
- `Products(product_id, name, category, brand)`
- `Customers(customer_id, name, region, segment)` (`segment` = `"B2B"` ou `"B2C"`)
- `Date` (marquée, continue)

Le responsable des ventes veut un dashboard avec les indicateurs suivants. **Écris chaque mesure DAX**.

1. **CA total** (base de tout).
2. **CA B2B uniquement** (segment `"B2B"`) — indépendamment du découpage visuel.
3. **Part B2B dans le CA total** (en %).
4. **Panier moyen** (CA par commande).
5. **Marge brute totale** — `unit_cost` manque dans `Sales` ? Utilise `SUMX`.
6. **Taux de marge brute** en %.
7. **CA du mois précédent** et **variation MoM en %**.
8. **CA cumulé depuis le début de l'année** (YTD).
9. **CA même période N-1** et **croissance YoY en %**.
10. **Nombre de clients distincts ayant commandé**.

<!--correction-->

## Correction

```text
// ── 1. Base ──────────────────────────────────────────────────────────────────

Total Sales =
SUM ( Sales[amount] )

// ── 2. Segment filter ────────────────────────────────────────────────────────

B2B Sales =
CALCULATE (
    [Total Sales],
    Customers[segment] = "B2B"
)

// ── 3. B2B share ─────────────────────────────────────────────────────────────

B2B Share % =
DIVIDE (
    [B2B Sales],
    CALCULATE ( [Total Sales], ALL ( Customers[segment] ) )
)

// ── 4. Average basket ────────────────────────────────────────────────────────

Order Count  = COUNTROWS ( Sales )
Avg Basket   = DIVIDE ( [Total Sales], [Order Count] )

// ── 5. Gross margin (unit_cost is on Sales) ──────────────────────────────────

Gross Margin =
SUMX (
    Sales,
    Sales[amount] - Sales[unit_cost] * Sales[quantity]
    // If amount = quantity * unit_price, you can also write:
    // Sales[quantity] * ( Sales[unit_price] - Sales[unit_cost] )
)

// ── 6. Gross margin rate ─────────────────────────────────────────────────────

Gross Margin % =
DIVIDE ( [Gross Margin], [Total Sales] )

// ── 7. MoM variation ─────────────────────────────────────────────────────────

Sales Prev Month =
CALCULATE ( [Total Sales], PREVIOUSMONTH ( 'Date'[date] ) )

Sales MoM % =
DIVIDE ( [Total Sales] - [Sales Prev Month], [Sales Prev Month] )

// ── 8. Year-to-date ──────────────────────────────────────────────────────────

Sales YTD =
TOTALYTD ( [Total Sales], 'Date'[date] )

// ── 9. Year-over-year ────────────────────────────────────────────────────────

Sales LY    =
CALCULATE ( [Total Sales], SAMEPERIODLASTYEAR ( 'Date'[date] ) )

Sales YoY % =
DIVIDE ( [Total Sales] - [Sales LY], [Sales LY] )

// ── 10. Distinct customers ───────────────────────────────────────────────────

Distinct Customers =
DISTINCTCOUNT ( Sales[customer_id] )
```

**Points de vigilance** :

- Mesure **5** (`Gross Margin`) : `SUMX` est indispensable car on doit calculer `(amount - unit_cost * quantity)` ligne par ligne avant de sommer. Un simple `SUM(Sales[amount]) - SUM(Sales[unit_cost])` donnerait un résultat faux si `unit_cost` est le coût unitaire (à multiplier par `quantity`).
- Mesure **3** (`B2B Share %`) : le `ALL(Customers[segment])` retire le filtre de segment pour le dénominateur. Sans lui, numérateur et dénominateur seraient identiques dans un visuel filtré sur B2B → toujours 100 %.
- Mesures **7, 8, 9** : elles nécessitent toutes la table `Date` marquée et continue. Sans elle, elles renvoient un blanc.
- **Convention** : toutes les mesures sont nommées clairement, décomposées (ex. `Sales Prev Month` séparé de `Sales MoM %`), et `DIVIDE` est systématique pour les ratios.
