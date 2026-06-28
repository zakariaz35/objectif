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

const taches = ref([{ id: 1, texte: 'Apprendre Vue', fait: false }])
const nouvelle = ref('')
let prochainId = 2

function ajouter() {
  const texte = nouvelle.value.trim()
  if (!texte) return
  taches.value.push({ id: prochainId++, texte, fait: false })
  nouvelle.value = ''
}
</script>

<template>
  <h3>Mes tâches</h3>
  <form @submit.prevent="ajouter">
    <input v-model="nouvelle" placeholder="Nouvelle tâche…" />
    <button>Ajouter</button>
  </form>
  <ul>
    <li v-for="t in taches" :key="t.id">{{ t.texte }}</li>
  </ul>
</template>
```

> **Teste** : tape une tâche, valide (Entrée ou « Ajouter »). On vide le champ après
> ajout, et on ignore une saisie vide. `@submit.prevent` évite le rechargement de page.
