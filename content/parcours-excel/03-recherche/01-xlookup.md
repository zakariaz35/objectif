---
title: "XLOOKUP : la recherche moderne"
type: lesson
---

# XLOOKUP (RECHERCHEX) : aller chercher une valeur ailleurs

Le besoin est constant : depuis la table `Sales`, retrouver le `name` d'un produit qui vit
dans la table `Products`. C'est une **recherche** : on a une clé (`product_id`), on veut la
valeur correspondante.

`XLOOKUP` remplace l'ancien `VLOOKUP` (RECHERCHEV) — plus simple, plus robuste, et il
cherche dans n'importe quel sens.

```
// Retrieve the product name from product_id, in the Products table
=XLOOKUP([@product_id], Products[product_id], Products[name], "unknown")
```

Lecture des arguments :

1. **ce qu'on cherche** : `[@product_id]` ;
2. **où chercher** : la colonne `Products[product_id]` ;
3. **quoi renvoyer** : la colonne `Products[name]` ;
4. **valeur si absent** (optionnel) : `"unknown"`.

Ce 4ᵉ argument est précieux : il évite les `#N/A` quand une clé n'existe pas.

## Pourquoi pas VLOOKUP ?

`VLOOKUP` a deux faiblesses qui causent des bugs en production :

```
// VLOOKUP: 4 arguments, including a fragile column number
=VLOOKUP([@product_id], Products, 2, FALSE)
```

- il faut compter la **colonne de retour** par son numéro (`2`) : insère une colonne et
  tout se décale ;
- il ne peut chercher que **vers la droite** : la clé doit être la première colonne.

`XLOOKUP` désigne les colonnes par leur nom et cherche dans les deux sens. Si tu en as la
version, utilise-le par défaut.

## Renvoyer plusieurs colonnes

`XLOOKUP` peut renvoyer un bloc de colonnes d'un coup :

```
// Returns name AND unit_price side by side
=XLOOKUP([@product_id], Products[product_id], Products[[name]:[unit_price]], "unknown")
```

## Le schéma clé → recherche

![Schéma XLOOKUP : clé dans Sales, recherche dans Products, retour du nom](assets/xlookup-schema.svg)

## Recherche inversée : vers la gauche

`VLOOKUP` ne peut chercher que vers la droite (la clé doit être la première colonne de la
plage). `XLOOKUP` s'en moque :

```
// Find product_id from a product name (reverse lookup, left-to-right or right-to-left)
=XLOOKUP("Laptop", Products[name], Products[product_id], "not found")
```

## Cas d'usage achat : enrichir un bon de commande

```
// Purchase order line: retrieve unit_price from Products using article code
=XLOOKUP([@article_code], Products[code], Products[unit_price], 0)

// Calculated column: line total
=[@quantity] * XLOOKUP([@article_code], Products[code], Products[unit_price], 0)
```

## Pas-à-pas : enrichir un tableau de ventes pour l'analyse

Contexte : la table `Sales` (`order_id | order_date | product_id | quantity | amount`)
n'a que l'identifiant produit. Pour filtrer par catégorie dans un TCD, tu as besoin du
nom et de la catégorie, qui se trouvent dans la table `Products`
(`product_id | name | category | unit_price`).

**Étape 1 — Ajouter la colonne `product_name`.**
Clique sur la première cellule vide après la dernière colonne de `Sales` (exemple : `F2`),
frappe `product_name` comme titre, valide. Entre en `F2` :

```
// Retrieve product name; "unknown" flags missing products
=XLOOKUP([@product_id], Products[product_id], Products[name], "unknown")
```

La formule se propage sur toutes les lignes du Tableau.

**Étape 2 — Ajouter la colonne `category`.**
En `G2`, même logique :

```
=XLOOKUP([@product_id], Products[product_id], Products[category], "unknown")
```

**Étape 3 — Vérifier les enrichissements manquants.**
En dehors du Tableau (par exemple en `I1`) :

```
// Count sales rows where the product was not found in Products
=COUNTIFS(Sales[product_name], "unknown")
```

Si ce nombre est supérieur à zéro, il y a des `product_id` dans `Sales` qui n'existent
pas dans `Products`. Corrige la table de référence avant d'analyser.

**Étape 4 — Valider l'unicité de la clé.**
Toujours avant une jointure, vérifie que la clé est unique dans la table de référence :

```
// TRUE if a product_id appears more than once in Products (should be zero rows)
=COUNTIFS(Products[product_id], [@product_id]) > 1
```

Filtre sur `TRUE` pour voir les doublons. Si `XLOOKUP` trouve plusieurs lignes, il
renvoie la première silencieusement — le résultat paraît correct mais peut être faux.

## Comparaison : RECHERCHEV vs RECHERCHEX vs INDEX+EQUIV

| Critère | `VLOOKUP` | `XLOOKUP` | `INDEX + MATCH` |
|---|---|---|---|
| Disponibilité | Toutes versions | Excel 2021 / Microsoft 365 | Toutes versions |
| Direction | Vers la droite uniquement | Dans les deux sens | Dans les deux sens |
| Référence colonne résultat | Numéro fragile (`2`, `3`…) | Nom de colonne | Nom de colonne |
| Valeur par défaut si absent | Non (`#N/A`) | Oui (4ᵉ argument) | Via `IFERROR` |
| Retourner plusieurs colonnes | Non | Oui (`col1:col2`) | Non |
| Lisibilité | Moyenne | Excellente | Bonne |

**Règle de décision :** Microsoft 365 ou Excel 2021 → utilise `XLOOKUP` par défaut.
Classeur partagé avec des collègues sur Excel 2016/2019 → utilise `INDEX + MATCH` qui
fonctionne partout. N'utilise plus `VLOOKUP` dans les nouveaux classeurs : le numéro de
colonne casse dès qu'on insère une colonne dans la table de référence.

> **Piège —** si deux lignes de `Products` ont le même `code`, `XLOOKUP` renvoie la
> **première** trouvée (comportement identique à `VLOOKUP`). Vérifie l'unicité de la clé
> avant de te fier au résultat.

> **À retenir —** `XLOOKUP(clé, colonne_clé, colonne_résultat, valeur_si_absent)`. Mets
> toujours le 4ᵉ argument pour ne jamais laisser un `#N/A` polluer ton tableau. Et
> souviens-toi : `XLOOKUP` cherche dans les deux sens, `VLOOKUP` non.
