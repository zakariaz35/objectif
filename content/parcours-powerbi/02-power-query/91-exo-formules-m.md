---
title: "Exercice — formules Power Query (M)"
type: exercise
---

## Énoncé

Tu travailles sur un export `purchases_raw.csv` qui contient les colonnes suivantes :

```text
| supplier_ref    | order_date | unit_cost | unit_price | quantity | region   |
| "SUP-FR-0042"  | 14/03/2024 | 85,00     | 120,00     | 3        | " paris" |
| "SUP-DE-0017"  | 15/03/2024 | 200,00    | 280,00     | 1        | "LYON"   |
| "SUP-FR-0011"  | 16/03/2024 | 45,00     | 70,00      | 10       | "Lyon"   |
```

Pour chaque question, **écris la formule M** à utiliser dans une colonne personnalisée ou indique l'étape Power Query.

1. **Nettoyer `region`** pour uniformiser la casse (`"Paris"`, `"Lyon"` — première lettre majuscule, reste minuscule) et retirer les espaces parasites.
2. **Extraire le code pays** du fournisseur (ex. `"FR"` de `"SUP-FR-0042"`).
3. **Calculer la marge brute** par ligne : `(unit_price - unit_cost) / unit_price`, exprimée en pourcentage.
4. **Calculer le montant total de la ligne** : `unit_price × quantity`.
5. **Classer la commande** en `"Grande"` (montant > 500), `"Moyenne"` (100-500), `"Petite"` (< 100).
6. **Convertir `order_date`** (texte `"14/03/2024"` au format FR) en type `Date` — indique l'étape et le paramètre régional à préciser.

<!--correction-->

## Correction

**1. Nettoyer `region`**

```text
// Trim whitespace then apply proper casing (Title Case)
Text.Proper(Text.Trim([region]))
```

`Text.Trim` retire les espaces en début/fin. `Text.Proper` met la première lettre en majuscule et le reste en minuscule. `"paris"`, `" paris"` et `"PARIS"` donnent tous `"Paris"`.

---

**2. Extraire le code pays**

```text
// The country code is always at position 4, length 2 in "SUP-FR-0042"
Text.Middle([supplier_ref], 4, 2)
```

`Text.Middle(texte, position_départ, longueur)` — zéro-indexé. `"SUP-FR-0042"` → position 4 = `"F"`, longueur 2 = `"FR"`.

---

**3. Marge brute en %**

```text
// Gross margin rate per line
([unit_price] - [unit_cost]) / [unit_price]
```

Formate ensuite la colonne en **Pourcentage** dans Power Query (icône de type → Pourcentage). Si `unit_price` peut être `0`, protège la division :

```text
if [unit_price] = 0 then null else ([unit_price] - [unit_cost]) / [unit_price]
```

---

**4. Montant total de la ligne**

```text
// Line amount = unit_price × quantity
[unit_price] * [quantity]
```

Simple, mais il faut que `unit_price` et `quantity` soient déjà typés correctement (Nombre décimal et Nombre entier respectivement) — sinon Power Query refuse la multiplication.

---

**5. Classement de la commande**

```text
// Classify order by total line amount
if [unit_price] * [quantity] > 500 then "Grande"
else if [unit_price] * [quantity] >= 100 then "Moyenne"
else "Petite"
```

> Astuce : si tu as déjà créé la colonne `line_amount` à l'étape 4, utilise-la directement (`[line_amount]`) plutôt que de recalculer — Power Query exécute les étapes dans l'ordre du volet *Étapes appliquées*.

---

**6. Convertir `order_date` en Date**

Dans l'éditeur Power Query :

1. Sélectionner la colonne `order_date` (type Texte `"14/03/2024"`).
2. Cliquer l'icône de type → **Date**.
3. Power Query affiche une boîte de dialogue : **utiliser les paramètres régionaux** → choisir **Français (France)** pour interpréter `JJ/MM/AAAA` correctement.

Sans ce paramètre régional, Power Query (en locale anglaise) tente de lire `14` comme mois → erreur de conversion.

> **Point clé** — toujours convertir les dates en type `Date` (pas en Texte) : c'est le prérequis de la time intelligence DAX et des axes temporels dans les visuels.
