---
title: "Étape 2 — Ajouter une tâche"
type: lesson
---

# Étape 2 — Ajouter une tâche

Un champ lié en `v-model`, un formulaire dont on intercepte l'envoi (`@submit.prevent`),
et on **pousse** la nouvelle tâche dans le tableau.

```vue
<script setup>
import { ref } from 'vue'

const tasks = ref([{ id: 1, text: 'Learn Vue', done: false }])
const newTask = ref('')
let nextId = 2

function addTask() {
  const text = newTask.value.trim()
  if (!text) return
  tasks.value.push({ id: nextId++, text, done: false })
  newTask.value = ''
}
</script>

<template>
  <h3>My tasks</h3>
  <form @submit.prevent="addTask">
    <input v-model="newTask" placeholder="New task…" />
    <button>Add</button>
  </form>
  <ul>
    <li v-for="t in tasks" :key="t.id">{{ t.text }}</li>
  </ul>
</template>
```

> **Teste** : tape une tâche, valide (Entrée ou « Ajouter »). On vide le champ après
> ajout, et on ignore une saisie vide. `@submit.prevent` évite le rechargement de page.
