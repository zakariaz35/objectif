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

> **À retenir —** `XLOOKUP(clé, colonne_clé, colonne_résultat, valeur_si_absent)`. Mets
> toujours le 4ᵉ argument pour ne jamais laisser un `#N/A` polluer ton tableau.
