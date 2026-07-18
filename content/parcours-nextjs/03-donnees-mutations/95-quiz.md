---
title: "Quiz — Données & mutations"
type: quiz
questions:
  - prompt: |
      Depuis Next.js 15, un `fetch(url)` sans aucune option est-il mis en
      cache par défaut ?
    options:
      - |
        Oui, comme en Next.js 13/14 : il est caché indéfiniment sauf mention
        contraire.
      - |
        Non : depuis Next.js 15, `fetch` n'est plus caché par défaut —
        chaque requête refait l'appel, sauf opt-in explicite.
      - |
        Cela dépend uniquement de la version de Node.js installée.
    answer: 1
    tags: ["cache", "fetch", "next15"]
    level: intermediaire
    explanation: |
      C'est le changement de comportement le plus important de Next.js 15 :
      l'ancien défaut « caché indéfiniment » devient « jamais caché », sauf
      si on ajoute explicitement `cache: "force-cache"` ou
      `next: { revalidate: N }`.
  - prompt: |
      Quelle option de `fetch` reproduit un comportement de type SSG
      (rendu une fois, réutilisé indéfiniment) ?
    options:
      - "`cache: 'force-cache'`"
      - "`next: { revalidate: 0 }`"
      - "Aucune option (le défaut Next.js 15) suffit."
    answer: 0
    tags: ["cache", "ssg", "fetch"]
    level: intermediaire
    explanation: |
      `cache: "force-cache"` met le résultat en cache indéfiniment (jusqu'au
      prochain build ou une revalidation manuelle) : c'est l'équivalent
      "opt-in" du comportement SSG. Le défaut Next.js 15, lui, ne cache rien.
  - prompt: |
      À quoi sert principalement un Route Handler (`app/api/.../route.ts`) ?
    options:
      - |
        À faire le data fetching interne d'une page Next.js — c'est le seul
        moyen d'y accéder.
      - |
        À exposer un vrai endpoint HTTP, appelable par un client externe à
        l'application (mobile, webhook, autre service).
      - |
        À remplacer systématiquement tous les Server Components.
    answer: 1
    tags: ["route-handlers", "api"]
    level: debutant
    explanation: |
      Un Server Component peut lire des données directement, sans passer
      par un Route Handler. Les Route Handlers sont réservés aux vrais
      clients externes qui ont besoin d'un endpoint HTTP stable.
  - prompt: |
      Quel est l'équivalent Symfony/NestJS le plus proche d'un Route
      Handler Next.js ?
    options:
      - |
        Un contrôleur/action annoté par route (`#[Route]` Symfony, `@Get()`
        NestJS) : un fichier/une méthode par endpoint HTTP.
      - "Un composant Twig."
      - "Un middleware Express générique."
    answer: 0
    tags: ["route-handlers", "symfony", "nestjs"]
    level: intermediaire
    explanation: |
      Un Route Handler exporte une fonction par méthode HTTP (`GET`,
      `POST`...) associée à un chemin déduit du fichier — exactement le
      rôle d'une action de contrôleur Symfony ou NestJS.
  - prompt: |
      Qu'est-ce qui distingue le mieux une Server Action d'un Route
      Handler ?
    options:
      - |
        Une Server Action est appelée directement depuis un composant/
        formulaire de la même app, sans écrire de route ; un Route Handler
        est un vrai endpoint HTTP pour des clients externes.
      - |
        Il n'y a aucune différence : ce sont deux noms pour la même chose.
      - |
        Une Server Action ne peut jamais modifier de données, seulement les
        lire.
    answer: 0
    tags: ["server-actions", "route-handlers"]
    level: avance
    explanation: |
      La Server Action évite d'écrire un endpoint : Next génère l'appel
      réseau sous le capot pour une mutation interne à l'app (formulaire,
      clic). Le Route Handler reste nécessaire pour un contrat d'API public.
  - prompt: |
      Après qu'une Server Action a modifié des données, quelle fonction
      permet d'invalider explicitement le cache d'une page pour refléter le
      changement ?
    options:
      - "`useEffect(() => {}, [])`"
      - "`revalidatePath(path)` (ou `revalidateTag(tag)`)"
      - "`window.location.reload()`"
    answer: 1
    tags: ["cache", "server-actions", "revalidation"]
    level: avance
    explanation: |
      `revalidatePath`/`revalidateTag` (du module `next/cache`) invalident un
      cache à la demande, typiquement appelés juste après une mutation dans
      une Server Action — sans attendre la fin d'une fenêtre de
      revalidation naturelle.
---

Six questions sur le data fetching serveur, le changement de cache introduit
par Next.js 15, et le choix entre Route Handlers et Server Actions.
