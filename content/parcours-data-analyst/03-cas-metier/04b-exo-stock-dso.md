---
title: "Exercice — inventoryTurnover & dso"
type: exercise
exercise:
  language: ts
  starter: |
    // 1) Inventory turnover: how many times stock is renewed over the period.
    //    turnover = costOfGoods / averageStock
    //    averageStock = (stockStart + stockEnd) / 2
    //    If averageStock === 0 -> null (no stock to turn over).
    function inventoryTurnover(
      costOfGoods: number,
      stockStart: number,
      stockEnd: number,
    ): number | null {
      // TODO: implement
      return null
    }

    // 2) Days Sales Outstanding (DSO): average number of days to collect payment.
    //    dso = (receivables / revenue) * periodDays
    //    If revenue === 0 -> null.
    function dso(
      receivables: number,
      revenue: number,
      periodDays: number,
    ): number | null {
      // TODO: implement
      return null
    }
  tests:
    - name: "inventoryTurnover — cas annuel classique"
      code: |
        // COGS = 120 000 ; stock start = 20 000 ; stock end = 40 000
        // avg stock = 30 000 ; turnover = 120 000 / 30 000 = 4
        const got = inventoryTurnover(120000, 20000, 40000)
        console.log('annual turnover (×):', got)
        assertEqual(got, 4, 'COGS 120k / avg stock 30k = 4×')
    - name: "inventoryTurnover — stock stable"
      code: |
        // avg stock = 60 000 ; turnover = 360 000 / 60 000 = 6
        const got = inventoryTurnover(360000, 60000, 60000)
        console.log('turnover:', got)
        assertEqual(got, 6, 'stable stock: 360k / 60k = 6×')
    - name: "inventoryTurnover — stock nul"
      code: |
        assertEqual(inventoryTurnover(50000, 0, 0), null, 'no stock -> null')
    - name: "dso — trimestre (90 jours)"
      code: |
        // receivables = 45 000 ; revenue = 300 000 ; period = 90 days
        // dso = 45000 / 300000 * 90 = 13.5 days
        const got = dso(45000, 300000, 90)
        console.log('DSO (days):', got)
        assertEqual(got, 13.5, '45k / 300k * 90 = 13.5 days')
    - name: "dso — année (365 jours)"
      code: |
        // receivables = 60 000 ; annual revenue = 400 000
        // dso = 60000 / 400000 * 365 = 54.75
        const got = dso(60000, 400000, 365)
        console.log('annual DSO:', got)
        assertEqual(got, 54.75, '60k / 400k * 365 = 54.75 days')
    - name: "dso — revenue nul"
      code: |
        assertEqual(dso(0, 0, 30), null, 'no revenue -> null')
    - name: "dso — zéro créances (clients qui paient comptant)"
      code: |
        assertEqual(dso(0, 100000, 30), 0, 'no receivables -> DSO = 0 days')
---

## Énoncé

Deux KPI logistique et finance à implémenter sur des données numériques directes.

**1. `inventoryTurnover(costOfGoods, stockStart, stockEnd)`** — rotation de stock :

```
stock moyen  = (stockStart + stockEnd) / 2
turnover (×) = costOfGoods / stock moyen
```

Si le stock moyen est nul → `null` (pas de stock à faire tourner).

**Interprétation :** une rotation **6×** signifie que le stock se renouvelle 6 fois par
an (toutes les ~2 mois). Haute = capital fluide, risque de rupture. Basse = surstock,
capital immobilisé.

**2. `dso(receivables, revenue, periodDays)`** — délai moyen de paiement :

```
DSO (jours) = (receivables / revenue) × periodDays
```

Si `revenue === 0` → `null`. `periodDays` = durée de la période analysée (ex. 90 jours
pour un trimestre, 365 pour un exercice annuel).

**Interprétation :** DSO = 13,5 j → les clients paient en moyenne 13,5 jours après
facturation (excellent). DSO = 55 j → trésorerie sous tension, à surveiller.

> Astuce : les deux formules sont directes — la seule complexité est la garde
> « dénominateur nul → null ».

<!--correction-->

## Correction

```ts
function inventoryTurnover(
  costOfGoods: number,
  stockStart: number,
  stockEnd: number,
): number | null {
  const avgStock = (stockStart + stockEnd) / 2
  if (avgStock === 0) return null
  return costOfGoods / avgStock
}

function dso(
  receivables: number,
  revenue: number,
  periodDays: number,
): number | null {
  if (revenue === 0) return null
  return (receivables / revenue) * periodDays
}
```

Pour `inventoryTurnover`, on divise les ventes **au coût** (COGS — *cost of goods sold*)
par le stock moyen, pas par le CA. Utiliser le CA au numérateur serait une erreur : on
compare des flux de coût à un stock en valeur d'achat.

Pour `dso`, on multiplie le ratio `créances / CA` par la durée de la période. Il faut
toujours préciser `periodDays` : un DSO calculé sur 30 jours vs 365 jours ne se compare
pas directement.
