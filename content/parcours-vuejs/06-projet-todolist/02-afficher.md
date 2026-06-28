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

const taches = ref([
  { id: 1, texte: 'Apprendre Vue', fait: false },
  { id: 2, texte: 'Construire une todo-list', fait: false },
])
</script>

<template>
  <h3>Mes tâches</h3>
  <ul>
    <li v-for="t in taches" :key="t.id">{{ t.texte }}</li>
  </ul>
</template>
```

> **Clique « Tester »** puis essaie : ajoute une tâche à la main dans le tableau, change
> un texte — l'affichage suit. La `key` aide Vue à suivre chaque élément efficacement.
