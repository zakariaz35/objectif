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
  titre: String,
  actif: { type: Boolean, default: false },
})
</script>

<template>
  <h2>{{ titre }}</h2>
</template>
```

Une prop est **en lecture seule** : l'enfant ne la modifie pas.

## Émettre un événement (enfant → parent)

```vue
<script setup>
const emit = defineEmits(['valider'])

function onClick() {
  emit('valider', { ok: true })   // le parent écoute @valider
}
</script>
```

Côté parent :

```vue
<MonBouton titre="Envoyer" @valider="onValider" />
```

## `v-model` (liaison à double sens)

`v-model` = une prop `modelValue` + un événement `update:modelValue`, condensés :

```vue
<input v-model="recherche" />     <!-- lie la valeur ET met à jour à la frappe -->
```

> **À retenir —** props en **lecture seule** (on ne les mute pas), on **émet** pour
> faire remonter l'info, et `v-model` est juste le sucre prop + événement pour les
> champs de formulaire.

## À toi de jouer

Clique **« Tester »** : `v-model` lie l'input et la liste filtrée se met à jour à la frappe.

```vue
<script setup>
import { ref, computed } from 'vue'

const recherche = ref('')
const fruits = ['Pomme', 'Banane', 'Cerise', 'Mangue', 'Poire']
const filtres = computed(() =>
  fruits.filter((f) => f.toLowerCase().includes(recherche.value.toLowerCase()))
)
</script>

<template>
  <input v-model="recherche" placeholder="Filtrer…" />
  <ul>
    <li v-for="f in filtres" :key="f">{{ f }}</li>
  </ul>
</template>
```
