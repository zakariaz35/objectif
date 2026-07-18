---
title: "Nettoyer un fichier Excel"
type: lesson
---

# Nettoyage : la moitié invisible du métier

Un fichier reçu par mail est presque toujours sale. Voici la checklist de l'analyste, dans
l'ordre où on l'applique.

![Avant / Après nettoyage : doublons, espaces, types hétérogènes](assets/nettoyage-avant-apres.svg)

## Scénario réel : export ERP du lundi matin

Imagine que tu reçois chaque lundi un export CSV de l'ERP commercial :
`commandes_semaine.csv`. Tu l'ouvres dans Excel et tu constates immédiatement :

- La colonne `montant` est alignée à gauche — elle est stockée en **texte**, pas en
  nombre. `SUMIFS` dessus renverra `0`.
- La colonne `region` contient `"nord"`, `"Nord "`, `"NORD"` en vrac — trois valeurs
  que le TCD considèrera comme trois catégories distinctes.
- Quelques lignes sont en **double** : des commandes partiellement saisies puis
  re-saisies.
- Trois cellules `date_commande` affichent `00/01/1900` — elles étaient vides dans l'ERP
  (une cellule date vide vaut `0`, affiché `00/01/1900`).

Applique les six étapes ci-dessous dans l'ordre. Chaque étape corrige une famille de
problèmes ; les sauter ou les inverser peut introduire de nouvelles erreurs.

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

**Nombres stockés en texte** — repères visuels : cellule alignée à gauche, petit triangle
vert dans le coin. `SUMIFS` sur cette colonne renvoie silencieusement `0`.

Trois façons de corriger selon la situation :

```
// Option A: multiply by 1 in a helper column
=[@amount] * 1

// Option B: VALUE() — explicit conversion
=VALUE([@amount])

// Option C: no extra column — select the column, Data > Text to Columns > Finish
```

**Dates stockées en texte** — une date textuelle comme `"15/06/2024"` est alignée à
gauche. `YEAR()` dessus renvoie `#VALEUR!`.

```
// Convert a text date to a real serial date
=DATEVALUE([@order_date])
```

Formate ensuite la colonne en *Date courte* (`Ctrl+1`).

**Cellules date vides qui affichent `00/01/1900`** — une cellule date numérique à `0`
s'affiche `00/01/1900`. Remplace par une vraie cellule vide :

```
// Replace "zero date" (displayed as 00/01/1900) with blank
=IF([@order_date] = 0, "", [@order_date])
```

**Décimales avec point au lieu de virgule** — un export anglophone utilise `1250.50`.
Excel en locale française le lira en texte. Utilise *Données → Convertir*, puis à l'étape
3 de l'assistant, clique sur *Avancé* et mets le séparateur décimal à `.`.

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

## 6. Traçabilité des corrections

Dans un contexte professionnel, **documente chaque correction** dans un onglet `_log` ou
en commentaire de cellule :

| date_correction | colonne | problème | règle appliquée |
|---|---|---|---|
| 2024-06-10 | amount | 3 cellules texte | multiply by 1 to coerce to number |
| 2024-06-10 | category | 12 espaces trailing | TRIM applied, new column clean_category |
| 2024-06-10 | order_id | 2 doublons | Remove Duplicates on order_id only |

Cette table de log te protège lors d'un audit ou quand un collègue reprend ton fichier.

## Mise en forme conditionnelle : signaler les anomalies restantes

Pour mettre en évidence les lignes suspectes sans les supprimer :

1. Sélectionne la colonne `amount` → *Accueil → Mise en forme conditionnelle → Nouvelle
   règle → Utiliser une formule*.
2. Entre la règle :

```
// Highlight: negative amount OR quantity = 0 OR date in the future
=OR([@amount] < 0, [@quantity] = 0, [@order_date] > TODAY())
```

3. Choisis une couleur (rouge clair) → OK.

Les lignes anormales ressortent à l'œil ; tu décides ensuite, ligne par ligne, d'exclure
ou de corriger.

## Pièges fréquents lors du nettoyage

**Trier avant de convertir les formules casse les références relatives.** Si ta colonne
de nettoyage contient `=A2 * 1`, `=A3 * 1`…, un tri réordonne les lignes mais les
formules pointent toujours vers les mêmes numéros de ligne — résultat : les données et
les formules ne sont plus alignées. Avant tout tri, sélectionne la colonne de nettoyage
→ *Copier* → *Coller spécial → Valeurs* pour figer les résultats.

**Supprimer les doublons sur toutes les colonnes n'est pas ce qu'on veut.** L'outil
*Données → Supprimer les doublons* avec toutes les colonnes cochées ne supprime que les
lignes **strictement identiques**. Pour dédoublonner sur `order_id` uniquement, décoche
toutes les colonnes sauf `order_id`. Sans quoi deux commandes du même client avec le même
montant mais des dates différentes disparaîtront à tort.

**`TRIM` ne supprime pas les espaces insécables.** `TRIM` supprime les espaces ASCII
(code 32), mais les copier-collers depuis le web, Teams ou certains ERP insèrent des
espaces insécables (code 160) que `TRIM` ne voit pas. Deux cellules d'apparence identique
(`"Nord"` et `"Nord"`) seront traitées comme différentes dans un SUMIFS ou un TCD :

```
// Remove both standard spaces and non-breaking spaces (char 160)
=TRIM(SUBSTITUTE([@region], CHAR(160), " "))
```

> **À retenir —** nettoie **avant** d'analyser, dans cet ordre : doublons → espaces/casse →
> types → valeurs manquantes → cohérence. Garde une trace de chaque correction : la
> reproductibilité est un signe de professionnalisme.
