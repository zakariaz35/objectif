---
title: "Vocabulaire : dimension, mesure, KPI, granularité"
type: lesson
---

# Le vocabulaire qu'on attend de toi

En entretien comme en réunion, ces mots reviennent sans cesse. Les employer juste te
crédibilise immédiatement.

## Donnée, dimension, mesure

Prends une table de ventes :

| order_id | order_date | region | category | quantity | amount |
|---|---|---|---|---|---|
| 1 | 2024-01-15 | Nord | Office | 2 | 120 |
| 2 | 2024-01-20 | Sud  | Hardware | 1 | 300 |

- **Mesure** : une valeur **numérique qu'on agrège** (somme, moyenne). Ici `quantity`,
  `amount`.
- **Dimension** : un axe **par lequel on découpe** la mesure. Ici `region`, `category`,
  `order_date`. Souvent du texte ou une date.

> « CA **par** région **et par** mois » = la mesure `amount`, découpée selon les
> dimensions `region` et `order_date` (au niveau mois).

## KPI vs métrique

- Une **métrique** est n'importe quelle valeur mesurée (nombre de visites, CA, panier
  moyen).
- Un **KPI** (*Key Performance Indicator*) est une métrique **choisie parce qu'elle pilote
  une décision** et qu'on la suit dans le temps, souvent **comparée à un objectif**.

> Tous les KPI sont des métriques, mais toutes les métriques ne sont pas des KPI. Le CA
> mensuel comparé à l'objectif est un KPI ; « nombre de lignes dans la table » est juste
> une métrique technique.

## Granularité

La **granularité** = le niveau de détail d'une ligne. Une ligne = une commande ? une ligne
de commande ? un jour ? un mois ?

- Fine (une ligne par produit vendu) → on peut tout agréger ensuite.
- Grossière (déjà un total par mois) → on ne peut **plus** redescendre.

> **À retenir —** on peut toujours **agréger** du fin vers le grossier, jamais l'inverse.
> En cas de doute, garde la donnée **la plus fine possible**.
