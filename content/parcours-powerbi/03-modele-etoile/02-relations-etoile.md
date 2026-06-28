---
title: "Relations & schéma en étoile"
type: lesson
---

# Relier les tables : l'étoile

Dans la **vue Modèle** de Power BI, on relie la table de faits aux dimensions par des **relations**. Le résultat ressemble à une étoile : le fait au centre, les dimensions autour.

![Modèle en étoile — Sales au centre](assets/star-schema.svg)

## Le schéma en étoile

```mermaid
erDiagram
    Date ||--o{ Sales : "order_date"
    Products ||--o{ Sales : "product_id"
    Customers ||--o{ Sales : "customer_id"

    Sales {
        string order_id
        date order_date
        string product_id
        string customer_id
        decimal amount
        int quantity
    }
    Products {
        string product_id PK
        string name
        string category
    }
    Customers {
        string customer_id PK
        string name
        string region
    }
    Date {
        date date PK
        int year
        int month
        string month_name
    }
```

`Sales` est au centre ; `Products`, `Customers` et `Date` rayonnent autour. C'est le modèle **que Power BI préfère** : performant, lisible, et c'est sur lui que DAX raisonne le mieux.

## Relations 1-* (un-à-plusieurs)

Chaque relation va du côté **un** (la dimension, clé unique) vers le côté **plusieurs** (le fait). Un produit apparaît dans **plusieurs** ventes ; une vente concerne **un** produit.

```mermaid
flowchart LR
    P["Products (1)<br/>product_id unique"] -->|"1 → *"| S["Sales (*)<br/>product_id répété"]
```

La relation rend le **filtre dimensionnel** possible : filtrer `Products[category] = "Electronics"` propage le filtre vers `Sales` et ne garde que les ventes correspondantes. Le sens du filtre va naturellement du **un** vers le **plusieurs**.

## Étoile vs flocon

- **Étoile (star)** : dimensions directement reliées au fait, chacune en une table « aplatie » (ex. `Products` contient déjà `category`). Simple, rapide. **À privilégier.**
- **Flocon (snowflake)** : une dimension est elle-même éclatée en sous-tables (`Products` → `Categories` séparée). Plus normalisé, mais plus de relations, plus lent, plus complexe.

```mermaid
flowchart TB
    subgraph Flocon
      C[Categories] --> P2[Products] --> S2[Sales]
    end
    subgraph Étoile
      P1["Products (category inclus)"] --> S1[Sales]
    end
```

En Power BI, on **dénormalise volontairement** vers l'étoile : on fait remonter `category` dans `Products` (souvent via un *Merge* en Power Query). Le moteur est optimisé pour ça.

## Pièges de relations courants

### La relation inactive

Power BI n'autorise qu'**une seule relation active** entre deux tables. Si `Sales` contient à la fois `order_date` et `delivery_date`, et que `Date` est reliée aux deux, **une seule** sera active (celle que Power BI choisit ou que tu définis). Pour utiliser la relation inactive dans une mesure, on emploie `USERELATIONSHIP` :

```text
// Sales measured on delivery date instead of order date
Sales by Delivery =
CALCULATE (
    [Total Sales],
    USERELATIONSHIP ( Sales[delivery_date], 'Date'[date] )
)
```

### La relation dans le mauvais sens

Le filtre se propage du côté **un** vers le côté **plusieurs**. Si tu relies `Sales → Products` (au lieu de `Products → Sales`), filtrer `Products[category]` ne propagera pas vers `Sales`. Vérifie toujours la flèche dans la vue Modèle : elle doit aller de la dimension vers le fait.

### Le piège du filtre bidirectionnel

Il est possible d'activer la **bidirectionnalité** (filtre dans les deux sens), mais c'est à éviter par défaut : ça complique les calculs DAX, crée des ambiguïtés et peut ralentir le modèle. On le réserve à des cas très précis (ex. sécurité au niveau ligne).

> **À retenir —** Fait au centre, dimensions autour, relations **1-\*** (dimension → fait). Filtrer une dimension filtre le fait. Vise l'**étoile**, pas le flocon. Attention aux relations inactives (`USERELATIONSHIP`) et au sens du filtre.
