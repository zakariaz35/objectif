---
title: "Asynchrone : promesses & async/await"
type: lesson
---

# Asynchrone

Charger des données prend du temps : le code **n'attend pas** sur place, il reprend plus tard. C'est la base des appels API dans Vue.

## Une promesse

Une `Promise` représente une valeur **future** (qui arrivera, ou échouera).

```js
fetch('/api/users')
  .then((res) => res.json())
  .then((users) => console.log(users))
  .catch((err) => console.error(err))
```

## `async` / `await` (plus lisible)

`await` met en pause **dans** une fonction `async` jusqu'à ce que la promesse soit résolue.

```js
async function loadUsers() {
  try {
    const res = await fetch('/api/users')
    const users = await res.json()
    return users
  } catch (err) {
    console.error('loading failed', err)
    return []
  }
}
```

> **Repère Vue —** Tu utiliseras ce pattern dans `onMounted` ou un composable pour
> remplir l'état d'un composant : `users.value = await loadUsers()`. La gestion
> `try/catch` + un état `loading` est la base d'un chargement propre.

> **Piège —** `await` ne marche que dans une fonction `async`. Et n'oublie pas que la
> fonction renvoie une **promesse** : l'appelant doit `await` aussi (ou `.then`).
