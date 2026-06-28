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

export const useCart = defineStore('cart', () => {
  const items = ref([])
  const total = computed(() => items.value.reduce((sum, item) => sum + item.price, 0))

  function addItem(item) {
    items.value.push(item)
  }

  return { items, total, addItem }
})
```

C'est la **même API que `<script setup>`** : `ref` pour l'état, `computed` pour le dérivé,
des fonctions pour les actions.

## Utiliser le store

```vue
<script setup>
import { useCart } from '@/stores/cart'
const cart = useCart()
</script>

<template>
  <p>Total: {{ cart.total }} €</p>
  <button @click="cart.addItem({ price: 10 })">Add</button>
</template>
```

> **Props ou store ?** Props pour la communication **locale** parent↔enfant. Store pour
> un état **transverse** (panier, utilisateur connecté, préférences) partagé par des
> composants éloignés. N'en abuse pas : tout n'a pas besoin d'être global.
