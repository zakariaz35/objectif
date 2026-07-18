---
title: "Démarrer avec Vite"
type: lesson
---

# Démarrer avec Vite

React 19 s'installe en une ligne avec **Vite** — le bundler de référence pour tout le
front moderne (Vue, Angular, React). Vite démarre en millisecondes grâce aux modules ES
natifs et au HMR instantané.

## Créer un projet React + TypeScript

```bash
npm create vite@latest mon-app -- --template react-ts
cd mon-app
npm install
npm run dev
```

La structure générée :

```
mon-app/
├─ src/
│  ├─ App.tsx          ← composant racine
│  ├─ main.tsx         ← entry point (createRoot from react-dom/client)
│  └─ index.css
├─ index.html
├─ vite.config.ts
└─ tsconfig.json
```

## Point d'entrée

```tsx
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- `createRoot` est l'API React 18+ ; plus d'`ReactDOM.render` (déprécié).
- `StrictMode` détecte les effets de bord involontaires en développement.
- L'extension `.tsx` (au lieu de `.jsx`) active la vérification TypeScript sur le JSX.

## Comparaison avec les autres frameworks

| | React + Vite | Vue + Vite | Angular CLI |
|---|---|---|---|
| Commande | `npm create vite@latest` | `npm create vite@latest` | `ng new` |
| Extension | `.tsx` / `.jsx` | `.vue` | `.ts` + `.html` |
| Template | JSX inline | SFC (`<template>`) | fichier `.html` séparé |

> **À retenir —** `npm create vite@latest mon-app -- --template react-ts` crée un projet
> React 19 + TypeScript prêt à l'emploi. Le fichier `main.tsx` monte l'arbre de composants
> dans le DOM via `createRoot`. Utilise toujours `.tsx` pour les fichiers contenant du JSX.
