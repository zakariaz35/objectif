---
title: "Cartes mémo — vocabulaire du métier"
type: flashcards
cards:
  - q: |
      Quelle est la différence entre une **dimension** et une **mesure** ?
    a: |
      La **mesure** est une valeur numérique qu'on **agrège** (CA, quantité). La
      **dimension** est un axe **par lequel on découpe** la mesure (région, catégorie,
      date). « CA par région » = mesure `amount` découpée par la dimension `region`.
  - q: |
      Tous les KPI sont des métriques. Pourquoi l'inverse est-il faux ?
    a: |
      Une **métrique** est n'importe quelle valeur mesurée. Un **KPI** est une métrique
      **choisie parce qu'elle pilote une décision** et qu'on suit dans le temps, souvent
      comparée à un objectif. « Nombre de lignes en base » est une métrique, pas un KPI.
  - q: |
      Pourquoi vaut-il mieux garder la donnée à la granularité **la plus fine** possible ?
    a: |
      Parce qu'on peut toujours **agréger** du fin vers le grossier (lignes → mois), mais
      **jamais redescendre** une fois agrégé. Garder le détail laisse toutes les analyses
      ouvertes.
  - q: |
      Pourquoi ne **somme**-t-on jamais un `order_id` ou un code client ?
    a: |
      Parce qu'un identifiant numérique est une **dimension déguisée en nombre** : il
      identifie, il ne quantifie pas. Le sommer n'a aucun sens métier.
  - q: |
      Dans quelle étape du workflow passe-t-on souvent 60-80 % du temps réel, et pourquoi
      la néglige-t-on ?
    a: |
      Le **nettoyage** (doublons, formats, valeurs manquantes). On la néglige car elle est
      ingrate et invisible, mais des **données sales = conclusions fausses**.
---

Lis, réfléchis, révèle, auto-évalue.
