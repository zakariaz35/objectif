---
title: "Exercice — diagnostiquer un modèle cassé"
type: exercise
---

## Énoncé

Un collègue t'envoie un fichier `.pbix` avec ces symptômes :

1. La mesure `Total Sales = SUM(Sales[amount])` affiche le **même total** dans toutes les lignes d'un tableau découpé par `Products[category]` — comme si le filtre de catégorie n'avait aucun effet.
2. La mesure `Sales YTD = TOTALYTD([Total Sales], 'Date'[date])` renvoie un **blanc** dans tous les visuels.
3. Dans un tableau croisé `region × month`, la ligne **Total** affiche un chiffre **inférieur** à la somme des lignes — ce qui est impossible.

Pour chacun des trois symptômes :

- Identifie la **cause probable** dans le modèle ou les données.
- Indique **comment corriger**.

<!--correction-->

## Correction

### Symptôme 1 — Le filtre `category` n'a aucun effet

**Cause probable** : la relation entre `Products` et `Sales` est **dans le mauvais sens**, ou elle est **absente**. Dans Power BI, le filtre se propage du côté *un* (dimension) vers le côté *plusieurs* (fait). Si la relation est dessinée de `Sales` vers `Products`, le filtre appliqué sur `Products[category]` ne remonte pas vers `Sales`.

**Correction** : dans la vue Modèle, vérifier que la relation va bien de `Products (1)` → `Sales (*)`. La flèche doit pointer vers `Sales`. Si la relation est absente, la créer en glissant `Products[product_id]` sur `Sales[product_id]`.

---

### Symptôme 2 — `TOTALYTD` renvoie un blanc

**Cause probable** : la table `Date` n'est pas **marquée comme table de dates** (`Mark as Date Table`) dans Power BI. Les fonctions de time intelligence (`TOTALYTD`, `SAMEPERIODLASTYEAR`, `PREVIOUSMONTH`…) exigent cette marque pour savoir quelle colonne est la date de référence.

Deuxième cause possible : la table `Date` n'est pas **continue** (des jours manquent dans la plage). `TOTALYTD` ne peut pas cumuler sur une plage trouée.

**Correction** :

1. Sélectionner la table `Date` dans la vue Modèle ou Données.
2. Onglet **Outils de table** → **Marquer comme table de dates** → choisir la colonne `date`.
3. Vérifier que la plage couvre **toutes** les dates de `Sales[order_date]` sans trou (utiliser `CALENDAR` en DAX ou une requête M qui génère toutes les dates).

---

### Symptôme 3 — Le total est inférieur à la somme des lignes

**Cause probable** : les données contiennent des **doublons** dans la table de faits que la mesure compte deux fois au niveau ligne, mais pas au niveau total — ou, plus fréquemment, il y a une **relation plusieurs-à-plusieurs** (many-to-many) non intentionnelle. Une ligne de `Sales` pointe vers un `product_id` qui n'existe pas dans `Products` → Power BI la met dans un groupe « vide » ou l'ignore selon le sens du filtre.

Autre cause : une **mesure utilisant `DISTINCTCOUNT`** où on attendait `SUM` — le total de valeurs distinctes n'est pas la somme des valeurs distinctes par groupe.

**Correction** :

1. **Nettoyer les doublons** dans `Sales` via Power Query (Remove Duplicates sur la clé `order_id`).
2. Vérifier l'intégrité référentielle : s'assurer que chaque `product_id` de `Sales` existe dans `Products`. On peut faire un Merge en Power Query et filtrer les lignes sans correspondance.
3. Revoir la mesure : s'assurer qu'on utilise `SUM` et non `COUNTROWS` / `DISTINCTCOUNT` si on veut sommer un montant.

> **À retenir** — Les trois pannes les plus fréquentes en modélisation Power BI : (1) relation dans le mauvais sens ou absente → filtre inopérant, (2) table de dates non marquée → time intelligence muette, (3) doublons dans le fait ou relation many-to-many → totaux faux. Commence toujours par vérifier ces trois points quand une mesure ne se comporte pas comme prévu.
