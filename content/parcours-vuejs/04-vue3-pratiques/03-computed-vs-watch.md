---
title: "computed vs watch"
type: lesson
---

# `computed` ou `watch` ?

La confusion la plus fréquente chez les débutants Vue. Règle simple :

- **`computed`** → quand tu veux **calculer une valeur** à partir d'autres. Pur, mis en cache.
- **`watch`** → quand tu veux **déclencher une action** (effet de bord) quand une valeur change.

## `computed` : une valeur dérivée

```js
const prixHT = ref(100)
const prixTTC = computed(() => prixHT.value * 1.2)   // une VALEUR
```

## `watch` : réagir à un changement

```js
watch(recherche, async (nouvelle) => {
  resultats.value = await api.chercher(nouvelle)   // un EFFET (appel API)
})
```

## Le test mental

> « Est-ce que je veux **obtenir une valeur**, ou **faire quelque chose** ? »
> Une valeur → `computed`. Une action (API, log, localStorage…) → `watch`.

> **Anti-pattern fréquent —** utiliser un `watch` pour recopier une valeur dérivée dans
> un autre `ref`. Si c'est dérivable, c'est un `computed` — sinon tu maintiens deux
> sources de vérité qui finiront par diverger.
