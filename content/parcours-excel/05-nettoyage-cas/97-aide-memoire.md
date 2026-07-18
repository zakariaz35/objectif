---
title: "Aide-mémoire formules Excel"
type: lesson
---

# Aide-mémoire formules Excel — référence rapide

Une page à garder ouverte. Syntaxe → effet, exemples d'une ligne.

---

## Agrégats conditionnels : famille *IFS

| Formule | Syntaxe | Effet |
|---|---|---|
| `SUMIFS` | `=SUMIFS(sum_range, crit_range1, crit1, ...)` | Somme multi-critères |
| `COUNTIFS` | `=COUNTIFS(crit_range1, crit1, ...)` | Comptage multi-critères |
| `AVERAGEIFS` | `=AVERAGEIFS(avg_range, crit_range1, crit1, ...)` | Moyenne multi-critères |

```
// Revenue for Nord region, Office category
=SUMIFS(Sales[amount], Sales[region], "Nord", Sales[category], "Office")

// Orders with amount > 200
=COUNTIFS(Sales[amount], ">200")

// Revenue since date in G1 (dynamic criterion)
=SUMIFS(Sales[amount], Sales[order_date], ">=" & G1)

// Protect against #DIV/0!
=IFERROR(AVERAGEIFS(Sales[amount], Sales[category], G2), 0)
```

> `SUMIFS` : la colonne à sommer vient **en premier**, puis les paires (plage, critère). Toujours préférer `SUMIFS` à `SUMIF` — même syntaxe, critères multiples.

### SUMPRODUCT (somme pondérée filtrée)

```
// Revenue = quantity * unit_price, Nord region only
=SUMPRODUCT((Sales[region]="Nord") * Sales[quantity] * Sales[unit_price])
```

---

## Recherche : XLOOKUP

```
=XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode], [search_mode])
```

| Argument | Valeur habituelle |
|---|---|
| `lookup_value` | La valeur cherchée (cellule ou constante) |
| `lookup_array` | La colonne où chercher |
| `return_array` | La colonne (ou plage) à retourner |
| `if_not_found` | `"N/A"` ou `0` — évite le `#N/A` |
| `match_mode` | `0` = exact (défaut), `-1` = valeur inférieure, `1` = valeur supérieure |
| `search_mode` | `1` = début → fin, `-1` = fin → début (dernier match) |

```
// Product name for code in A2
=XLOOKUP(A2, Products[code], Products[name], "Unknown")

// Return multiple columns at once
=XLOOKUP(A2, Products[code], Products[[name]:[price]], "Not found")

// Last matching entry (most recent order)
=XLOOKUP(A2, Orders[customer_id], Orders[order_date], , , -1)
```

---

## Recherche : INDEX / MATCH

```
=INDEX(return_range, MATCH(lookup_value, lookup_array, match_type))
```

```
// Same as XLOOKUP above, classic form
=INDEX(Products[name], MATCH(A2, Products[code], 0))

// Double MATCH : row + column lookup (matrix lookup)
=INDEX(PriceMatrix, MATCH(B2, PriceMatrix[region], 0), MATCH(C2, PriceMatrix[1], 0))
```

> `MATCH` renvoie la **position** (1-indexée). `match_type = 0` = exact. `INDEX` utilise cette position pour retourner la valeur. Ensemble, ils remplacent `VLOOKUP` sans la contrainte « chercher à gauche ».

---

## Logique : IF / IFS

```
// Simple IF
=IF(A2 > 100, "Big", "Small")

// Nested conditions — use IFS instead of nesting IFs
=IFS(A2 >= 90, "Excellent", A2 >= 70, "Good", A2 >= 50, "Pass", TRUE, "Fail")

// AND / OR inside IF
=IF(AND(A2 > 50, B2 = "Nord"), "Target", "Other")
=IF(OR(A2 = "VIP", B2 > 1000), "Priority", "Standard")

// IFERROR — silent error handling
=IFERROR(A2 / B2, 0)
=IFERROR(XLOOKUP(A2, ...), "Not found")

// SWITCH — clean alternative to IFS on equality
=SWITCH(A2, "A", "Excellent", "B", "Good", "C", "Pass", "Unknown")
```

