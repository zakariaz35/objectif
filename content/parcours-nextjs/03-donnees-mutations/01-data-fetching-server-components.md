---
title: "Data fetching dans les Server Components"
type: lesson
---

## La fin du duo `useEffect` + état de chargement (pour le rendu initial)

En React nu, récupérer des données au montage d'un composant impose un patron bien connu :

```tsx
// A plain React (Client Component) pattern — still valid, but NOT for initial data
"use client"
import { useEffect, useState } from "react"

function ProductList() {
  const [products, setProducts] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data)
        setLoading(false)
      })
  }, [])

  if (loading) return <p>Loading...</p>
  return <ul>{products.map(/* ... */)}</ul>
}
```

Dans un Server Component, ce patron **disparaît pour le chargement initial** : le composant est `async`, fait `await fetch(...)` directement dans son corps, et le HTML envoyé au navigateur contient **déjà** les données — aucun état `loading` à gérer pour ce premier affichage.

```tsx
// app/products/page.tsx — Server Component: fetch directly, no loading state needed
async function getProducts() {
  const res = await fetch("https://api.example.com/products")
  if (!res.ok) throw new Error("Failed to fetch products")
  return res.json()
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <ul>
      {products.map((product: { id: string; name: string }) => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  )
}
```

> **Symfony → Next.js.** C'est le même geste qu'une action de contrôleur Symfony qui appelle `$this->repository->findAll()` **avant** de rendre le template Twig avec les données déjà résolues — jamais de "chargement" côté template, les données sont là quand le rendu commence.

## `useEffect` + `fetch` reste utile — mais pour autre chose

Le duo `useEffect`/`fetch` (vu au parcours React) n'est **pas obsolète** : il redevient pertinent pour du data fetching **déclenché par une interaction côté client** (une recherche en temps réel, un scroll infini, un polling) — des cas où, par nature, il n'y a rien à pré-rendre côté serveur puisque la donnée dépend d'une action de l'utilisateur *après* le chargement de la page.

> ⚠️ **Erreur fréquente — fetcher depuis un `useEffect` alors qu'un Server Component suffirait.** Si la donnée est connue **avant** que la page ne s'affiche (le contenu initial d'une liste, d'une fiche produit...), fetch-la dans le Server Component. Réserve `useEffect` + `fetch` aux données qui dépendent réellement d'une interaction survenue *après* le premier rendu.

## Gérer les erreurs et le typage

`fetch` ne rejette **pas** automatiquement sur un statut HTTP d'erreur (404, 500) — il faut vérifier `res.ok` explicitement, exactement comme côté client.

```tsx
async function getProduct(id: string) {
  const res = await fetch(`https://api.example.com/products/${id}`)

  if (res.status === 404) {
    return null // let the page decide how to render a "not found" state
  }
  if (!res.ok) {
    throw new Error(`Unexpected status: ${res.status}`)
  }

  return res.json() as Promise<{ id: string; name: string; price: number }>
}
```

Une exception non attrapée dans un Server Component est capturée automatiquement par le fichier spécial `error.tsx` du segment (mentionné au module 1) — pas besoin de `try`/`catch` manuel partout.

## À retenir

- Un Server Component `async` fait `await fetch(...)` (ou une requête DB) **directement dans son corps** : la donnée est déjà présente au premier rendu HTML.
- `useEffect` + `fetch` reste pertinent, mais **seulement** pour des données déclenchées par une interaction côté client — pas pour le contenu initial d'une page.
- `fetch` ne lève pas d'exception sur une erreur HTTP : vérifie `res.ok`/`res.status` toi-même.
