---
title: "Nettoyer & transformer"
type: lesson
---

# Le travail réel dans l'éditeur Power Query

Une fois connecté, on entre dans l'**éditeur Power Query**. À droite, le volet *Étapes appliquées* enregistre chaque manipulation. Voici les opérations qu'on enchaîne presque à chaque dataset.

## 1. Typer les colonnes

C'est la **première chose à vérifier**. Power Query devine les types, mais se trompe : un `order_date` lu en texte, un `amount` lu en texte à cause d'une virgule décimale… Un mauvais type casse tout en aval (impossible de sommer du texte, impossible de faire de la time intelligence sur une date-texte).

| Colonne | Type attendu |
|---|---|
| `order_id` | Texte (ou Nombre entier non sommé) |
| `order_date` | Date |
| `amount` | Nombre décimal |
| `quantity` | Nombre entier |
| `category` | Texte |

On clique sur l'icône de type en tête de colonne et on choisit le bon type. **Toujours.**

## 2. Nettoyer le contenu

- **Supprimer les colonnes inutiles** — moins de colonnes = modèle plus léger et plus clair.
- **Supprimer les doublons** (Remove Duplicates) — sur la clé qui doit être unique.
- **Filtrer les lignes** — retirer les totaux parasites, les lignes vides, les tests.
- **Remplacer les valeurs** / **Réduire les espaces** (Trim) — normaliser le texte (`" Paris "` → `"Paris"`), sinon `Paris` et `Paris ` comptent comme deux régions.
- **Gérer les valeurs manquantes** — remplacer les `null`, ou filtrer les lignes incomplètes selon le cas.

## 3. Créer des colonnes utiles

- **Colonne à partir d'exemples** : on tape quelques résultats voulus, Power Query devine la règle.
- **Colonne personnalisée** : une formule en langage **M** (le langage de Power Query).

```text
// Custom column in Power Query (M language)
// Build a "year-month" label from order_date
Text.From(Date.Year([order_date])) & "-" & Text.PadStart(Text.From(Date.Month([order_date])), 2, "0")
```

Autres formules M courantes dans un contexte vente/achat :

```text
// Compute gross margin percentage per line
([unit_price] - [unit_cost]) / [unit_price]

// Classify order size
if [amount] >= 5000 then "Large" else if [amount] >= 1000 then "Medium" else "Small"

// Extract supplier code from a reference like "SUP-FR-0042"
Text.Range([reference], 0, 6)

// Flag weekends (useful before loading into the Date dimension)
Date.DayOfWeek([order_date], Day.Monday) >= 5
```

> M est le langage de **transformation** (étape par étape). À ne pas confondre avec **DAX** (module 4), qui sert à **analyser** le modèle déjà chargé. Règle simple : si ça nettoie la donnée → M / Power Query ; si ça calcule un indicateur → DAX / mesure.

## 4. Pièges courants à éviter

| Piège | Symptôme | Correction |
|---|---|---|
| Type détecté automatiquement | `amount` lu en texte → `SUM` donne une erreur | Cliquer l'icône de type, choisir Nombre décimal |
| Paramètre régional oublié | `1 250,00` (FR) lu comme `1` par Power Query anglophone | Définir les paramètres régionaux (régional settings) au moment du changement de type |
| Texte non normalisé | `"Paris"` et `"paris"` = deux régions dans les visuels | `Text.Proper([region])` ou `Text.Upper` + Trim |
| Ligne de total en bas du fichier | Fausse la `SUM` globale | Filtrer sur `order_id` ne contenant pas `"TOTAL"` |
| Colonne calculée dans les visuels | On corrige la donnée dans 10 graphiques, pas à la source | Créer une colonne personnalisée M une fois dans Power Query |

## La règle d'or : nettoyer en amont

Une transformation faite dans Power Query est faite **une fois pour tout le rapport** et se rejoue au rafraîchissement. Évite de bricoler la donnée dans les visuels : si une catégorie est mal orthographiée, on la corrige **dans Power Query**, pas dans dix graphiques.

> **À retenir —** Réflexe d'ouverture d'un dataset : (1) vérifier les **types** (avec les bons paramètres régionaux), (2) supprimer colonnes/doublons inutiles, (3) **normaliser** le texte, (4) gérer les `null`. On nettoie en amont, une seule fois. M = transformation ; DAX = analyse.
