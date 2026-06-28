---
title: "Calculs avancés, segments et graphiques"
type: lesson
---

# Faire parler un TCD

Une fois le TCD posé, quelques réglages transforment des chiffres bruts en **analyse**.

## Afficher en % et en écart

Dans *Paramètres des champs de valeurs* → onglet **Afficher les valeurs** :

- **% du total général** : chaque cellule en part du total. « Hardware représente 70 % du
  CA. »
- **% du total de la ligne / colonne** : utile pour comparer la répartition par région.
- **Différence par rapport à** : écart d'un mois à l'autre, d'une année à l'autre.
- **% différence par rapport à** : la croissance en pourcentage.

> Astuce : duplique la même mesure deux fois — une en **Somme** (le montant), une en **% du
> total** (la part). Tu lis la valeur et son poids d'un coup d'œil.

## Filtrer visuellement : les segments (slicers)

Plutôt que le menu déroulant *Filtres*, ajoute un **segment** : *Analyse du TCD → Insérer
un segment*. Tu obtiens des boutons cliquables (`Nord` / `Sud`, ou par année) qui filtrent
le TCD — idéal pour un mini tableau de bord. La **chronologie** (*Insérer une chronologie*)
fait pareil, spécialement pour les dates.

## Regrouper des valeurs

Au-delà des dates, on peut regrouper des nombres en tranches : sélectionne des lignes de
`amount` → clic droit → **Grouper** → pas de 100. Tu obtiens des classes `0-100`,
`100-200`… sans colonne supplémentaire.

## Le graphique croisé dynamique

Avec le TCD sélectionné : *Analyse du TCD → Graphique croisé dynamique*. Il **suit** le
TCD : change un filtre ou un segment, le graphique se met à jour. Choisis le bon type :

- **barres / colonnes** pour comparer des catégories ;
- **courbe** pour une évolution dans le temps ;
- **secteurs** seulement pour une part du tout (et avec peu de catégories).

## Champ calculé : ajouter une mesure dérivée

Un TCD peut contenir des **champs calculés** — des formules appliquées sur les mesures
agrégées. Menu : *Analyse du TCD → Champs, éléments et jeux → Champ calculé…*

Exemple : marge brute = montant - coût

```
// Calculated field formula (typed in the pivot table dialog)
= amount - cost
```

Le champ calculé `Marge` apparaît ensuite en zone Valeurs comme n'importe quelle mesure.

> **Piège —** un champ calculé opère sur des **agrégats**, pas sur des lignes. Si tu
> calcules `= quantity * unit_price` dans un champ calculé, Excel somme `quantity` et
> `unit_price` séparément **puis** les multiplie — ce qui n'est pas équivalent à une
> `SUMPRODUCT` ligne à ligne. Pour des calculs exacts, crée la colonne dans la table source.

## Astuce : nommer ses TCD

Avec plusieurs TCD dans un classeur, donne-leur un nom descriptif (*Analyse du TCD → Nom
du tableau croisé dynamique*) : `TCD_CA_region`, `TCD_RH_masse_salariale`… C'est aussi
ce nom qu'utilisent les fonctions `GETPIVOTDATA` si tu veux référencer une cellule du TCD
dans une formule externe.

> **À retenir —** % du total et écart répondent à « combien, et par rapport à quoi ? ». Les
> segments rendent l'exploration interactive, le graphique croisé reste synchronisé, et les
> champs calculés permettent des mesures dérivées — mais ils opèrent sur des agrégats, pas
> des lignes brutes.
