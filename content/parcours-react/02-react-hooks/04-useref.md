---
title: "useRef — référence mutable"
type: lesson
---

# `useRef` — référence mutable

`useRef` crée une **boîte mutable** qui persiste entre les rendus mais dont la
modification **ne déclenche pas de re-rendu**. On l'utilise dans deux cas distincts.

## Cas 1 : accès à un élément DOM

```tsx
import { useRef, useEffect } from 'react'

function SearchInput() {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Focus the input after mounting
    inputRef.current?.focus()
  }, [])

  return <input ref={inputRef} type="search" placeholder="Rechercher…" />
}
```

`ref={inputRef}` fait que `inputRef.current` pointe vers le nœud DOM réel après le
montage. TypeScript : `useRef<HTMLInputElement>(null)` (valeur initiale `null`).

## Cas 2 : valeur mutable sans re-rendu

Parfois on veut mémoriser une valeur entre les rendus **sans** déclencher un re-rendu —
par exemple : l'ID d'un timer, une valeur précédente, un drapeau « première exécution » :

```tsx
function Timer() {
  const [seconds, setSeconds] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function start() {
    if (intervalRef.current) return  // already running
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)
  }

  function stop() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  return (
    <div>
      <p>{seconds}s</p>
      <button onClick={start}>Démarrer</button>
      <button onClick={stop}>Arrêter</button>
    </div>
  )
}
```

`intervalRef.current = ...` modifie la boîte **directement** — pas de setter, pas de
re-rendu. `seconds` est dans l'état (il faut re-rendre pour afficher), mais l'ID du timer
est dans une `ref` (on n'a pas besoin de re-rendre pour le stocker).

## `useState` vs `useRef`

| Critère | `useState` | `useRef` |
|---|---|---|
| Déclenche un re-rendu | Oui | Non |
| Valeur accessible dans le rendu | Oui | Oui (`current`) |
| Mutation directe | Non (immuable) | Oui (`ref.current = x`) |
| Usage | État affiché à l'écran | Timer, DOM, valeur précédente |

## Valeur précédente (pattern courant)

```tsx
function usePrevious<T>(value: T): T | undefined {
  const prevRef = useRef<T>()

  useEffect(() => {
    prevRef.current = value
  })  // runs after every render

  return prevRef.current
}

// Usage
function Counter() {
  const [count, setCount] = useState(0)
  const prev = usePrevious(count)

  return (
    <p>
      {prev !== undefined ? `Avant : ${prev}, ` : ''}Maintenant : {count}
      <button onClick={() => setCount(count + 1)}>+1</button>
    </p>
  )
}
```

> **À retenir —** `useRef` est une boîte persistante (`current`) dont la modification
> ne provoque **pas** de re-rendu. Deux usages : accéder à un **nœud DOM** (`ref={ref}`)
> ou stocker une **valeur mutable** qui n'a pas besoin de déclencher de rendu (timers,
> valeurs précédentes, drapeaux).
