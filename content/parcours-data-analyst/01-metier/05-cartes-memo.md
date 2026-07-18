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
  - q: |
      Un manager te demande « Est-ce que nos ventes vont bien ? ». Quelle est la **bonne
      réaction** d'un·e analyste avant de toucher aux données ?
    a: |
      **Reformuler et valider** la question : « Souhaitez-vous le CA du mois en cours,
      comparé au mois précédent et à l'objectif, par région ? » Sans question précise, on
      risque de produire un livrable qui ne répond pas au vrai besoin.
  - q: |
      Quelle est la différence entre comparer **mois à mois (MoM)** et **année sur année
      (YoY)** pour une vente de saison ?
    a: |
      Le **MoM** montre l'évolution brute : en décembre, le CA grimpe naturellement
      (Noël). Le **YoY** (même mois, année N-1) **neutralise l'effet de saisonnalité** et
      révèle la vraie tendance de fond. Pour des données saisonnières, le YoY est plus
      fiable.
  - q: |
      Cite les **5 étapes du workflow** de l'analyste dans l'ordre.
    a: |
      1. **Question** — cadrer ce qu'on cherche vraiment.
      2. **Collecte** — identifier les sources, rapatrier le nécessaire.
      3. **Nettoyage** — doublons, formats, valeurs manquantes.
      4. **Analyse** — filtrer, grouper, agréger, calculer.
      5. **Restitution** — dashboard, insights, recommandations.
      Et un **feedback** qui relance la question suivante.
---

Lis, réfléchis, révèle, auto-évalue.
