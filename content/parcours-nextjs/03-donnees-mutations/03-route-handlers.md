---
title: "Route Handlers : exposer une vraie API depuis app/api/"
type: lesson
---

## Quand un Server Component ne suffit pas

Un Server Component peut lire des données directement (module précédent) — mais **seulement pour alimenter une page Next.js elle-même**. Dès qu'un client **externe** doit appeler ton application (une app mobile, un webhook Stripe, un autre service), il faut un vrai **endpoint HTTP** : un **Route Handler**.

Un Route Handler est un fichier `route.ts` (jamais `page.tsx` au même niveau — un segment est soit une page, soit une route d'API, pas les deux), qui exporte une fonction `async` par méthode HTTP.

```ts
// app/api/products/route.ts
import { NextResponse } from "next/server"

// In-memory placeholder — a real app would query a database here.
const products = [{ id: "1", name: "Keyboard" }]

export async function GET() {
  return NextResponse.json(products)
}

export async function POST(request: Request) {
  const body = await request.json()
  const product = { id: String(products.length + 1), name: body.name }
  products.push(product)
  return NextResponse.json(product, { status: 201 })
}
```

> **Symfony → Next.js.** Un Route Handler est l'équivalent direct d'une méthode de contrôleur Symfony annotée `#[Route('/api/products', methods: ['GET'])]` — ou, plus proche encore, d'un `@Get()`/`@Post()` NestJS : un fichier = un chemin, une fonction exportée = une méthode HTTP. C'est **le seul endroit** de Next.js qui se comporte comme un backend pur, sans rien rendre.

## Lire les paramètres de la requête

```ts
// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // ?category=electronics
  const category = request.nextUrl.searchParams.get("category")

  const filtered = category
    ? products.filter((p) => p.category === category)
    : products

  return NextResponse.json(filtered)
}
```

`NextRequest`/`NextResponse` sont des extensions pratiques (parsing des query params, cookies, redirections) au-dessus des objets Web standards `Request`/`Response` — que tu peux aussi utiliser directement si tu préfères rester sur les APIs natives.

## Le cache s'applique aussi aux Route Handlers

Le même changement Next.js 15 vu à la leçon précédente s'applique ici : un `GET` de Route Handler n'est **pas caché par défaut** — chaque appel réexécute la fonction. Si tu veux qu'un endpoint `GET` soit mis en cache, il faut le déclarer explicitement (`export const revalidate = 60`, par exemple).

> ⚠️ **Erreur fréquente — Route Handler pour tout, y compris le data fetching interne.** Si la donnée n'est destinée qu'à **une page de ton app**, écrire un Route Handler que ton propre Server Component appelle ensuite en `fetch("/api/...")` est un aller-retour réseau **inutile** : le Server Component peut lire la source de données (base, service) directement. Réserve les Route Handlers aux consommateurs **externes** à ton application Next.js.

## À retenir

- Un Route Handler (`app/api/.../route.ts`) exporte des fonctions `GET`/`POST`/... : c'est un **vrai endpoint HTTP**, comparable à un contrôleur Symfony ou NestJS.
- Réserve-les aux clients **externes** (mobile, webhook, autre service) — pas au data fetching interne d'une page Next, qui peut lire les données directement dans son Server Component.
- Le changement de cache Next.js 15 (leçon précédente) s'applique aussi aux `GET` : pas de cache par défaut, opt-in explicite si besoin.
