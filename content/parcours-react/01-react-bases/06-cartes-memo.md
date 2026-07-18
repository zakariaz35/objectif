---
title: "Cartes mémo — React, les bases"
type: flashcards
cards:
  - q: |
      Quelle est la règle sur le **nom** d'un composant React ?
    a: |
      Il doit commencer par une **majuscule**. `<greeting />` est interprété comme une
      balise HTML inconnue ; `<Greeting />` est un composant React.
  - q: |
      Pourquoi utilise-t-on `className` en JSX au lieu de `class` ?
    a: |
      En JSX, `class` est un mot-clé JavaScript réservé. On utilise donc `className`
      qui est l'attribut DOM correspondant.
  - q: |
      Quelle est la règle d'or concernant la **mutation de l'état** React ?
    a: |
      Ne jamais muter l'état directement. Toujours créer une **nouvelle valeur** :
      `setItems([...items, newItem])` plutôt que `items.push(newItem)`.
  - q: |
      Pourquoi la prop `key` est-elle obligatoire dans les listes ?
    a: |
      React l'utilise pour identifier chaque élément, optimiser les re-rendus
      (diff du DOM virtuel) et éviter des bugs de reconciliation. On utilise un
      identifiant stable (ID de BDD), pas l'index du tableau.
  - q: |
      Quelle est la différence entre un **composant contrôlé** et un composant non-contrôlé ?
    a: |
      Dans un composant contrôlé, React est la source de vérité : `value={state}` +
      `onChange`. Dans un non-contrôlé, le DOM garde la valeur (on lit via `ref`). On
      préfère les composants contrôlés car l'état est prévisible.
  - q: |
      `useState(0)` retourne quoi exactement ?
    a: |
      Un tableau de deux éléments : `[valeurActuelle, fonctionSetter]`. Par convention
      on déstructure : `const [count, setCount] = useState(0)`.
  - q: |
      En JSX, comment affiche-t-on du contenu **conditionnel** (sans `if`) ?
    a: |
      Soit avec l'opérateur ternaire : `{condition ? <A /> : <B />}`.
      Soit avec `&&` pour afficher ou rien : `{condition && <A />}`.
