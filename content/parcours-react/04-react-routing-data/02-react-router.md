---
title: "React Router v6"
type: lesson
---

# React Router v6

React Router v6 est la bibliothèque de routage standard pour React. La version 6.4+
introduit `createBrowserRouter` — l'API recommandée, avec support du data loading.

## Installation

```bash
npm install react-router-dom
```

## Configuration des routes

```tsx
// src/router.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './pages/Layout'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import NotFound from './pages/NotFound'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,      // parent avec <Outlet />
    children: [
      { index: true, element: <Home /> },
      { path: 'products', element: <Products /> },
      { path: 'products/:id', element: <ProductDetail /> },
    ],
  },
  { path: '*', element: <NotFound /> },
])

export default router
```

```tsx
// src/main.tsx
import { RouterProvider } from 'react-router-dom'
import router from './router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
```

## Layout avec `<Outlet>`

```tsx
// src/pages/Layout.tsx
import { Outlet, NavLink } from 'react-router-dom'

function Layout() {
  return (
    <>
      <nav>
        <NavLink to="/" end>Accueil</NavLink>
        <NavLink to="/products">Produits</NavLink>
      </nav>
      <main>
        <Outlet />  {/* children routes render here */}
      </main>
    </>
  )
}
```

`<Outlet>` est l'endroit où les routes enfants s'affichent — exactement comme
`<RouterView>` en Vue ou `<router-outlet>` en Angular.

`<NavLink>` ajoute automatiquement la classe `active` quand la route correspond. L'attribut
`end` sur `/` évite qu'il reste actif pour toutes les sous-routes.

## Navigation

### Liens déclaratifs

```tsx
import { Link } from 'react-router-dom'

<Link to="/products">Voir les produits</Link>
<Link to={`/products/${product.id}`}>Détail</Link>
```

### Navigation programmatique

```tsx
import { useNavigate } from 'react-router-dom'

function LoginForm() {
  const navigate = useNavigate()

  async function handleSubmit() {
    await login()
    navigate('/dashboard')          // redirect after login
    // navigate(-1)                 // go back
    // navigate('/home', { replace: true })  // replace history entry
  }
}
```

## Paramètres dynamiques

```tsx
// Route: /products/:id
import { useParams } from 'react-router-dom'

function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  // id is always a string — parse to number if needed: Number(id)
  return <h1>Produit {id}</h1>
}
```

## Query string

```tsx
// URL: /products?category=books&sort=price
import { useSearchParams } from 'react-router-dom'

function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') ?? 'all'
  const sort = searchParams.get('sort') ?? 'name'

  return (
    <div>
      <p>Catégorie : {category}</p>
      <button onClick={() => setSearchParams({ category, sort: 'price' })}>
        Trier par prix
      </button>
    </div>
  )
}
```

## Comparaison Vue Router / Angular Router

| Concept | React Router v6 | Vue Router | Angular Router |
|---|---|---|---|
| Outlet | `<Outlet />` | `<RouterView />` | `<router-outlet>` |
| Lien | `<Link to>` | `<RouterLink to>` | `routerLink` |
| Lien actif | `<NavLink>` (classe `active`) | `<RouterLink>` (classe `router-link-active`) | `routerLinkActive` |
| Navigation programmatique | `useNavigate()` | `useRouter().push()` | `Router.navigate()` |
| Paramètre | `useParams()` | `useRoute().params` | `ActivatedRoute.params` |
| Query string | `useSearchParams()` | `useRoute().query` | `ActivatedRoute.queryParams` |

> **À retenir —** `createBrowserRouter` déclare les routes en tableau. `<Outlet>` affiche
> la route enfant active. `useParams` pour les segments dynamiques, `useSearchParams` pour
> la query string, `useNavigate` pour la navigation programmatique.
