---
title: "Quiz — Architecture agentique & orchestration"
type: quiz
questions:
  - prompt: |
      Une équipe doit automatiser l'extraction de cinq champs (nom, email, montant, date,
      référence) depuis des emails entrants au format libre, pour les insérer dans une
      base de données. Le format des emails est varié mais les cinq informations
      recherchées sont toujours les mêmes. L'équipe propose de construire un agent avec
      une boucle autonome, un outil de recherche dans l'historique des emails précédents,
      et un outil de validation croisée, pour « garantir la robustesse ».

      Quelle est l'évaluation la plus juste de cette proposition ?
    options:
      - "L'agent est justifié : la variabilité du format des emails impose une boucle autonome avec plusieurs outils."
      - "Un simple appel (une passe, éventuellement avec structured outputs) suffit : le chemin de résolution — extraire 5 champs connus — est fixe et ne dépend pas d'une exploration dynamique."
      - "Un agent est nécessaire, mais sans outil de recherche dans l'historique, qui est superflu."
      - "Il faut un workflow multi-étapes avec au moins trois appels LLM séquentiels pour fiabiliser l'extraction."
    answer: 1
    tags: [agents, orchestration]
    level: intermediaire
    explanation: >
      La variabilité du *format d'entrée* ne justifie pas une boucle agentique : le
      *chemin de résolution* (quels champs extraire) est parfaitement connu à l'avance,
      il n'y a pas besoin que le modèle décide dynamiquement de la prochaine action. C'est
      exactement le cas d'usage d'un appel simple avec un schéma de sortie structuré. Les
      options qui ajoutent une boucle, des outils de recherche ou plusieurs appels
      séquentiels sont de l'over-engineering : elles ajoutent coût et latence sans
      répondre à un besoin réel d'autonomie.
  - prompt: |
      Un agent d'automatisation d'infrastructure exécute une commande destructive
      (`terraform destroy` sur un environnement) après plusieurs itérations où ses
      tentatives précédentes de résolution ont échoué. L'équipe veut mettre en place un
      garde-fou structurel pour ce type de scénario, où le coût d'une erreur est très
      élevé et où l'agent semble insister sur la même approche défaillante.

      Quel garde-fou correspond le mieux à ce cas ?
    options:
      - "Ajouter dans le system prompt une phrase demandant à l'agent d'être prudent avec les commandes destructives."
      - "Un maximum d'itérations combiné à une escalade humaine avant toute action à fort coût d'erreur, plutôt que de compter sur la prudence du modèle."
      - "Ne rien changer : stop_reason: refusal empêchera automatiquement ce type d'action."
      - "Réduire max_tokens pour que l'agent ne puisse pas aller assez loin pour exécuter la commande."
    answer: 1
    tags: [agents, orchestration, reliability]
    level: avance
    explanation: >
      Face à un coût d'erreur élevé et à des échecs répétés sur la même approche, la
      réponse structurelle est de borner la boucle (max_iterations), déclencher une
      replanification en cas d'échecs répétés, et escalader vers un humain avant toute
      action irréversible — pas de compter sur une instruction de prudence dans le
      prompt (non fiable structurellement). `refusal` est un stop_reason lié aux refus de
      contenu du modèle, pas un garde-fou anti-boucle applicatif. Réduire `max_tokens`
      casserait la réponse (troncature) sans empêcher l'exécution d'un outil.
  - prompt: |
      Une entreprise veut construire un agent capable de lire et modifier des fichiers
      dans un dépôt, exécuter des commandes shell, et déléguer certaines sous-tâches à des
      sous-agents spécialisés — essentiellement reproduire les capacités de Claude Code
      dans son propre produit interne, hébergé sur son infrastructure. L'équipe hésite
      entre écrire une boucle manuelle sur l'API Messages, utiliser le Tool Runner du SDK,
      ou utiliser le Claude Agent SDK.

      Quelle option correspond structurellement à ce besoin ?
    options:
      - "Le Tool Runner du SDK, qui gère nativement les outils fichiers et bash."
      - "Une boucle manuelle sur l'API Messages, la seule option personnalisable à ce point."
      - "Le Claude Agent SDK, qui fournit précisément le harnais de Claude Code (outils intégrés fichiers/bash, MCP, sous-agents) en librairie, à héberger soi-même."
      - "Managed Agents, car c'est la seule option qui propose des outils fichiers et bash."
    answer: 2
    tags: [agents, claude-code]
    level: avance
    explanation: >
      Le besoin décrit (outils fichiers/bash intégrés + MCP + sous-agents, hébergé sur sa
      propre infrastructure) correspond exactement au Claude Agent SDK, qui est le harnais
      de Claude Code packagé en librairie. Le Tool Runner du SDK ne fournit **aucun** outil
      intégré : il ne gère que la mécanique de boucle sur des outils que l'équipe devrait
      elle-même écrire. Managed Agents fournit bien des outils intégrés similaires, mais
      héberge aussi le sandbox **chez Anthropic** — ce qui contredit l'exigence d'héberger
      sur sa propre infrastructure. Une boucle manuelle imposerait de réimplémenter tous
      ces outils à la main, sans bénéfice pour ce besoin précis.
  - prompt: |
      Une équipe construit un agent qui doit tourner plusieurs heures pour analyser un
      grand volume de données, avec la possibilité qu'une session soit interrompue puis
      reprise plus tard sans perdre l'état d'avancement. L'équipe ne souhaite pas
      développer ni maintenir sa propre infrastructure de sandbox pour l'exécution des
      outils.

      Quelle option est la mieux adaptée ?
    options:
      - "Managed Agents, dont les sessions sont à état persistant et dont le sandbox est hébergé par Anthropic (ou auto-hébergé si besoin)."
      - "Une boucle manuelle sur l'API Messages avec une base de données maison pour stocker l'état."
      - "Le Tool Runner du SDK, qui gère automatiquement la persistance des sessions."
      - "Le Claude Agent SDK, qui inclut un sandbox managé par Anthropic pour les tâches longues."
    answer: 0
    tags: [agents, orchestration]
    level: avance
    explanation: >
      Le besoin (tâche longue, reprise après interruption, pas d'infra de sandbox à
      maintenir) est exactement le cas d'usage central de Managed Agents : sessions à
      état persistant, sandbox hébergé par Anthropic (cloud managé) ou auto-hébergé sur
      demande. Une boucle manuelle imposerait de construire soi-même toute la
      persistance — contraire à l'exigence. Le Tool Runner ne gère aucune persistance de
      session, seulement la mécanique de boucle en mémoire. Le Claude Agent SDK est
      hébergé par **toi** (tu fournis le sandbox), pas par Anthropic.
  - prompt: |
      Un système doit produire, pour chacun des 40 rapports PDF déposés ce matin, un
      résumé indépendant d'une page. Les rapports n'ont aucune dépendance entre eux. Un
      développeur propose de traiter les rapports un par un, dans une boucle séquentielle,
      avec un seul agent qui garde en mémoire tous les résumés précédents « au cas où ».

      Quelle amélioration structurelle l'examen attendrait-il ?
    options:
      - "Garder le traitement séquentiel, mais réduire le nombre d'outils disponibles à l'agent."
      - "Déléguer chaque rapport à un sous-agent en fan-out parallèle, chacun avec un contexte isolé, puisque les items sont indépendants et que les résumés précédents ne sont pas nécessaires au traitement des suivants."
      - "Passer à un unique appel simple contenant les 40 rapports concaténés dans le prompt."
      - "Ajouter un stop_reason personnalisé pour signaler la fin du traitement de chaque rapport."
    answer: 1
    tags: [agents, orchestration, subagents]
    level: intermediaire
    explanation: >
      Des items indépendants, sans dépendance entre eux, sont le cas d'usage typique du
      fan-out parallèle en sous-agents : chacun traite son rapport dans un contexte
      isolé, sans avoir besoin de l'historique des résumés précédents, ce qui réduit la
      latence totale et évite d'accumuler inutilement du contexte dans un seul fil. Garder
      un traitement séquentiel avec mémoire de tous les résumés précédents est une fausse
      bonne idée : cette mémoire n'apporte rien ici et fait grossir le contexte pour
      rien. Concaténer 40 rapports dans un seul prompt pose un problème de fenêtre de
      contexte et de perte de qualité par rapport (« needle in a haystack »).
      `stop_reason` est un champ défini par l'API, pas un mécanisme personnalisable.
---

Vérifie tes réflexes sur les 4 façons de construire un agent, les stop_reason et les patterns multi-agents.
