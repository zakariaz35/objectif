---
title: "Étape 4 — Filtrer & compter"
type: lesson
---

# Étape 4 — Filtres et compteur

On ajoute un filtre (`toutes` / `actives` / `faites`) en **`computed`** — la liste affichée
est **dérivée** de l'état, jamais dupliquée. Et un compteur de tâches restantes, dérivé lui
aussi.

```vue
<script setup>
import { ref, computed } from 'vue'

const taches = ref([
  { id: 1, texte: 'Apprendre Vue', fait: true },
  { id: 2, texte: 'Filtrer les tâches', fait: false },
  { id: 3, texte: 'Compter celles qui restent', fait: false },
])
const filtre = ref('toutes')

const visibles = computed(() => {
  if (filtre.value === 'actives') return taches.value.filter((t) => !t.fait)
  if (filtre.value === 'faites') return taches.value.filter((t) => t.fait)
  return taches.value
})
const restantes = computed(() => taches.value.filter((t) => !t.fait).length)
</script>

<template>
  <p>
    <button @click="filtre = 'toutes'">Toutes</button>
    <button @click="filtre = 'actives'">Actives</button>
    <button @click="filtre = 'faites'">Faites</button>
  </p>
  <ul>
    <li v-for="t in visibles" :key="t.id">
      <input type="checkbox" v-model="t.fait" /> {{ t.texte }}
    </li>
  </ul>
  <p>{{ restantes }} tâche(s) restante(s)</p>
</template>
```

> **Pourquoi `visibles` et `restantes` en `computed` (et pas en `ref`) ?** Parce qu'ils sont
> **entièrement dérivables** de `taches` et `filtre`. Les stocker dans des `ref` séparés
> obligerait à les recalculer à la main à chaque changement — deux sources de vérité qui
> divergent. C'est la **règle d'or** du module 3, appliquée : on dérive, on ne synchronise
> pas.

> **Passerelle — data / SQL.** `visibles` se lit comme un `SELECT * FROM taches WHERE fait =
> false` (filtre `actives`), et `restantes` comme un `SELECT COUNT(*) ... WHERE fait =
> false`. Le `computed` est la « vue » qui recalcule ça à la volée dès que la table
> `taches` bouge.

> **Teste** : change de filtre, coche des tâches — `visibles` et `restantes` se recalculent
> tout seuls, en cache. C'est la boucle réactive complète, sur une vraie mini-appli.

## À retenir

- La liste affichée et le compteur sont des **`computed`** dérivés de l'état — **jamais**
  dupliqués dans des `ref` à synchroniser.
- Un `computed` filtré/compté se lit comme un `SELECT ... WHERE` / `COUNT(*)` recalculé à la
  volée.
- Tu as maintenant une todo-list fonctionnelle : afficher, ajouter, cocher, supprimer,
  filtrer, compter — le tout piloté par l'état.
