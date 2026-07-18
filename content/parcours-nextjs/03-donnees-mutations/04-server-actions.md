---
title: "Server Actions : muter les données sans écrire d'endpoint"
type: lesson
---

## Une mutation, sans Route Handler ni `fetch` manuel

Pour une mutation déclenchée **depuis l'app elle-même** (un formulaire, un clic de bouton) — pas par un client externe — Next.js propose une alternative aux Route Handlers : les **Server Actions**. C'est une fonction `async` marquée `"use server"`, appelable **directement** depuis un composant, sans écrire de route ni de `fetch` côté client : Next génère l'appel réseau sous le capot.

```ts
// app/actions.ts — a dedicated file, "use server" applies to every export
"use server"

import { revalidatePath } from "next/cache"

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string

  await fetch("https://api.example.com/products", {
    method: "POST",
    body: JSON.stringify({ name }),
  })

  // Invalidate the cached product list so the UI reflects the new product
  revalidatePath("/products")
}
```

```tsx
// app/products/new-product-form.tsx
import { createProduct } from "../actions"

// No "use client" needed here: a <form action={...}> can call a Server
// Action directly from a Server Component, with zero client-side JS.
export default function NewProductForm() {
  return (
    <form action={createProduct}>
      <input name="name" placeholder="Product name" />
      <button type="submit">Create</button>
    </form>
  )
}
```

> **Symfony → Next.js.** Une Server Action ressemble à une méthode de contrôleur Symfony qui traite un `Request` de formulaire POST — sauf que tu **n'écris ni route, ni sérialisation JSON, ni appel `fetch` côté client** : Next s'occupe de tout le câblage réseau. C'est un contrôleur de formulaire, débarrassé de sa tuyauterie HTTP.

## Server Action vs Route Handler : lequel choisir ?

| | Server Action (`"use server"`) | Route Handler (`route.ts`) |
|---|---|---|
| Appelant | Un composant/formulaire **de la même app** | N'importe quel client HTTP, y compris externe |
| Écriture d'un endpoint | Non — Next génère l'appel | Oui — un vrai chemin d'URL |
| Cas d'usage typique | Soumettre un formulaire, une mutation depuis l'UI | API publique, webhook, app mobile |

> ⚠️ **Erreur fréquente — croire qu'une Server Action est publique comme une route.** Une Server Action reste, sous le capot, un endpoint HTTP interne — mais elle n'est **pas pensée** pour être appelée par un client externe (pas de documentation d'API, pas de contrat stable garanti entre versions). Pour un vrai contrat d'API, utilise un Route Handler.

## Depuis un Client Component aussi

Une Server Action n'est pas réservée aux formulaires natifs : elle peut être appelée depuis un gestionnaire d'événement d'un Client Component (par exemple pour ajouter un état de chargement pendant la mutation).

```tsx
"use client"

import { useState } from "react"
import { createProduct } from "../actions"

export default function QuickAddButton() {
  const [pending, setPending] = useState(false)

  async function handleClick() {
    setPending(true)
    const formData = new FormData()
    formData.set("name", "New product")
    await createProduct(formData)
    setPending(false)
  }

  return (
    <button onClick={handleClick} disabled={pending}>
      {pending ? "Adding..." : "Quick add"}
    </button>
  )
}
```

## À retenir

- Une Server Action (`"use server"`) est une fonction serveur **appelable directement** depuis un composant ou un `<form action={...}>` — sans écrire de route ni de `fetch` manuel.
- Elle sert aux **mutations internes** à l'app (formulaires, clics) ; un Route Handler reste nécessaire pour une **API publique**, consommée par un client externe.
- Après une mutation, `revalidatePath`/`revalidateTag` invalide le cache pour que l'UI reflète immédiatement le nouvel état.
