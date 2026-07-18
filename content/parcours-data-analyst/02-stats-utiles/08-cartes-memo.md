---
title: "Cartes mémo — statistiques utiles"
type: flashcards
cards:
  - q: |
      Quand préfère-t-on la **médiane** à la **moyenne** pour résumer une série ?
    a: |
      Dès qu'il y a des **valeurs extrêmes** (*outliers*) — salaires, prix immobilier,
      paniers d'achat. La médiane est **robuste** : une seule valeur énorme ne la déplace
      pas. Exemple : salaires `2000, 2100, 2200, 2300, 15000` → moyenne = **4720**,
      médiane = **2200**. La médiane décrit mieux le salaire typique.
  - q: |
      Comment calcule-t-on la médiane d'un tableau de **n pair** valeurs ?
    a: |
      On trie, puis on prend la **moyenne des deux valeurs centrales** (indices `n/2 - 1`
      et `n/2`). Exemple : `[1, 2, 3, 4]` → `(2 + 3) / 2 = 2,5`.
  - q: |
      Qu'est-ce que l'**écart-type** et dans quelle unité s'exprime-t-il ?
    a: |
      C'est la racine carrée de la **variance** : il mesure la dispersion « moyenne »
      autour de la moyenne. Il s'exprime dans la **même unité** que les données (€, jours,
      pièces). Formule : `√( Σ(xᵢ − μ)² / n )`.
  - q: |
      Deux magasins ont le même CA moyen. Magasin A : σ = 5 €. Magasin B : σ = 90 €.
      Qu'est-ce que cela signifie pour la décision ?
    a: |
      A est **stable** (ventes proches de la moyenne chaque jour). B est **erratique** :
      un jour 10 €, le lendemain 190 €. Pour la gestion des stocks, des effectifs et de la
      trésorerie, ce sont deux réalités opposées malgré une moyenne identique.
  - q: |
      Quelle est la formule du **taux de variation** (évolution en %) ?
    a: |
      `(valeur finale − valeur initiale) / valeur initiale × 100`. Le dénominateur est
      **toujours la valeur de départ**. Ex : 200 → 250 = `(250-200)/200 × 100 = +25 %`.
  - q: |
      Un taux de conversion passe de 4 % à 6 %. Comment le formuler précisément ?
    a: |
      `+2 points de pourcentage` (écart absolu). En relatif : `(6-4)/4 × 100 = +50 %`.
      Dire « +2 % » est faux (ça voudrait dire 4 % × 1,02 = 4,08 %). Toujours préciser
      **pp** quand on compare deux pourcentages.
  - q: |
      Un CA fait −30 % en janvier, puis +30 % en février. Où en est-on par rapport au
      départ ?
    a: |
      `100 × 0,70 × 1,30 = 91`. On est à **−9 %** du départ, pas à zéro. Les
      pourcentages se **multiplient** (facteurs), ils ne s'additionnent pas.
  - q: |
      Qu'est-ce que le **paradoxe de Simpson** et quel réflexe adopter ?
    a: |
      Une tendance vraie dans **chaque sous-groupe** s'inverse une fois les groupes
      agrégés, à cause de la répartition des effectifs. Réflexe : vérifier la conclusion
      **groupe par groupe** avant de globaliser, surtout quand les groupes ont des tailles
      très différentes.
---

Lis, réfléchis, révèle, auto-évalue — ces cartes couvrent les 4 leçons du module Stats.
