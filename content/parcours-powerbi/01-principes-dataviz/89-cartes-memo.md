---
title: "Cartes mémo — dataviz"
type: flashcards
cards:
  - q: |
      Tu veux **comparer le CA de 8 régions**. Quel visuel, et pourquoi pas un camembert ?
    a: |
      Des **barres horizontales triées** par valeur. L'œil compare des longueurs alignées,
      pas des angles. Un camembert à 8 parts est illisible : les angles proches sont
      indiscernables.
  - q: |
      Pourquoi l'axe Y d'un graphique en **barres** doit-il toujours commencer à **zéro** ?
    a: |
      Parce que dans une barre, c'est la **longueur** qui encode la valeur. Tronquer l'axe
      exagère artificiellement les écarts et rend le visuel trompeur.
  - q: |
      Quel verbe de la demande métier oriente vers une **courbe** plutôt que des barres ?
    a: |
      « **Évoluer** », « tendance », « dans le temps ». Dès qu'il y a une dimension `Date`
      en abscisse, la courbe relie les points et rend la tendance visible.
  - q: |
      « 120 k€ de CA » : pourquoi ce chiffre seul est-il presque inutile ?
    a: |
      Il manque le **contexte**. Bon ou mauvais ? On le rend parlant par comparaison : vs
      objectif, vs période précédente, vs moyenne. Un KPI gagne toujours à porter une
      variation.
  - q: |
      Quel devrait être le contenu d'un bon **titre** de visuel ?
    a: |
      Le **message**, pas la description des axes. « Le CA recule depuis mars (-12 %) »
      plutôt que « CA par mois ». Le titre fait gagner au lecteur l'effort d'interprétation.
  - q: |
      Tu dois montrer la **part de chaque fournisseur** dans les achats (12 fournisseurs).
      Quel visuel choisis-tu et lequel rejettes-tu ?
    a: |
      Tu choisis des **barres horizontales triées** (ou une treemap). Tu rejettes le
      **camembert à 12 parts** : l'œil ne distingue pas les angles proches, le graphique
      devient illisible dès 4-5 parts similaires.
  - q: |
      Quel est le seul visuel adapté pour montrer la **relation entre deux mesures
      continues** (ex. budget pub vs CA) ?
    a: |
      Le **nuage de points (scatter)**, une bulle par entité (région, produit…), une
      mesure par axe. Une droite de tendance renforce le message. À ne pas confondre avec
      un double axe Y, qui peut faire apparaître de fausses corrélations.
  - q: |
      Dans quel ordre place-t-on l'information dans un dashboard pour une **lecture efficace** ?
    a: |
      Du **général au détail** : KPI clés en haut (lecture en 3 secondes), tendances au
      milieu, tableaux de détail en bas. On suit le schéma Z de lecture : haut-gauche →
      bas-droite. L'essentiel va en haut à gauche.
  - q: |
      Qu'est-ce que le **double axe Y** et pourquoi est-il risqué ?
    a: |
      Un graphique avec deux échelles différentes (une par série). En jouant les échelles,
      on peut faire « corréler » n'importe quelle paire de courbes. À manier avec une
      extrême prudence — préférer deux graphiques distincts ou un scatter.
---

Lis, réfléchis, révèle, auto-évalue.
