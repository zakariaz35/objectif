---
title: "Exercice — recherches entre tables vente/achat"
type: exercise
---

## Énoncé

Tu disposes de trois tableaux structurés :

```
// Table: Orders
// Columns: order_id | client_id | product_code | quantity | order_date

// Table: Clients
// Columns: client_id | client_name | segment | credit_limit

// Table: Catalog
// Columns: product_code | product_name | list_price | min_qty_discount
```

Écris les formules pour chacun des besoins suivants :

1. Dans `Orders`, ajouter une colonne **`client_name`** : nom du client (renvoie
   `"Unknown"` si le `client_id` n'existe pas dans `Clients`).
2. Dans `Orders`, ajouter une colonne **`list_price`** : prix catalogue du produit
   (`0` si le code n'existe pas).
3. Dans `Orders`, ajouter une colonne **`line_total`** : `quantity × list_price`, en
   gérant le cas où `list_price` est absent.
4. Vérifier l'unicité de la clé dans `Catalog` : écrire une formule qui renvoie `TRUE`
   si le `product_code` courant est dupliqué dans `Catalog`.
5. Compter le nombre de commandes dont le `client_id` n'existe **pas** dans `Clients`
   (commandes orphelines).
6. La table `Catalog` contient une remise progressive : le prix remisé s'obtient en
   cherchant dans `Discounts` (colonnes `min_qty | discount_rate`, triée croissante)
   le taux applicable à la `quantity` commandée. Écris la formule de la colonne
   **`discounted_price`** dans `Orders`.

<!--correction-->

## Correction

**1. Colonne `client_name`**

```
// Retrieve client name; fallback to "Unknown" if client_id is missing
=XLOOKUP([@client_id], Clients[client_id], Clients[client_name], "Unknown")
```

**2. Colonne `list_price`**

```
// Retrieve list price from Catalog; 0 if product code not found
=XLOOKUP([@product_code], Catalog[product_code], Catalog[list_price], 0)
```

**3. Colonne `line_total`**

```
// Line total: quantity × retrieved price
=[@quantity] * XLOOKUP([@product_code], Catalog[product_code], Catalog[list_price], 0)
```

On peut aussi simplement écrire `[@quantity] * [@list_price]` si la colonne `list_price`
a déjà été calculée en point 2.

**4. Détecter les doublons dans `Catalog`**

```
// TRUE if this product_code appears more than once in Catalog
=COUNTIFS(Catalog[product_code], [@product_code]) > 1
```

Insère cette colonne calculée directement dans le tableau `Catalog`, ou dans une colonne
de vérification à côté.

**5. Commandes orphelines**

```
// Count orders whose client_id does not exist in Clients
=SUMPRODUCT(--(COUNTIFS(Clients[client_id], Orders[client_id]) = 0))
```

`--` convertit les `TRUE`/`FALSE` en `1`/`0` pour que `SUMPRODUCT` puisse additionner.

**6. Colonne `discounted_price` (recherche approchée)**

```
// Table Discounts: min_qty | discount_rate — sorted ascending by min_qty
// Approximate lookup: find the highest min_qty that is <= ordered quantity
=[@list_price]
  * (1 - XLOOKUP([@quantity], Discounts[min_qty], Discounts[discount_rate], 0, -1))
```

Le `-1` de `XLOOKUP` : prendre la borne inférieure la plus proche. La table `Discounts`
**doit** être triée par `min_qty` croissant, sinon le résultat est silencieusement faux.

---

**Points clés à retenir :**
- Toujours fournir un 4ᵉ argument (fallback) à `XLOOKUP` pour éviter les `#N/A`.
- Valider l'unicité de la clé dans la table de référence **avant** de joindre.
- Une recherche approchée (`-1`) nécessite une table **triée** : documente-le dans le
  classeur pour les futurs mainteneurs.
