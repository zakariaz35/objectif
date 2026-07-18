---
title: "Agréger sous condition : la famille *IFS"
type: lesson
---

# Le cœur du calcul : SUMIFS, COUNTIFS, AVERAGEIFS

On travaille sur le tableau `Sales` :
`order_id | order_date | region | category | quantity | amount`.

La famille `*IFS` répond à la question la plus fréquente de l'analyste : « agréger
**selon des critères** ».

```
// Total revenue for the Nord region
=SUMIFS(Sales[amount], Sales[region], "Nord")

// Revenue for the Office category in the Nord region
=SUMIFS(Sales[amount], Sales[region], "Nord", Sales[category], "Office")

// Number of orders from the Sud region
=COUNTIFS(Sales[region], "Sud")

// Average order value for the Hardware category
=AVERAGEIFS(Sales[amount], Sales[category], "Hardware")
```

> **Ordre des arguments —** dans `SUMIFS`, la colonne à **sommer** vient en premier, puis
> les paires `(colonne critère, critère)`. C'est l'inverse de l'ancien `SUMIF`. Prends
> l'habitude de **toujours** utiliser `SUMIFS` : un seul réflexe, des critères multiples.

## Pas-à-pas : rapport de ventes mensuel

Contexte : tu as un onglet `Sales` avec le Tableau structuré `Sales`
(`order_id | order_date | region | category | quantity | amount`) et un onglet
`Dashboard` pour la synthèse. Les paramètres interactifs sont en colonne B de cet onglet.

