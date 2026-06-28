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

> **À retenir —** % du total et écart répondent à « combien, et par rapport à quoi ? ». Les
> segments rendent l'exploration interactive, et le graphique croisé reste synchronisé avec
> le TCD.
