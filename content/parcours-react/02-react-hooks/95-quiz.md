---
title: "Quiz — les hooks React"
type: quiz
questions:
  - prompt: |
      Quel est le résultat de ce code au premier rendu ?
      ```tsx
      useEffect(() => {
        console.log('effect')
      }, [])
      ```
    options:
      - "« effect » est affiché avant le rendu"
      - "« effect » est affiché une seule fois après le rendu initial"
      - "« effect » est affiché après chaque rendu"
      - "Erreur : le tableau de dépendances ne peut pas être vide"
    answer: 1
    tags: [useEffect]
    level: debutant
    explanation: |
      `useEffect(fn, [])` s'exécute **après** le rendu initial, une seule fois — l'équivalent de `onMounted` en Vue. Le tableau vide `[]` signifie « pas de dépendance : ne jamais relancer ». Sans tableau, l'effet se relancerait après **chaque** rendu.
  - prompt: |
      Quelle est la règle absolue sur **l'endroit** où on appelle un hook ?
    options:
      - "Un hook peut être appelé n'importe où dans le composant"
      - "Un hook doit être appelé au niveau supérieur — jamais dans un `if`, une boucle, ou une fonction imbriquée"
      - "Un hook ne peut être appelé que dans `useEffect`"
      - "Un hook doit être appelé avant tout `return`"
    answer: 1
    tags: [hooks, regles]
    level: debutant
    explanation: |
      React s'appuie sur l'**ordre d'appel** des hooks pour faire correspondre chaque hook à son état interne. Si on appelle un hook dans un `if`, cet ordre peut changer d'un rendu à l'autre — React perd le fil et produit des bugs imprévisibles. La règle est : hooks toujours au niveau supérieur.
  - prompt: |
      Quelle est la différence entre `useMemo` et `useCallback` ?
    options:
      - "`useMemo` mémoïse une valeur ; `useCallback` mémoïse une référence de fonction"
      - "`useMemo` est pour les effets ; `useCallback` est pour l'état"
      - "`useCallback` remplace `useMemo` dans React 19"
      - "Ils sont identiques"
    answer: 0
    tags: [useMemo, useCallback]
    level: intermediaire
    explanation: |
      `useMemo(() => val, [deps])` mémoïse le **résultat** d'un calcul — l'équivalent de `computed` Vue. `useCallback(fn, [deps])` mémoïse la **référence** d'une fonction pour qu'elle reste stable entre les rendus. `useCallback(fn, deps)` est en réalité `useMemo(() => fn, deps)` — juste plus lisible pour les fonctions.
  - prompt: |
      Quand une modification de `ref.current` **ne déclenche-t-elle pas** de re-rendu ?
    options:
      - "Jamais — toute modification déclenche un re-rendu"
      - "Toujours — `useRef` ne déclenche jamais de re-rendu"
      - "Seulement si la ref est attachée à un élément DOM"
      - "Seulement si on passe par le setter `ref.set()`"
    answer: 1
    tags: [useRef]
    level: intermediaire
    explanation: |
      C'est la propriété centrale de `useRef` : modifier `ref.current` **directement** ne déclenche jamais de re-rendu. C'est justement pour ça qu'on l'utilise pour stocker des valeurs qui n'ont pas besoin d'être affichées (IDs de timers, valeurs précédentes, drapeaux).
  - prompt: |
      Dans un `useEffect` qui fait un `fetch`, pourquoi retourne-t-on une fonction cleanup avec une variable `cancelled` ?
    options:
      - "Pour annuler la requête réseau"
      - "Pour éviter d'appeler le setter d'état après que le composant est démonté (race condition)"
      - "Pour réinitialiser les dépendances"
      - "Pour que TypeScript soit satisfait"
    answer: 1
    tags: [useEffect, fetch]
    level: avance
    explanation: |
      Si le composant est démonté avant la fin du fetch, appeler le setter provoquerait une mise à jour d'état sur un composant inexistant — erreur et fuite mémoire. La variable `cancelled = true` dans le cleanup permet à la callback du fetch de vérifier si elle doit encore agir. En React 19, Suspense + `use()` simplifient ce pattern, mais la compréhension des race conditions reste essentielle.
---

Cinq questions sur les hooks essentiels : `useEffect`, règles des hooks, `useMemo`,
`useRef` et cleanup.
