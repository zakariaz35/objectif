---
title: "Nettoyer un fichier Excel"
type: lesson
---

# Nettoyage : la moitié invisible du métier

Un fichier reçu par mail est presque toujours sale. Voici la checklist de l'analyste, dans
l'ordre où on l'applique.

## 1. Doublons

`Données → Supprimer les doublons`. **Attention** : choisis bien les colonnes
identifiantes. Deux commandes peuvent avoir le même `amount` sans être des doublons —
c'est `order_id` qui décide.

Pour repérer **avant** de supprimer :

```
// TRUE if the order_id appears more than once
=COUNTIFS(Sales[order_id], [@order_id]) > 1
```

## 2. Espaces et casse

Les espaces invisibles cassent les regroupements : `"Office"` ≠ `"Office "`.

```
=TRIM([@category])                 // removes extra spaces
=PROPER(TRIM([@region]))           // "nord " -> "Nord"
=CLEAN([@notes])                   // strips non-printable characters
```

## 3. Formats de nombres et dates

- Nombres stockés en **texte** (alignés à gauche, petit triangle vert) : `Convertir`, ou
  multiplier par 1 (`=[@amount] * 1`).
- Dates en texte : `=DATEVALUE([@order_date])` puis formater en date.
- Décimales : attention à la **virgule vs point** selon la locale du fichier source.

## 4. Valeurs manquantes

Repère-les, ne les ignore pas :

```
=COUNTBLANK(Sales[amount])         // how many empty cells
```

Décide une règle métier : exclure la ligne ? remplacer par 0 ? La **documenter** dans le
classeur.

## 5. Cohérence

Un `amount` négatif ? une `quantity` à 0 ? une `order_date` dans le futur ? Mets en
évidence avec une **mise en forme conditionnelle** et tranche au cas par cas :

```
// Conditional formatting rule: anomaly to highlight
=OR([@amount] < 0, [@quantity] <= 0, [@order_date] > TODAY())
```

> **À retenir —** nettoie **avant** d'analyser, jamais après. Et garde une trace de chaque
> correction : la reproductibilité est un signe de professionnalisme.
