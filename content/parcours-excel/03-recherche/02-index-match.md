---
title: "INDEX + MATCH et recherche approchée"
type: lesson
---

# INDEX + EQUIV : l'alternative universelle

Si `XLOOKUP` n'est pas disponible (versions plus anciennes), le couple `INDEX` + `MATCH`
(EQUIV) fait tout, et travaille partout :

```
=INDEX(Products[name], MATCH([@product_id], Products[product_id], 0))
```

Décomposition :

- `MATCH([@product_id], Products[product_id], 0)` trouve la **position** de la clé.
  Le `0` impose une correspondance **exacte**.
- `INDEX(Products[name], position)` renvoie la valeur de `name` à cette position.

```mermaid
flowchart LR
    K["product_id cherché"] --> M["MATCH → position (ex. 3)"]
    M --> I["INDEX(name, 3) → 'Laptop'"]
```

C'est plus verbeux que `XLOOKUP`, mais parfaitement fiable et indépendant du numéro de
colonne.

## Recherche approchée : ranger dans des tranches

Toutes les recherches ne sont pas exactes. Pour classer un montant dans une **tranche**
(remise, tarif progressif), on utilise une recherche **approchée** sur une table de bornes
triée par ordre croissant.

Table `Tiers` triée par `min_amount` croissant :

| min_amount | discount |
|---|---|
| 0 | 0% |
| 200 | 5% |
| 500 | 10% |

```
// XLOOKUP in "closest value less than or equal to" mode
=XLOOKUP([@amount], Tiers[min_amount], Tiers[discount], 0, -1)

// Legacy equivalent: approximate MATCH (last argument = 1)
=INDEX(Tiers[discount], MATCH([@amount], Tiers[min_amount], 1))
```

Le `-1` de `XLOOKUP` (ou le `1` de `MATCH`) signifie « prends la borne juste en dessous ».
La table **doit** être triée croissante, sinon le résultat est faux.

## Arbre de décision : quelle formule de recherche ?

```mermaid
flowchart TD
    A["J'ai besoin de\nrechercher une valeur"] --> B{"XLOOKUP\ndisponible ?"}
    B -->|oui| C{"Recherche\nexacte ?"}
    B -->|non| D["INDEX + MATCH(…, 0)\npour une recherche exacte"]
    C -->|oui| E["XLOOKUP(clé, col_clé, col_résultat, fallback)"]
    C -->|non — tranches| F["XLOOKUP(…, -1) ou MATCH(…, 1)\nsur table triée croissante"]
    D --> G{"Recherche\napprochée ?"}
    G -->|oui| H["INDEX + MATCH(…, 1)\nsur table triée croissante"]
    G -->|non| D
```

## Cas concret : grille tarifaire fournisseur

Un fournisseur applique un prix dégressif selon le volume commandé. La table `Pricing`
(triée croissante sur `min_qty`) :

| min_qty | unit_price |
|---|---|
| 1 | 12.00 |
| 50 | 10.50 |
| 200 | 9.00 |
| 500 | 7.50 |

```
// Retrieve the applicable unit price for the ordered quantity
=XLOOKUP([@quantity], Pricing[min_qty], Pricing[unit_price], 0, -1)

// With INDEX+MATCH (older Excel)
=INDEX(Pricing[unit_price], MATCH([@quantity], Pricing[min_qty], 1))
```

Pour une commande de 120 unités, le résultat est `10.50` (la borne `50 ≤ qty < 200`).

> **À retenir —** `INDEX + MATCH(…, 0)` = recherche exacte universelle. Pour ranger une
> valeur dans des tranches (remise, tarif progressif), passe en mode **approché** (`-1`/`1`)
> sur une table de bornes triée croissante. La table **doit** être triée — sinon le résultat
> est faux sans message d'erreur.
