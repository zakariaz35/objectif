---
title: "Étape 3 — Cocher & supprimer"
type: lesson
---

# Étape 3 — Cocher et supprimer

On coche une tâche avec une case liée en **`v-model`** (sur `t.fait`), et on supprime en
**filtrant** le tableau (on garde tout sauf l'id cliqué).

```vue
<script setup>
import { ref } from 'vue'

const taches = ref([
  { id: 1, texte: 'Apprendre Vue', fait: true },
  { id: 2, texte: 'Construire une todo-list', fait: false },
])

function supprimerTache(id) {
  taches.value = taches.value.filter((t) => t.id !== id)
}
</script>

<template>
  <ul>
    <li v-for="t in taches" :key="t.id">
      <input type="checkbox" v-model="t.fait" />
      <span :style="{ textDecoration: t.fait ? 'line-through' : 'none' }">{{ t.texte }}</span>
      <button @click="supprimerTache(t.id)">✕</button>
    </li>
  </ul>
</template>
```

> **Pourquoi supprimer avec `filter` (et pas modifier le tableau en place) ?** `filter`
> renvoie un **nouveau** tableau sans l'élément visé — on **réaffecte** `taches.value`. C'est
> le style « données immuables » : plus lisible, moins de pièges qu'un `splice` avec des
> index à calculer. Tu retrouves exactement le `filter` du module Tableaux, appliqué ici à
> de l'état réactif.

> **Pourquoi `:style` lié à `t.fait` ?** L'apparence (texte barré) est **dérivée** de l'état
> (`fait`), pas gérée à part. On ne « barre » pas le texte à la main : on décrit « si fait,
> alors barré », et Vue applique. Même philosophie qu'un `computed`.

> **Teste** : coche une tâche (elle se barre via `:style` lié à `t.fait`), supprime-en une.
> `v-model` sur la case écrit directement dans `t.fait` — la réactivité fait le reste.

## À retenir

- **`v-model`** marche aussi sur une case à cocher : il écrit le booléen directement dans
  `t.fait`.
- On **supprime** avec **`filter`** (nouveau tableau sans l'élément) — style immuable, plus
  sûr que muter en place.
- L'apparence (`:style`) est **dérivée** de l'état : on décrit la règle, Vue l'applique.
