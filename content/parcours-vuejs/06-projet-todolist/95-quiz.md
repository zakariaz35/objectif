---
title: "Quiz de synthèse — Todo-list & Vue 3"
type: quiz
questions:
  - prompt: |
      Dans `<li v-for="t in taches" :key="t.id">`, à quoi sert la `:key` ?
    options:
      - |
        À rien de visible : c'est purement décoratif
      - |
        À donner à Vue un identifiant **stable** pour suivre chaque élément et ne redessiner que ce qui change
      - |
        À trier automatiquement la liste par ordre croissant
    answer: 1
    explanation: |
      La `:key` (un id **unique et stable**, jamais l'index du tableau) permet à Vue de savoir quel élément est lequel quand la liste bouge — il ne remue alors que ce qui a réellement changé. L'oublier (ou utiliser l'index) provoque des bugs subtils lors des ajouts/suppressions. Elle ne trie rien : c'est un repère d'identité, pas d'ordre.
  - prompt: |
      La liste `visibles` (selon le filtre) et le compteur `restantes` sont écrits en `computed`. Pourquoi pas en `ref` mis à jour à la main ?
    options:
      - |
        Par habitude ; un `ref` recalculé dans un `watch` ferait aussi bien l'affaire
      - |
        Parce qu'ils sont **dérivables** de l'état : un `computed` se recalcule seul, sans deux sources de vérité à synchroniser
      - |
        Parce qu'un `computed` est obligatoire dès qu'on utilise `v-for`
    answer: 1
    explanation: |
      C'est **la règle d'or** du parcours : on ne **duplique** jamais un état qu'on peut **dériver**. `visibles` et `restantes` se calculent entièrement à partir de `taches` et `filtre` → `computed` (recalculé et mis en cache tout seul). Les recopier dans des `ref` via un `watch` créerait deux sources de vérité qui finiraient par diverger. `v-for` n'impose rien de tel.
  - prompt: |
      Tu veux **persister** les tâches dans `localStorage` à chaque changement. Quel outil réactif utiliser ?
    options:
      - |
        Un `computed`, puisqu'on « réagit » aux changements de `taches`
      - |
        Un `watch` sur `taches`, car écrire dans `localStorage` est un **effet de bord**
      - |
        Rien : `localStorage` se met à jour tout seul avec la réactivité
    answer: 1
    explanation: |
      Écrire dans `localStorage` **agit sur le monde extérieur** : c'est un **effet de bord**, donc un `watch` (`watch(taches, (v) => localStorage.setItem(...), { deep: true })`). Un `computed` est réservé aux valeurs **dérivées et pures** — il ne doit rien déclencher d'extérieur. Et non, `localStorage` ne suit pas la réactivité tout seul : il faut explicitement écrire dedans.
---

Quiz de synthèse : la `:key`, la règle « dérive (`computed`) plutôt que duplique », et le
bon usage du `watch` pour un effet de bord. Si ces trois points sont clairs, tu tiens
l'essentiel de Vue 3.
