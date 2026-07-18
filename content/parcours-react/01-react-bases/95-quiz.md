---
title: "Quiz — React, les bases"
type: quiz
questions:
  - prompt: |
      Dans un composant React, tu as `const [score, setScore] = useState(0)`. Comment **incrémenter** ce compteur de manière sûre ?
    options:
      - |
        `score++`
      - |
        `setScore(score + 1)`
      - |
        `setScore(prev => prev + 1)` — forme fonctionnelle recommandée
      - |
        `score.value++`
    answer: 2
    tags: [useState, state]
    level: debutant
    explanation: |
      `score++` mute directement — React ne détecte pas le changement. `setScore(score + 1)` fonctionne mais peut donner un mauvais résultat si plusieurs mises à jour sont **batched** ensemble. La forme fonctionnelle `setScore(prev => prev + 1)` reçoit toujours la valeur précédente correcte — c'est la recommandation officielle React. `score.value` est la syntaxe Vue `ref`, pas React.
  - prompt: |
      Quelle est l'erreur dans ce JSX ?
      ```jsx
      return (
        <h1>Titre</h1>
        <p>Paragraphe</p>
      )
      ```
    options:
      - "Il manque des guillemets autour du texte"
      - "Un composant ne peut retourner qu'un seul élément racine"
      - "On ne peut pas mélanger `<h1>` et `<p>` en JSX"
      - "Il faut importer `React` explicitement"
    answer: 1
    tags: [jsx]
    level: debutant
    explanation: |
      Un composant React ne peut retourner qu'**un seul élément racine**. Ici il y en a deux (`<h1>` et `<p>`). La solution : les envelopper dans `<div>` ou dans un Fragment `<>...</>`. React n'est plus à importer depuis React 17 (le transforme JSX automatique le fait). Le texte JSX ne prend pas de guillemets.
  - prompt: |
      Pourquoi faut-il une prop `key` **stable** (pas l'index du tableau) dans une liste ?
    options:
      - "Pour trier le tableau côté React"
      - "Pour que React identifie correctement chaque élément et évite des bugs lors des réordonnements"
      - "Parce que TypeScript l'exige"
      - "`key` n'est utile que pour les listes de plus de 10 éléments"
    answer: 1
    tags: [listes, jsx]
    level: intermediaire
    explanation: |
      React utilise `key` pour son algorithme de **reconciliation** : il détermine quels éléments ont été ajoutés, supprimés ou déplacés. Si on utilise l'index comme clé et qu'on réordonne, React peut confondre les éléments et produire un état incohérent (champs de formulaire avec les mauvaises valeurs, animations incorrectes). Un ID stable (de BDD) évite ce problème.
  - prompt: |
      Quelle est la bonne façon d'ajouter un item à un tableau en état React ?
    options:
      - |
        `items.push(newItem)` puis `setItems(items)`
      - |
        `setItems([...items, newItem])`
      - |
        `setItems(items.concat)` sans appel
      - |
        `items[items.length] = newItem`
    answer: 1
    tags: [useState, immutabilite]
    level: debutant
    explanation: |
      On ne mute jamais l'état React directement. `push` mute le tableau existant — React ne voit pas de nouvelle référence et ne re-rend pas. `[...items, newItem]` crée un **nouveau tableau** : React détecte le changement et met à jour l'UI. C'est le principe fondamental : **immuabilité** de l'état.
  - prompt: |
      Comment passe-t-on du JSX entre les balises d'un composant ? Quelle prop reçoit ce contenu ?
    options:
      - "Via une prop `content`"
      - "Via la prop `children` (automatiquement remplie par React)"
      - "Via `innerHTML`"
      - "On ne peut pas — il faut tout passer en props explicites"
    answer: 1
    tags: [props, composants]
    level: debutant
    explanation: |
      React remplit automatiquement la prop `children` avec ce qui est placé entre les balises ouvrante et fermante du composant. On la reçoit et on la place dans le JSX : `function Panel({ children }) { return <div>{children}</div> }`. Son type TypeScript est `React.ReactNode`.
---

Cinq questions pour vérifier les fondations React : `useState`, JSX, listes, immuabilité
et composition par `children`.
