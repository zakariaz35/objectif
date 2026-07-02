---
title: "Quiz — Vue 3, bonnes pratiques"
type: quiz
questions:
  - prompt: |
      Tu veux, quand `query` change, **lancer un appel API** pour récupérer des résultats. Quel outil ?
    options:
      - |
        Un `computed`, car il « réagit » au changement de `query`
      - |
        Un `watch`, car un appel API est un **effet de bord**
      - |
        Une variable normale recalculée à la main
    answer: 1
    explanation: |
      Le test mental : « je veux **obtenir une valeur** ou **faire quelque chose** ? ». Ici on **fait** quelque chose (un appel réseau) : c'est un **effet de bord**, donc `watch`. Un `computed` est réservé aux valeurs **dérivées et pures** (comme un `ttc = ht × 1.2`) ; il ne doit rien déclencher d'extérieur.
  - prompt: |
      Une liste `visible` doit afficher soit toutes les tâches, soit seulement les non-faites, selon un `filter`. Comment la produire proprement ?
    options:
      - |
        Un `watch` sur `filter` qui recopie le bon sous-ensemble dans un `ref visible`
      - |
        Un `computed` qui renvoie le bon sous-ensemble selon `filter`
      - |
        Un second tableau `ref` qu'on trie manuellement à chaque clic
    answer: 1
    explanation: |
      `visible` est **entièrement dérivable** de `tasks` et `filter` : c'est donc un `computed`. Utiliser un `watch` pour recopier un dérivé dans un `ref` est **l'anti-pattern classique** : tu te retrouves avec deux sources de vérité qui finiront par diverger. Règle d'or : on **dérive**, on ne **synchronise pas** à la main.
  - prompt: |
      Deux composants ont besoin de la **même logique** (état + fonctions) « ouvert / fermé ». Quelle est l'approche Vue 3 recommandée ?
    options:
      - |
        Copier-coller la logique dans chaque composant
      - |
        Extraire un **composable** `useToggle()` que chaque composant importe
      - |
        Mettre la logique dans une variable globale partagée
    answer: 1
    explanation: |
      C'est le rôle exact d'un **composable** : une fonction `useXxx()` qui encapsule une logique réactive réutilisable (factorisation / DRY). Chaque appel crée **son propre état** — on partage la logique, pas l'état. Le copier-coller multiplie les bugs ; une variable globale mélangerait les états des deux composants.
---

Trois questions pour ancrer les réflexes « pro » : distinguer `computed` (valeur dérivée)
de `watch` (effet de bord), et extraire la logique commune dans un composable.
