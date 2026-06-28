---
title: "Tri, filtre et règles d'un jeu de données propre"
type: lesson
---

# Une donnée propre se reconnaît à l'œil

Avant d'analyser, ton jeu de données doit respecter une règle d'or : **1 ligne = 1
enregistrement, 1 colonne = 1 variable**. C'est ce qu'on appelle une donnée *tidy*, et
c'est aussi ce qu'attendent les TCD, SQL et Python.

## La checklist du jeu propre

- **Un en-tête unique** sur une seule ligne (pas de titre fusionné au-dessus).
- **Pas de lignes vides** ni de totaux au milieu des données.
- **Une seule information par cellule** : `"Nord - Office"` doit devenir deux colonnes
  `region` et `category`.
- **Types homogènes** par colonne : `amount` ne contient que des nombres, `order_date`
  que des dates.
- **Pas de cellules fusionnées** dans la zone de données.

```mermaid
flowchart LR
    A["Tableau « joli »\nfusions, totaux, sous-titres"] -->|à éviter| X(("✗"))
    B["Tableau « plat »\n1 ligne = 1 enregistrement"] -->|exploitable| OK(("✓"))
```

## Trier sans casser les lignes

Avec un tableau structuré, le tri est intégré : clique sur la flèche d'un en-tête → *Trier
du plus grand au plus petit*. Excel déplace **la ligne entière**, donc `amount`, `region`
et `category` restent solidaires.

> **Piège classique —** sélectionner une seule colonne puis trier : tu désynchronises les
> lignes et tu corromps silencieusement le fichier. Avec un Tableau, ce risque disparaît.

## Filtrer pour explorer

Les flèches d'en-tête permettent aussi de **filtrer** : ne garder que `region = "Nord"`,
ou les `amount` au-dessus d'un seuil. Le filtre ne supprime rien, il **masque** : pratique
pour vérifier une hypothèse avant de lancer un calcul.

Pour des filtres plus visuels, on verra les **segments** (slicers) dans le module TCD.

## Exemples de tables mal structurées (à éviter)

Ces configurations cassent les formules et les TCD :

| Problème | Exemple concret | Conséquence |
|---|---|---|
| Titre fusionné au-dessus | « Rapport ventes 2024 » sur 3 colonnes | TCD ne détecte pas les en-têtes |
| Totaux en milieu de tableau | Ligne « Sous-total Janvier » entre des données | SUMIFS compte les sous-totaux en double |
| Deux informations en une cellule | `"Nord - Office"` | Impossible de filtrer sur `region` seul |
| Cellules fusionnées | `amount` sur 2 lignes | Le tri désynchronise les lignes |

## Cas logistique : fichier de livraisons

Un fichier type reçu d'un transporteur arrive souvent ainsi :

```
// BAD: two pieces of information in one cell
origin_destination  | delay_days | status
"Paris > Lyon"      | 3          | OK
"Marseille > Paris" | 1          | OK
```

Il faut éclater `origin_destination` en deux colonnes `origin` et `destination` avant toute
analyse (`Données → Convertir`, ou `TEXTSPLIT` sur les versions récentes).

> **À retenir —** vise une table plate : un en-tête, une ligne par enregistrement, un type
> par colonne. C'est le socle de tout le reste du parcours.
