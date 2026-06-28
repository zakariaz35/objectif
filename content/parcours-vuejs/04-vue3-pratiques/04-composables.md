---
title: "Les composables (useXxx)"
type: lesson
---

# Les composables

Un **composable** est une fonction `useXxx()` qui encapsule de la **logique réactive
réutilisable**. C'est LE moyen de partager du code entre composants en Vue 3.

## Exemple : `useToggle`

```js
// composables/useToggle.js
import { ref } from 'vue'

export function useToggle(initial = false) {
  const state = ref(initial)
  const toggle = () => { state.value = !state.value }
  return { state, toggle }
}
```

Utilisation dans n'importe quel composant :

```vue
<script setup>
import { useToggle } from '@/composables/useToggle'

const { state: ouvert, toggle } = useToggle()
</script>

<template>
  <button @click="toggle">{{ ouvert ? 'Fermer' : 'Ouvrir' }}</button>
</template>
```

## Conventions

- Le nom commence par **`use`** (`useToggle`, `useFetch`, `usePagination`).
- Il **renvoie** des `ref`/`computed`/fonctions (pas un gros objet réactif figé).
- Il peut appeler d'autres composables et les hooks de cycle de vie.

> **Pourquoi c'est mieux —** au lieu de dupliquer la même logique (ou d'abuser de
> `provide/inject`), on l'extrait une fois et on la réutilise. C'est l'équivalent moderne
> et propre des anciens *mixins*, sans leurs pièges.

## À toi de jouer

Clique **« Tester »** : ici le composable est défini dans le même fichier (en vrai il serait
dans `composables/useToggle.js`). On l'utilise **deux fois** indépendamment.

```vue
<script setup>
import { ref } from 'vue'

function useToggle(initial = false) {
  const state = ref(initial)
  const toggle = () => (state.value = !state.value)
  return { state, toggle }
}

const { state: menu, toggle: toggleMenu } = useToggle()
const { state: aide, toggle: toggleAide } = useToggle(true)
</script>

<template>
  <button @click="toggleMenu">Menu : {{ menu ? 'ouvert' : 'fermé' }}</button>
  <button @click="toggleAide">Aide : {{ aide ? 'visible' : 'cachée' }}</button>
</template>
```
