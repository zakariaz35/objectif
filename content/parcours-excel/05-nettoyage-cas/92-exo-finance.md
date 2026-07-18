---
title: "Exercice — analyse financière : budget vs réalisé"
type: exercise
---

## Énoncé

Tu es contrôleur de gestion junior. Le DAF te demande une analyse rapide à partir de deux
fichiers fusionnés dans un classeur Excel.

```
// Table: Budget
// Columns: cost_center | month | year | planned_amount

// Table: Actuals
// Columns: cost_center | month | year | consumed_amount | category
```

Écris les formules ou décris les TCD pour répondre à chaque demande.

1. **Dépense réalisée** du centre de coût `"MKT"` en mars 2025 (mois = 3, année = 2025).
2. **Variance absolue** (réalisé - prévu) pour le même centre et la même période.
3. **Taux de consommation** (réalisé / prévu) en pourcentage, protégé contre la division
   par zéro.
4. **Vue d'ensemble** : TCD montrant la variance par `cost_center` et par `month`, pour
   l'année 2025. Décris les zones.
5. **Catégorie la plus coûteuse** parmi les réalisés du centre `"MKT"` sur toute l'année
   2025 (formule ou TCD, au choix — explique ton choix).
6. **Alerte dépassement** : dans un tableau de synthèse, une colonne `status` qui vaut
   `"Over budget"` si le taux de consommation > 100 %, `"On track"` si entre 80 % et
   100 %, `"Under-used"` sinon.

<!--correction-->

## Correction

**1. Dépense réalisée — centre MKT, mars 2025**

```
// Total consumed for cost center "MKT" in month 3, year 2025
=SUMIFS(Actuals[consumed_amount],
        Actuals[cost_center], "MKT",
        Actuals[month], 3,
        Actuals[year], 2025)
```

**2. Variance absolue**

```
// Actual - Planned for MKT / month 3 / year 2025
=SUMIFS(Actuals[consumed_amount],
        Actuals[cost_center], "MKT",
        Actuals[month], 3,
        Actuals[year], 2025)
 - SUMIFS(Budget[planned_amount],
          Budget[cost_center], "MKT",
          Budget[month], 3,
          Budget[year], 2025)
```

**3. Taux de consommation**

```
// Consumption rate (%), protected against zero budget
=IFERROR(
    SUMIFS(Actuals[consumed_amount], Actuals[cost_center], "MKT",
           Actuals[month], 3, Actuals[year], 2025)
    /
    SUMIFS(Budget[planned_amount], Budget[cost_center], "MKT",
           Budget[month], 3, Budget[year], 2025),
    0)
```

Formate la cellule en pourcentage. `IFERROR` protège si le budget est 0 (pas de ligne
dans `Budget` pour ce centre/mois).

**4. Vue d'ensemble — TCD variance par centre et par mois**

- **Filtres** : `year` = 2025.
- **Lignes** : `cost_center`.
- **Colonnes** : `month`.
- **Valeurs** : impossible de faire la soustraction directe dans un TCD (les deux tables
  sont séparées). Deux approches :
  - **Option A** : créer une table de synthèse avec formules `SUMIFS` (recommandé si les
    tables restent séparées).
  - **Option B** : fusionner `Budget` et `Actuals` dans une seule table via Power Query,
    puis un TCD avec champ calculé `= consumed_amount - planned_amount`.

**5. Catégorie la plus coûteuse — MKT, 2025**

**Choix TCD** (plus rapide pour explorer) :

- Filtre : `cost_center = "MKT"` et `year = 2025`.
- Lignes : `category`.
- Valeurs : SOMME de `consumed_amount`.
- Tri : décroissant → la première ligne est la plus coûteuse.

**Alternative formule** si on veut le résultat dans une cellule :

```
// Name of the category with highest consumption for MKT in 2025
// Step 1: compute max
=MAXIFS(Actuals[consumed_amount],
        Actuals[cost_center], "MKT",
        Actuals[year], 2025)

// Step 2: find the category matching that max (place in adjacent cell)
=XLOOKUP(
    MAXIFS(Actuals[consumed_amount], Actuals[cost_center], "MKT", Actuals[year], 2025),
    Actuals[consumed_amount],
    Actuals[category],
    "n/a")
```

**6. Colonne `status`**

En supposant que le taux de consommation est en colonne `F` :

```
// Budget status label based on consumption rate
=IFS(F2 > 1,    "Over budget",
     F2 >= 0.8, "On track",
     TRUE,       "Under-used")
```

Ou, sans colonne intermédiaire (en inlinant le calcul) :

```
=LET(
    rate, IFERROR([@consumed] / [@planned], 0),
    IFS(rate > 1,    "Over budget",
        rate >= 0.8, "On track",
        TRUE,        "Under-used")
)
```

`LET` (disponible sur Excel 365) évite de répéter le calcul du taux deux fois.

---

**Bilan méthode :** les analyses budget/réalisé impliquent souvent de **joindre deux
sources**. Privilégie les `SUMIFS` avec critères multiples pour des tableaux de synthèse
ad hoc ; utilise Power Query + TCD dès que les sources dépassent quelques milliers de
lignes ou que la jointure est récurrente.
