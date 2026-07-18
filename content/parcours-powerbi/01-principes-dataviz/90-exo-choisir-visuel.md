---
title: "Exercice — choisir le bon visuel"
type: exercise
---

## Énoncé

Pour chacun des cas métier suivants, indique :

1. Le **visuel Power BI** le plus adapté.
2. La **raison** (en une phrase).
3. Le ou les **visuels à éviter** et pourquoi.

**Cas A** — La direction demande : « Montre-moi comment notre chiffre d'affaires a évolué mois par mois sur les 18 derniers mois. »

**Cas B** — Un acheteur demande : « Quelle est la part de chaque fournisseur dans nos achats totaux ? On a 12 fournisseurs actifs. »

**Cas C** — Le marketing veut savoir : « Est-ce qu'il existe une relation entre le budget publicitaire dépensé par région et le CA réalisé ? »

**Cas D** — Le responsable des ventes veut : « Compare le CA de nos 8 régions pour voir lesquelles sous-performent. »

**Cas E** — La direction financière : « Donne-moi le CA total de l'année, la marge brute en % et le nombre de commandes — en un coup d'œil. »

<!--correction-->

## Correction

**Cas A — Évolution temporelle**

- Visuel : **Courbe (line chart)** avec `Date[month_name]` en abscisse et `[Total Sales]` en valeur.
- Raison : le verbe « évoluer » + une dimension date → la courbe relie les points et rend la tendance immédiatement lisible.
- À éviter : un camembert (ne montre pas d'évolution) ; des barres non triées par ordre chronologique (on perd la continuité temporelle).

**Cas B — Répartition entre 12 fournisseurs**

- Visuel : **Barres horizontales triées** par CA descendant, ou **treemap** (si on veut aussi visualiser des sous-groupes).
- Raison : 12 parts dans un camembert → les angles sont trop proches pour être distingués. Les barres triées révèlent le classement immédiatement.
- À éviter : **camembert à 12 parts** — c'est le piège classique. L'œil compare très mal des angles proches.

**Cas C — Corrélation budget vs CA**

- Visuel : **Nuage de points (scatter)** avec `Budget_pub` en axe X et `[Total Sales]` en axe Y, une bulle par région.
- Raison : le scatter est le seul visuel qui représente la relation entre deux mesures continues. Une droite de tendance (trendline) renforce le message.
- À éviter : un double axe Y (on peut faire « corréler » n'importe quoi en jouant sur les échelles — c'est trompeur).

**Cas D — Comparaison de 8 régions**

- Visuel : **Barres horizontales**, triées du CA le plus élevé au plus faible.
- Raison : comparer des catégories → longueurs alignées sur une même base. Les libellés de régions longs tiennent mieux à l'horizontal.
- À éviter : colonnes verticales (libellés coupés), camembert (angles illisibles à 8 parts), 3D (déforme les volumes).

**Cas E — KPI clés en un coup d'œil**

- Visuel : **3 cartes (Card)** ou **KPI cards**, une par indicateur (`[Total Sales]`, `[Gross Margin %]`, `[Order Count]`).
- Raison : un seul chiffre large, lisible en 2 secondes, idéal pour le haut du dashboard.
- À éviter : un tableau matriciel (trop dense), une courbe (pas de dimension temporelle demandée ici).

> **Rappel** — Le visuel découle toujours du **verbe** de la demande : évoluer → courbe, comparer → barres, répartir → empilé/treemap, corréler → scatter, un chiffre → carte. Mémorise ce mapping et tu évites 90 % des mauvais choix.
