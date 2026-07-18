---
title: "React Server Components : le nouveau défaut"
type: lesson
---

## Un composant qui s'exécute... sur le serveur

Dans `app/`, **chaque composant est, par défaut, un Server Component**. Ce n'est pas une option Next.js : c'est une capacité de React 19 lui-même, que Next.js adopte comme comportement par défaut. Concrètement :

- Il s'exécute **uniquement sur le serveur**, jamais dans le navigateur.
- Son code (et ses dépendances) ne sont **jamais envoyés** dans le bundle JS du client — ça réduit le poids téléchargé.
- Il peut être **`async`** et faire `await fetch(...)` ou parler directement à une base de données, **sans API intermédiaire**.

```tsx
// app/blog/[slug]/page.tsx — a Server Component: runs ONLY on the server
// It can be async and fetch data directly, no client-side loading state needed.
async function getPost(slug: string) {
  const res = await fetch(`https://api.example.com/posts/${slug}`)
  return res.json()
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </article>
  )
}
```

> **Symfony → Next.js.** Un Server Component ressemble à un **contrôleur Symfony qui appelle un repository, puis rend directement un template Twig** — sauf que le contrôleur, le repository et le template sont fusionnés dans **un seul fichier** : le composant React lui-même est le code serveur.

## Ce qu'un Server Component ne peut PAS faire

Un Server Component n'a **aucune existence dans le navigateur** : il n'a donc accès à rien qui suppose une interaction ou une API du navigateur.

```tsx
// ❌ This will NOT work in a Server Component (no "use client")
export default function Counter() {
  const [count, setCount] = useState(0) // ❌ useState needs a browser runtime

  return (
    <button onClick={() => setCount(count + 1)}> {/* ❌ no event handlers */}
      Count: {count}
    </button>
  )
}
```

- **Pas de hooks d'état/effet** : `useState`, `useEffect`, `useRef`...
- **Pas de gestionnaires d'événements** : `onClick`, `onChange`...
- **Pas d'API navigateur** : `window`, `localStorage`, `document`...

Pour tout ça, il faut un **Client Component** — la leçon suivante.

> 💡 **À retenir.** Pose-toi la question : « ce composant a-t-il besoin d'interactivité, d'état, ou d'une API navigateur ? » Si non → laisse-le en Server Component (le défaut). Si oui → il faudra `"use client"` sur lui, ou sur la petite partie interactive qu'il contient.

## Pourquoi c'est un progrès, pas juste une contrainte

- **Bundle JS plus léger** : la logique de rendu, le formatage de données, le markup statique — tout ça reste côté serveur, zéro octet envoyé au client.
- **Accès direct et sûr aux ressources serveur** : base de données, variables d'environnement secrètes, système de fichiers — sans jamais risquer de les exposer dans le JS du navigateur (contrairement à un `fetch` fait depuis un Client Component, où toute clé utilisée serait visible dans les DevTools).
- **Pas de aller-retour "chargement" superflu** : la donnée est déjà là au premier rendu HTML — pas de `isLoading` à gérer pour l'affichage initial.

## À retenir

- Dans `app/`, tout composant est un **Server Component par défaut** : rendu uniquement sur le serveur, jamais envoyé comme JS au client.
- Il peut être `async` et faire du data fetching **directement** dans son corps — pas de `useEffect`, pas d'état de chargement pour l'affichage initial.
- Il **ne peut pas** utiliser `useState`, `useEffect`, ni des gestionnaires d'événements (`onClick`...) — ça, c'est le rôle des Client Components.
- Avantage clé : accès direct et sûr aux ressources serveur (DB, secrets), sans jamais les exposer au navigateur.
