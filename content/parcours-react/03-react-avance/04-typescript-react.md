---
title: "React & TypeScript"
type: lesson
---

# React & TypeScript

TypeScript et React se marient très naturellement. Voici les patterns incontournables
pour typer correctement les composants, les hooks et les événements.

## Typer les props

```tsx
// Preferred interface for props (extensible)
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  disabled?: boolean
}

function Button({ label, onClick, variant = 'primary', disabled = false }: ButtonProps) {
  return (
    <button
      className={`btn btn--${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  )
}
```

## `React.ReactNode` vs `JSX.Element`

| Type | Signification |
|---|---|
| `React.ReactNode` | tout ce que React peut rendre (JSX, string, number, null…) |
| `JSX.Element` | uniquement du JSX retourné par un composant |
| `React.FC<Props>` | type d'un composant fonction (non recommandé — préférer la signature explicite) |

```tsx
// Pour children, toujours React.ReactNode
interface LayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
}
```

## Typer les événements

```tsx
// Input change
function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  console.log(e.target.value)
}

// Form submit
function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault()
}

// Button click
function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
  e.stopPropagation()
}
```

Raccourci : dans un attribut inline, TypeScript infère le type automatiquement :

```tsx
<input onChange={(e) => setValue(e.target.value)} />
//              ↑ TypeScript infers ChangeEvent<HTMLInputElement>
```

## `useState` avec type explicite

```tsx
// Inferred when the initial value is enough for TypeScript
const [count, setCount] = useState(0)                    // number
const [name, setName] = useState('')                     // string

// Explicit when state can be null or a complex type
const [user, setUser] = useState<User | null>(null)
const [items, setItems] = useState<string[]>([])
```

## `useRef` typé

```tsx
// For a DOM element: always initialize to null
const inputRef = useRef<HTMLInputElement>(null)
inputRef.current?.focus()

// For a mutable value: initialize with the value
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
```

## Types utilitaires courants

```tsx
// Pick and Omit — useful for derived props
type CardPreviewProps = Pick<CardProps, 'title' | 'description'>
type CreateUserInput = Omit<User, 'id' | 'createdAt'>

// Discriminated union pour les actions (useReducer)
type Action =
  | { type: 'INCREMENT'; amount: number }
  | { type: 'RESET' }
```

## `as const` pour les tableaux de valeurs

```tsx
const VARIANTS = ['primary', 'secondary', 'ghost'] as const
type Variant = typeof VARIANTS[number]  // 'primary' | 'secondary' | 'ghost'

interface ButtonProps {
  variant: Variant
}
```

## Generic props — composants réutilisables typés

Les generic props sont l'équivalent React des génériques Angular (`MatTableDataSource<T>`)
ou des props génériques Vue (`defineProps<{ items: T[] }>()`).

```tsx
// A generic list component — works with any item type
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  keyExtractor: (item: T) => string | number
  emptyMessage?: string
}

function List<T>({ items, renderItem, keyExtractor, emptyMessage = 'Aucun élément' }: ListProps<T>) {
  if (items.length === 0) return <p>{emptyMessage}</p>
  return (
    <ul>
      {items.map((item) => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  )
}

// Usage: TypeScript infers T = User
interface User { id: number; name: string; email: string }
const users: User[] = [{ id: 1, name: 'Alice', email: 'alice@example.com' }]

<List
  items={users}
  keyExtractor={(u) => u.id}
  renderItem={(u) => <span>{u.name} — {u.email}</span>}
/>
```

### Generic hook — `useFetch<T>`

```tsx
// A reusable typed data-fetching hook
interface FetchState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

function useFetch<T>(url: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: T = await res.json()
        if (!cancelled) setState({ data, loading: false, error: null })
      } catch (err) {
        if (!cancelled)
          setState({ data: null, loading: false, error: (err as Error).message })
      }
    }

    load()
    return () => { cancelled = true }
  }, [url])

  return state
}

// Usage: data is typed as User | null
const { data: user, loading, error } = useFetch<User>('/api/users/1')
```

## Discriminated unions pour l'état

Le pattern **discriminated union** sur le state est l'équivalent TypeScript des
états NgRx (`LoadingState`, `LoadedState`, `ErrorState`). Il rend les états
impossibles irreprésentables.

```tsx
// Instead of 3 booleans that can conflict (loading=true AND error="..."),
// model state as a discriminated union
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string }

