---
title: "Exercice — implémenter un reducer (TS)"
type: exercise
exercise:
  language: ts
  starter: |
    type Status = 'idle' | 'loading' | 'success' | 'error'

    interface FetchState<T> {
      status: Status
      data: T | null
      error: string | null
    }

    type FetchAction<T> =
      | { type: 'FETCH_START' }
      | { type: 'FETCH_SUCCESS'; payload: T }
      | { type: 'FETCH_ERROR'; message: string }
      | { type: 'RESET' }

    function fetchReducer<T>(
      state: FetchState<T>,
      action: FetchAction<T>
    ): FetchState<T> {
      // TODO: handle all four action types
      // FETCH_START  → status: 'loading', error: null
      // FETCH_SUCCESS → status: 'success', data: payload
      // FETCH_ERROR  → status: 'error', error: message
      // RESET        → initial state (idle, null, null)
      return state
    }

    const initial: FetchState<unknown> = { status: 'idle', data: null, error: null }
  tests:
    - name: "FETCH_START passe en loading"
      code: |
        const next = fetchReducer(initial, { type: 'FETCH_START' })
        console.log('after FETCH_START :', next)
        assertEqual(next.status, 'loading', 'status = loading')
        assertEqual(next.error, null, 'error reste null')
    - name: "FETCH_SUCCESS reçoit les données"
      code: |
        const loading = { status: 'loading' as Status, data: null, error: null }
        const next = fetchReducer(loading, { type: 'FETCH_SUCCESS', payload: { id: 1 } })
        console.log('after FETCH_SUCCESS :', next)
        assertEqual(next.status, 'success', 'status = success')
        assertEqual((next.data as { id: number }).id, 1, 'data.id = 1')
    - name: "FETCH_ERROR capture le message"
      code: |
        const loading = { status: 'loading' as Status, data: null, error: null }
        const next = fetchReducer(loading, { type: 'FETCH_ERROR', message: 'Network error' })
        assertEqual(next.status, 'error', 'status = error')
        assertEqual(next.error, 'Network error', 'message capturé')
    - name: "RESET revient à l'état initial"
      code: |
        const success = { status: 'success' as Status, data: { id: 1 }, error: null }
        const next = fetchReducer(success, { type: 'RESET' })
        assertEqual(next.status, 'idle', 'status = idle')
        assertEqual(next.data, null, 'data = null')
---

## Énoncé

> **Durée conseillée : ~15 min.** Un reducer est une **fonction pure** — on peut la tester
> sans composant. Dans un vrai projet : `const [state, dispatch] = useReducer(fetchReducer, initial)`.

Implémente `fetchReducer` qui gère les quatre transitions d'un chargement asynchrone :

| Action | Transition d'état |
|---|---|
| `FETCH_START` | `status: 'loading'`, `error: null` |
| `FETCH_SUCCESS` | `status: 'success'`, `data: payload` |
| `FETCH_ERROR` | `status: 'error'`, `error: message` |
| `RESET` | retour à l'état initial (`idle`, `null`, `null`) |

Ne mute jamais `state` — retourne toujours un **nouvel objet** avec spread `{ ...state, ... }`.

<!--correction-->

## Correction

```ts
function fetchReducer<T>(
  state: FetchState<T>,
  action: FetchAction<T>
): FetchState<T> {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, status: 'loading', error: null }
    case 'FETCH_SUCCESS':
      return { ...state, status: 'success', data: action.payload }
    case 'FETCH_ERROR':
      return { ...state, status: 'error', error: action.message }
    case 'RESET':
      return { status: 'idle', data: null, error: null }
    default:
      return state
  }
}
```

Le `switch` sur `action.type` avec des **unions discriminées** est le pattern standard.
TypeScript rétrécit le type d'`action` dans chaque branche — `action.payload` n'est
accessible que dans `FETCH_SUCCESS`.
