---
title: "Exercice — tableau de bord logistique"
type: exercise
---

## Énoncé

Tu travailles dans le service Supply Chain. On te remet le tableau structuré `Deliveries` :

```
// Table: Deliveries
// Columns: delivery_id | supplier | order_date | promised_date | actual_date | qty | unit_cost | status
```

Écris les formules répondant aux questions suivantes. Utilise des **références structurées**.

1. **Nombre de livraisons en retard** (celles où `actual_date > promised_date`).
2. **Coût total** des commandes passées en **janvier 2025** (entre le 1er et le 31 janvier).
3. **Coût moyen par unité** pour le fournisseur `"FastShip"`, en protégeant contre
   `#DIV/0!` si ce fournisseur n'a pas de ligne.
4. Une **colonne calculée `delay_days`** : nombre de jours de retard (0 si livré à temps
   ou en avance).
5. Une **colonne calculée `alert`** qui vaut :
   - `"Late"` si `actual_date > promised_date`,
   - `"On time"` si `actual_date <= promised_date`,
   - `"Pending"` si `actual_date` est vide.
6. **Nombre de livraisons en retard** pour lesquelles `qty > 100` (grosse commande tardive).

<!--correction-->

## Correction

**1. Livraisons en retard**

On ne peut pas écrire `">" & Deliveries[promised_date]` colonne entière dans `COUNTIFS`
pour une comparaison colonne-à-colonne. On utilise `SUMPRODUCT` :

```
// Count rows where actual_date is after promised_date
=SUMPRODUCT((Deliveries[actual_date] > Deliveries[promised_date])
            * (Deliveries[actual_date] <> ""))
```

**2. Coût total en janvier 2025**

```
// Total cost for orders placed in January 2025
=SUMIFS(Deliveries[unit_cost],
        Deliveries[order_date], ">=" & DATE(2025,1,1),
        Deliveries[order_date], "<=" & DATE(2025,1,31))
```

**3. Coût moyen par unité — fournisseur "FastShip"**

```
// Average unit cost for FastShip, 0 if no rows match
=IFERROR(AVERAGEIFS(Deliveries[unit_cost], Deliveries[supplier], "FastShip"), 0)
```

**4. Colonne `delay_days`**

```
// Delay in days; 0 if on time or early; blank actual_date = not yet delivered
=IF([@actual_date] = "", 0,
    MAX(0, [@actual_date] - [@promised_date]))
```

`MAX(0, …)` évite les valeurs négatives (livraisons anticipées comptent 0 retard).

**5. Colonne `alert`**

```
// Delivery status label
=IFS([@actual_date] = "",         "Pending",
     [@actual_date] > [@promised_date], "Late",
     TRUE,                        "On time")
```

**6. Grosses commandes tardives**

```
// Late deliveries with qty > 100
=SUMPRODUCT((Deliveries[actual_date] > Deliveries[promised_date])
            * (Deliveries[actual_date] <> "")
            * (Deliveries[qty] > 100))
```

---

**Point méthode :** quand on compare deux colonnes ligne à ligne (et non une colonne à une
constante), `SUMPRODUCT` est l'outil naturel car `COUNTIFS` ne supporte pas les
comparaisons colonne-à-colonne directement. Retenir ce réflexe est un bon signe de
maturité Excel.
