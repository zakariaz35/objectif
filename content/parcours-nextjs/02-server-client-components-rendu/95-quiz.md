---
title: "Quiz — Server & Client Components, rendu"
type: quiz
questions:
  - prompt: |
      Dans le dossier `app/`, quel type de composant est utilisé PAR DÉFAUT,
      sans directive particulière ?
    options:
      - "Un Client Component."
      - "Un Server Component."
      - "Cela dépend uniquement de la version de React installée."
    answer: 1
    tags: ["rsc", "app-router"]
    level: debutant
    explanation: |
      Tout composant placé dans `app/` est un Server Component par défaut :
      rendu côté serveur, jamais envoyé au navigateur, sauf s'il est marqué
      `"use client"` (ou importé par un module qui l'est).
  - prompt: |
      Que se passe-t-il si on essaie d'utiliser `useState` dans un composant
      qui n'a PAS la directive `"use client"` ?
    options:
      - |
        Cela fonctionne normalement, sans aucune différence.
      - |
        Une erreur : `useState` (comme les autres hooks d'état/effet et les
        gestionnaires d'événements) requiert un Client Component.
      - |
        La valeur reste toujours à `0`, silencieusement.
    answer: 1
    tags: ["rsc", "client-components", "use-client"]
    level: debutant
    explanation: |
      Un Server Component n'a aucune existence dans le navigateur : il ne
      peut pas gérer d'état interactif. `useState`, `useEffect`, `onClick`...
      nécessitent la directive `"use client"`.
  - prompt: |
      La directive `"use client"` signifie que le composant...
    options:
      - |
        ...ne s'exécute JAMAIS côté serveur, uniquement dans le navigateur.
      - |
        ...est rendu côté serveur pour le premier HTML, PUIS hydraté dans
        le navigateur pour devenir interactif.
      - |
        ...est automatiquement mis en cache indéfiniment.
    answer: 1
    tags: ["client-components", "hydratation"]
    level: intermediaire
    explanation: |
      "use client" ne veut pas dire "client-only" : Next.js rend aussi ces
      composants côté serveur pour produire le HTML initial, puis les
      hydrate dans le navigateur. C'est une erreur fréquente de croire
      qu'ils échappent totalement au rendu serveur.
  - prompt: |
      Pourquoi un Client Component ne doit-il JAMAIS accéder directement à
      une base de données ou lire une clé secrète d'environnement ?
    options:
      - |
        Parce que ce code finit dans le bundle JS envoyé au navigateur : la
        clé/le secret y serait lisible par n'importe qui.
      - |
        Parce que TypeScript l'interdit techniquement à la compilation.
      - |
        Ce n'est pas un problème : Next.js chiffre automatiquement le
        bundle client.
    answer: 0
    tags: ["client-components", "securite"]
    level: intermediaire
    explanation: |
      Tout le code d'un Client Component est bundlé et téléchargé par le
      navigateur : un secret y serait visible en clair dans les DevTools.
      Les données/secrets doivent rester dans un Server Component, transmis
      en props si besoin.
  - prompt: |
      Quelle stratégie de rendu convient le mieux à un dashboard personnel
      affichant les données de l'utilisateur connecté ?
    options:
      - "SSG (généré une fois au build)."
      - "SSR (rendu à chaque requête, ex. via `cache: 'no-store'`)."
      - "Aucune des deux : il faut obligatoirement un Client Component."
    answer: 1
    tags: ["ssr", "ssg", "isr", "strategie-rendu"]
    level: intermediaire
    explanation: |
      Des données par utilisateur/session doivent être fraîches à chaque
      requête : c'est le rôle du SSR. Le SSG figerait les données d'un seul
      build pour tout le monde — inadapté à un contenu personnalisé.
  - prompt: |
      Que permet d'obtenir l'ISR (`next: { revalidate: 60 }`) par rapport à
      un SSG classique (`force-cache` sans revalidation) ?
    options:
      - |
        Un contenu statique, rapide à servir, mais qui se régénère
        automatiquement après un délai — sans re-rendre à chaque requête.
      - |
        Un rendu strictement identique au SSR, à chaque requête.
      - |
        La suppression totale du cache : chaque requête refait le calcul.
    answer: 0
    tags: ["isr", "cache", "strategie-rendu"]
    level: avance
    explanation: |
      L'ISR garde les bénéfices du statique (rapidité, pas de calcul à
      chaque requête) tout en évitant que le contenu reste figé
      indéfiniment : une revalidation périodique le régénère en arrière-plan.
---

Six questions pour distinguer clairement Server Components et Client
Components, comprendre l'hydratation, et choisir entre SSR/SSG/ISR.
