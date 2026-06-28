---
title: "Étape 3 — Cocher & supprimer"
type: lesson
---

# Étape 3 — Cocher et supprimer

On coche une tâche avec une case liée en `v-model` (sur `t.fait`), et on supprime en
**filtrant** le tableau (on garde tout sauf l'id cliqué).

```vue
<script setup>
import { ref } from 'vue'

const taches = ref([
  { id: 1, texte: 'Apprendre Vue', fait: true },
  { id: 2, texte: 'Construire une todo-list', fait: false },
])

function supprimer(id) {
  taches.value = taches.value.filter((t) => t.id !== id)
}
</script>

<template>
  <ul>
    <li v-for="t in taches" :key="t.id">
      <input type="checkbox" v-model="t.fait" />
      <span :style="{ textDecoration: t.fait ? 'line-through' : 'none' }">{{ t.texte }}</span>
      <button @click="supprimer(t.id)">✕</button>
    </li>
  </ul>
</template>
```

> **Teste** : coche une tâche (elle se barre via `:style` lié à `t.fait`), supprime-en
> une. `v-model` sur la case écrit directement dans `t.fait` — la réactivité fait le reste.
