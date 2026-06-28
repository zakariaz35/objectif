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
const priceExclTax = ref(100)
const priceInclTax = computed(() => priceExclTax.value * 1.2)   // a VALUE
```

## `watch` : réagir à un changement

```js
watch(query, async (newValue) => {
  results.value = await api.search(newValue)   // an EFFECT (API call)
})
```

## Le test mental

> « Est-ce que je veux **obtenir une valeur**, ou **faire quelque chose** ? »
> Une valeur → `computed`. Une action (API, log, localStorage…) → `watch`.

> **Anti-pattern fréquent —** utiliser un `watch` pour recopier une valeur dérivée dans
> un autre `ref`. Si c'est dérivable, c'est un `computed` — sinon tu maintiens deux
> sources de vérité qui finiront par diverger.
