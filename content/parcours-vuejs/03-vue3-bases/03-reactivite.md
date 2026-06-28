---
title: "La réactivité : ref, reactive, computed"
type: lesson
---

# La réactivité

La réactivité, c'est ce qui fait que le **template se met à jour tout seul** quand une donnée change.

## `ref` — une valeur réactive

```js
import { ref } from 'vue'

const counter = ref(0)
counter.value++          // in the <script>: .value
```

Dans le **template**, pas besoin de `.value` : `{{ counter }}`.

## `reactive` — un objet réactif

```js
import { reactive } from 'vue'

const form = reactive({ name: '', age: 0 })
form.name = 'Ada'         // no .value for reactive
```

> **ref ou reactive ?** En pratique : **`ref` par défaut** (marche pour tout, y compris
> objets), `reactive` pour un groupe de champs liés (un formulaire). `ref` est le choix
> sûr quand tu hésites.

## `computed` — une valeur dérivée

Une valeur **calculée** à partir d'autres, recalculée automatiquement (et mise en cache) :

```js
import { ref, computed } from 'vue'

const priceExclTax = ref(100)
const priceInclTax = computed(() => priceExclTax.value * 1.2)   // 120, follows priceExclTax
```

> **Règle d'or —** ne **duplique** jamais un état que tu peux **dériver**. Si une valeur
> se calcule à partir d'une autre, c'est un `computed`, pas un second `ref` à maintenir.

## À toi de jouer

Survole le bloc ci-dessous et clique **« Tester »** : le composant s'exécute en direct dans
le playground. Modifie `step`, ajoute un `computed`…

```vue
<script setup>
import { ref, computed } from 'vue'

const counter = ref(0)
const step = ref(1)
const double = computed(() => counter.value * 2)
</script>

<template>
  <p>Counter: {{ counter }} — double: {{ double }}</p>
  <button @click="counter += step">+{{ step }}</button>
  <button @click="step++">Increase step</button>
</template>
```
