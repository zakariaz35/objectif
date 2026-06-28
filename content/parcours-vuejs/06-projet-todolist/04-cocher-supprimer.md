---
title: "Étape 3 — Cocher & supprimer"
type: lesson
---

# Étape 3 — Cocher et supprimer

On coche une tâche avec une case liée en `v-model` (sur `t.done`), et on supprime en
**filtrant** le tableau (on garde tout sauf l'id cliqué).

```vue
<script setup>
import { ref } from 'vue'

const tasks = ref([
  { id: 1, text: 'Learn Vue', done: true },
  { id: 2, text: 'Build a todo-list', done: false },
])

function removeTask(id) {
  tasks.value = tasks.value.filter((t) => t.id !== id)
}
</script>

<template>
  <ul>
    <li v-for="t in tasks" :key="t.id">
      <input type="checkbox" v-model="t.done" />
      <span :style="{ textDecoration: t.done ? 'line-through' : 'none' }">{{ t.text }}</span>
      <button @click="removeTask(t.id)">✕</button>
    </li>
  </ul>
</template>
```

> **Teste** : coche une tâche (elle se barre via `:style` lié à `t.done`), supprime-en
> une. `v-model` sur la case écrit directement dans `t.done` — la réactivité fait le reste.
