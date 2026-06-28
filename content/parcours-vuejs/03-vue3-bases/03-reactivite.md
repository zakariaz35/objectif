---
title: "La réactivité : ref, reactive, computed"
type: lesson
---

# La réactivité

La réactivité, c'est ce qui fait que le **template se met à jour tout seul** quand une donnée change.

## `ref` — une valeur réactive

```js
import { ref } from 'vue'

const compteur = ref(0)
compteur.value++          // dans le <script> : .value
```

Dans le **template**, pas besoin de `.value` : `{{ compteur }}`.

## `reactive` — un objet réactif

```js
import { reactive } from 'vue'

const form = reactive({ nom: '', age: 0 })
form.nom = 'Ada'          // pas de .value pour reactive
```

> **ref ou reactive ?** En pratique : **`ref` par défaut** (marche pour tout, y compris
> objets), `reactive` pour un groupe de champs liés (un formulaire). `ref` est le choix
> sûr quand tu hésites.

## `computed` — une valeur dérivée

Une valeur **calculée** à partir d'autres, recalculée automatiquement (et mise en cache) :

```js
import { ref, computed } from 'vue'

const prixHT = ref(100)
const prixTTC = computed(() => prixHT.value * 1.2)   // 120, suit prixHT
```

> **Règle d'or —** ne **duplique** jamais un état que tu peux **dériver**. Si une valeur
> se calcule à partir d'une autre, c'est un `computed`, pas un second `ref` à maintenir.

## À toi de jouer

Survole le bloc ci-dessous et clique **« Tester »** : le composant s'exécute en direct dans
le playground. Modifie `pas`, ajoute un `computed`…

```vue
<script setup>
import { ref, computed } from 'vue'

const compteur = ref(0)
const pas = ref(1)
const double = computed(() => compteur.value * 2)
</script>

<template>
  <p>Compteur : {{ compteur }} — double : {{ double }}</p>
  <button @click="compteur += pas">+{{ pas }}</button>
  <button @click="pas++">Augmenter le pas</button>
</template>
```
