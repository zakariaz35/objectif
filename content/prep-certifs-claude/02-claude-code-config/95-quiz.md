---
title: "Quiz — Claude Code : configuration & workflows"
type: quiz
questions:
  - prompt: |
      Une équipe de six développeurs utilise Claude Code sur le même dépôt Symfony.
      Chacun redécouvre séparément la même check-list de revue de code (vérifier les
      migrations Doctrine, les voters de sécurité, la couverture de tests) en la collant
      à chaque fois dans le chat. Un développeur veut factoriser cette check-list pour
      que toute l'équipe en profite automatiquement.

      Quelle solution est structurellement la mieux adaptée ?
    options:
      - "Ajouter la check-list complète dans ~/.claude/CLAUDE.md de chaque développeur."
      - "Créer une skill dans .claude/skills/code-review/SKILL.md, commitée dans le dépôt."
      - "Créer un sous-agent en ~/.claude/agents/ pour chaque développeur individuellement."
      - "Copier la check-list dans un fichier README.md à la racine du projet."
    answer: 1
    tags: [claude-code, skills]
    level: intermediaire
    explanation: >
      Une skill en portée projet (.claude/skills/, commitée) est découverte automatiquement
      par Claude Code chez tous les collaborateurs du dépôt, et ne charge son contenu que
      lorsqu'elle est invoquée — sans gonfler le contexte de chaque session comme le
      ferait un CLAUDE.md surchargé. Dupliquer la config en ~/.claude/ pour chaque
      développeur individuellement perd l'avantage du partage via le contrôle de version
      et doit être refait à la main pour chaque nouvel arrivant. Un simple README n'est
      pas découvert ni chargé automatiquement par Claude Code de la même façon qu'une
      skill ou un CLAUDE.md.
  - prompt: |
      Un sous-agent `db-explorer` est créé pour explorer un schéma de base de données et
      répondre à des questions dessus. L'équipe veut être certaine qu'il ne pourra
      **jamais**, même par erreur d'interprétation d'une consigne ambiguë, exécuter une
      commande shell ou modifier un fichier du projet.

      Quelle configuration garantit ce comportement ?
    options:
      - "Ajouter dans le corps du prompt du sous-agent : « N'exécute jamais de commande shell et ne modifie aucun fichier »."
      - "Définir tools: Read, Grep, Glob dans le front-matter du sous-agent, en omettant Bash, Write et Edit."
      - "Laisser tools: non défini (hérite de tous les outils) mais ajouter une note dans la description."
      - "Configurer un hook PostToolUse qui annule les actions Bash après leur exécution."
    answer: 1
    tags: [claude-code, subagents, permissions]
    level: intermediaire
    explanation: >
      Restreindre `tools:` dans le front-matter du sous-agent est une garantie
      **structurelle** : l'outil n'est physiquement pas exposé au sous-agent, il ne peut
      donc pas l'invoquer, indépendamment de la consigne textuelle. Une instruction
      textuelle dans le prompt reste une recommandation que le modèle pourrait ne pas
      suivre à la lettre en cas d'ambiguïté. Omettre `tools:` hérite de tous les outils
      (l'inverse du besoin). Un hook PostToolUse agirait *après* l'exécution — trop tard
      si l'action a déjà eu un effet de bord (ex. une commande shell déjà exécutée).
  - prompt: |
      Après chaque `Edit` ou `Write` sur le dépôt, un hook `PostToolUse` relance
      l'intégralité de la suite de tests (12 minutes), y compris pour un changement d'une
      ligne de documentation dans un fichier `.md` sans rapport avec le code testé.
      L'équipe se plaint que Claude Code devient inutilisable, chaque itération étant
      bloquée pendant 12 minutes.

      Quelle est la meilleure correction structurelle ?
    options:
      - "Supprimer le hook entièrement pour ne plus être bloqué."
      - "Cibler le hook avec un matcher/if plus précis sur les fichiers de code concernés, et/ou déplacer la suite complète en CI en ne gardant qu'un contrôle rapide dans le hook."
      - "Changer l'événement du hook de PostToolUse à PreToolUse pour qu'il s'exécute plus tôt."
      - "Augmenter max_tokens pour que Claude Code termine plus vite."
    answer: 1
    tags: [claude-code, hooks]
    level: intermediaire
    explanation: >
      Un hook lent bloque le flux à chaque déclenchement : la correction structurelle est
      de restreindre son champ d'application (matcher/if sur les fichiers de code
      réellement concernés, en excluant par exemple les .md) et/ou de déplacer la
      vérification lourde en CI, en ne gardant dans le hook qu'un contrôle rapide et
      ciblé. Supprimer le hook fait perdre la garantie qu'il apportait. Passer en
      PreToolUse ne change rien à la durée d'exécution du hook, juste à quand il se
      déclenche. max_tokens régit la longueur de génération du modèle, sans rapport avec
      la durée d'exécution d'un hook.
  - prompt: |
      Un serveur MCP interne nécessite un token d'authentification pour se connecter à un
      système de tickets. L'équipe committe la configuration dans `.mcp.json` à la racine
      du dépôt pour que tout le monde en bénéficie, avec le token écrit en clair dans le
      champ `headers`.

      Quel est le problème, et quelle est la correction attendue ?
    options:
      - "Aucun problème : .mcp.json est fait pour être partagé avec l'équipe."
      - "Le token en clair dans un fichier commité fuite à quiconque a accès au dépôt ; il faut le référencer via une variable d'environnement ou le configurer en portée utilisateur (~/.claude.json), pas en dur dans le fichier partagé."
      - "Il faut renommer .mcp.json en .mcp.local.json pour le sécuriser."
      - "Il faut désactiver MCP entièrement et copier les données manuellement dans le chat."
    answer: 1
    tags: [claude-code, mcp, permissions]
    level: intermediaire
    explanation: >
      .mcp.json en portée projet est versionné et donc lisible par quiconque a accès au
      dépôt (y compris son historique Git) : un secret en clair y est une fuite,
      exactement comme un .env commité. La correction structurelle est de référencer une
      variable d'environnement dans le fichier partagé, ou de déplacer la configuration
      contenant le secret en portée utilisateur (~/.claude.json, jamais commité).
      Renommer le fichier ne change rien à son statut de fichier suivi par Git s'il l'est
      déjà. Désactiver MCP abandonne la fonctionnalité au lieu de corriger le problème
      de fond.
  - prompt: |
      Une équipe met en place un pipeline CI qui appelle `claude -p` pour générer un
      résumé automatique de chaque pull request. Le résultat doit être **identique**,
      qu'il soit exécuté sur un runner GitHub Actions éphémère ou sur le poste d'un
      développeur ayant ses propres hooks et serveurs MCP configurés localement.

      Quelle option garantit cette reproductibilité ?
    options:
      - "--output-format text, le format par défaut, suffisant pour un résumé."
      - "--continue, pour repartir d'une session précédente à chaque exécution."
      - "--bare, pour ignorer la découverte automatique de hooks/skills/MCP/CLAUDE.md locaux et ne s'appuyer que sur les flags passés explicitement."
      - "--allowedTools '*', pour éviter toute interruption liée aux permissions."
    answer: 2
    tags: [claude-code, headless]
    level: avance
    explanation: >
      --bare désactive la découverte ambiante de configuration (hooks, skills, plugins,
      serveurs MCP, auto memory, CLAUDE.md) : le comportement ne dépend plus de ce qui se
      trouve sur la machine qui exécute la commande, seulement des flags fournis
      explicitement — exactement ce qu'exige la reproductibilité CI. --output-format
      contrôle le format de sortie, pas la configuration chargée. --continue reprend une
      session précédente, ce qui est risqué en CI (état non maîtrisé). --allowedTools '*'
      autorise tous les outils sans discernement, contraire au principe de moindre
      privilège et sans rapport avec la reproductibilité de la configuration.
---

Vérifie tes réflexes sur les portées CLAUDE.md/skills/subagents, les hooks et le mode headless.
