---
title: "Composant SFC & <script setup>"
type: lesson
---

# Le composant Single-File (SFC)

Un composant Vue tient dans **un fichier `.vue`** à trois sections :

```vue
<script setup>
import { ref } from 'vue'

const message = ref('Hello')
</script>

<template>
  <h1>{{ message }}</h1>
</template>

<style scoped>
h1 { color: teal; }
</style>
```

- **`<script setup>`** : la logique (Composition API). Tout ce que tu y déclares est
  automatiquement disponible dans le template.
- **`<template>`** : le HTML, avec l'interpolation `{{ }}` et les directives (`v-if`…).
- **`<style scoped>`** : du CSS limité à ce composant (pas de fuite vers les autres).

> **Pourquoi `<script setup>` ?** C'est la forme moderne et recommandée : moins de
> cérémonie (pas de `export default`, pas de `return`), tout ce qui est déclaré est
> exposé au template. C'est ce qu'on utilise dans tout ce parcours.

## Interpolation et liaisons

```vue
<template>
  <p>{{ message }}</p>              <!-- text -->
  <img :src="url" />               <!-- v-bind (dynamic attribute) -->
  <button @click="count">+1</button>  <!-- v-on (event) -->
</template>
```

`:` est le raccourci de `v-bind`, `@` celui de `v-on`.
