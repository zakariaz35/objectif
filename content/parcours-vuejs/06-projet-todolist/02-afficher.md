---
title: "Étape 1 — Afficher les tâches"
type: lesson
---

# Étape 1 — Afficher la liste

On part d'un tableau réactif de tâches et on l'affiche avec `v-for`. Chaque tâche a un
`id` (pour la `key`), un `texte` et un booléen `fait`.

```vue
<script setup>
import { ref } from 'vue'

const tasks = ref([
  { id: 1, text: 'Learn Vue', done: false },
  { id: 2, text: 'Build a todo-list', done: false },
])
</script>

<template>
  <h3>My tasks</h3>
  <ul>
    <li v-for="task in tasks" :key="task.id">{{ task.text }}</li>
  </ul>
</template>
```

> **Clique « Tester »** puis essaie : ajoute une tâche à la main dans le tableau, change
> un texte — l'affichage suit. La `key` aide Vue à suivre chaque élément efficacement.
