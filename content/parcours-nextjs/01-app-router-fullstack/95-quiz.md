---
title: "Quiz — App Router & fullstack"
type: quiz
questions:
  - prompt: |
      Qu'est-ce que Next.js ajoute concrètement par rapport à React seul
      (Vite/CRA) ?
    options:
      - |
        Un nouveau langage à la place de JSX.
      - |
        Un routing par fichiers, un rendu côté serveur par défaut, et un
        backend intégré dans la même codebase (fullstack).
      - |
        Rien de plus : Next.js est juste un autre nom pour React.
    answer: 1
    tags: ["nextjs", "fullstack"]
    level: debutant
    explanation: |
      Next.js encadre React avec trois apports propres à Next : le routing
      déduit de l'arborescence de `app/`, le rendu serveur par défaut (RSC),
      et un backend (Route Handlers, Server Actions) dans la même codebase —
      React seul ne fournit aucun des trois.
  - prompt: |
      Quelle affirmation décrit le mieux la différence entre NestJS et
      Next.js ?
    options:
      - |
        NestJS est un backend pur (API JSON, comme une API Symfony) ;
        Next.js est fullstack : front React et backend vivent dans la même
        codebase.
      - |
        NestJS et Next.js sont deux frameworks concurrents qui font
        exactement la même chose.
      - |
        Next.js remplace NestJS : on ne peut plus faire d'API pure avec
        Next.js.
    answer: 0
    tags: ["nestjs", "nextjs", "architecture"]
    level: debutant
    explanation: |
      NestJS ne rend aucune UI : il répond en JSON, comme une API Symfony.
      Next.js couvre à la fois le rendu de vue (React) et le backend
      (Route Handlers, Server Actions) — ce sont deux catégories
      différentes, pas deux concurrents sur le même terrain.
  - prompt: |
      Dans l'App Router, quel fichier définit le contenu affiché pour
      l'URL `/blog` ?
    options:
      - "`app/blog/layout.tsx`"
      - "`app/blog/page.tsx`"
      - "`app/blog.tsx`"
    answer: 1
    tags: ["app-router", "routing"]
    level: debutant
    explanation: |
      `page.tsx` est le nom de fichier réservé pour le contenu d'un
      segment. `layout.tsx` définit une enveloppe partagée, pas le contenu
      de la page elle-même.
  - prompt: |
      Que se passe-t-il quand on navigue de `/blog` vers `/blog/mon-article`
      si les deux partagent un `layout.tsx` commun ?
    options:
      - |
        Le layout est entièrement re-rendu à chaque navigation, comme la
        page.
      - |
        Le layout partagé persiste : seule la nouvelle `page.tsx` est
        rendue.
      - |
        Rien ne change tant que la page n'est pas rechargée manuellement.
    answer: 1
    tags: ["app-router", "layout"]
    level: intermediaire
    explanation: |
      Un `layout.tsx` persiste entre les navigations à l'intérieur de son
      segment : seule la `page.tsx` correspondante change. C'est une
      optimisation automatique de l'App Router, sans équivalent direct dans
      un rendu Twig classique (qui régénère tout à chaque requête).
  - prompt: |
      Que capture un dossier nommé `[slug]` dans `app/blog/[slug]/page.tsx` ?
    options:
      - |
        Un segment dynamique de l'URL, comme `{slug}` dans une route
        Symfony — accessible via `params` dans le composant.
      - |
        Un tableau JavaScript littéral, sans lien avec l'URL.
      - |
        Un commentaire ignoré par Next.js.
    answer: 0
    tags: ["app-router", "routing", "dynamic-segments"]
    level: intermediaire
    explanation: |
      `[slug]` est un segment dynamique : visiter `/blog/mon-article`
      rend `app/blog/[slug]/page.tsx` avec `slug = "mon-article"`, reçu via
      la prop `params` (une `Promise` à `await` depuis Next.js 15).
  - prompt: |
      Pourquoi `getServerSideProps`/`getStaticProps` ne sont-ils PAS la
      méthode recommandée pour un nouveau projet Next.js en 2026 ?
    options:
      - |
        Parce qu'ils appartiennent au Pages Router (l'ancien système) ;
        l'App Router les remplace par un `async`/`await` direct dans les
        Server Components.
      - |
        Parce qu'ils ont été supprimés de Next.js et ne fonctionnent plus
        du tout, même en Pages Router.
      - |
        Parce qu'ils ne peuvent être utilisés qu'avec TypeScript.
    answer: 0
    tags: ["pages-router", "app-router", "historique"]
    level: avance
    explanation: |
      Ces fonctions sont toujours utilisables dans un projet Pages Router
      existant (elles n'ont pas été retirées de Next.js), mais l'App
      Router — le défaut moderne — les remplace par du data fetching direct
      (`await fetch(...)`) dans les Server Components.
---

Six questions pour ancrer le rôle fullstack de Next.js, la logique du
routing par fichiers de l'App Router, et le contraste avec le Pages Router.
