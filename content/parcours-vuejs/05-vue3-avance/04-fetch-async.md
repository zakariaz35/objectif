---
title: "Charger des données (async)"
type: lesson
---

# Charger des données proprement

Le pattern d'un composant qui appelle une API : trois états — **chargement**, **erreur**,
**données**.

```vue
<script setup>
import { ref, onMounted } from 'vue'

const users = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const res = await fetch('/api/users')
    if (!res.ok) throw new Error('HTTP ' + res.status)
    users.value = await res.json()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <p v-if="loading">Loading…</p>
  <p v-else-if="error" class="err">{{ error }}</p>
  <ul v-else>
    <li v-for="u in users" :key="u.id">{{ u.name }}</li>
  </ul>
</template>
```

> **Bonne pratique —** extrais ce pattern dans un composable `useFetch(url)` qui renvoie
> `{ data, loading, error }` : tu le réutilises partout, et tes composants restent
> concentrés sur l'affichage.

> **Piège —** toujours gérer l'**erreur** et l'état **loading**. Un composant qui suppose
> que les données arrivent toujours, instantanément et sans échec, casse en production.
