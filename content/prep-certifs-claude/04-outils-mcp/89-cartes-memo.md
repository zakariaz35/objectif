---
title: "Cartes mémo — Tool design & intégration MCP"
type: flashcards
cards:
  - q: |
      Un outil est mal utilisé par Claude (jamais appelé alors qu'il le faudrait, ou
      appelé au mauvais moment). La description dit correctement ce que fait l'outil.
      Quelle est la cause la plus probable, et la correction ?
    a: |
      La description ne précise probablement pas **quand** l'appeler. La correction
      structurelle est de réécrire la `description` pour qu'elle soit **prescriptive** :
      les déclencheurs, les conditions, les cas d'exclusion — pas seulement ce que fait
      l'outil. C'est le facteur le plus déterminant pour la qualité de la sélection
      d'outil.
  - q: |
      Quelle est la différence entre `tool_choice: {"type": "any"}` et
      `{"type": "any", "disable_parallel_tool_use": true}` ?
    a: |
      `any` seul autorise Claude à appeler **plusieurs** outils dans la même réponse,
      tant qu'il en appelle au moins un. Ajouter `disable_parallel_tool_use: true`
      (imbriqué **dans** `tool_choice`) force Claude à n'appeler **exactement un**
      outil.
  - q: |
      Claude renvoie 3 blocs `tool_use` indépendants dans une seule réponse. Comment
      doit-on structurer la requête suivante pour préserver le parallélisme ?
    a: |
      Exécuter les 3 outils **en concurrence**, puis renvoyer les 3 `tool_result`
      dans **un seul message `user`**, placés **avant** tout texte. Les séparer en
      plusieurs messages casse le parallélisme — c'est le piège d'examen classique sur
      ce sujet.
  - q: |
      `is_error: true` s'applique-t-il aux outils serveur (`web_search`,
      `code_execution`) comme aux outils client ?
    a: |
      Non. `is_error` ne concerne que les outils **client**, que ton code exécute et
      dont tu construis le `tool_result`. Les outils **serveur** gèrent leurs erreurs
      de façon transparente, gérée directement par Claude.
  - q: |
      Un outil externe échoue de façon transitoire environ 5 % du temps. Quelle
      combinaison de mesures répond structurellement à ce problème ?
    a: |
      **Retry avec backoff** côté harnais (absorbe les échecs transitoires avant même
      d'atteindre Claude), un `is_error` avec message **informatif** pour les cas qui
      remontent, un **outil de secours** si l'outil principal reste indisponible, et
      une **escalade humaine** en dernier recours. Un simple ajustement de prompt
      (« gère les erreurs avec grâce ») n'est pas une solution structurelle.
  - q: |
      Un outil a besoin d'un accès direct au système de fichiers de la machine de
      l'utilisateur. Quel transport MCP choisir, et pourquoi pas HTTP ?
    a: |
      **stdio** : le serveur tourne en process local, avec accès direct au système.
      HTTP suppose un serveur **distant** — inadapté à un besoin d'accès filesystem
      local, même si HTTP reste le transport recommandé pour les services partagés
      hébergés dans le cloud.
---

`description` prescriptive, `tool_choice`, parallélisme, `is_error`, transports MCP.
