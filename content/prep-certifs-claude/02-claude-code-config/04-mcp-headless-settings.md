---
title: "MCP, mode headless/CI, settings.json vs settings.local.json"
type: lesson
---

# Connecter des outils externes et automatiser en CI

## MCP dans Claude Code : projet vs utilisateur

**MCP (Model Context Protocol)** connecte Claude Code à des outils externes (bases de données, trackers de tickets, APIs internes). L'ajout se fait via la commande `claude mcp add` :

```bash
# Remote HTTP server
claude mcp add --transport http notion https://mcp.notion.com/mcp

# Local stdio server
claude mcp add --env AIRTABLE_API_KEY=YOUR_KEY --transport stdio airtable \
  -- npx -y airtable-mcp-server
```

| Portée | Fichier | Partagé avec |
|---|---|---|
| **Local** *(portée par défaut)* | `~/.claude.json`, sous le chemin du projet courant | Toi seul, uniquement dans **ce** projet — ne réapparaît pas dans tes autres projets |
| **Projet** | `.mcp.json` (racine du repo) | L'équipe, via le contrôle de version |
| **Utilisateur** | `~/.claude.json` (entrée globale, hors chemin de projet) | Toi seul, tous tes projets |

Quand `claude mcp add` est invoqué sans préciser `--scope`, c'est la portée **locale** qui s'applique par défaut — pratique pour un serveur expérimental ou personnel qu'on ne veut pas encore committer. Si le même serveur est défini à plusieurs portées, Claude Code s'y connecte une seule fois, en utilisant la définition de la portée la plus prioritaire (l'entrée entière, sans fusion des champs) : **local > projet > utilisateur**.

> 🎯 **Piège d'examen —** un serveur MCP dont l'authentification nécessite un **secret** (clé API, token) ne doit **jamais** avoir ce secret codé en dur dans `.mcp.json` s'il est commité au repo — exactement le même réflexe que pour un `.env` versionné. La bonne pratique structurelle : référencer une variable d'environnement, ou configurer le serveur en portée **locale** ou **utilisateur** (toutes deux dans `~/.claude.json`, jamais commitées) si l'équipe ne doit pas nécessairement partager la même instance.

## Mode headless / CI

Le flag `-p` (`--print`) exécute Claude Code en mode **non interactif**, adapté aux scripts et pipelines CI :

```bash
# Structured JSON output, includes session id, cost, metadata
claude -p "Summarize this project" --output-format json

# Restrict tools for a reproducible CI run
claude --bare -p "Summarize this file" --allowedTools "Read"
```

| Option | Rôle |
|---|---|
| `-p` / `--print` | Mode non interactif : un prompt, une réponse, le process se termine. |
| `--output-format json` | Sortie structurée (résultat, `session_id`, coût) au lieu de texte brut — pensée pour être parsée par un script (`jq`). |
| `--allowedTools` | Pré-approuve une liste d'outils, sans demande de confirmation interactive (indispensable en CI, où personne n'est là pour répondre). |
| `--bare` | Démarre une session minimale : saute les hooks, le LSP, la synchronisation des plugins, l'attribution, l'auto-memory, les préchargements en arrière-plan, les lectures de trousseau (keychain) et la découverte automatique de `CLAUDE.md` — seuls les flags passés explicitement s'appliquent. Les **skills** restent invocables explicitement via `/nom-du-skill` malgré `--bare`. Recommandé en CI pour un résultat **reproductible**, indépendant de la configuration ambiante de la machine qui exécute le job. |

> 🎯 **Piège d'examen —** un pipeline CI doit produire un résultat **identique** quelle que soit la machine qui l'exécute (runner éphémère vs poste d'un développeur avec ses propres hooks/MCP locaux). La réponse structurelle est `--bare`, qui désactive la découverte ambiante de configuration — pas une documentation demandant aux développeurs de « garder leurs `.claude/` synchronisés ».

## settings.json vs settings.local.json vs ~/.claude/settings.json

| Fichier | Portée | Partagé | Cas d'usage |
|---|---|---|---|
| `~/.claude/settings.json` | Utilisateur | Non | Préférences personnelles, tous projets. |
| `.claude/settings.json` | Projet | Oui (commité) | Hooks, permissions, MCP partagés avec l'équipe. |
| `.claude/settings.local.json` | Projet, personnel | Non (gitignoré automatiquement à la création) | Overrides personnels pour ce projet (expérimentation, réglages machine-spécifiques). |

L'ordre de priorité (du plus fort au plus faible) : **managed** > arguments en ligne de commande > **local** > **project** > **user**. Les règles de permission, elles, **fusionnent** entre portées plutôt que de s'écraser (une règle `deny` ajoutée en local s'ajoute à celles du projet, elle ne les remplace pas).

> 🎯 **Piège d'examen —** un hook ou un jeu de permissions destiné à **toute l'équipe** (ex. bloquer `Bash(curl *)` pour tout le monde) doit vivre dans `.claude/settings.json` (commité) — placer cette règle dans `settings.local.json` ne protégerait que la machine de son auteur, pas celle des autres membres de l'équipe.

## À retenir

- MCP : trois portées — **locale** (par défaut, `~/.claude.json` sous le chemin du projet, personnel), **projet** (`.mcp.json`, partagé), **utilisateur** (`~/.claude.json`, personnel, tous projets) ; précédence **local > projet > utilisateur** ; jamais de secret en dur dans un fichier commité.
- Mode headless : `-p`, `--output-format json` pour parser en script, `--bare` pour un résultat CI reproductible indépendant de la config locale.
- `settings.json` (projet, partagé) vs `settings.local.json` (projet, personnel, gitignoré) vs `~/.claude/settings.json` (utilisateur) : une règle d'équipe va toujours dans le fichier **commité**.
