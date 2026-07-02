---
title: "Quiz — TypeScript"
type: quiz
questions:
  - prompt: |
      Le navigateur (ou Node) exécute-t-il directement un fichier `.ts` ?
    options:
      - "Non : il faut d'abord compiler / transpiler le TypeScript en JavaScript, seul langage qu'ils exécutent"
      - "Oui, tous les navigateurs modernes comprennent nativement le TypeScript"
      - "Oui, mais seulement si le fichier contient au moins une `interface`"
      - "Non, le TypeScript ne peut tourner que côté serveur, jamais dans un navigateur"
    answer: 0
    explanation: |
      Ni le navigateur ni Node ne comprennent le TypeScript : ils exécutent du **JavaScript**.
      On transforme donc le `.ts` en `.js` au préalable (compilation / transpilation), via `tsc`
      ou un outil de build comme Vite/esbuild. Le `.js` produit peut alors tourner partout.
  - prompt: |
      Qu'appelle-t-on le *type erasure* (effacement des types) en TypeScript ?
    options:
      - "Les annotations de type **disparaissent** dans le JavaScript produit ; elles servent à vérifier **avant** l'exécution, pas au runtime"
      - "TypeScript efface automatiquement les variables inutilisées de ton code"
      - "Les types sont convertis en commentaires que le navigateur ignore poliment"
      - "C'est une option à activer pour supprimer les erreurs de type affichées par l'éditeur"
    answer: 0
    explanation: |
      À la compilation, les types (`: number`, `interface`, etc.) sont **retirés** : le JavaScript
      final n'en contient aucune trace. Ils font partie d'une vérification **statique** (avant
      l'exécution) — ils ne protègent pas au **runtime**. C'est la même idée que les type hints
      Python relus par `mypy`.
  - prompt: |
      Quel est le rôle de l'outil `tsc` (avec `tsconfig.json`) ?
    options:
      - "Vérifier les types **et** produire les fichiers `.js` à partir du `.ts`, selon la configuration du projet"
      - "Lancer un serveur web pour héberger l'application TypeScript"
      - "Formater automatiquement le code pour respecter le style de l'équipe"
      - "Télécharger les dépendances déclarées dans `package.json`"
    answer: 0
    explanation: |
      `tsc` est le compilateur officiel : il lit `tsconfig.json` (version de JS visée, sévérité,
      dossier de sortie…), **vérifie les types** et génère le **JavaScript** correspondant. En
      pratique, la transpilation est souvent déléguée à Vite/esbuild pour la vitesse, `tsc` (ou
      l'éditeur) restant chargé de la vérification.
---

Un point de contrôle sur ce module. Lis bien les explications après chaque réponse : elles récapitulent l'essentiel.