function UserProfile({ userId }: { userId: number }) {
  const [state, setState] = useState<AsyncState<User>>({ status: 'idle' })

  useEffect(() => {
    setState({ status: 'loading' })

    fetchUser(userId)
      .then((user) => setState({ status: 'success', data: user }))
      .catch((err) => setState({ status: 'error', message: err.message }))
  }, [userId])

  // TypeScript narrows the type in each branch
  switch (state.status) {
    case 'idle':    return null
    case 'loading': return <p>Chargement…</p>
    case 'error':   return <p>Erreur : {state.message}</p>
    case 'success': return <h2>{state.data.name}</h2>
  }
}
```

> **Avantage —** l'état `{ status: 'success', data: user }` garantit que `data` est
> présent. Plus besoin du `!` (non-null assertion) comme dans `user!.name`. TypeScript
> sait que dans la branche `success`, `data` est défini.

## Typer `useReducer` avec discriminated unions

```tsx
// Full typed reducer — same pattern as NgRx actions
interface User { id: number; name: string; role: 'admin' | 'user' }

type UserAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'UPDATE_ROLE'; role: User['role'] }   // reuse User['role'] — no duplication
  | { type: 'LOGOUT' }

type UserState =
  | { authenticated: false }
  | { authenticated: true; user: User }

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'SET_USER':
      return { authenticated: true, user: action.payload }
    case 'UPDATE_ROLE':
      if (!state.authenticated) return state
      return { ...state, user: { ...state.user, role: action.role } }
    case 'LOGOUT':
      return { authenticated: false }
  }
}
```

## Utility types courants en contexte React

```tsx
// ComponentProps — extract props of any component (Angular: @Input() reflection)
import { ComponentProps } from 'react'
type NativeButtonProps = ComponentProps<'button'>    // all HTML button attributes
type CustomButtonProps = ComponentProps<typeof Button>  // your component's props

// Extend a native element's props (common pattern for design systems)
interface InputProps extends ComponentProps<'input'> {
  label: string
  error?: string
}

function Input({ label, error, ...nativeProps }: InputProps) {
  return (
    <label>
      {label}
      <input {...nativeProps} />
      {error && <span className="error">{error}</span>}
    </label>
  )
}

// ReturnType — infer return type of a hook
type UseFetchReturn<T> = ReturnType<typeof useFetch<T>>

// Parameters — extract parameter types
type FetchArgs = Parameters<typeof fetch>   // [input: RequestInfo, init?: RequestInit]
```

## Formulaires avec react-hook-form et TypeScript

`react-hook-form` est la solution de référence 2024/2025 pour les formulaires React.
Elle évite les re-renders à chaque frappe (contrairement aux formulaires contrôlés
avec `useState`) et s'intègre naturellement avec Zod pour la validation.

```tsx
// npm install react-hook-form zod @hookform/resolvers
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

// 1. Zod schema = single source of truth for validation AND types
const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, '8 caractères minimum'),
})

type LoginFormValues = z.infer<typeof loginSchema>  // { email: string; password: string }

// 2. Form component
function LoginForm() {
  const {
    register,       // connects inputs (like Angular FormControl)
    handleSubmit,   // wraps the submit handler (calls e.preventDefault() automatically)
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(values: LoginFormValues) {
    await loginApi(values)  // values is fully typed
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input type="email" placeholder="Email" {...register('email')} />
        {errors.email && <span>{errors.email.message}</span>}
      </div>
      <div>
        <input type="password" placeholder="Mot de passe" {...register('password')} />
        {errors.password && <span>{errors.password.message}</span>}
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  )
}
```

> **Passerelle Angular —** `register('email')` joue le rôle de `formControlName="email"`.
> Le `zodResolver` joue le rôle des `Validators` Angular. La différence majeure : RHF
> utilise des refs DOM (non contrôlé par défaut) — zéro re-render à la frappe.

> **À retenir —** types d'événements React : `ChangeEvent`, `FormEvent`, `MouseEvent` —
> tous dans le namespace `React`. Generic props pour les composants réutilisables.
> Discriminated unions sur le state = états impossibles irreprésentables. `ComponentProps<T>`
> pour étendre les props natives. `react-hook-form` + Zod = formulaires sans re-renders.
