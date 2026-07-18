---
title: "JSX — la syntaxe"
type: lesson
---

# JSX — la syntaxe

**JSX** est une extension syntaxique de JavaScript qui ressemble à du HTML. Ce n'est
**pas** du HTML : c'est du sucre syntaxique compilé par Vite (Babel/SWC) en appels
`React.createElement(...)`.

> **Pourquoi JSX ?** Vue et Angular ont choisi de séparer le template HTML du code JS.
> React fait le pari inverse : tout est JavaScript — l'UI **est** du code. JSX rend ce
> mélange lisible tout en gardant la pleine puissance de JS (boucles, conditions,
> fonctions) directement dans le template.

## Règles fondamentales

### 1. Un seul élément racine (ou Fragment)

```tsx
// Correct
function App() {
  return (
    <div>
      <h1>Hello</h1>
      <p>World</p>
    </div>
  )
}

// Correct with Fragment (no extra DOM node)
function App() {
  return (
    <>
      <h1>Hello</h1>
      <p>World</p>
    </>
  )
}

// Error: two root elements
function App() {
  return (
    <h1>Hello</h1>
    <p>World</p>   // ← SyntaxError
  )
}
```

### 2. `className` au lieu de `class`

```tsx
// HTML : <div class="card active">
// JSX :
<div className="card active">
```

### 3. Expressions JavaScript entre `{}`

```tsx
const name = 'Alice'
const isAdmin = true

function Greeting() {
  return (
    <div>
      <p>Bonjour, {name} !</p>
      <p>Rôle : {isAdmin ? 'Admin' : 'Utilisateur'}</p>
      <p>2 + 2 = {2 + 2}</p>
    </div>
  )
}
```

Les accolades acceptent n'importe quelle **expression** JS — mais pas des **instructions**
(`if`, `for`). Pour les conditions, on utilise l'opérateur ternaire ou `&&` :

```tsx
function Badge({ active }: { active: boolean }) {
  return (
    <span>
      {active ? <span className="badge--on">Actif</span> : null}
      {/* or with && : */}
      {active && <span className="badge--on">Actif</span>}
    </span>
  )
}
```

### 4. Balises auto-fermantes

Toute balise sans enfant doit être fermée avec `/>` :

```tsx
<img src="logo.svg" alt="Logo" />
<input type="text" />
<br />
```

### 5. Style inline : un objet JavaScript

```tsx
// HTML : style="color: red; font-size: 16px"
// JSX :
<p style={{ color: 'red', fontSize: '16px' }}>Texte</p>
//         ↑ double accolades : { expression JS } + { objet JS }
```

## JSX compilé

```tsx
// What you write:
<h1 className="title">Hello, {name}!</h1>

// Ce que Babel/SWC compile :
React.createElement('h1', { className: 'title' }, `Hello, ${name}!`)
```

Tu n'importes plus `React` explicitement depuis React 17+ (le transforme JSX automatique
s'en charge). Vite et `tsconfig.json` (`"jsx": "react-jsx"`) gèrent ça tout seuls.

## À retenir

- JSX = JS + HTML mélangés, compilé en `createElement`. Un seul élément racine (ou `<>`).
- Attributs camelCase : `className`, `htmlFor`, `onClick`…
- Expressions JS dans `{}` — pas d'instructions (`if`/`for` : utilise ternaire ou `.map()`).
- Style inline = objet JS double accolades.
