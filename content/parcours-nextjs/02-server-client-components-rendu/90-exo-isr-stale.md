---
title: "Exercice — détecter du contenu ISR périmé (TS)"
type: exercise
exercise:
  language: ts
  starter: |
    // Decides whether ISR (Incremental Static Regeneration) content is "stale"
    // and should be regenerated on the next request.
    //
    // - fetchedAt: timestamp (ms since epoch) when the page was last generated
    // - revalidateSeconds: the ISR revalidation window, e.g. next: { revalidate: 60 }
    // - now: current timestamp (ms since epoch) — passed in for testability
    function isStale(fetchedAt: number, revalidateSeconds: number, now: number): boolean {
      // TODO: return true once `revalidateSeconds` (converted to ms) have
      // elapsed between fetchedAt and now.
      return false
    }
  tests:
    - name: "contenu encore frais"
      code: |
        const fetchedAt = 1_000
        const now = fetchedAt + 30_000 // 30s later
        const result = isStale(fetchedAt, 60, now)
        console.log('age (ms) :', now - fetchedAt, '-> stale ?', result)
        assertEqual(result, false, '30s < 60s window: not stale yet')
    - name: "exactement à la limite de la fenêtre"
      code: |
        const fetchedAt = 1_000
        const now = fetchedAt + 60_000 // exactly 60s later
        assertEqual(isStale(fetchedAt, 60, now), true, '60s = 60s window: already stale')
    - name: "largement périmé"
      code: |
        const fetchedAt = 0
        const now = 120_000 // 120s later
        assertEqual(isStale(fetchedAt, 60, now), true, '120s > 60s: stale')
    - name: "revalidate = 0 : toujours considéré périmé"
      code: |
        const fetchedAt = 5_000
        const now = 5_000 // no time elapsed at all
        assertEqual(isStale(fetchedAt, 0, now), true, 'zero window -> always stale')
---

## Énoncé

> **Durée conseillée : ~10 min.** Cet exercice isole, en TypeScript pur, la
> logique de décision derrière l'ISR (module 2, leçon 3) — pas de runtime
> Next.js ici, juste la règle de calcul.

Une page ISR est régénérée par Next.js quand la fenêtre `revalidate` (en
secondes) est dépassée depuis le dernier rendu. Implémente `isStale` :

- Elle reçoit `fetchedAt` (l'instant du dernier rendu, en millisecondes),
  `revalidateSeconds` (la fenêtre de revalidation, en secondes) et `now`
  (l'instant courant, en millisecondes).
- Elle renvoie `true` si **au moins** `revalidateSeconds` secondes se sont
  écoulées entre `fetchedAt` et `now` (borne incluse).

<!--correction-->

## Correction

```ts
function isStale(fetchedAt: number, revalidateSeconds: number, now: number): boolean {
  const ageMs = now - fetchedAt
  const windowMs = revalidateSeconds * 1000
  return ageMs >= windowMs
}
```

- `ageMs` : combien de temps s'est écoulé depuis le dernier rendu.
- `windowMs` : la fenêtre de revalidation convertie en millisecondes (les
  timestamps JS sont en `ms`, `revalidateSeconds` est en secondes — attention
  à l'unité, piège classique).
- `>=` (et non `>`) : dès que la fenêtre est **atteinte**, le contenu est
  considéré périmé — c'est ce que Next.js applique réellement en interne
  avec `next: { revalidate: N }`.

Dans un vrai Server Component, ce calcul reste **implicite** : c'est Next.js
qui le fait pour toi dès que tu écris `fetch(url, { next: { revalidate: 60 } })`
— l'intérêt de cet exercice est de comprendre *ce qui se passe derrière*.
