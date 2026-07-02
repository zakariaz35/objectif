---
title: "Quiz — JavaScript essentiel"
type: quiz
questions:
  - prompt: |
      Quelle est la différence entre du JavaScript **inline** et un fichier **externe** dans une page HTML ?
    options:
      - "L'inline est écrit directement dans une balise `<script>` de la page ; l'externe vit dans un fichier `.js` chargé via `<script src=\"app.js\">`"
      - "L'inline s'exécute côté serveur, l'externe côté client"
      - "Il n'y a aucune différence, ce sont deux noms pour la même chose"
      - "L'inline ne fonctionne que dans Chrome, l'externe partout"
    answer: 0
    explanation: |
      **Inline** = le code est directement entre `<script> … </script>` dans la page.
      **Externe** = le code est dans un fichier `.js` séparé, référencé par `<script src="app.js"></script>`.
      On préfère l'externe dès que le code grandit : réutilisable, mis en cache, et il sépare
      la structure (HTML) du comportement (JS). Les deux tournent côté **client** (navigateur).
  - prompt: |
      À quoi sert l'attribut `defer` sur `<script src="app.js" defer></script>` ?
    options:
      - "À exécuter le script **après** que tout le HTML a été lu, pour que le code trouve bien les éléments de la page"
      - "À exécuter le script le plus vite possible, avant même le HTML"
      - "À compresser le fichier JavaScript pour qu'il se télécharge plus vite"
      - "À empêcher le script de s'exécuter tant que l'utilisateur n'a pas cliqué"
    answer: 0
    explanation: |
      `defer` télécharge le script en parallèle mais retarde son **exécution** jusqu'à ce que
      tout le HTML soit lu. C'est une question d'**ordre des opérations** : sans `defer`, un script
      pourrait s'exécuter avant que les éléments qu'il manipule existent → bug « élément introuvable ».
  - prompt: |
      Sur un tableau, quelle est la différence entre `map` et `filter` ?
    options:
      - "`map` **transforme** chaque élément (même taille) ; `filter` **garde** seulement ceux qui passent un test (taille ≤)"
      - "`map` garde certains éléments, `filter` les transforme"
      - "`map` modifie le tableau d'origine, `filter` en crée un nouveau"
      - "Les deux renvoient une seule valeur, comme `reduce`"
    answer: 0
    explanation: |
      **`map`** applique une transformation à chaque élément et renvoie un tableau de **même taille**.
      **`filter`** ne conserve que les éléments dont le test renvoie `true` → tableau **plus court** (ou égal).
      Les deux renvoient un **nouveau** tableau et ne modifient pas l'original ; c'est `reduce` qui condense en une seule valeur.
---

Un petit point de contrôle sur ce module. Prends le temps de lire les explications après chaque réponse — c'est là que tout se consolide.
