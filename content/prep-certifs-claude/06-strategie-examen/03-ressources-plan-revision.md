---
title: "Ressources gratuites & plan de révision"
type: lesson
---

# Réviser efficacement en 2 à 4 semaines

## Ressources officielles gratuites

| Ressource | Contenu |
|---|---|
| **Anthropic Academy** (`anthropic.skilljar.com`) | Cours officiels avec **certificats de complétion** — la ressource la plus alignée sur le contenu réel des examens. |
| **Documentation développeur** (`platform.claude.com/docs`) | Référence complète de l'API : tool use, prompt caching, gestion du contexte, modèles. |
| **Documentation Claude Code** (`code.claude.com/docs`) | Référence complète de la configuration, des hooks, de MCP côté CLI. |

## Un plan sur 2 à 4 semaines, pour quelqu'un qui utilise déjà Claude Code au quotidien

L'usage quotidien de Claude Code donne déjà une intuition pratique de beaucoup de sujets (boucle agentique, outils, MCP) — l'effort de révision doit se concentrer sur ce que la pratique quotidienne **ne** couvre pas nécessairement : les paramètres exacts de l'API, les mécanismes de fiabilité, et la méthode de lecture des questions.

| Semaine | Focus | Pourquoi |
|---|---|---|
| **1** | Modules 1-3 (architecture agentique, config Claude Code, prompt engineering) + cours correspondants sur Anthropic Academy | Les bases conceptuelles, en partie déjà familières par la pratique — valider les détails précis (stop_reason, structured output). |
| **2** | Modules 4-5 (outils/MCP, gestion du contexte) | Le cœur le plus dense et le moins « visible » dans un usage quotidien de Claude Code : prompt caching, tool_choice, transports MCP, RAG vs long contexte. |
| **3** | Reprise des cartes mémo de tous les modules + premier test blanc, en conditions chronométrées (2 min/question) | Identifier les zones de faiblesse réelles avant la dernière ligne droite. |
| **4** *(si besoin)* | Deuxième test blanc + relecture ciblée des seuls domaines où le premier test a montré des lacunes | Consolider plutôt que tout revoir uniformément — le temps de révision est limité, mieux vaut le concentrer où l'écart est réel. |

> 🎯 **Repère —** ne pas confondre familiarité pratique et préparation à l'examen : savoir utiliser Claude Code au quotidien ne garantit pas de connaître le nom exact d'un paramètre (`disable_parallel_tool_use`, `cache_control`), une valeur de `stop_reason`, ou un ordre de grandeur de pricing — ce sont précisément ces détails que l'examen teste, et que la pratique seule ne fixe pas toujours.

## À retenir

- Anthropic Academy (certificats officiels), `platform.claude.com/docs`, `code.claude.com/docs` : les trois ressources gratuites de référence.
- Un usage quotidien de Claude Code accélère la révision mais ne la remplace pas : concentrer l'effort sur les paramètres précis de l'API et les mécanismes moins visibles au quotidien (caching, fiabilité, MCP côté conception).
- 2 à 4 semaines : bases (semaine 1) → cœur dense outils/contexte (semaine 2) → test blanc chronométré (semaine 3) → révision ciblée sur les lacunes identifiées (semaine 4).
