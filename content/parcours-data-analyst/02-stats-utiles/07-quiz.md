---
title: "Quiz — statistiques utiles"
type: quiz
questions:
  - prompt: |
      Les salaires (k€) d'une équipe : `2.0, 2.1, 2.2, 2.3, 15.0`. Quel résumé décrit le
      mieux le « salaire typique » ?
    options:
      - "La moyenne (4.72) — elle utilise toutes les valeurs"
      - "La médiane (2.2) — elle résiste à la valeur extrême"
      - "L'étendue (13.0) — elle montre l'amplitude"
    answer: 1
    explanation: >
      La valeur `15` tire fortement la moyenne vers le haut. La médiane (2.2) reste
      représentative du salaire typique : elle est robuste aux extrêmes.
  - prompt: |
      Un taux de conversion passe de 20 % à 25 %. Comment le formuler correctement ?
    options:
      - "+5 % de conversion"
      - "+5 points de pourcentage (soit +25 % en relatif)"
      - "+25 points de pourcentage"
    answer: 1
    explanation: >
      Entre deux pourcentages, l'écart se dit en **points de pourcentage** : 25 − 20 = 5 pp.
      En relatif, c'est (25−20)/20 = +25 %. Confondre les deux est l'erreur classique.
  - prompt: |
      Un CA fait `−50 %` un mois, puis `+50 %` le mois suivant. Où en est-on vs le départ ?
    options:
      - "Revenu au point de départ (0 % net)"
      - "En baisse de 25 % (les % se multiplient, pas s'additionnent)"
      - "En hausse de 25 %"
    answer: 1
    explanation: >
      100 × 0.5 × 1.5 = 75. Les pourcentages se composent en multipliant les facteurs ;
      ils ne s'additionnent pas. On a donc perdu 25 %.
  - prompt: |
      Une méthode B est meilleure que A dans chaque canal pris séparément, mais A gagne sur
      le total agrégé. Comment s'appelle ce piège ?
    options:
      - "Le biais du survivant"
      - "Le paradoxe de Simpson"
      - "La corrélation fallacieuse"
    answer: 1
    explanation: >
      C'est le paradoxe de Simpson : la répartition des effectifs entre groupes inverse la
      tendance une fois agrégée. Toujours vérifier groupe par groupe.
  - prompt: |
      Pour un graphique en **barres** de CA mensuel, où doit commencer l'axe vertical ?
    options:
      - "À la valeur minimale, pour mieux voir les écarts"
      - "À zéro, sinon il exagère visuellement les écarts"
      - "Peu importe, c'est purement esthétique"
    answer: 1
    explanation: >
      Un axe tronqué (ne partant pas de zéro) dramatise des variations minuscules. Pour des
      barres, l'axe doit partir de zéro afin que la longueur reste proportionnelle.
---

Vérifie que tu sais résumer une série, manier les pourcentages et repérer les pièges.
