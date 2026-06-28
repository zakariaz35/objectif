---
title: "Exercice — plan de nettoyage"
type: exercise
---

## Énoncé

Tu importes un export `sales_export.csv` brut. Un aperçu des premières lignes :

```text
| order_id | order_date | region   | category    | amount   | qty |
| 1001     | 12/03/2024 | Paris    | Electronics | 1 250,00 | 2   |
| 1002     | 13/03/2024 | paris    | Electronics | 980,00   | 1   |
| 1001     | 12/03/2024 | Paris    | Electronics | 1 250,00 | 2   |
| 1003     | 14/03/2024 | Lyon     |             | 0,00     | 0   |
| TOTAL    |            |          |             | 3 480,00 | 5   |
```

Liste, **dans l'ordre**, les étapes de nettoyage que tu appliquerais dans Power Query, en expliquant *pourquoi* pour chacune. Précise le **type** final de chaque colonne.

<!--correction-->

## Correction

Un plan d'étapes raisonnable :

1. **Supprimer la ligne de total parasite** (`order_id = "TOTAL"`). Filtrer les lignes : un total n'est pas une observation, il fausserait toutes les agrégations.
2. **Supprimer les doublons** sur `order_id` (la ligne `1001` apparaît deux fois). Sinon on double son `amount`.
3. **Normaliser le texte de `region`** : appliquer *Trim* + mise en casse cohérente, sinon `Paris` et `paris` comptent comme deux régions distinctes.
4. **Gérer la `category` manquante** (ligne `1003`) : remplacer le vide par `"Unknown"`, ou décider de filtrer la ligne selon le besoin métier.
5. **Corriger les types** :

| Colonne | Type final | Pourquoi |
|---|---|---|
| `order_id` | Texte | un identifiant ne se somme pas |
| `order_date` | Date | sinon pas de time intelligence en DAX |
| `region` | Texte | dimension |
| `category` | Texte | dimension |
| `amount` | Nombre décimal | gérer la **virgule décimale** et l'espace millier au format FR |
| `qty` | Nombre entier | mesure entière |

> Point clé : sur `amount`, le format `1 250,00` doit être interprété avec le bon paramètre régional (virgule = décimale, espace = séparateur de milliers), sinon Power Query le lit en texte et la conversion échoue.

Toutes ces étapes restent dans *Étapes appliquées* et se **rejouent à chaque rafraîchissement** : le prochain export sera nettoyé automatiquement.
