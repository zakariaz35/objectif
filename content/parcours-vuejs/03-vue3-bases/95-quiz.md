---
title: "Quiz — Vue 3, les bases"
type: quiz
questions:
  - prompt: |
      Dans un composant, tu as `const counter = ref(0)`. Comment **incrémenter** ce compteur **dans le `<script setup>`** ?
    options:
      - |
        `counter++`
      - |
        `counter.value++`
      - |
        `counter.set(counter + 1)`
    answer: 1
    explanation: |
      Un `ref` emballe la valeur dans une boîte réactive : on lit/écrit son contenu via **`.value`** dans le script (`counter.value++`). Dans le **template**, en revanche, Vue déballe tout seul : on écrit juste `{{ counter }}`. Ce `.value` est le prix à payer pour rendre réactif un type primitif.
  - prompt: |
      Un prix TTC se calcule à partir d'un prix HT (`ttc = ht × 1.2`). Comment l'exprimer proprement en Vue ?
    options:
      - |
        Un second `ref(0)` qu'on met à jour à la main chaque fois que le HT change
      - |
        Un `computed(() => ht.value * 1.2)` — une valeur **dérivée**
      - |
        Une variable normale `const ttc = ht.value * 1.2`
    answer: 1
    explanation: |
      C'est **la règle d'or** : on ne **duplique** jamais un état qu'on peut **dériver**. Un `computed` se recalcule tout seul quand sa source change (et il est mis en cache). Un second `ref` synchronisé à la main crée deux sources de vérité qui finiront par diverger. Une variable normale, elle, ne serait pas réactive : elle ne se recalculerait jamais.
  - prompt: |
      Un composant **enfant** reçoit une prop `title`. L'enfant veut « changer le titre ». Que doit-il faire ?
    options:
      - |
        Modifier directement `props.title` dans l'enfant
      - |
        **Émettre** un événement (`emit`) pour que le **parent** décide du changement
      - |
        Stocker le titre dans une variable globale partagée
    answer: 1
    explanation: |
      Le flux Vue est à sens unique : **les props descendent, les événements remontent**. Une prop est en **lecture seule** — l'enfant ne la mute pas. S'il veut un changement, il **émet** un événement ; le parent, qui possède l'état, décide. Ainsi, quand une donnée est fausse, on sait toujours qui la possède.
---

Trois questions pour vérifier les fondations de Vue 3 : le `.value` d'un `ref`, la règle
« dérive plutôt que duplique » (`computed`), et le sens de circulation props ↓ / events ↑.
