---
title: "Dataset interactif — orders & products"
type: lesson
---

# Dataset interactif — orders & products

Cette leçon met le **dataset fil rouge** directement entre tes mains, sous forme de blocs
Python exécutables. Clique « Tester » sur chaque bloc pour le faire tourner dans Pyodide
(navigateur, pas de serveur). Tu peux modifier les valeurs et re-exécuter.

> Toutes les valeurs sont **cohérentes avec le reste du capstone** : les 6 commandes et
> les 4 produits sont exactement ceux décrits dans l'étape 1 (cadrage). CA total attendu :
> **260 €**, marge totale : **104 €**.

---

## Charger les deux tables

```python
import io
import pandas as pd

ORDERS_CSV = """order_id,order_date,customer_id,product_id,quantity,unit_price,discount,region
1001,2024-01-05,C001,P01,2,20,0.00,North
1002,2024-01-18,C002,P02,1,50,0.10,South
1003,2024-02-02,C001,P03,3,12,0.00,North
1004,2024-02-20,C003,P01,1,20,0.05,East
1005,2024-03-11,C002,P04,5,8,0.00,South
1006,2024-03-29,C004,P02,2,50,0.20,West
"""

PRODUCTS_CSV = """product_id,name,category,cost
P01,Wireless Mouse,Accessories,12
P02,Office Chair,Furniture,30
P03,Notebook,Stationery,5
P04,Ballpoint Pen,Stationery,3
"""

orders   = pd.read_csv(io.StringIO(ORDERS_CSV))
products = pd.read_csv(io.StringIO(PRODUCTS_CSV))

print("=== orders ===")
print(orders.to_string(index=False))
print("\n=== products ===")
print(products.to_string(index=False))
```

Les types pandas détectés automatiquement : `order_id` et `quantity` sont `int64`,
`unit_price`, `discount` et `cost` sont `float64`. La colonne `order_date` reste une
chaîne — on la convertira si on fait du filtrage par date.

---

## Exemple 1 — CA total

La formule du **revenu d'une ligne** : `quantity * unit_price * (1 - discount)`.

```python
import io
import pandas as pd

ORDERS_CSV = """order_id,order_date,customer_id,product_id,quantity,unit_price,discount,region
1001,2024-01-05,C001,P01,2,20,0.00,North
1002,2024-01-18,C002,P02,1,50,0.10,South
1003,2024-02-02,C001,P03,3,12,0.00,North
1004,2024-02-20,C003,P01,1,20,0.05,East
1005,2024-03-11,C002,P04,5,8,0.00,South
1006,2024-03-29,C004,P02,2,50,0.20,West
"""

orders = pd.read_csv(io.StringIO(ORDERS_CSV))

# Line revenue (discount is a rate: 0.10 = -10 %)
orders["line_revenue"] = orders["quantity"] * orders["unit_price"] * (1 - orders["discount"])

total_revenue = orders["line_revenue"].sum().round(2)
avg_basket    = orders["line_revenue"].mean().round(2)

print(f"Total revenue : {total_revenue} €")   # expected: 260.0 €
print(f"Average basket: {avg_basket} €")       # expected:  43.33 €

print("\nRevenue by order:")
print(orders[["order_id", "line_revenue"]].to_string(index=False))
```

Détail ligne par ligne :

| order_id | Calcul | Revenu |
|---|---|---|
| 1001 | 2 × 20 × 1,00 | **40 €** |
| 1002 | 1 × 50 × 0,90 | **45 €** |
| 1003 | 3 × 12 × 1,00 | **36 €** |
| 1004 | 1 × 20 × 0,95 | **19 €** |
| 1005 | 5 ×  8 × 1,00 | **40 €** |
| 1006 | 2 × 50 × 0,80 | **80 €** |

---

## Exemple 2 — CA et marge par catégorie

On **joint** les deux tables sur `product_id` pour accéder à `category` et `cost`.

```python
import io
import pandas as pd

ORDERS_CSV = """order_id,order_date,customer_id,product_id,quantity,unit_price,discount,region
1001,2024-01-05,C001,P01,2,20,0.00,North
1002,2024-01-18,C002,P02,1,50,0.10,South
1003,2024-02-02,C001,P03,3,12,0.00,North
1004,2024-02-20,C003,P01,1,20,0.05,East
1005,2024-03-11,C002,P04,5,8,0.00,South
1006,2024-03-29,C004,P02,2,50,0.20,West
"""

PRODUCTS_CSV = """product_id,name,category,cost
P01,Wireless Mouse,Accessories,12
P02,Office Chair,Furniture,30
P03,Notebook,Stationery,5
P04,Ballpoint Pen,Stationery,3
"""

orders   = pd.read_csv(io.StringIO(ORDERS_CSV))
products = pd.read_csv(io.StringIO(PRODUCTS_CSV))

# Merge on product_id (inner join)
merged = orders.merge(products, on="product_id")

merged["line_revenue"] = (
    merged["quantity"] * merged["unit_price"] * (1 - merged["discount"])
)
merged["line_cost"]   = merged["quantity"] * merged["cost"]
merged["line_margin"] = merged["line_revenue"] - merged["line_cost"]

# Aggregate by category
summary = merged.groupby("category").agg(
    revenue=("line_revenue", "sum"),
    margin=("line_margin", "sum"),
).round(2)

summary["margin_pct"] = (summary["margin"] / summary["revenue"] * 100).round(1)
summary = summary.sort_values("revenue", ascending=False)

print(summary.to_string())
# Expected:
#              revenue  margin  margin_pct
# Furniture     125.0    35.0        28.0
# Stationery     76.0    46.0        60.5
# Accessories    59.0    23.0        39.0
```

**Insight à retenir** : Furniture domine le CA (48 %), mais Stationery affiche le
meilleur taux de marge (60,5 %). Un CA élevé ne garantit pas la rentabilité.

---

> **À retenir** — Ce bloc est ta **base de départ** pour tous les exercices du capstone :
> copie-le, modifie une colonne, ajoute un `groupby`, et explore. Pyodide charge `pandas`
> et `numpy` dans le navigateur — pas besoin d'installer quoi que ce soit.
