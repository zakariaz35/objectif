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

const tasks = ref([
  { id: 1, text: 'Learn Vue', done: true },
  { id: 2, text: 'Filter the tasks', done: false },
  { id: 3, text: 'Count the remaining ones', done: false },
])
const filter = ref('all')

const visible = computed(() => {
  if (filter.value === 'active') return tasks.value.filter((t) => !t.done)
  if (filter.value === 'done') return tasks.value.filter((t) => t.done)
  return tasks.value
})
const remaining = computed(() => tasks.value.filter((t) => !t.done).length)
</script>

<template>
  <p>
    <button @click="filter = 'all'">All</button>
    <button @click="filter = 'active'">Active</button>
    <button @click="filter = 'done'">Done</button>
  </p>
  <ul>
    <li v-for="t in visible" :key="t.id">
      <input type="checkbox" v-model="t.done" /> {{ t.text }}
    </li>
  </ul>
  <p>{{ remaining }} task(s) remaining</p>
</template>
```

> **Teste** : change de filtre, coche des tâches — `visible` et `remaining` se
> recalculent tout seuls. C'est la **règle d'or** : on dérive (`computed`), on ne
> synchronise pas à la main.
