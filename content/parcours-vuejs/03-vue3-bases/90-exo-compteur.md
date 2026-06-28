---
title: "Exercice — un compteur"
type: exercise
---

## Énoncé

Complète ce composant `<script setup>` pour qu'il :

1. tienne un compteur réactif `count` (départ à 0) ;
2. expose `double` = le double de `count` (valeur **dérivée**) ;
3. ait une fonction `increment()` qui ajoute 1.

```vue
<script setup>
import { ref, computed } from 'vue'

// 1) count réactif
// 2) double dérivé
// 3) increment()
</script>

<template>
  <button @click="increment">{{ count }}</button>
  <p>Double : {{ double }}</p>
</template>
```

<!--correction-->

## Correction

```vue
<script setup>
import { ref, computed } from 'vue'

const count = ref(0)
const double = computed(() => count.value * 2)
function increment() {
  count.value++
}
</script>

<template>
  <button @click="increment">{{ count }}</button>
  <p>Double : {{ double }}</p>
</template>
```

Points clés : `count` est un `ref` (on fait `count.value++` dans le script, mais juste
`count` dans le template) ; `double` est un `computed` **dérivé** (jamais un second
`ref` à synchroniser à la main).
