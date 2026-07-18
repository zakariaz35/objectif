---
title: "Quiz — Apollo Client & cache normalisé"
type: quiz
questions:
  - prompt: |
      Que renvoie le hook `useQuery(QUERY, { variables })` ?
    options:
      - "Uniquement les données, une fois la requête terminée."
      - |
        Un objet avec au moins `loading`, `error` et `data`, mis à jour au
        fil du cycle de vie de la requête.
      - "Une fonction à appeler manuellement pour déclencher la requête."
    answer: 1
    tags: ["apollo-client", "usequery"]
    level: debutant
    explanation: |
      `useQuery` déclenche la requête automatiquement au montage du
      composant (ou quand ses variables changent) et renvoie en continu
      `{ loading, error, data }` — c'est `useMutation`, lui, qui renvoie une
      fonction à appeler explicitement.
  - prompt: |
      Que décide Apollo Client de mettre dans une entrée SÉPARÉE du cache
      (une clé `Type:id` propre) plutôt que de laisser imbriqué ?
    options:
      - "Tout objet, sans exception, dès qu'il contient au moins un champ."
      - |
        Uniquement un objet qui possède À LA FOIS `__typename` ET `id` dans
        la sélection.
      - "Uniquement les objets marqués `@cacheable` explicitement dans la requête."
    answer: 1
    tags: ["cache-normalise", "entite"]
    level: debutant
    explanation: |
      C'est la règle par défaut de la normalisation : `__typename` (ajouté
      automatiquement par Apollo à chaque requête) ET `id` (à demander
      explicitement) identifient une entité. Sans les DEUX, l'objet reste
      imbriqué, jamais normalisé.
  - prompt: |
      Une requête sélectionne `author { name }`, SANS `id`. Quelle
      conséquence sur le cache ?
    options:
      - "Aucune : Apollo Client déduit `id` depuis le champ `name`."
      - |
        `author` reste imbriqué tel quel dans son parent : pas d'entrée de
        cache dédiée, pas de déduplication, pas de mise à jour croisée.
      - "La requête échoue à la validation, avant même d'atteindre le serveur."
    answer: 1
    tags: ["cache-normalise", "piege"]
    level: intermediaire
    explanation: |
      C'est le piège classique de la leçon : sans `id`, l'objet n'est pas
      reconnu comme une entité, même avec `__typename` présent (ajouté
      automatiquement). Il reste imbriqué — aucune des propriétés du cache
      normalisé (dédup, mise à jour partagée) ne s'applique.
  - prompt: |
      Le MÊME auteur `Author:42` apparaît dans deux requêtes différentes
      (la fiche d'un livre, et une liste de livres). Que fait Apollo Client ?
    options:
      - "Il stocke deux copies indépendantes, une par requête."
      - |
        Il reconnaît la même clé `Author:42` et pointe les deux endroits
        vers LA MÊME entrée du cache — une seule copie en mémoire.
      - "Il fusionne les deux requêtes en une seule au niveau réseau."
    answer: 1
    tags: ["cache-normalise", "deduplication"]
    level: intermediaire
    explanation: |
      C'est le bénéfice central du cache normalisé : la déduplication. Une
      seule entrée `Author:42`, référencée à deux endroits — si elle change,
      les DEUX affichages se mettent à jour ensemble, automatiquement.
  - prompt: |
      Après une mutation `createBook`, quelle option évite un aller-retour
      réseau supplémentaire pour rafraîchir la liste des livres affichée ?
    options:
      - "`refetchQueries`, qui relance systématiquement une requête réseau."
      - |
        `update`, qui écrit directement le nouveau livre dans le cache
        normalisé (via `cache.modify`/`cache.writeFragment`), sans requête.
      - "Aucune : un rechargement complet de la page est toujours nécessaire."
    answer: 1
    tags: ["usemutation", "cache-update"]
    level: intermediaire
    explanation: |
      `refetchQueries` est la solution la plus simple, mais ajoute un
      aller-retour réseau. `update` modifie le cache directement (sans
      requête), au prix d'un peu plus de code — les deux stratégies
      cohabitent normalement dans une même app selon le contexte.
  - prompt: |
      Que permet un FRAGMENT GraphQL, utilisé côté React (ex. `BookCard`) ?
    options:
      - "D'exécuter la requête plus vite, en réduisant sa taille réseau."
      - |
        La COLOCATION : chaque composant déclare, à côté de son propre
        code, les champs GraphQL dont il a besoin — assemblés ensuite dans
        la query de la page.
      - "De remplacer complètement `useQuery` par un accès direct au cache."
    answer: 1
    tags: ["fragments", "colocation"]
    level: avance
    explanation: |
      Un fragment factorise un ensemble de champs (module 2) ; côté React,
      cette factorisation devient un principe d'architecture : le composant
      qui affiche une donnée est aussi celui qui déclare, dans son propre
      fichier, les champs qu'il consomme.
---

Six questions sur `useQuery`/`useMutation`, et surtout sur le cœur du
module : le mécanisme de normalisation du cache Apollo Client.
