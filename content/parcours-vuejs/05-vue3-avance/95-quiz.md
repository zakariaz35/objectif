---
title: "Quiz — Vue 3 avancé"
type: quiz
questions:
  - prompt: |
      Dans une route `{ path: '/invoices/:id', component: Invoice }`, comment le composant `Invoice` lit-il l'id de l'URL `/invoices/42` ?
    options:
      - |
        `useRouter().params.id`
      - |
        `useRoute().params.id`
      - |
        En recevant `id` comme une prop obligatoire du parent
    answer: 1
    explanation: |
      On **lit** la route courante avec **`useRoute()`** (`useRoute().params.id` vaut `'42'`). Attention à la paire : `useRoute()` pour **lire** (params, query…), `useRouter()` pour **agir** (`router.push(...)`). L'id vient de l'URL, pas d'un parent — c'est justement l'intérêt d'un paramètre de route `:id`.
  - prompt: |
      Le panier de l'appli est lu par le header, la page produit et la page paiement (composants **éloignés** dans l'arbre). Où mettre cet état ?
    options:
      - |
        Dans le composant racine, relayé en props à travers tous les intermédiaires
      - |
        Dans un **store Pinia** que chaque composant importe directement
      - |
        Dans une variable JS globale hors de Vue
    answer: 1
    explanation: |
      C'est le cas d'école du **store Pinia** : un état **transverse**, partagé par des composants éloignés. Le relayer en props à travers dix intermédiaires qui ne s'en servent pas, c'est du *prop-drilling* — lourd et fragile. Une variable globale hors de Vue, elle, ne serait pas **réactive**. Le store offre une source de vérité unique **et** réactive.
  - prompt: |
      Un composant charge des utilisateurs via `fetch`. Quels états doit-il gérer pour être robuste ?
    options:
      - |
        Uniquement les données : on affiche la liste quand elle arrive
      - |
        Les données **et** le chargement, mais l'erreur est inutile
      - |
        Les **trois** : chargement, erreur, données
    answer: 2
    explanation: |
      Une opération asynchrone est une **machine à états** : `pending → fulfilled | rejected`. Il faut donc gérer les **trois** cas — **loading** (l'attente, sinon écran vide qui semble cassé), **error** (le réseau ou le serveur peut échouer), **data** (le succès). Le trio `try / catch / finally` encode exactement ces transitions.
---

Trois questions sur l'architecture d'une vraie appli : lire un paramètre de route
(`useRoute`), choisir un store Pinia pour l'état transverse, et gérer les trois états d'un
chargement asynchrone.
