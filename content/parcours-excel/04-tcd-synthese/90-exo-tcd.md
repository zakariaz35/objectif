---
title: "Exercice — construire un tableau de bord TCD"
type: exercise
---

## Énoncé

Tu es analyste dans une entreprise de vente en ligne. Le responsable commercial te demande
un **mini tableau de bord** à partir du tableau structuré `Sales` :

```
// Table: Sales
// Columns: order_id | order_date | salesperson | region | category | quantity | amount | cost
```

Décris précisément (zones Lignes / Colonnes / Valeurs / Filtres, agrégation, réglages)
comment construire chaque vue, et indique les formules si une question nécessite un calcul
hors TCD.

**Vue 1 — CA mensuel par région**
Afficher le chiffre d'affaires (`amount`) mois par mois et par région. On doit pouvoir
filtrer par `category` avec un segment.

**Vue 2 — Performance des commerciaux**
Pour chaque `salesperson` : CA total, nombre de commandes, panier moyen. Trié par CA
décroissant.

**Vue 3 — Part du CA par catégorie**
Afficher le CA de chaque `category` en valeur **et** en pourcentage du total général.

**Vue 4 — Évolution mensuelle avec croissance**
Le CA mensuel avec, en colonne supplémentaire, la **différence** par rapport au mois
précédent.

**Vue 5 — Marge brute**
Calculer et afficher `amount - cost` comme mesure dans le TCD. Expliquer la limite de
cette approche.

<!--correction-->

## Correction

**Vue 1 — CA mensuel par région**

- **Filtres** : `category` (ajouter ensuite un **segment** via *Analyse du TCD → Insérer
  un segment → category*).
- **Lignes** : `order_date` → clic droit → Grouper → **Mois** (et Année si multi-annuel).
- **Colonnes** : `region`.
- **Valeurs** : `amount`, agrégation **Somme**.

Le segment `category` permettra de filtrer d'un clic sans modifier le TCD.

**Vue 2 — Performance des commerciaux**

- **Lignes** : `salesperson`.
- **Valeurs** : glisser `amount` **trois fois** :
  - 1ᵉʳ `amount` → agrégation **Somme** (CA total) ;
  - 2ᵉ `amount` → agrégation **Nombre** (nb commandes) ;
  - 3ᵉ `amount` → agrégation **Moyenne** (panier moyen).
- **Tri** : clique sur la colonne « Somme de amount » → Trier du plus grand au plus petit.

**Vue 3 — Part du CA par catégorie**

- **Lignes** : `category`.
- **Valeurs** : `amount` deux fois :
  - 1ᵉʳ → **Somme** (valeur absolue) ;
  - 2ᵉ → Somme, puis *Paramètres → Afficher les valeurs → % du total général*.

Tu obtiens ainsi la valeur et la part dans la même vue.

**Vue 4 — Évolution mensuelle avec croissance**

- **Lignes** : `order_date` groupé par Mois.
- **Valeurs** : `amount` deux fois :
  - 1ᵉʳ → Somme (CA du mois) ;
  - 2ᵉ → Somme, puis *Afficher les valeurs → Différence par rapport à → mois précédent*.

La colonne de différence affiche automatiquement l'écart mois sur mois.

**Vue 5 — Marge brute**

*Analyse du TCD → Champs calculés → Ajouter un champ* :

```
// Calculated field: gross margin
= amount - cost
```

Ce champ apparaît en Valeurs comme « Somme de Marge ».

**Limite importante :** le champ calculé opère sur les **agrégats**. Si tu as des lignes
avec des `cost` et `amount` variables, Excel calcule `SOMME(amount) - SOMME(cost)`, ce
qui est correct ici. Mais si la formule implique une multiplication (ex. `quantity *
unit_price`), le champ calculé donnerait `SOMME(quantity) * SOMME(unit_price)` — résultat
faux. Dans ce cas, crée une colonne `line_margin` dans la table source.

---

**Bonne pratique :** place les cinq TCD sur des **onglets séparés** (`CA_region`,
`Commerciaux`, etc.), et regroupe les segments sur un onglet `Dashboard` lié à tous les
TCD via *Connexions du rapport* (clic droit sur le segment → Connexions de rapport).
