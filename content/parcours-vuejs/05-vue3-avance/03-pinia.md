---
title: "Pinia : l'état global"
type: lesson
---

# Pinia

Quand plusieurs composants (sans lien parent/enfant) partagent le même état, on le met
dans un **store** Pinia plutôt que de le faire transiter par props.

## Définir un store

```js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePanier = defineStore('panier', () => {
  const lignes = ref([])
  const total = computed(() => lignes.value.reduce((s, l) => s + l.prix, 0))

  function ajouter(article) {
    lignes.value.push(article)
  }

  return { lignes, total, ajouter }
})
```

C'est la **même API que `<script setup>`** : `ref` pour l'état, `computed` pour le dérivé,
des fonctions pour les actions.

## Utiliser le store

```vue
<script setup>
import { usePanier } from '@/stores/panier'
const panier = usePanier()
</script>

<template>
  <p>Total : {{ panier.total }} €</p>
  <button @click="panier.ajouter({ prix: 10 })">Ajouter</button>
</template>
```

> **Props ou store ?** Props pour la communication **locale** parent↔enfant. Store pour
> un état **transverse** (panier, utilisateur connecté, préférences) partagé par des
> composants éloignés. N'en abuse pas : tout n'a pas besoin d'être global.
