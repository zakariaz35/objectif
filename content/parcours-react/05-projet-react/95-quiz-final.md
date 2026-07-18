---
title: "Quiz final — React 19"
type: quiz
questions:
  - prompt: |
      Quelle est la différence fondamentale entre les **hooks** React et les **composables** Vue 3 ?
    options:
      - "Les hooks React ne peuvent gérer que des primitifs (number, string) ; les composables gèrent les objets"
      - "Conceptuellement ils sont identiques : fonctions `useXxx` qui encapsulent de la logique réactive réutilisable"
      - "Les hooks React sont globaux ; les composables Vue sont locaux"
      - "Les composables Vue ont besoin d'un store ; les hooks React non"
    answer: 1
    tags: [hooks, comparaison]
    level: intermediaire
    explanation: |
      Les hooks React et les composables Vue 3 partagent la même philosophie : une fonction `useXxx` qui encapsule de la logique avec état, retourne des valeurs réactives et des fonctions, et **partage la logique (pas l'état)**. La différence principale est mécanique : React exige de déclarer explicitement les dépendances (`useEffect`, `useMemo`) ; Vue les traque automatiquement.
  - prompt: |
      Dans React, comment partage-t-on un état entre des composants **sans lien parent/enfant direct** ?
    options:
      - "On passe les props à travers tous les intermédiaires (prop-drilling)"
      - "On utilise Context ou un store (Zustand)"
      - "On utilise `useRef` partagé"
      - "On ne peut pas — React ne supporte pas l'état partagé"
    answer: 1
    tags: [context, state-management]
    level: debutant
    explanation: |
      Le prop-drilling devient vite ingérable. `useContext` + un `Provider` fournit un canal de communication direct entre un composant fournisseur et n'importe quel descendant — sans intermédiaires. Pour un état plus fréquemment mis à jour ou partagé entre des branches différentes, un store comme Zustand est plus adapté (l'équivalent de Pinia).
  - prompt: |
      En React 19, quel attribut JSX place-t-on sur un élément DOM pour y attacher une `ref` ?
    options:
      - "`ref={maRef}`"
      - "`v-ref:maRef`"
      - "`#maRef`"
      - "`[ref]=\"maRef\"`"
    answer: 0
    tags: [useRef, jsx]
    level: debutant
    explanation: |
      `ref={maRef}` est la syntaxe JSX standard. Après le montage, `maRef.current` pointe vers le nœud DOM. En Vue 3 c'est `ref="maRef"` (string dans le template), en Angular c'est `#maRef` (variable de template).
  - prompt: |
      Un composant `ProductCard` reçoit une prop `onFavorite` (une fonction). Sans `useCallback`, que se passe-t-il si le parent se re-rend ?
    options:
      - "Rien — React sait que la fonction est la même"
      - "Une nouvelle référence de fonction est créée → `React.memo` sur `ProductCard` ne peut pas optimiser le re-rendu"
      - "La fonction est supprimée"
      - "Une erreur TypeScript"
    answer: 1
    tags: [useCallback, performance]
    level: avance
    explanation: |
      À chaque rendu du parent, une nouvelle fonction est créée en mémoire — nouvelle référence. Si `ProductCard` est enveloppé dans `React.memo`, il compare les props par référence : la nouvelle référence de `onFavorite` force un re-rendu même si la logique n'a pas changé. `useCallback` stabilise la référence entre les rendus.
  - prompt: |
      Quelle commande Vite crée un projet React 19 + TypeScript ?
    options:
      - "`npx create-react-app mon-app --template typescript`"
      - "`npm create vite@latest mon-app -- --template react-ts`"
      - "`ng new mon-app`"
      - "`npm init react mon-app`"
    answer: 1
    tags: [vite, setup]
    level: debutant
    explanation: |
      `npm create vite@latest mon-app -- --template react-ts` est la commande officielle pour créer un projet React + TypeScript avec Vite. `create-react-app` est déprécié (lent, plus maintenu). `ng new` est Angular. Vite démarre en millisecondes grâce aux modules ES natifs.
  - prompt: |
      Dans React Router v6, comment rediriger vers `/dashboard` après une action (login réussi) ?
    options:
      - "`window.location.href = '/dashboard'`"
      - "`const navigate = useNavigate(); navigate('/dashboard')`"
      - "`<Redirect to='/dashboard' />`"
      - "`router.push('/dashboard')`"
    answer: 1
    tags: [routing]
    level: debutant
    explanation: |
      `useNavigate()` retourne une fonction de navigation impérative. `window.location.href` provoque un rechargement de page complet (pas une navigation SPA). `<Redirect>` vient de React Router v5. `router.push` est Vue Router.
---

Quiz de synthèse : hooks, Context, JSX, performance, Vite et React Router.
