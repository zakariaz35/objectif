---
title: "Exercice — structurer un fichier RH"
type: exercise
---

## Énoncé

On te remet le fichier RH suivant. Il provient d'un export ATS (logiciel de recrutement)
et doit être mis en forme avant toute analyse.

**Problèmes identifiés — décris ce que tu ferais et écris les formules nécessaires.**

Fichier reçu (plage `A1:E6`) :

```
// Raw file — intentionally messy
// Row 1 (title, merged A1:E1): "Rapport RH – Juin 2024"
// Row 2 (headers): "Employé" | "Dept" | "Salaire brut / mois" | "Entrée" | "note"
// Row 3: "Alice Durand" | "it" | "3 500 €" | "15/03/2021" | ""
// Row 4: "Bob Martin " | "IT" | "4200"     | "01-2020"    | "senior"
// Row 5: (empty row)
// Row 6: "Alice Durand" | "it" | "3 500 €" | "15/03/2021" | ""  ← duplicate of row 3
```

Pour chaque point, indique l'action Excel et, si une formule est nécessaire, écris-la
(tu peux nommer le futur tableau `Employees`) :

1. Quel est le problème du **titre fusionné** (ligne 1) et que fais-tu ?
2. Comment **supprimer le doublon** (ligne 6) et comment le détecter d'abord ?
3. Le salaire `"3 500 €"` est stocké en **texte**. Comment le convertir en nombre ?
4. La date `"01-2020"` n'est pas une vraie date Excel. Quelle approche prends-tu ?
5. La colonne `dept` contient `"it"` et `"IT"`. Écris la formule de nettoyage.
6. Il reste une **ligne vide** (ligne 5). Comment la repérer programmatiquement avant
   de la supprimer ?

<!--correction-->

## Correction

**1. Titre fusionné**
Il faut le **supprimer** (ou le déplacer dans une cellule hors de la zone de données) et
laisser la ligne 2 comme seul en-tête. Un titre sur des cellules fusionnées empêche
l'import en Tableau et casse les TCD.

**2. Détection + suppression de doublon**

D'abord, ajouter une colonne de détection (avant `Ctrl+L`) :

```
// TRUE if the employee name appears more than once in column A
=COUNTIF($A$3:$A$100, A3) > 1
```

Puis `Données → Supprimer les doublons` en cochant les colonnes `name` **et** `hire_date`
(pas seulement le nom : deux employés peuvent s'appeler pareil).

**3. Montant texte → nombre**

```
// Removes "€" and spaces, converts to number
=VALUE(SUBSTITUTE(SUBSTITUTE([@salary_raw], " €", ""), " ", ""))
```

Ou plus simplement : `Données → Convertir` avec séparateur décimal virgule.

**4. Date incomplète `"01-2020"`**

Ce n'est pas une date précise ; la meilleure approche métier est de demander la date
exacte à la source. À défaut, construire le premier du mois :

```
// Reconstructs 1st of the month from "MM-YYYY" in cell A4
=DATE(RIGHT(A4,4), LEFT(A4,2), 1)
```

**5. Homogénéiser la casse du département**

```
// Normalize department to "Title Case": "it" -> "IT"
// For abbreviations, use UPPER instead of PROPER
=UPPER(TRIM([@dept]))
```

**6. Détecter les lignes vides**

```
// TRUE if all key columns are empty (flag empty rows)
=AND([@name]="", [@dept]="", [@salary]="")
```

Filtre sur `TRUE` puis supprime les lignes correspondantes. `Données → Supprimer les
doublons` ne détecte pas les lignes vides : cette vérification manuelle reste nécessaire.

---

**Bilan** : avant tout calcul, ce fichier nécessite six corrections. Dans un contexte pro,
**documente** chaque correction dans un onglet `_log` : date, colonne corrigée, règle
appliquée. C'est ce qui prouve la traçabilité en cas d'audit.
