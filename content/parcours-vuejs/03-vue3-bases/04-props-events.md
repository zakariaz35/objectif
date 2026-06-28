---
title: "Props, événements & v-model"
type: lesson
---

# Communiquer entre composants

Règle de base : **les props descendent, les événements remontent**.

## Recevoir des props (parent → enfant)

```vue
<script setup>
const props = defineProps({
  title: String,
  active: { type: Boolean, default: false },
})
</script>

<template>
  <h2>{{ title }}</h2>
</template>
```

Une prop est **en lecture seule** : l'enfant ne la modifie pas.

## Émettre un événement (enfant → parent)

```vue
<script setup>
const emit = defineEmits(['validate'])

function onClick() {
  emit('validate', { ok: true })   // the parent listens to @validate
}
</script>
```

Côté parent :

```vue
<MyButton title="Send" @validate="onValidate" />
```

## `v-model` (liaison à double sens)

`v-model` = une prop `modelValue` + un événement `update:modelValue`, condensés :

```vue
<input v-model="query" />     <!-- binds the value AND updates on keystroke -->
```

> **À retenir —** props en **lecture seule** (on ne les mute pas), on **émet** pour
> faire remonter l'info, et `v-model` est juste le sucre prop + événement pour les
> champs de formulaire.

## À toi de jouer

Clique **« Tester »** : `v-model` lie l'input et la liste filtrée se met à jour à la frappe.

```vue
<script setup>
import { ref, computed } from 'vue'

const query = ref('')
const fruits = ['Apple', 'Banana', 'Cherry', 'Mango', 'Pear']
const filtered = computed(() =>
  fruits.filter((f) => f.toLowerCase().includes(query.value.toLowerCase()))
)
</script>

<template>
  <input v-model="query" placeholder="Filter…" />
  <ul>
    <li v-for="f in filtered" :key="f">{{ f }}</li>
  </ul>
</template>
```
