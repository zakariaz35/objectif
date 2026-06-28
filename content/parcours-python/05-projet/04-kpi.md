---
title: "Étape 3 — Les KPI globaux"
type: exercise
---

## Énoncé

Sur le DataFrame **nettoyé** (colonnes `product`, `category`, `quantity`, `amount`, `month`), calcule les indicateurs clés :

- **CA total** (`total_revenue`) : somme des `amount` ;
- **Nombre de commandes** (`order_count`) : nombre de lignes ;
- **Unités vendues** (`total_units`) : somme des `quantity` ;
- **Panier moyen** (`average_order`) : CA total / nombre de commandes.

Affiche-les dans un petit rapport formaté.

> Écris le code, puis déroule la correction.

<!--correction-->

## Correction

```python
total_revenue = df["amount"].sum()
order_count = len(df)
total_units = df["quantity"].sum()
average_order = total_revenue / order_count

print(f"Total revenue : {total_revenue:>10,.2f} €")
print(f"Orders        : {order_count:>10}")
print(f"Units sold    : {total_units:>10}")
print(f"Average order : {average_order:>10,.2f} €")
```

Sortie attendue :

```
Total revenue :     610,43 €
Orders        :          8
Units sold    :         24
Average order :      76,30 €
```

Détail du CA : `39.98 + 34.00 + 25.00 + 149.00 + 99.95 + 102.00 + 12.50 + 149.00 = 610.43`.
Panier moyen : `610.43 / 8 = 76.30`.

> **À retenir —** les KPI de base ne sont que des agrégations de colonnes (`sum`, `len`, division). La valeur ajoutée d'un analyste, c'est de les **présenter** clairement (alignement, séparateurs, unités) — d'où les f-strings formatées.
