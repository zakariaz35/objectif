---
title: "Quiz — React avancé"
type: quiz
questions:
  - prompt: |
      Quel hook utilises-tu pour éviter le **prop-drilling** (passer des props à travers de nombreux intermédiaires) ?
    options:
      - "`useRef`"
      - "`useContext`"
      - "`useReducer`"
      - "`useMemo`"
    answer: 1
    tags: [context]
    level: debutant
    explanation: |
      `useContext(MonContext)` permet à n'importe quel composant de lire une valeur fournie par un `Provider` ancêtre — sans que les composants intermédiaires aient à la transmettre. C'est l'équivalent de `inject()` en Vue 3 ou d'un service singleton en Angular.
  - prompt: |
      Quelle est la signature correcte d'un reducer React ?
    options:
      - "`(action) => state`"
      - "`(state, action) => newState`"
      - "`async (state, action) => newState`"
      - "`(dispatch, state) => void`"
    answer: 1
    tags: [useReducer]
    level: debutant
    explanation: |
      Un reducer est une **fonction pure** : il reçoit `(state, action)` et retourne le **nouvel état** — sans muter `state`, sans effets de bord, sans async. La pureté est ce qui rend un reducer facile à tester et prévisible.
  - prompt: |
      Quel est le type TypeScript correct pour la prop `children` d'un composant d'enveloppe ?
    options:
      - "`JSX.Element`"
      - "`string`"
      - "`React.ReactNode`"
      - "`React.FC`"
    answer: 2
    tags: [typescript, props]
    level: debutant
    explanation: |
      `React.ReactNode` englobe tout ce que React peut rendre : JSX, chaînes, nombres, tableaux, `null`, `undefined`, Fragments… `JSX.Element` est plus restrictif (uniquement du JSX retourné par un composant). Pour `children`, on veut toujours `React.ReactNode`.
  - prompt: |
      Quand préférer `useReducer` à `useState` ?
    options:
      - "Toujours — `useReducer` est plus performant"
      - "Quand l'état a plusieurs sous-valeurs interdépendantes ou des transitions nommées complexes"
      - "Uniquement quand on utilise TypeScript"
      - "Quand on veut éviter les re-rendus"
    answer: 1
    tags: [useReducer, useState]
    level: intermediaire
    explanation: |
      `useState` est parfait pour 1-2 valeurs simples. `useReducer` brille quand l'état est un objet avec plusieurs champs qui évoluent ensemble, ou quand on veut des **transitions nommées** (`action.type`) lisibles et testables. C'est le schéma Redux miniaturisé.
  - prompt: |
      Un hook personnalisé `useCounter` appelle `useState`. Deux composants utilisent `useCounter()`. Partagent-ils le même état ?
    options:
      - "Oui — les hooks partagent leur état entre tous les composants qui les appellent"
      - "Non — chaque appel à `useCounter()` crée son propre état indépendant"
      - "Ça dépend de si le hook est dans un Context"
      - "Oui — sauf si on utilise `useRef` à la place de `useState`"
    answer: 1
    tags: [hooks-personnalises]
    level: intermediaire
    explanation: |
      C'est la propriété fondamentale des hooks (et des composables Vue) : on **partage la logique**, pas l'état. Chaque appel à `useCounter()` crée ses propres instances de `useState`. Pour partager l'état, on utilise un Context ou un store (Zustand).
---

Cinq questions sur Context, `useReducer`, TypeScript et les hooks personnalisés.