---

## Texte

| Formule | Exemple | Résultat |
|---|---|---|
| `LEFT(text, n)` | `=LEFT("Paris 75", 5)` | `"Paris"` |
| `RIGHT(text, n)` | `=RIGHT("Paris 75", 2)` | `"75"` |
| `MID(text, start, n)` | `=MID("AB-1234", 4, 4)` | `"1234"` |
| `LEN(text)` | `=LEN("Hello")` | `5` |
| `TRIM(text)` | `=TRIM(" test ")` | `"test"` |
| `LOWER/UPPER/PROPER` | `=PROPER("jean DUPONT")` | `"Jean Dupont"` |
| `SUBSTITUTE(text, old, new)` | `=SUBSTITUTE(A2, "-", "")` | Supprime tirets |
| `FIND(find, within)` | `=FIND("@", A2)` | Position du @ |
| `TEXT(value, format)` | `=TEXT(A2, "dd/mm/yyyy")` | Date formatée |
| `CONCAT(a, b)` / `&` | `=A2 & " " & B2` | Concaténation |
| `TEXTJOIN(delim, ignore, range)` | `=TEXTJOIN(", ", TRUE, A2:A10)` | Joint avec délimiteur |

---

## Dates

| Formule | Exemple | Résultat |
|---|---|---|
| `TODAY()` | `=TODAY()` | Date du jour |
| `NOW()` | `=NOW()` | Date + heure |
| `YEAR(date)` | `=YEAR(A2)` | Année |
| `MONTH(date)` | `=MONTH(A2)` | Mois (1–12) |
| `DAY(date)` | `=DAY(A2)` | Jour |
| `WEEKDAY(date, 2)` | `=WEEKDAY(A2, 2)` | Jour semaine (1 = lundi) |
| `EOMONTH(date, 0)` | `=EOMONTH(A2, 0)` | Fin du mois de la date |
| `EOMONTH(date, -1)+1` | — | Début du mois |
| `DATEDIF(start, end, "M")` | `=DATEDIF(A2, B2, "M")` | Nb de mois entre deux dates |
| `NETWORKDAYS(start, end)` | `=NETWORKDAYS(A2, B2)` | Jours ouvrés entre deux dates |
| `DATE(y, m, d)` | `=DATE(2024, 12, 31)` | Construire une date |

```
// Age in complete years
=DATEDIF(birth_date, TODAY(), "Y")

// Days remaining in month
=EOMONTH(TODAY(), 0) - TODAY()
```

---

## Tableaux croisés dynamiques (TCD) — repères clés

| Action | Comment |
|---|---|
| Créer un TCD | Insertion → Tableau croisé dynamique → Nouvelle feuille |
| Source recommandée | Tableau structuré (`Ctrl+T`) — le TCD s'actualise sur « Actualiser tout » |
| Actualiser | Clic droit → Actualiser (ou `Alt + F5`) |
| Champ calculé | Analyse → Champs, éléments et jeux → Champ calculé |
| % du total colonne | Paramètres de champ valeur → Afficher valeurs → % du total de la colonne |
| Grouper des dates | Clic droit sur une date → Grouper → Mois / Trimestre / Année |
| Filtre sur valeur (Top 10) | Filtre de valeurs sur l'étiquette de ligne |
| Segment (Slicer) | Analyse → Insérer un segment — contrôle interactif pour tableau de bord |
| Connecter segments à plusieurs TCD | Clic droit segment → Connexions de rapport |

> **Bonne pratique —** toujours baser un TCD sur un tableau structuré nommé (`Sales`, `Budget`…). Nommer l'onglet source et l'onglet TCD. Éviter les colonnes vides dans la source.

> **À retenir —** `SUMIFS` pour toute somme conditionnelle ; `XLOOKUP` pour toute recherche (et `INDEX/MATCH` si compatibilité ancienne requise) ; `IFS` plutôt que des `IF` imbriqués ; `IFERROR` pour les tableaux de bord propres ; `DATEDIF` + `EOMONTH` pour les calculs de dates métier.
