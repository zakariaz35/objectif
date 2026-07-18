---
title: "Jointures « à la Excel » entre deux tables"
type: lesson
---

# Enrichir une table à partir d'une autre

En SQL, on fait une **jointure** : on rapproche deux tables sur une clé commune. Dans
Excel, on reproduit l'idée en ajoutant des **colonnes calculées** à la table principale,
remplies par recherche.

## Le scénario

- `Sales` : `order_id | product_id | quantity | amount`
- `Products` : `product_id | name | unit_price`

On veut enrichir chaque vente avec le **nom** et le **prix unitaire** du produit.

```
// product_name column in Sales
=XLOOKUP([@product_id], Products[product_id], Products[name], "unknown")

// unit_price column in Sales
=XLOOKUP([@product_id], Products[product_id], Products[unit_price], 0)
```

C'est l'équivalent d'un `LEFT JOIN Sales ... ON Sales.product_id = Products.product_id` :
chaque ligne de `Sales` est conservée, enrichie par la table de référence.

## Vérifier la qualité de la jointure

Avant de faire confiance au résultat, pose-toi deux questions.

**Y a-t-il des clés manquantes ?** (des ventes dont le `product_id` n'existe pas dans
`Products`)

```
// Number of orphan sales (product not found)
=SUMPRODUCT(--(COUNTIFS(Products[product_id], Sales[product_id]) = 0))
```

**La clé est-elle bien unique côté Products ?** Si un `product_id` apparaît deux fois dans
`Products`, la recherche renvoie le **premier** trouvé — silencieusement.

```
// Flags duplicate product_id values in the reference table
=COUNTIFS(Products[product_id], [@product_id]) > 1
```

> **Piège —** une recherche suppose une clé **unique** dans la table de référence. Vérifie
> toujours l'unicité avant de joindre, sinon tu enrichis avec la mauvaise valeur sans t'en
> rendre compte.

> **À retenir —** une « jointure Excel » = des colonnes calculées par `XLOOKUP` /
> `INDEX+MATCH`. Contrôle les clés **manquantes** et les clés **dupliquées** avant de te
> fier au résultat.
