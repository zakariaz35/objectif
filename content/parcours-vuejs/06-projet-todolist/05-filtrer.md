---
title: "Étape 4 — Filtrer & compter"
type: lesson
---

# Étape 4 — Filtres et compteur

On ajoute un filtre (`toutes` / `actives` / `faites`) en **`computed`** — la liste
affichée est **dérivée** de l'état, jamais dupliquée. Et un compteur de tâches restantes.

```vue
<script setup>
import { ref, computed } from 'vue'

const taches = ref([
  { id: 1, texte: 'Apprendre Vue', fait: true },
  { id: 2, texte: 'Filtrer les tâches', fait: false },
  { id: 3, texte: 'Compter les restantes', fait: false },
])
const filtre = ref('toutes')

const visibles = computed(() => {
  if (filtre.value === 'actives') return taches.value.filter((t) => !t.fait)
  if (filtre.value === 'faites') return taches.value.filter((t) => t.fait)
  return taches.value
})
const restantes = computed(() => taches.value.filter((t) => !t.fait).length)
</script>

<template>
  <p>
    <button @click="filtre = 'toutes'">Toutes</button>
    <button @click="filtre = 'actives'">Actives</button>
    <button @click="filtre = 'faites'">Faites</button>
  </p>
  <ul>
    <li v-for="t in visibles" :key="t.id">
      <input type="checkbox" v-model="t.fait" /> {{ t.texte }}
    </li>
  </ul>
  <p>{{ restantes }} tâche(s) restante(s)</p>
</template>
```

> **Teste** : change de filtre, coche des tâches — `visibles` et `restantes` se
> recalculent tout seuls. C'est la **règle d'or** : on dérive (`computed`), on ne
> synchronise pas à la main.
