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

## Pas-à-pas : tableau de bord commercial interactif avec segments

Contexte : tu as le TCD `TCD_CA_region` posé sur l'onglet `Dashboard` et tu veux le
rendre filtrable pour un manager non-expert Excel.

**Étape 1 — Ajouter un segment Région.**
Clique sur le TCD → onglet *Analyse du TCD* → *Insérer un segment* → coche `region` →
OK. Un volet de boutons (`Nord`, `Sud`, `Est`…) apparaît. Redimensionne-le et place-le
au-dessus du tableau. Un clic sur `"Nord"` : le TCD se filtre instantanément.

**Étape 2 — Ajouter une chronologie.**
*Analyse du TCD → Insérer une chronologie* → sélectionne `order_date` → OK. Une barre de
mois s'affiche. Fais glisser pour sélectionner une plage de mois : le TCD ne montre que
cette période.

**Étape 3 — Connecter les contrôles à plusieurs TCD.**
Si tu as deux TCD sur le même onglet (`TCD_CA_region` et `TCD_NbCommandes_region`) :
clic droit sur le segment → *Connexions de rapport* → coche les deux TCD. Un clic sur
`"Nord"` filtre maintenant les deux tableaux simultanément.

**Étape 4 — Protéger la mise en forme.**
Clic droit sur le segment → *Taille et propriétés* → décoche *Déplacer et redimensionner
avec les cellules*. Le segment reste en place même si tu insères des lignes dans le
tableau source en dessous.

> **Repère —** pour un rapport envoyé par e-mail, protège la feuille (*Révision →
> Protéger la feuille*) en laissant cochée l'option *Utiliser les rapports de tableau
> croisé dynamique*. Le destinataire peut filtrer avec les segments, mais ne peut pas
> modifier les données source.

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

## Cas d'usage contrôle de gestion : budget vs réalisé

Tu as deux tables : `Budget` (`cost_center | month | planned`) et `Actuals`
(`cost_center | month | consumed`). Pour éviter des dizaines de formules `SUMIFS`,
consolide les deux sources en une seule table `CG` en ajoutant une colonne `type`
valant `"planned"` ou `"consumed"`. Empile les deux tables l'une sous l'autre dans `CG`
(`cost_center | month | type | amount`).

Le TCD sur `CG` devient :

- **Lignes** : `cost_center`
- **Colonnes** : `type` (Excel crée automatiquement les colonnes `planned` et `consumed`)
- **Valeurs** : SOMME de `amount`
- **Filtre** (ou chronologie) : `month`

Crée ensuite un **champ calculé** `variance` (*Analyse du TCD → Champs, éléments et jeux
→ Champ calculé*) :

```
// Calculated field formula (entered in the pivot table dialog)
= consumed - planned
```

Résultat : chaque centre de coût affiche `planned`, `consumed` et `variance` dans la
même ligne, filtrable par mois en un clic.

> **Piège contrôle de gestion —** si `Budget` et `Actuals` n'ont pas exactement les mêmes
> combinaisons (`cost_center` × `month`), certaines cellules du TCD resteront vides. Un
> centre de coût présent dans `Actuals` mais absent du `Budget` ne montrera que `consumed`
> — la `variance` sera fausse (elle ne vaudra que `0 - consumed`). Vérifie l'exhaustivité
> des deux listes avant de construire le TCD.

> **À retenir —** % du total et écart répondent à « combien, et par rapport à quoi ? ». Les
> segments rendent l'exploration interactive, le graphique croisé reste synchronisé, et les
> champs calculés permettent des mesures dérivées — mais ils opèrent sur des agrégats, pas
> des lignes brutes.