**Étape 1 — Saisir les paramètres dans des cellules fixes.**
En `Dashboard!B2`, tape `Nord` (la région à analyser). En `Dashboard!B3`, tape `2024`
(l'année). En `Dashboard!B4`, tape `1` (le numéro du mois). Ces trois cellules jouent le
rôle de filtres interactifs — les changer mettra à jour toutes les formules.

**Étape 2 — Chiffre d'affaires pour la région et le mois choisis.**
En `Dashboard!C7`, entre :

```
// Revenue for the region in B2, month B4 of year B3
=SUMIFS(Sales[amount],
        Sales[region], B2,
        Sales[order_date], ">=" & DATE(B3, B4, 1),
        Sales[order_date], "<=" & EOMONTH(DATE(B3, B4, 1), 0))
```

Teste : change `B2` de `"Nord"` à `"Sud"`. La formule se recalcule immédiatement —
aucun filtre manuel, aucune modification de la formule.

**Étape 3 — Nombre de commandes.**
En `Dashboard!C8` :

```
// Order count matching the same region and period
=COUNTIFS(Sales[region], B2,
          Sales[order_date], ">=" & DATE(B3, B4, 1),
          Sales[order_date], "<=" & EOMONTH(DATE(B3, B4, 1), 0))
```

**Étape 4 — Panier moyen.**
En `Dashboard!C9` :

```
// Average order value — IFERROR protects against zero orders
=IFERROR(C7 / C8, 0)
```

> **Repère —** c'est la structure de base de tout rapport mensuel sous Excel. Tu peux
> relier B2, B3, B4 à des **listes déroulantes** (onglet *Données → Validation des
> données → Liste*) pour rendre le sélecteur encore plus convivial.

## Des critères plus riches

Les critères ne sont pas que des égalités. On peut comparer, et même faire référence à une
cellule :

```
// Orders with amount exceeding 200
=COUNTIFS(Sales[amount], ">200")

// Revenue since a date entered in cell G1
=SUMIFS(Sales[amount], Sales[order_date], ">=" & G1)

// Revenue for a region entered in G2 (dynamic criterion)
=SUMIFS(Sales[amount], Sales[region], G2)
```

Le `&` colle l'opérateur (`">="`) à la valeur de la cellule : c'est ce qui rend un
tableau de bord **interactif** sans toucher aux formules.

## SUMPRODUCT, quand *IFS ne suffit plus

Pour sommer un **produit** sous condition (ex. chiffre d'affaires = quantité × prix), on
utilise `SUMPRODUCT` :

```
// Recalculated revenue = sum of quantity * unit_price, for the Nord region only
=SUMPRODUCT((Sales[region]="Nord") * Sales[quantity] * Sales[unit_price])
```

Chaque `(condition)` vaut `1` ou `0` ; multipliée aux colonnes, elle filtre la somme.

## Cas d'usage métier supplémentaires

**Finance — budget vs réalisé par centre de coût :**

```
// Budget consumed by cost center "MKT" for month 3
=SUMIFS(Budget[consumed], Budget[cost_center], "MKT", Budget[month], 3)

// Variance: consumed - planned
=SUMIFS(Budget[consumed], Budget[cost_center], "MKT", Budget[month], 3)
 - SUMIFS(Budget[planned], Budget[cost_center], "MKT", Budget[month], 3)
```

**Logistique — commandes en retard :**

```
// Number of deliveries where actual_date > promised_date (late orders)
=COUNTIFS(Deliveries[actual_date], ">" & TODAY(),
          Deliveries[promised_date], "<" & TODAY())
```

**Achat — total fournisseur sur une plage de dates :**

```
// Total purchase amount from supplier "Acme" between two dates (D1 and D2)
=SUMIFS(Purchases[amount],
        Purchases[supplier], "Acme",
        Purchases[order_date], ">=" & D1,
        Purchases[order_date], "<=" & D2)
```

## SUMIF vs SUMIFS : toujours utiliser SUMIFS

| Fonction | Critères | Ordre des arguments | Recommandation |
|---|---|---|---|
| `SUMIF` | 1 seul | `(critère_range, critère, somme_range)` — somme **en dernier** | À éviter |
| `SUMIFS` | 1 à N | `(somme_range, critère_range1, critère1, …)` — somme **en premier** | Toujours |
| `SUMPRODUCT` | Flexible | `(condition * valeur)` | Sommes de produits filtrés |

L'inversion d'ordre entre `SUMIF` et `SUMIFS` est la première cause d'erreur `#VALEUR!`
dans les classeurs récupérés. Règle simple : **n'utilise jamais `SUMIF`**, même pour un
critère unique — `SUMIFS` fait exactement la même chose.

## Pièges fréquents

**Données texte dans la colonne sommée.** Si `amount` est stocké en texte (cellules
alignées à gauche, petit triangle vert dans le coin), `SUMIFS` renvoie `0` sans message
d'erreur. Clique sur une cellule suspecte : la barre de formule doit afficher `1250`,
pas `"1250"`. Corrige avec `=[@amount] * 1` dans une colonne de nettoyage, ou via
*Données → Convertir*.

**Critère de date entre guillemets seuls.** `SUMIFS(..., Sales[order_date],
">=2024-01-01")` ne reconnaît pas de date — Excel lit cela comme du texte et renvoie `0`.
Construis toujours la borne avec `&` et `DATE()` :

```
// Wrong — date as plain string, always returns 0
=SUMIFS(Sales[amount], Sales[order_date], ">=2024-01-01")

// Correct — concatenate the operator with a real date
=SUMIFS(Sales[amount], Sales[order_date], ">=" & DATE(2024, 1, 1))
```

**Références relatives qui glissent à la copie.** Si tu copies la formule vers la droite
pour avoir une colonne par région, les noms de Tableau (`Sales[amount]`) ne bougent pas,
mais la cellule de critère doit être fixée sur la ligne avec `$` :

```
// B$2 stays on row 2 when copied across columns
=SUMIFS(Sales[amount], Sales[region], B$2)
```

> **Piège —** `AVERAGEIFS` renvoie `#DIV/0!` si aucune ligne ne correspond aux critères.
> Protège avec `IFERROR(AVERAGEIFS(...), 0)` dans un tableau de bord.

> **À retenir —** `SUMIFS` / `COUNTIFS` / `AVERAGEIFS` couvrent l'essentiel des calculs
> conditionnels. Garde `SUMPRODUCT` pour les sommes de produits filtrés. Toujours vérifier
> qu'un critère sur une date est collé avec `&`, jamais mis entre guillemets seul.
