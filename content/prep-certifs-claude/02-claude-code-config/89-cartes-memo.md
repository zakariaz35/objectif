---
title: "Cartes mémo — Claude Code : configuration & workflows"
type: flashcards
cards:
  - q: |
      Une skill utile pour lancer et builder un projet doit être partagée avec toute
      l'équipe. Faut-il la placer en `~/.claude/skills/` ou en `.claude/skills/` ?
    a: |
      En `.claude/skills/` (**portée projet**), commitée dans le dépôt : c'est ce qui
      permet à Claude Code de la découvrir chez tous les collaborateurs. `~/.claude/`
      (portée utilisateur) ne bénéficierait qu'à son auteur.
  - q: |
      Comment garantir **structurellement** qu'un sous-agent de revue de code ne pourra
      jamais modifier de fichiers ?
    a: |
      En restreignant `tools:` dans son front-matter à une liste explicite en lecture
      seule (ex. `Read, Glob, Grep`), sans `Write`/`Edit`/`Bash`. Une instruction textuelle
      du type « ne modifie jamais de fichier » dans le prompt n'est pas une garantie
      structurelle.
  - q: |
      Un hook `PostToolUse` relance toute la suite de tests à chaque édition et ralentit
      chaque itération. Quelles sont les deux corrections structurelles possibles ?
    a: |
      Cibler le hook avec un `matcher`/`if` plus précis (ne réagir qu'aux fichiers
      réellement concernés), ou déplacer la vérification lourde en CI et garder dans le
      hook un contrôle rapide seulement.
  - q: |
      Pourquoi ne jamais coder en dur un secret d'authentification MCP dans `.mcp.json`
      s'il est commité au dépôt ?
    a: |
      Parce que `.mcp.json` en portée projet est partagé via le contrôle de version :
      un secret en dur fuiterait à toute personne ayant accès au repo. Il faut référencer
      une variable d'environnement, ou configurer le serveur en portée utilisateur
      (`~/.claude.json`, jamais commité).
  - q: |
      Pourquoi utiliser `--bare` pour un appel `claude -p` lancé depuis un pipeline CI ?
    a: |
      Pour obtenir un résultat **reproductible**, indépendant de la configuration locale
      ambiante (hooks, skills, MCP, `CLAUDE.md`) qui pourrait varier d'une machine à
      l'autre. Seuls les flags passés explicitement s'appliquent alors.
  - q: |
      Une règle de permission (`deny`) doit s'appliquer à toute l'équipe. Dans quel
      fichier la placer, et pourquoi pas dans `settings.local.json` ?
    a: |
      Dans `.claude/settings.json` (portée projet, commité). `settings.local.json` est
      personnel et gitignoré : une règle placée là ne protégerait que la machine de son
      auteur, pas celle des autres membres de l'équipe.
---

Lis, réfléchis, révèle, auto-évalue.
