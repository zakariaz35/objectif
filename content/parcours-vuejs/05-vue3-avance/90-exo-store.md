---
title: "Exercice — un store Pinia"
type: exercise
---

## Énoncé

Écris un store Pinia `useCounter` (style Composition) qui expose :

1. un état `count` (départ à 0) ;
2. un dérivé `double` ;
3. une action `increment()`.

```js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounter = defineStore('counter', () => {
  // 1) count
  // 2) double
  // 3) increment
  // return { ... }
})
```

<!--correction-->

## Correction

```js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounter = defineStore('counter', () => {
  const count = ref(0)
  const double = computed(() => count.value * 2)
  function increment() {
    count.value++
  }
  return { count, double, increment }
})
```

C'est volontairement la **même structure** qu'un `<script setup>` : `ref` pour l'état,
`computed` pour le dérivé, une fonction pour l'action — et on **retourne** ce qu'on veut
exposer. La différence : l'état est **partagé** par tous les composants qui appellent
`useCounter()`.
