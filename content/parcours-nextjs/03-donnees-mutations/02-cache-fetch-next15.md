---
title: "Le cache en Next.js 15 : fetch n'est plus caché par défaut"
type: lesson
---

## ⚠️ Le changement le plus important à connaître (et le plus piégeux)

Si tu lis un tutoriel ou un article écrit avant 2026 (Next.js 13/14), tu tomberas presque certainement sur cette affirmation : *« par défaut, `fetch` est mis en cache indéfiniment dans l'App Router »*. C'était vrai — **et ce n'est plus le cas depuis Next.js 15.**

> ⚠️ **Erreur fréquente — appliquer les réflexes Next 14 à un projet Next 15.** En Next 13/14, un simple `fetch(url)` sans option était **caché indéfiniment** par défaut (il fallait ajouter `{ cache: "no-store" }` pour l'éviter). **Depuis Next.js 15, c'est l'inverse** : `fetch(url)` sans option n'est **plus caché du tout** — chaque requête refait l'appel. Si tu veux du cache, tu dois maintenant le demander **explicitement**.

## Les trois comportements, explicitement

```ts
// 1. DEFAULT since Next.js 15: no caching at all — always fresh, every request.
//    This is equivalent to what "no-store" meant in Next.js 14.
const freshData = await fetch("https://api.example.com/data")

// 2. Opt IN to indefinite caching (SSG-like behavior): fetched once, reused forever
//    until the next build (or an explicit `revalidateTag`/`revalidatePath` call).
const staticData = await fetch("https://api.example.com/data", {
  cache: "force-cache",
})

// 3. Opt IN to periodic revalidation (ISR-like behavior): cached, but refreshed
//    at most once every `revalidate` seconds.
const isrData = await fetch("https://api.example.com/data", {
  next: { revalidate: 60 },
})
```

| Option | Comportement | Stratégie qui en découle |
|---|---|---|
| *(aucune option)* | **Non caché** (Next.js 15+) : refetch à chaque requête | SSR |
| `cache: "force-cache"` | Caché indéfiniment (jusqu'au prochain build ou revalidation manuelle) | SSG |
| `next: { revalidate: N }` | Caché, régénéré au plus une fois toutes les `N` secondes | ISR |
| `cache: "no-store"` | Toujours équivalent au défaut Next.js 15 — encore accepté pour la clarté du code | SSR |

> 💡 **À retenir.** Le lien entre les leçons du module précédent et celle-ci : **SSR/SSG/ISR ne sont pas des modes à activer à part** — ce sont les *conséquences* des options passées à `fetch`. Pas d'option → SSR. `force-cache` → SSG. `revalidate` → ISR.

## Pourquoi ce changement ?

Le comportement « caché par défaut » de Next 14 provoquait un bug très fréquent : un développeur modifiait une API, redéployait, et voyait **les anciennes données** rester affichées — sans comprendre pourquoi, jusqu'à découvrir qu'il fallait explicitement désactiver le cache. Next.js 15 inverse la logique par défaut : **la fraîcheur des données est désormais le comportement sûr par défaut**, la mise en cache devient un choix conscient et explicite.

> **Symfony → Next.js.** C'est le même changement de philosophie que passer d'un cache HTTP activé « par surprise » (un reverse-proxy qui cache tout sans qu'on l'ait demandé) à un cache **opt-in**, où chaque route déclare explicitement sa politique de cache (comme un en-tête `Cache-Control` posé consciemment sur chaque route, plutôt qu'une configuration globale agressive).

## Révoquer un cache manuellement

Après une mutation (module suivant : Server Actions), on invalide le cache **explicitement**, plutôt que d'attendre la fin de la fenêtre de revalidation :

```ts
import { revalidatePath, revalidateTag } from "next/cache"

// Invalidate everything cached for a specific route
revalidatePath("/blog")

// Invalidate everything cached under a specific tag (finer-grained)
revalidateTag("posts")
```

## À retenir

- **Depuis Next.js 15, `fetch` n'est plus caché par défaut** : c'est un changement de comportement par rapport à Next 13/14 — la source de confusion n°1 pour qui a appris Next avant 2026.
- Cache indéfini (SSG) : `cache: "force-cache"`. Cache avec revalidation (ISR) : `next: { revalidate: N }`. Aucune option (ou `cache: "no-store"`) : toujours frais (SSR).
- `revalidatePath`/`revalidateTag` invalident un cache **à la demande**, typiquement juste après une mutation.
