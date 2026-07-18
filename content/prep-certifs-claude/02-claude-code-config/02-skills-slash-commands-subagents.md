---
title: "Skills, slash commands & sous-agents personnalisés"
type: lesson
---

# Étendre Claude Code sans tout mettre dans CLAUDE.md

Trois mécanismes d'extension, à ne pas confondre : les **skills** (procédures chargées à la demande), les **slash commands** (fusionnés avec les skills), et les **sous-agents personnalisés** (contexte et permissions isolés).

## Skills : une procédure, chargée seulement quand utile

Une **skill** est un dossier `<nom>/SKILL.md` avec un front-matter YAML (`description` — le signal qui permet à Claude de la déclencher automatiquement) et des instructions Markdown. Contrairement à `CLAUDE.md`, le corps d'une skill **ne charge le contexte que lorsqu'elle est invoquée** (explicitement via `/nom-skill`, ou automatiquement si Claude juge la description pertinente pour la tâche en cours).

| Portée | Emplacement | Partagé avec |
|---|---|---|
| **Personnelle** | `~/.claude/skills/<nom>/SKILL.md` | Toi, tous tes projets |
| **Projet** | `.claude/skills/<nom>/SKILL.md` | L'équipe, via le contrôle de version |

> 🎯 **Piège d'examen —** une skill d'équipe (ex. « comment lancer et builder ce projet », générée par `/run-skill-generator`, ou un check-list de revue de code) doit être versionnée en **portée projet** (`.claude/skills/`) pour que Claude Code la découvre chez tous les collaborateurs via le dépôt — exactement le même réflexe que pour `CLAUDE.md` (leçon précédente). Une skill strictement personnelle (raccourcis propres à ta machine) reste en `~/.claude/skills/`.

## Slash commands = skills

Les anciennes commandes personnalisées (`.claude/commands/deploy.md`) et les skills (`.claude/skills/deploy/SKILL.md`) produisent la **même** commande `/deploy` et fonctionnent de façon identique — les skills ajoutent simplement des fonctionnalités optionnelles (dossier de ressources associées, contrôle fin sur qui peut invoquer la skill, déclenchement automatique par Claude). Un slash command visible dans un audit de repo (`.claude/commands/`) n'est donc pas une architecture différente d'une skill : c'est son ancêtre, toujours fonctionnel.

## Sous-agents personnalisés : contexte isolé, outils restreints

Un **sous-agent** (`.claude/agents/<nom>.md`, ou `~/.claude/agents/` en portée personnelle) est un fichier Markdown avec un front-matter YAML :

```markdown
---
name: code-reviewer
description: Reviews code for quality and best practices. Use after code changes.
tools: Read, Glob, Grep
model: sonnet
---

You are a code reviewer. When invoked, analyze the code and provide
specific, actionable feedback on quality, security, and best practices.
```

| Champ | Rôle |
|---|---|
| `name` | Identifiant unique (minuscules, tirets). |
| `description` | **Déclenche** la délégation : Claude compare la tâche en cours à cette description pour décider quand invoquer ce sous-agent. |
| `tools` | (optionnel) Restreint les outils disponibles. **Omis = hérite de tous les outils.** |
| `model` | (optionnel) Modèle à utiliser (`sonnet`, `opus`, `haiku`, un ID complet, ou `inherit`). |

Le corps Markdown devient le **system prompt** du sous-agent — il ne reçoit **que** ce system prompt plus l'environnement de base, pas l'historique complet de la conversation principale (cohérent avec la leçon sur l'isolation de contexte du module 1).

> 🎯 **Piège d'examen —** un scénario demande un sous-agent de revue de code qui ne doit **jamais** pouvoir modifier de fichiers, seulement lire et chercher. La réponse structurelle est de restreindre `tools:` dans le front-matter à une liste explicite (`Read, Glob, Grep` — sans `Write`/`Edit`/`Bash`) — **pas** de se reposer sur une instruction du type « ne modifie jamais de fichier » dans le corps du prompt, qui reste une consigne non contraignante. La restriction de `tools:` est une garantie structurelle (le sous-agent n'a physiquement pas accès à l'outil) ; une instruction textuelle est une simple recommandation que le modèle peut ne pas suivre à la lettre.

## Skill vs sous-agent : comparaison rapide

| | Skill | Sous-agent |
|---|---|---|
| **Ce que ça charge** | Une procédure/des instructions dans le contexte **courant** | Un **nouveau** contexte isolé, séparé du fil principal |
| **Outils** | Ceux déjà disponibles dans la session courante | Peut être restreint indépendamment (`tools:`) |
| **Quand l'utiliser** | Éviter de répéter une procédure/un prompt long | Isoler une exploration volumineuse ou restreindre des permissions pour une sous-tâche |

## À retenir

- Skill = procédure chargée à la demande (portée projet pour une skill d'équipe, versionnée ; portée personnelle sinon).
- Slash command = ancienne forme de skill, fonctionnellement équivalente.
- Sous-agent = contexte isolé + outils potentiellement restreints via `tools:` dans le front-matter — la restriction d'outils est la garantie structurelle pour un sous-agent read-only, pas une instruction dans le prompt.
