---
title: 'Client Components : la directive "use client"'
type: lesson
---

## Passer un composant côté client : `"use client"`

Dès qu'un composant a besoin d'état, d'événements ou d'une API navigateur, il faut le marquer explicitement avec la directive `"use client"`, **en toute première ligne du fichier**, avant même les imports.

```tsx
// app/components/counter.tsx
"use client" // MUST be the very first line, before any import

import { useState } from "react"

export default function Counter() {
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  )
}
```

`"use client"` marque une **frontière** : ce module — et tout ce qu'il importe qui n'a pas déjà sa propre frontière — devient du code exécutable dans le navigateur, avec accès à `useState`, `useEffect`, aux événements, à `window`, etc.

> ⚠️ **Erreur fréquente — croire qu'un Client Component ne s'exécute jamais sur le serveur.** `"use client"` ne veut **pas** dire « ce composant tourne uniquement dans le navigateur » : Next.js le **rend aussi côté serveur** pour produire le HTML initial (comme un Server Component), **puis** l'hydrate côté client pour activer l'interactivité. « Client Component » signifie « peut s'exécuter dans le navigateur », pas « s'exécute exclusivement dans le navigateur ».

## Ce qu'un Client Component ne peut pas faire

Un Client Component finit par voir son code envoyé au navigateur : il n'a donc **jamais** accès direct à ce qui est censé rester secret côté serveur.

```tsx
"use client"

// ❌ NEVER do this: the API key would end up in the browser's JS bundle,
// visible to anyone in the DevTools network tab or the bundle source.
async function fetchSecretData() {
  const res = await fetch("https://api.example.com/data", {
    headers: { Authorization: `Bearer ${process.env.SECRET_API_KEY}` },
  })
  return res.json()
}
```

- **Pas d'accès direct à une base de données** ni à un secret d'environnement : ce code serait littéralement lisible dans le bundle JS téléchargé.
- Un Client Component doit **recevoir ses données depuis un Server Component parent** (en props), ou les récupérer via un endpoint public (Route Handler, module 3) qui, lui, garde les secrets côté serveur.

## Composer les deux : Server Component qui contient un Client Component

Le bon réflexe n'est **pas** de marquer toute une page `"use client"` — seulement la **petite partie** qui a réellement besoin d'interactivité, pour garder le reste (souvent l'essentiel) en Server Component.

```tsx
// app/product/[id]/page.tsx — Server Component (the DEFAULT, no directive needed)
import AddToCartButton from "./add-to-cart-button"

async function getProduct(id: string) {
  const res = await fetch(`https://api.example.com/products/${id}`)
  return res.json()
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProduct(id) // data fetching stays server-side

  return (
    <section>
      <h1>{product.name}</h1>
      <p>{product.price} €</p>
      {/* Only this small piece needs interactivity */}
      <AddToCartButton productId={product.id} />
    </section>
  )
}
```

```tsx
// app/product/[id]/add-to-cart-button.tsx
"use client"

import { useState } from "react"

export default function AddToCartButton({ productId }: { productId: string }) {
  const [added, setAdded] = useState(false)

  return (
    <button onClick={() => setAdded(true)}>
      {added ? "Added!" : "Add to cart"}
    </button>
  )
}
```

> **Réflexe à prendre.** Pousse la frontière `"use client"` **le plus bas possible** dans l'arbre de composants : la page reste un Server Component (data fetching direct, bundle léger), seul le bouton devient client. C'est l'inverse du réflexe React nu, où *tout* est déjà client par défaut.

## Récapitulatif : qui peut quoi

| | Server Component (défaut) | Client Component (`"use client"`) |
|---|---|---|
| `async`/`await` + `fetch` direct | ✅ | ❌ (pas dans le corps du composant) |
| Accès direct DB / secrets | ✅ | ❌ jamais |
| `useState`, `useEffect` | ❌ | ✅ |
| `onClick`, `onChange`... | ❌ | ✅ |
| Rendu HTML initial sur le serveur | ✅ | ✅ (puis hydraté) |
| Envoyé dans le bundle JS client | ❌ jamais | ✅ |

## À retenir

- `"use client"` en première ligne marque une frontière : ce module devient exécutable dans le navigateur (état, événements, hooks).
- Un Client Component est **quand même rendu côté serveur** pour le premier HTML, puis **hydraté** — ce n'est pas « client only ».
- Jamais de DB/secrets directement dans un Client Component : ces données doivent venir d'un Server Component parent (en props) ou d'un endpoint public.
- Bon réflexe : garde le maximum de l'arbre en Server Component, et pousse `"use client"` le plus bas possible, sur la plus petite partie interactive.
