---
title: "Cartes mémo — Architecture agentique & orchestration"
type: flashcards
cards:
  - q: |
      Quels sont les **quatre critères** pour décider entre un simple appel, un workflow
      et un agent ?
    a: |
      **Complexité** du chemin de résolution (connu à l'avance ou non), **valeur** de
      l'autonomie, **viabilité économique** (coût vs valeur produite), et **coût d'une
      erreur** (réversible ou non). Plus le coût d'erreur est élevé, plus on borne
      l'autonomie.
  - q: |
      Un agent enchaîne les appels et reçoit `stop_reason: "pause_turn"`. Est-ce une
      erreur à traiter, ou faut-il faire autre chose ?
    a: |
      Ce n'est **pas une erreur** : `pause_turn` signale qu'une boucle d'**outil serveur**
      a atteint sa limite d'itérations internes. Il suffit de renvoyer le contenu
      assistant tel quel dans un nouvel appel pour que la boucle continue. À ne pas
      confondre avec `max_tokens`, qui signale une vraie troncature.
  - q: |
      Quelle est la différence structurelle entre le **Tool Runner du SDK** et le
      **Claude Agent SDK** ?
    a: |
      Le **Tool Runner** ne gère que la mécanique de la boucle agentique (typage,
      wrapping d'erreurs) — tu dois quand même écrire et exposer **tes propres outils**,
      il n'y a aucun outil intégré. Le **Claude Agent SDK** fournit le harnais complet
      de Claude Code : outils intégrés (Read/Write/Bash/Grep), intégration MCP, et
      sous-agents — pas seulement une boucle.
  - q: |
      Qu'est-ce qui distingue **Managed Agents** des trois autres façons de construire
      un agent ?
    a: |
      C'est la **seule** option où Anthropic héberge à la fois **la boucle agentique
      ET le sandbox d'exécution**, avec un état persistant par session (reprise après
      interruption, agents créés une fois et référencés par ID). Les trois autres
      options t'obligent à héberger toi-même l'exécution.
  - q: |
      Pourquoi délègue-t-on une sous-tâche à un **sous-agent** plutôt que de la traiter
      directement dans le fil principal ?
    a: |
      Pour **isoler le contexte** : la sous-tâche produirait un volume de contenu
      intermédiaire (logs, résultats de recherche) que le fil principal n'a pas besoin
      de conserver. Le sous-agent absorbe ce volume dans sa propre fenêtre et ne renvoie
      qu'un résumé. Ce n'est **pas** une histoire de « rendre l'architecture plus
      agentique ».
  - q: |
      Dix fichiers indépendants doivent être analysés séparément. Faut-il un traitement
      séquentiel ou un fan-out parallèle de sous-agents ?
    a: |
      **Fan-out parallèle** : les items sont indépendants, donc paralléliser réduit la
      latence totale sans risque de conflit. Le séquentiel n'a de sens que lorsque les
      étapes dépendent réellement les unes des autres.
---

Lis, réfléchis, révèle, auto-évalue.
