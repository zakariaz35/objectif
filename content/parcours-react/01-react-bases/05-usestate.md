---
title: "État local — useState"
type: lesson
---

# État local — `useState`

Un composant qui ne fait que recevoir des props est statique. Pour qu'il **réagisse** à
l'utilisateur — compteur, formulaire, menu ouvert/fermé — il a besoin d'un **état local**.
En React, c'est `useState`.

## Syntaxe

```tsx
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)
  //     ↑ valeur   ↑ setter   ↑ valeur initiale

  return (
    <div>
      <p>Compteur : {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(0)}>Réinitialiser</button>
    </div>
  )
}
```

`useState` retourne un **tableau de deux éléments** :
1. La valeur actuelle de l'état.
2. Une fonction **setter** pour la mettre à jour.

Quand le setter est appelé, React **re-rend** le composant avec la nouvelle valeur.
L'ancienne valeur est perdue — l'état ne mute jamais directement.

## Règle d'or : ne jamais muter l'état

```tsx
// Wrong — direct mutation (React won't detect the change)
const [items, setItems] = useState(['a', 'b'])
items.push('c')         // ← mutation directe, aucun re-rendu

// Correct — creates a new array
setItems([...items, 'c'])
```

La même règle s'applique aux objets :

```tsx
const [user, setUser] = useState({ name: 'Alice', age: 30 })

// Incorrect
user.age = 31

// Correct — spread to copy, then replace the property
setUser({ ...user, age: 31 })
```

## Forme fonctionnelle du setter

Quand la nouvelle valeur dépend de l'ancienne, utilise la **forme fonctionnelle** — elle
reçoit la valeur précédente et garantit un résultat correct même en mode concurrent :

```tsx
// Risky if multiple updates are batched together
setCount(count + 1)

// Recommended
setCount((prev) => prev + 1)
```

## `useState` vs `ref` (Vue) vs propriété de classe (Angular)

| React `useState` | Vue `ref` | Angular (signal/propriété) |
|---|---|---|
| `const [x, setX] = useState(v)` | `const x = ref(v)` | `x = signal(v)` |
| Lecture : `x` | Lecture script : `x.value` | Lecture : `x()` |
| Écriture : `setX(newVal)` | Écriture : `x.value = newVal` | Écriture : `x.set(newVal)` |
| Re-rendu automatique | Mise à jour réactive | Mise à jour réactive |

> **Passerelle —** Vue fait la même distinction entre `ref` (primitif) et `reactive`
> (objet). En React, `useState` gère les deux cas. La différence fondamentale : en Vue on
> lit `.value` dans le script ; en React on lit directement la variable dévstructurée.

## Exemple complet : formulaire simple

```tsx
function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log('Login with:', email, password)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mot de passe"
      />
      <button type="submit">Se connecter</button>
    </form>
  )
}
```

C'est un **formulaire contrôlé** : React est la source de vérité, pas le DOM. La valeur
du champ est toujours synchronisée avec l'état (`value={email}`).

> **Passerelle Vue —** `v-model` fait exactement ça automatiquement. En React, on le fait
> explicitement : `value` pour lire, `onChange` pour écrire.

## À retenir

- `useState(initial)` retourne `[valeur, setter]`. Le setter déclenche un **re-rendu**.
- Ne **jamais muter** l'état — toujours créer une nouvelle valeur.
- Forme fonctionnelle `setX(prev => ...)` quand la nouvelle valeur dépend de l'ancienne.
- Formulaire contrôlé : `value={state}` + `onChange={e => setState(e.target.value)}`.
