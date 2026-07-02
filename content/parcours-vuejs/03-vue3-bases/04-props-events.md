---
title: "Props, événements & v-model"
type: lesson
---

# Communiquer entre composants

Une appli, c'est plein de composants **emboîtés** : un parent qui contient des enfants. La
question devient vite : comment se parlent-ils ? Vue impose une règle simple et saine :
**les props descendent, les événements remontent**.

![Props ↓ (parent → enfant) · Events ↑ (enfant → parent)](assets/props-events.svg)

> **Pourquoi ce sens unique (« flux descendant ») ?** Pour que la donnée ait **une seule
> source de vérité**. Le parent possède l'état ; il le *prête* à l'enfant via une prop.
> L'enfant ne modifie pas ce qu'on lui prête — s'il veut un changement, il **demande**
> (il émet un événement) et le parent décide. Résultat : quand une donnée est fausse, tu
> sais qui la possède. Si n'importe qui pouvait tout modifier, débugger deviendrait un
> cauchemar.

> **Passerelle — fonctions.** Tu connais déjà ce modèle : une prop, c'est un **argument**
> passé à une fonction (le parent « appelle » l'enfant avec des valeurs) ; un événement
> émis, c'est un **callback** que l'enfant déclenche pour prévenir l'appelant. Props =
> entrées, `emit` = signaux de sortie.

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

Une prop est **en lecture seule** : l'enfant l'affiche, ne la mute jamais.

> **Passerelle — TypeScript.** Déclarer `title: String` ici, c'est exactement l'esprit
> d'un **type hint** (`title: string` en TS, `str` en Python, `string $title` en PHP) :
> tu documentes et tu contrôles la forme des entrées. En TS on peut même écrire
> `defineProps<{ title: string; active?: boolean }>()` — typage statique de bout en bout.

## Émettre un événement (enfant → parent)

```vue
<script setup>
const emit = defineEmits(['validate'])

function onClick() {
  emit('validate', { ok: true })   // le parent écoute @validate
}
</script>
```

Côté parent, on **écoute** avec `@` (rappel : `@` = `v-on`) :

```vue
<MonBouton title="Envoyer" @validate="onValidate" />
```

## `v-model` (liaison à double sens)

Pour un champ de formulaire, on veut souvent que la donnée aille **dans les deux sens** :
l'input affiche la valeur *et* la met à jour à la frappe. `v-model` fait exactement ça —
c'est juste du **sucre** au-dessus d'une prop `modelValue` + un événement
`update:modelValue` :

```vue
<input v-model="query" />     <!-- lie la valeur ET la met à jour à chaque frappe -->
```

> **À retenir —** props en **lecture seule** (on ne les mute pas), on **émet** pour faire
> remonter l'info, et `v-model` n'est que le raccourci « prop + événement » pour les champs
> de formulaire. Le flux reste toujours le même : ↓ props, ↑ events.

## À toi de jouer

Clique **« Tester »** : `v-model` lie l'input à `query`, et la liste filtrée (un `computed`,
donc **dérivée**) se met à jour à la frappe. C'est la réactivité de l'étape précédente en
action sur un vrai formulaire.

```vue
<script setup>
import { ref, computed } from 'vue'

const query = ref('')
const fruits = ['Pomme', 'Banane', 'Cerise', 'Mangue', 'Poire']
const filtered = computed(() =>
  fruits.filter((f) => f.toLowerCase().includes(query.value.toLowerCase()))
)
</script>

<template>
  <input v-model="query" placeholder="Filtrer…" />
  <ul>
    <li v-for="f in filtered" :key="f">{{ f }}</li>
  </ul>
</template>
```

## À retenir

- **Les props descendent, les événements remontent** : le parent possède l'état, l'enfant
  l'affiche et *demande* les changements en **émettant**.
- **`defineProps`** déclare les entrées (en **lecture seule** — jamais mutées par l'enfant),
  **`defineEmits`** déclare les signaux de sortie.
- Une prop, c'est un **argument** ; un `emit`, c'est un **callback**.
- **`v-model`** = sucre « prop `modelValue` + événement `update:modelValue` » pour lier un
  champ dans les deux sens.
