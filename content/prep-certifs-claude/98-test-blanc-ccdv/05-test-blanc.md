---
title: "Test blanc — CCDV-F (60 questions, conditions réelles)"
type: quiz
strategy: linear
questions:
  # ======================= AGENTIC ARCHITECTURE (16) =======================
  - prompt: |
      Une équipe doit classer automatiquement chaque email entrant dans l'une de cinq
      catégories fixes et connues à l'avance (facturation, support technique, commercial,
      recrutement, spam). La formulation des emails varie énormément d'un expéditeur à
      l'autre. Un développeur propose de construire un agent avec une boucle autonome et un
      outil de recherche dans l'historique des emails similaires, « pour garantir la
      robustesse face à cette variabilité ».

      Quelle est l'évaluation la plus juste de cette proposition ?
    options:
      - "Un appel simple suffit : parmi cinq catégories fixes et connues à l'avance, le chemin de résolution ne dépend d'aucune exploration dynamique — une boucle agentique n'apporte rien ici."
      - "Un agent est nécessaire, car la formulation des emails varie trop pour un appel unique."
      - "Un workflow d'au moins trois appels séquentiels est requis pour fiabiliser la classification."
      - "Il faut un agent avec un outil de recherche dans l'historique des emails similaires, pour garantir la cohérence."
    answer: 0
    level: intermediaire
    tags: [agents, orchestration]
    explanation: >
      La variabilité du texte d'entrée ne change rien au chemin de résolution : choisir
      parmi cinq catégories connues à l'avance est une tâche déterministe, parfaitement
      couverte par un appel simple (éventuellement avec un schéma de sortie structuré).
      L'option 1 confond variabilité de l'entrée et besoin d'autonomie décisionnelle d'un
      agent. L'option 2 ajoute des allers-retours séquentiels sans justification : rien
      dans la tâche ne nécessite plusieurs étapes. L'option 3 ajoute un outil qui n'apporte
      aucune valeur pour une classification à catégories fixes — c'est de
      l'over-engineering caractéristique du piège d'examen sur ce domaine.

  - prompt: |
      Un pipeline CI exécute toujours la même séquence : lancer le lint, puis les tests, puis
      déployer si les tests passent, sinon notifier l'équipe par message. Cette séquence et
      son embranchement if/else sont connus et fixés à l'avance, indépendamment du contenu
      du code modifié.

      Comment qualifier structurellement ce système ?
    options:
      - "C'est un agent, car la décision de déployer ou non dépend d'une condition."
      - "C'est un workflow : la séquence d'étapes et son embranchement if/else sont connus à l'avance, ce n'est pas le modèle qui décide dynamiquement de la prochaine action."
      - "C'est un appel simple, puisqu'une seule requête au modèle suffit à tout orchestrer."
      - "Ce n'est ni un agent ni un workflow : un pipeline CI est hors du cadre agentique de l'examen."
    answer: 1
    level: intermediaire
    tags: [agents, orchestration]
    explanation: >
      Un workflow est précisément une séquence d'étapes connue à l'avance, pouvant
      bifurquer (if/else), mais orchestrée par le code, pas par le modèle qui déciderait
      dynamiquement de la prochaine action. L'option 0 confond branchement conditionnel
      déterministe et décision autonome d'un agent : le résultat du test conditionne la
      branche, mais ce n'est pas le modèle qui choisit. L'option 2 sous-estime le nombre
      d'étapes orchestrées réellement nécessaires. L'option 3 est fausse : ce type de
      séquence fixe avec embranchement est exactement l'exemple manuel d'un workflow dans
      le cadre de l'examen, pas une catégorie à part.

  - prompt: |
      Le harnais d'un développeur reçoit une réponse avec `stop_reason: "tool_use"` et
      exécute correctement l'outil demandé. Mais dans son code, il n'ajoute à l'historique
      des messages **que** le nouveau message `user` contenant le `tool_result` — il omet
      de renvoyer le tour `assistant` précédent (celui qui contenait le bloc `tool_use`)
      dans l'appel suivant.

      Quel est le problème le plus probable ?
    options:
      - "Aucun problème : l'API retrouve automatiquement le tour assistant précédent sans qu'il soit renvoyé."
      - "Le problème est que tool_choice devrait être réglé sur none pour cette étape de la boucle."
      - "L'historique complet, y compris le tour assistant contenant les blocs tool_use, doit être renvoyé à chaque appel pour que chaque tool_result puisse être associé à son tool_use_id d'origine ; l'omettre casse la continuité de la conversation."
      - "Le problème vient de max_iterations, probablement réglé trop bas dans la boucle."
    answer: 2
    level: intermediaire
    tags: [agents, stop-reason]
    explanation: >
      L'API Messages est sans état (stateless) : chaque requête doit renvoyer l'historique
      complet, y compris le tour assistant contenant les blocs tool_use, pour que le/les
      tool_result suivants puissent être associés à leur tool_use_id d'origine — l'omettre
      provoque une erreur ou une réponse incohérente. L'option 0 est fausse : rien n'est
      conservé côté serveur d'un appel à l'autre. Les options 1 et 3 sont sans rapport avec
      le symptôme décrit, qui porte sur la construction de l'historique de messages, pas
      sur le choix de l'outil ni sur une borne d'itérations.

  - prompt: |
      Un agent utilise un outil serveur de recherche web multi-étapes. Après plusieurs
      itérations internes gérées par Anthropic, la réponse revient avec
      `stop_reason: "pause_turn"`. Le développeur traite ce cas comme une erreur : il
      interrompt le traitement et affiche à l'utilisateur « la recherche a échoué ».

      Quelle est l'évaluation correcte de ce traitement ?
    options:
      - "pause_turn n'est pas une erreur : c'est un point de reprise volontaire d'une boucle d'outil serveur ayant atteint sa limite d'itérations internes ; il suffit de renvoyer le contenu assistant tel quel dans un nouvel appel pour que la boucle continue."
      - "C'est correct : pause_turn signale un échec de la recherche, il faut en informer l'utilisateur."
      - "Il faut relancer toute la conversation depuis le premier message pour réinitialiser la boucle serveur."
      - "Il faut augmenter max_tokens pour empêcher pause_turn de se déclencher à l'avenir."
    answer: 0
    level: avance
    tags: [agents, stop-reason]
    explanation: >
      pause_turn signale qu'une boucle d'outil serveur (ex. recherche web multi-étapes) a
      atteint sa limite d'itérations internes — ce n'est pas un échec, mais un point de
      reprise volontaire : renvoyer le contenu assistant tel quel dans un nouvel appel
      suffit à laisser la boucle continuer. Traiter ce cas comme une erreur et l'annoncer à
      l'utilisateur interrompt à tort un traitement qui aurait abouti. Relancer toute la
      conversation depuis le début perd le travail déjà accompli sans nécessité. Augmenter
      max_tokens régit la troncature de longueur de réponse, sans rapport avec pause_turn.

  - prompt: |
      Un pipeline de génération de rapports reçoit une réponse avec
      `stop_reason: "max_tokens"` : le bloc `tool_use` généré est visiblement tronqué (son
      `input` JSON s'arrête au milieu d'un champ). Le harnais tente malgré tout de parser
      cet `input` et d'exécuter l'outil correspondant.

      Quel est le problème et la correction attendue ?
    options:
      - "max_tokens signale une réponse tronquée : un bloc tool_use potentiellement incomplet ne doit pas être exécuté tel quel ; il faut augmenter max_tokens (ou gérer la reprise) avant de considérer l'appel d'outil comme valide."
      - "C'est acceptable : max_tokens et tool_use sont indépendants, l'input est nécessairement complet."
      - "Il faut ignorer stop_reason et toujours exécuter l'outil tel quel, quel que soit son état."
      - "Le problème vient en réalité de pause_turn, pas de max_tokens."
    answer: 0
    level: intermediaire
    tags: [agents, stop-reason]
    explanation: >
      max_tokens signale une troncature : le contenu généré (y compris un bloc tool_use)
      n'est pas garanti complet, et l'exécuter tel quel risque d'appeler un outil avec des
      paramètres corrompus. La correction est d'augmenter max_tokens ou de gérer une
      reprise, jamais de considérer la réponse comme finale. L'option 1 ignore à tort le
      lien entre troncature de la réponse et intégrité du contenu généré, y compris les
      blocs structurés. L'option 2 est dangereuse : exécuter un outil avec un input
      possiblement corrompu peut avoir des effets de bord imprévus. L'option 3 confond deux
      stop_reason bien distincts.

  - prompt: |
      Une équipe construit un agent avec une exigence précise : à chaque itération de la
      boucle, il faut exécuter une logique métier spécifique (écrire une ligne d'audit
      détaillée avec des champs propres à l'entreprise) avant même de décider d'exécuter
      l'outil suivant. Contrainte technique non négociable de l'équipe : la solution
      retenue ne doit dépendre d'aucune fonctionnalité bêta du SDK, seules les
      fonctionnalités stables peuvent tourner en production.

      Quelle approche correspond structurellement à ce besoin ?
    options:
      - "Managed Agents, qui permet une personnalisation illimitée du harnais hébergé par Anthropic."
      - "Une boucle manuelle sur l'API Messages : stable (elle ne dépend d'aucune fonctionnalité bêta) et seule option donnant un contrôle ligne par ligne sur chaque itération, permettant d'y insérer une logique métier précise comme cet audit détaillé."
      - "Le Tool Runner du SDK, qui expose un hook dédié pour ce type d'audit personnalisé."
      - "Le Claude Agent SDK, dont le harnais complet inclut nativement un mécanisme d'audit par itération."
    answer: 1
    level: intermediaire
    tags: [agents, orchestration]
    explanation: >
      Une boucle manuelle sur l'API Messages est la seule des quatre options qui soit à la
      fois stable (aucune dépendance à une fonctionnalité bêta) et capable d'un contrôle
      total, ligne par ligne, sur chaque itération — exactement ce qu'exige une logique
      métier précise insérée avant chaque décision d'appel d'outil. Managed Agents délègue
      la boucle à Anthropic, sans ce niveau de contrôle fin. Le Tool Runner du SDK est
      documenté comme une fonctionnalité bêta et n'expose de toute façon aucun hook dédié à
      ce genre d'audit métier arbitraire, seulement une boucle générique. Le Claude Agent
      SDK fournit un harnais complet mais pas de mécanisme d'audit personnalisé prêt à
      l'emploi pour ce cas précis.

  - prompt: |
      Une équipe veut déléguer la mécanique de la boucle agentique (parsing de
      `stop_reason`, typage, retries de bas niveau) à un SDK, sans écrire cette logique à la
      main. Elle ne veut en revanche **aucun outil intégré** (pas de fichiers, pas de bash) :
      seuls ses propres outils métier doivent être exposés, exécutés sur son infrastructure
      interne, sans dépendre d'un sandbox hébergé par Anthropic.

      Quelle option correspond à ce besoin ?
    options:
      - "Managed Agents, car il fournit exactement les outils nécessaires sans rien construire soi-même."
      - "Une boucle manuelle sur l'API Messages, seule option sans outil intégré imposé."
      - "Le Tool Runner du SDK : il gère la mécanique de boucle et le typage, mais n'apporte aucun outil intégré — seuls les outils déclarés par l'équipe sont exposés, sur son infrastructure propre."
      - "Le Claude Agent SDK, dont les outils intégrés fichiers/bash peuvent être désactivés un par un."
    answer: 2
    level: intermediaire
    tags: [agents, sdk]
    explanation: >
      Le Tool Runner du SDK gère précisément la mécanique de boucle (le point que l'équipe
      ne veut pas réécrire) sans imposer aucun outil intégré : seuls les outils déclarés par
      l'équipe sont exposés, exécutés sur son infrastructure. Managed Agents (option 0) est
      hébergé par Anthropic, ce que l'équipe exclut explicitement. Une boucle manuelle
      (option 1) obligerait l'équipe à réécrire elle-même la mécanique qu'elle veut
      déléguer. Le Claude Agent SDK (option 3) fournit un harnais complet avec des outils
      intégrés par défaut — les désactiver un par un est un contournement inutile alors que
      le Tool Runner n'en propose aucun nativement.

  - prompt: |
      Une équipe de veille scientifique construit un agent qui explore et synthétise la
      littérature académique sur un sujet donné, une tâche qui peut prendre huit à dix
      heures. Un analyste peut fermer son ordinateur portable en cours de route ; l'agent
      doit alors pouvoir reprendre exactement là où il s'était arrêté, sans perdre les
      documents déjà lus ni les notes déjà rédigées. L'équipe ne veut ni construire ni
      maintenir sa propre infrastructure de sandbox pour exécuter les outils de recherche
      et de lecture de documents.

      Quelle option est la mieux adaptée ?
    options:
      - "Le Tool Runner du SDK, qui gère automatiquement la persistance de session en mémoire."
      - "Managed Agents : sessions à état persistant et sandbox hébergé par Anthropic (ou auto-hébergé sur demande), pensé précisément pour les tâches longues reprises après interruption."
      - "Le Claude Agent SDK, dont le sandbox est hébergé par Anthropic pour ce type de tâche longue."
      - "Une boucle manuelle avec une base de données maison pour stocker l'état entre les interruptions."
    answer: 1
    level: avance
    tags: [agents, orchestration]
    explanation: >
      Managed Agents propose des sessions à état persistant et un sandbox hébergé par
      Anthropic (ou auto-hébergé sur demande) — exactement le cas d'usage d'une tâche
      longue, interrompue par la fermeture d'un poste de travail puis reprise, sans
      infrastructure à construire. Le Tool Runner ne gère aucune persistance de session,
      juste la mécanique de boucle en mémoire : fermer l'ordinateur y ferait perdre l'état.
      Le Claude Agent SDK est hébergé par **toi**, pas par Anthropic : l'équipe devrait
      construire elle-même le sandbox, contraire à l'exigence. Une boucle manuelle avec une
      base de données maison imposerait de construire soi-même toute la persistance, ce que
      l'équipe cherche justement à éviter.

  - prompt: |
      Un éditeur de logiciels de santé veut construire un agent interne « clinical-ops »
      capable de lire/modifier des fichiers de configuration de déploiement, exécuter des
      commandes shell, se connecter à des serveurs MCP internes (dossier patient anonymisé,
      registre de lots de médicaments) et déléguer certaines sous-tâches à des sous-agents —
      en somme, reproduire les capacités de Claude Code, hébergées entièrement sur son
      propre cluster on-premise pour respecter des contraintes de résidence des données.

      Quelle option correspond structurellement à ce besoin ?
    options:
      - "Le Tool Runner du SDK, qui inclut nativement les mêmes outils que Claude Code."
      - "Le Claude Agent SDK, qui fournit précisément le harnais de Claude Code (outils intégrés fichiers/bash, MCP, sous-agents) en librairie, à héberger sur sa propre infrastructure on-premise."
      - "Managed Agents, seule option proposant des outils fichiers et bash prêts à l'emploi."
      - "Une boucle manuelle, pour repartir de zéro sans dépendance à un harnais existant."
    answer: 1
    level: avance
    tags: [agents, sdk]
    explanation: >
      Le Claude Agent SDK est exactement le harnais de Claude Code packagé en librairie :
      outils intégrés fichiers/bash, intégration MCP et sous-agents, à héberger sur sa
      propre infrastructure — ce qui correspond mot pour mot à la contrainte de résidence
      des données on-premise décrite. Le Tool Runner ne fournit aucun outil intégré : il
      faudrait tout réécrire à la main, contrairement à ce qu'affirme cette option. Managed
      Agents fournit bien des outils intégrés similaires, mais héberge par défaut le sandbox
      **chez Anthropic** — et même avec un sandbox auto-hébergé, la boucle d'orchestration
      reste côté Anthropic, ce qui contredit l'exigence on-premise. Une boucle manuelle
      imposerait de réimplémenter tous ces outils, sans bénéfice pour ce besoin précis.

  - prompt: |
      Un agent d'infrastructure retente 15 fois d'affilée la même commande `terraform apply`
      qui échoue systématiquement pour la même raison, sans jamais changer d'approche, en
      consommant du budget à chaque tentative.

      Quelle est la correction structurelle attendue ?
    options:
      - "Ajouter dans le system prompt une consigne demandant à l'agent d'être plus prudent avant de retenter."
      - "Combiner un max_iterations qui borne la boucle, une replanification forcée après des échecs répétés sur la même approche, et une escalade humaine avant toute nouvelle tentative."
      - "Réduire max_tokens pour limiter la longueur de chaque réponse générée."
      - "Ne rien changer : stop_reason: refusal finira par interrompre la boucle automatiquement."
    answer: 1
    level: intermediaire
    tags: [agents, orchestration, reliability]
    explanation: >
      Face à des échecs répétés sur la même approche, la réponse structurelle combine une
      limite dure d'itérations (max_iterations), une replanification forcée plutôt que de
      laisser l'agent insister sur la même action, et une escalade humaine. Une consigne de
      prudence dans le prompt (option 0) reste une recommandation non contraignante, pas un
      garde-fou fiable. Réduire max_tokens (option 2) ne borne pas le nombre d'itérations,
      seulement la longueur d'une réponse. refusal (option 3) est un stop_reason lié au
      refus de contenu du modèle, sans rapport avec une boucle applicative qui retente une
      commande.

  - prompt: |
      Une plateforme e-commerce doit générer, chaque heure, un email de relance
      personnalisé pour chacun des 500 paniers abandonnés de la dernière heure. Chaque
      panier est indépendant des autres (le contenu d'un email ne dépend d'aucune
      information sur les autres paniers). Le développeur les traite actuellement un par
      un, dans une boucle séquentielle, avec un seul agent qui accumule l'historique complet
      de tous les paniers précédents dans son contexte.

      Quelle amélioration structurelle est attendue ?
    options:
      - "Garder un traitement séquentiel mais réduire le nombre d'outils disponibles à l'agent."
      - "Passer à un unique appel contenant les 500 paniers concaténés dans un seul prompt."
      - "Ajouter un tool_choice: none pour accélérer le traitement de chaque panier."
      - "Déléguer chaque panier à un sous-agent en fan-out parallèle, avec un contexte isolé, puisque les paniers sont indépendants et qu'aucun n'a besoin de l'historique des précédents."
    answer: 3
    level: intermediaire
    tags: [agents, subagents]
    explanation: >
      Des paniers indépendants, sans dépendance entre eux, sont le cas d'usage typique du
      fan-out parallèle en sous-agents : chacun est traité dans un contexte isolé, sans
      accumuler inutilement l'historique des précédents, ce qui réduit la latence totale.
      Garder un traitement séquentiel avec mémoire complète fait grossir le contexte pour
      rien ; réduire les outils ne corrige pas ce problème structurel. Concaténer 500
      paniers dans un seul prompt pose un risque de perte de qualité (« needle in a
      haystack ») et de dépassement de fenêtre. tool_choice: none empêcherait tout appel
      d'outil, contraire au besoin de traiter les paniers.

  - prompt: |
      Un agent traite une demande qui a besoin de tout l'historique déjà accumulé dans la
      conversation principale (des dizaines de tours précédents), et dont le résultat
      détaillé sera directement réutilisé dans les tours suivants du même fil. Un
      développeur propose malgré tout de déléguer cette étape à un sous-agent, « par souci
      de propreté architecturale ».

      Quelle est l'évaluation la plus juste ?
    options:
      - "Déléguer systématiquement, car isoler toute sous-tâche dans un sous-agent est toujours une bonne pratique."
      - "Déléguer, mais réduire au minimum les outils du sous-agent pour compenser le couplage."
      - "Déléguer de façon asynchrone, pour ne pas bloquer le fil principal pendant le traitement."
      - "Travailler directement dans le contexte principal : la sous-tâche a besoin de tout l'historique déjà accumulé et son résultat détaillé sera réutilisé ensuite — déléguer ajouterait de la latence et de la complexité sans bénéfice ici."
    answer: 3
    level: avance
    tags: [agents, subagents]
    explanation: >
      La bonne raison de déléguer à un sous-agent est d'isoler du contexte non réutile ;
      ici, c'est l'inverse : la sous-tâche a besoin de tout l'historique déjà présent et son
      résultat détaillé sera réutilisé, donc le sous-agent devrait recevoir un contexte
      qu'il n'a pas ou l'orchestrateur devrait réintégrer tout le détail perdu à
      l'isolation. Déléguer systématiquement (option 0) ignore ce critère de contexte.
      Restreindre les outils (option 1) ne compense en rien le couplage au contexte
      principal. La délégation asynchrone (option 2) résout un problème de blocage, pas de
      dépendance au contexte — sans rapport avec le scénario décrit.

  - prompt: |
      Une tâche se décompose en deux étapes : trouver un fichier de configuration
      correspondant à un critère donné, puis analyser son contenu pour en extraire une
      information précise. La seconde étape a besoin du résultat exact de la première pour
      s'exécuter.

      Quel pattern de sous-agents correspond à ce cas ?
    options:
      - "Un pattern séquentiel : le résultat de la première étape (trouver le fichier) conditionne l'exécution de la seconde (l'analyser)."
      - "Un pattern parallèle (fan-out), puisque deux sous-agents peuvent travailler en même temps sur ces deux étapes."
      - "Une délégation asynchrone, pour ne pas bloquer le fil principal pendant la recherche du fichier."
      - "Aucun sous-agent n'est nécessaire ici, un seul appel simple suffit toujours pour deux étapes dépendantes."
    answer: 0
    level: intermediaire
    tags: [agents, subagents]
    explanation: >
      Le pattern séquentiel s'applique quand les étapes dépendent les unes des autres :
      ici, la seconde étape (analyser le fichier) ne peut démarrer qu'une fois le fichier
      trouvé par la première. Le fan-out parallèle (option 1) suppose des items
      indépendants, ce qui n'est pas le cas ici puisque la seconde étape a besoin du
      résultat de la première. La délégation asynchrone (option 2) répond à un besoin de ne
      pas bloquer sur une tâche longue dont seul le résultat final compte, pas à une
      dépendance stricte entre deux étapes. L'option 3 ignore que la nature dépendante des
      étapes peut justifier une décomposition en sous-agents, selon le volume de contexte
      en jeu.

  - prompt: |
      Un sous-agent lance un build complet d'une application, une opération qui prend
      environ 20 minutes. L'orchestrateur n'a besoin d'aucune information intermédiaire
      pendant ce temps : seul le résultat final (succès ou liste des erreurs) l'intéresse,
      et il peut continuer à traiter d'autres aspects de la tâche en attendant.

      Quel pattern de délégation correspond le mieux à ce cas ?
    options:
      - "Un pattern séquentiel classique, puisqu'une seule étape est concernée."
      - "Une délégation asynchrone : l'orchestrateur lance le sous-agent en tâche de fond et ne bloque pas sur les étapes intermédiaires, seul le résultat final compte."
      - "Un pattern parallèle (fan-out), en lançant plusieurs copies du même sous-agent de build."
      - "Un appel simple, la tâche ne nécessitant pas de sous-agent dédié."
    answer: 1
    level: avance
    tags: [agents, subagents]
    explanation: >
      La délégation asynchrone correspond exactement à ce cas : une tâche longue dont le
      résultat n'est nécessaire qu'à la fin, permettant à l'orchestrateur de continuer sans
      bloquer sur chaque étape intermédiaire du build. Le pattern séquentiel (option 0) ne
      capture pas l'aspect « ne pas bloquer » du besoin. Le fan-out parallèle (option 2)
      suppose plusieurs items indépendants à traiter simultanément, alors qu'il n'y a ici
      qu'un seul build. Un appel simple (option 3) ne convient pas à une opération de 20
      minutes nécessitant l'exécution d'outils (build) dans un contexte isolé.

  - prompt: |
      Un agent RH s'apprête à exécuter une opération de nettoyage qui va supprimer en masse
      des fiches employé jugées « doublons » dans la base de paie de production, après
      plusieurs tentatives infructueuses de correction plus fine du même problème de
      déduplication.

      Quel garde-fou structurel correspond le mieux à ce scénario à fort coût d'erreur ?
    options:
      - "Laisser l'agent continuer : le coût d'une itération supplémentaire est négligeable face au temps gagné."
      - "Un gate humain obligatoire avant toute action irréversible à fort coût d'erreur, combiné à un max_iterations qui aurait dû arrêter la boucle plus tôt — pas une simple consigne de prudence."
      - "Ajouter une instruction dans le system prompt demandant d'être prudent avant toute suppression de fiche employé."
      - "Réduire max_tokens pour empêcher l'agent de formuler la commande de suppression."
    answer: 1
    level: avance
    tags: [agents, reliability]
    explanation: >
      Face à une action irréversible à fort coût d'erreur (suppression en masse de fiches
      employé en production) après des échecs répétés sur la même approche, la réponse
      structurelle combine un gate humain systématique avant exécution et une borne
      d'itérations qui aurait dû interrompre la boucle plus tôt. Laisser l'agent continuer
      ignore le coût d'erreur très élevé décrit. Une instruction de prudence dans le prompt
      reste non contraignante : rien ne garantit qu'elle soit suivie à la lettre. Réduire
      max_tokens ne bloque pas l'exécution d'un outil, cela ne fait que tronquer la longueur
      de la réponse générée.

  - prompt: |
      Une tâche consiste à reformater un rapport hebdomadaire selon un gabarit fixe, à
      partir d'une source de données dont le format ne change jamais d'une semaine à
      l'autre. Une équipe propose de construire un agent complet, avec une boucle autonome
      et cinq outils différents, « pour plus de robustesse ».

      Quelle est l'évaluation la plus juste de cette proposition ?
    options:
      - "C'est justifié : plus un système a d'outils, plus il est robuste face aux imprévus."
      - "C'est justifié, à condition d'ajouter aussi un outil de validation croisée supplémentaire."
      - "C'est justifié uniquement si la source de données change de format d'une exécution à l'autre."
      - "Ce n'est pas justifié : le chemin de résolution est fixe et connu à l'avance (un gabarit, une source stable), un appel simple ou un petit workflow suffit — l'agent avec plusieurs outils est de l'over-engineering."
    answer: 3
    level: intermediaire
    tags: [agents, orchestration]
    explanation: >
      Le chemin de résolution (un gabarit fixe, une source de données stable) est connu à
      l'avance : un appel simple ou, au pire, un petit workflow suffit largement, sans
      boucle autonome ni multiplication d'outils. L'option 0 relève d'un raisonnement faux
      et généralisé : plus d'outils n'est pas synonyme de plus de robustesse, surtout sur
      une tâche déterministe. L'option 1 ajoute encore de la complexité inutile. L'option 2
      pose une condition qui, si elle était vraie, changerait effectivement l'analyse, mais
      l'énoncé précise explicitement que le format ne change jamais.

  # ===================== CLAUDE CODE CONFIGURATION (12) =====================
  - prompt: |
      Une équipe de développeurs Symfony veut documenter, pour tous les membres du projet,
      les conventions d'architecture du dépôt ainsi que les commandes exactes de build et de
      tests à lancer avant de committer.

      Où cette information doit-elle être placée pour bénéficier automatiquement à toute
      l'équipe ?
    options:
      - "Dans ./CLAUDE.md ou ./.claude/CLAUDE.md (portée projet), commité dans le dépôt pour que toute l'équipe en bénéficie automatiquement."
      - "Dans ~/.claude/CLAUDE.md, pour que chaque développeur l'adapte ensuite à sa convenance."
      - "Dans ./CLAUDE.local.md, pour itérer rapidement sans impacter les autres."
      - "Dans une skill personnelle en ~/.claude/skills/, plus rapide à écrire qu'un CLAUDE.md."
    answer: 0
    level: intermediaire
    tags: [claude-code]
    explanation: >
      Un CLAUDE.md en portée projet, versionné dans le dépôt, est découvert automatiquement
      par Claude Code chez tous les collaborateurs — exactement le besoin d'une convention
      d'équipe partagée. ~/.claude/CLAUDE.md (option 1) ne profite qu'à son auteur, il
      faudrait le dupliquer pour chaque développeur. CLAUDE.local.md (option 2) est
      justement pensé pour rester local et gitignoré, pas partagé. Une skill personnelle
      (option 3) ne serait découverte que par son auteur, pas par toute l'équipe.

  - prompt: |
      Un projet possède un ./CLAUDE.md de portée projet qui indique « utiliser npm pour
      toutes les commandes ». Un développeur ajoute, dans son propre ./CLAUDE.local.md du
      même dépôt, « utilise pnpm pour cette expérimentation personnelle ».

      Comment Claude Code traite-t-il ces deux fichiers ?
    options:
      - "Le CLAUDE.local.md remplace entièrement les instructions du CLAUDE.md de projet pour ce développeur."
      - "Les deux fichiers sont concaténés dans le contexte (pas d'écrasement) ; à l'intérieur d'un même répertoire, CLAUDE.local.md est ajouté en dernier, mais l'instruction de projet reste également présente et partagée avec le reste de l'équipe."
      - "Le CLAUDE.md de projet est ignoré tant qu'un CLAUDE.local.md existe dans le même dossier."
      - "Les deux fichiers entrent en conflit et Claude Code refuse de démarrer la session."
    answer: 1
    level: avance
    tags: [claude-code]
    explanation: >
      Tous les fichiers CLAUDE.md découverts sont concaténés dans le contexte, pas
      simplement écrasés ; à l'intérieur d'un même répertoire, le fichier local est ajouté
      en dernier, mais le fichier de projet reste présent et continue de s'appliquer pour
      toute l'équipe. L'option 0 décrit un remplacement qui n'a pas lieu : les deux
      coexistent. L'option 2 inverse la logique de concaténation. L'option 3 invente un
      comportement de blocage qui n'existe pas : Claude Code démarre normalement avec les
      deux fichiers chargés.

  - prompt: |
      Une skill `commit-conventions/SKILL.md` a pour description « Helps with commits. ».
      L'équipe constate que Claude ne l'invoque jamais automatiquement, même quand un
      développeur demande explicitement de l'aide pour rédiger un message de commit.

      Quelle est la correction structurelle attendue ?
    options:
      - "C'est normal : les skills ne se déclenchent jamais automatiquement, seulement via /nom-skill."
      - "Il faut déplacer la skill en portée utilisateur pour qu'elle se déclenche automatiquement."
      - "Il faut convertir la skill en sous-agent, seul mécanisme à déclenchement automatique."
      - "Il faut réécrire la description pour qu'elle précise explicitement quand l'invoquer (ex. « Use when the user asks to write a commit message or review commit conventions »), c'est ce signal qui permet le déclenchement automatique."
    answer: 3
    level: intermediaire
    tags: [claude-code, skills]
    explanation: >
      La description d'une skill est le signal qui permet à Claude de la déclencher
      automatiquement quand il juge la tâche en cours pertinente ; une description vague
      comme « Helps with commits. » ne donne aucun signal exploitable, il faut la rendre
      prescriptive sur le quand. Prétendre que les skills ne se déclenchent jamais
      automatiquement est faux : le déclenchement automatique existe bel et bien, il dépend
      justement de la qualité de la description. Changer la portée de la skill n'a aucun
      effet sur le déclenchement automatique, seulement sur son partage avec l'équipe.
      Convertir la skill en sous-agent change de mécanisme sans nécessité : les sous-agents
      se déclenchent eux aussi via leur propre champ description, pas différemment sur ce
      point.

  - prompt: |
      Un nouvel arrivant découvre un fichier `.claude/commands/deploy.md` dans le dépôt et
      pense qu'il s'agit d'un artefact cassé de l'ancien système de commandes personnalisées,
      à migrer en urgence vers le nouveau système de skills.

      Quelle est l'évaluation correcte de la situation ?
    options:
      - "Le nouvel arrivant a raison : les anciens slash commands ne fonctionnent plus et doivent être migrés en urgence."
      - "Le fichier doit être supprimé, car seules les skills en .claude/skills/ sont reconnues par les versions récentes de Claude Code."
      - "Le fichier doit être déplacé en portée utilisateur pour continuer à fonctionner."
      - "Ce n'est pas un problème urgent : un slash command et une skill produisent la même commande /deploy et fonctionnent de façon identique ; migrer vers .claude/skills/ n'apporterait que des fonctionnalités additionnelles optionnelles."
    answer: 3
    level: intermediaire
    tags: [claude-code, skills]
    explanation: >
      Les anciens slash commands (.claude/commands/) et les skills (.claude/skills/)
      produisent la même commande et fonctionnent de façon identique — les skills ajoutent
      seulement des fonctionnalités optionnelles (ressources associées, déclenchement
      automatique, contrôle fin). L'option 0 exagère un problème inexistant : le fichier
      fonctionne toujours. L'option 1 est fausse, ces fichiers restent parfaitement
      reconnus. L'option 2 n'a aucun sens : la portée n'a pas d'impact sur la
      reconnaissance de ce format, seulement sur le partage avec l'équipe.

  - prompt: |
      Une équipe crée un sous-agent `test-runner` chargé uniquement de lancer la suite de
      tests via `npm test`. Elle veut être certaine qu'il ne pourra **jamais**, même par
      erreur d'interprétation d'une consigne ambiguë, modifier un fichier du projet.

      Quelle configuration garantit structurellement ce comportement ?
    options:
      - "Restreindre tools: à Bash dans le front-matter du sous-agent (en omettant Write et Edit), combiné à une permission allow ciblée sur la commande de test — une garantie structurelle, pas une instruction textuelle dans le prompt."
      - "Ajouter dans le corps du prompt du sous-agent : « N'édite jamais aucun fichier, seulement les tests »."
      - "Laisser tools: non défini pour hériter de tous les outils, en faisant confiance à la description du sous-agent."
      - "Ajouter un hook PostToolUse qui annule toute édition faite par ce sous-agent après coup."
    answer: 0
    level: intermediaire
    tags: [claude-code, subagents, permissions]
    explanation: >
      Restreindre tools: dans le front-matter est une garantie structurelle : Write et Edit
      ne sont physiquement pas exposés au sous-agent, il ne peut donc pas les invoquer,
      quelle que soit l'ambiguïté d'une consigne. Une instruction textuelle (option 1) reste
      une recommandation que le modèle pourrait ne pas suivre à la lettre. Omettre tools:
      (option 2) hérite de tous les outils, l'inverse exact du besoin. Un hook PostToolUse
      (option 3) agirait après l'exécution — trop tard si une édition a déjà eu un effet de
      bord.

  - prompt: |
      Un sous-agent `changelog-summarizer` est invoqué très fréquemment sur des diffs
      triviaux (renommage de variable, correction de typo). L'équipe veut réduire son coût
      sans toucher au modèle utilisé par la conversation principale.

      Quelle configuration répond au besoin ?
    options:
      - "Réduire max_tokens du sous-agent, qui contrôle indirectement le modèle utilisé."
      - "Définir model: haiku dans le front-matter de ce sous-agent uniquement, indépendamment du modèle utilisé par la conversation principale."
      - "Changer le modèle de la conversation principale vers Haiku, ce qui s'appliquera aussi au sous-agent."
      - "Restreindre tools: du sous-agent, ce qui réduit automatiquement son coût par appel."
    answer: 1
    level: avance
    tags: [claude-code, subagents]
    explanation: >
      Le champ model: du front-matter d'un sous-agent est indépendant du modèle de la
      conversation principale : le définir sur haiku pour ce seul sous-agent réduit le coût
      des invocations fréquentes sur des tâches simples, sans impacter le reste de la
      session. max_tokens (option 0) ne change pas le modèle utilisé, seulement la longueur
      de sortie autorisée. Changer le modèle principal (option 2) impacterait toute la
      conversation, pas seulement ce sous-agent. Restreindre tools: (option 3) limite les
      capacités du sous-agent, sans effet direct sur le tarif du modèle appelé.

  - prompt: |
      Une équipe veut qu'un contrôle personnalisé (une logique de validation plus riche
      qu'un simple motif Bash) vérifie chaque tentative de push avant qu'elle n'atteigne
      réellement le dépôt distant, et bloque l'opération si nécessaire. Elle hésite entre
      implémenter ce contrôle via un hook `PreToolUse` ou un hook `PostToolUse`.

      Quel choix est correct, et pourquoi ?
    options:
      - "Un hook PostToolUse, car il s'exécute après coup et peut donc annuler la commande si le contrôle personnalisé échoue."
      - "Un hook Stop, car il se déclenche à la fin du tour de Claude, avant que la commande n'ait été exécutée."
      - "Aucun des deux : seule une règle deny statique dans settings.json peut appliquer un contrôle sur une commande Bash."
      - "Un hook PreToolUse, car il s'exécute avant l'exécution de l'outil et peut bloquer l'appel si le contrôle personnalisé échoue ; un PostToolUse arriverait après que le push a déjà atteint le dépôt distant."
    answer: 3
    level: avance
    tags: [claude-code, hooks]
    explanation: >
      PreToolUse s'exécute avant l'exécution de l'outil et peut bloquer l'appel : c'est le
      seul point du cycle de vie qui permet d'empêcher un push déjà signé de partir vers le
      dépôt distant. Un hook PostToolUse s'exécute après le succès de l'outil — le push a
      déjà eu lieu, il ne peut plus être proprement « annulé ». Un hook Stop se déclenche à
      la fin du tour de Claude, potentiellement après plusieurs appels d'outils, bien trop
      tard. Miser uniquement sur une règle deny statique est insuffisant : les hooks
      permettent justement d'exécuter une logique de validation personnalisée, au-delà de ce
      qu'une règle deny statique par motif peut exprimer.

  - prompt: |
      Un hook `PostToolUse` relance systématiquement un dry-run complet des migrations de
      base de données (45 secondes) après **chaque** commande `Bash`, y compris pour des
      commandes anodines comme `ls` ou `git status`, sans aucun rapport avec une migration.
      L'équipe se plaint que chaque commande shell devient anormalement lente.

      Quelle est la meilleure correction structurelle ?
    options:
      - "Supprimer le hook entièrement, pour ne plus être ralenti."
      - "Cibler le hook avec un matcher/if plus précis sur les commandes réellement liées aux migrations (en excluant par exemple ls, git status, cat), et/ou déplacer le dry-run complet en CI en ne gardant qu'un contrôle rapide dans le hook."
      - "Passer l'événement du hook de PostToolUse à PreToolUse, ce qui résout le ralentissement."
      - "Augmenter max_tokens pour que Claude Code termine plus vite malgré le hook."
    answer: 1
    level: intermediaire
    tags: [claude-code, hooks]
    explanation: >
      Un hook lent bloque le flux à chaque déclenchement : la correction structurelle est
      de restreindre son champ d'application (matcher/if sur les commandes réellement liées
      aux migrations) et/ou de déplacer le dry-run lourd en CI, en gardant dans le hook un
      contrôle rapide et ciblé. Supprimer le hook fait perdre la garantie qu'il apportait.
      Changer l'événement en PreToolUse ne change rien à la durée d'exécution du hook,
      seulement à quand il se déclenche. max_tokens régit la génération du modèle, sans
      rapport avec la durée d'exécution d'un hook.

  - prompt: |
      Le fichier `.claude/settings.json` d'un projet contient une règle
      `"deny": ["Bash(rm -rf *)"]`. Un développeur, pressé, ajoute dans son propre
      `.claude/settings.local.json` une règle `"allow": ["Bash(rm -rf *)"]` pour « se
      débloquer rapidement ».

      Que se passe-t-il réellement ?
    options:
      - "La commande reste bloquée : une règle deny provenant de n'importe quelle portée est évaluée avant les règles allow, et l'emporte toujours, même si l'allow vient d'un fichier de portée différente."
      - "La commande est désormais autorisée, car settings.local.json a une priorité plus forte que settings.json de projet."
      - "Les deux règles s'annulent et Claude Code demande une confirmation manuelle à chaque fois."
      - "La règle allow locale s'applique uniquement en dehors des sessions headless, donc la commande reste bloquée seulement en CI."
    answer: 0
    level: avance
    tags: [claude-code, permissions]
    explanation: >
      Les règles deny, quelle que soit leur portée d'origine, sont évaluées avant les
      règles allow et l'emportent toujours : un deny de projet bloque un allow local, et
      inversement. L'option 1 inverse cette précédence, qui n'existe pas dans ce sens.
      L'option 2 invente un comportement de demande de confirmation qui ne correspond pas
      au fonctionnement réel (le deny bloque silencieusement, sans repasser par une
      confirmation). L'option 3 introduit une distinction headless/interactif qui n'a pas
      lieu d'être ici : le deny s'applique dans tous les contextes.

  - prompt: |
      Un projet open source publie un fichier `.mcp.json` à la racine de son dépôt public
      sur GitHub, pour connecter un serveur MCP interne qui synchronise des données vers un
      bucket S3. Le champ `env` de ce fichier contient une clé d'accès AWS écrite en clair,
      désormais visible de quiconque consulte le dépôt.

      Quel est le problème, et quelle est la correction attendue ?
    options:
      - "Aucun problème : un fichier .mcp.json de projet est justement prévu pour contenir ce type d'information partagée."
      - "Il suffit de renommer le fichier en .mcp.local.json pour le sécuriser automatiquement."
      - "La clé d'accès en clair fuite publiquement à quiconque consulte le dépôt (y compris son historique Git) ; il faut la référencer via une variable d'environnement dans le fichier partagé, ou configurer ce serveur en portée utilisateur (~/.claude.json, jamais commité)."
      - "Il faut désactiver MCP entièrement pour ce serveur et copier les données manuellement."
    answer: 2
    level: intermediaire
    tags: [claude-code, mcp, permissions]
    explanation: >
      .mcp.json en portée projet est versionné et donc lisible par quiconque a accès au
      dépôt — sur un dépôt public, littéralement par n'importe qui, y compris dans son
      historique Git : une clé d'accès AWS en clair y est une fuite immédiate et grave. La
      correction est de référencer une variable d'environnement, ou de déplacer la
      configuration sensible en portée utilisateur (~/.claude.json, jamais commité). Ignorer
      le problème ignore un risque de sécurité réel et déjà exposé publiquement. Renommer le
      fichier ne change rien à son statut de fichier suivi par Git ni à sa présence dans
      l'historique. Désactiver MCP abandonne la fonctionnalité au lieu de corriger le
      problème de fond.

  - prompt: |
      Un pipeline CI appelle `claude -p "Summarize this pull request"` puis doit extraire
      programmatiquement le coût de l'appel et l'identifiant de session pour les journaliser
      dans un tableau de bord interne.

      Quelle commande répond à ce besoin ?
    options:
      - "claude -p \"query\" seul, sans autre option : le format texte par défaut inclut déjà le coût et l'identifiant de session."
      - "claude -p \"query\" --continue, pour rattacher chaque exécution à la session précédente et en déduire le coût cumulé."
      - "claude -p \"query\" --output-format json, qui renvoie une sortie structurée incluant le résultat, le session_id et le coût, pensée pour être parsée par un script."
      - "claude -p \"query\" --verbose, qui affiche le détail de chaque étape interne dans le terminal."
    answer: 2
    level: intermediaire
    tags: [claude-code, headless]
    explanation: >
      --output-format json renvoie une sortie structurée incluant le résultat, l'identifiant
      de session et le coût, pensée pour être parsée par un script (ex. avec jq) — exactement
      le besoin décrit. Le format texte par défaut (option 0) ne fournit pas ces métadonnées
      structurées. --continue (option 1) reprend une session précédente, sans rapport avec
      l'extraction de métadonnées d'un appel donné. --verbose (option 3) affiche des détails
      d'exécution dans le terminal, pas une sortie structurée exploitable par un script.

  - prompt: |
      Une plateforme SaaS déclenche `claude -p` depuis une fonction serverless (AWS Lambda),
      une fois par requête API entrante, à partir d'une image de base partagée par toute
      l'équipe d'ingénierie. L'équipe veut garantir un comportement **strictement
      identique** à chaque invocation, indépendamment de tout hook, skill, plugin ou serveur
      MCP qu'un développeur aurait pu laisser configuré dans l'image de base.

      Quelle option répond à cette exigence de reproductibilité ?
    options:
      - "Ajouter --continue pour repartir d'un état propre à chaque invocation."
      - "Ajouter --verbose pour détecter toute configuration locale qui influencerait le résultat."
      - "Ajouter --bare, qui ignore la découverte automatique de hooks/skills/plugins/MCP/CLAUDE.md locaux et ne s'appuie que sur les flags passés explicitement — le comportement ne dépend alors plus de ce qui traîne dans l'image de base."
      - "Ajouter --output-format json, qui ignore automatiquement la configuration locale ambiante."
    answer: 2
    level: avance
    tags: [claude-code, headless]
    explanation: >
      --bare désactive la découverte ambiante de configuration (hooks, skills, plugins,
      serveurs MCP, CLAUDE.md) : le comportement ne dépend plus de ce qui se trouve dans
      l'image de base qui exécute la commande, seulement des flags fournis explicitement —
      exactement l'exigence de reproductibilité pour une fonction serverless partagée.
      --continue reprend une session précédente, contraire à un traitement indépendant par
      requête. --verbose affiche des détails d'exécution dans un terminal, il ne neutralise
      aucune configuration locale. --output-format contrôle le format de sortie, pas la
      configuration chargée.

  # ================ PROMPT ENGINEERING & STRUCTURED OUTPUT (12) ================
  - prompt: |
      Un outil interne remplit automatiquement un formulaire de ticket de support à partir
      d'un message client, en demandant dans le prompt : « Réponds uniquement en JSON avec
      les clés name, email et issue_type, sans aucune autre clé ». En production, le mapper
      qui consomme la réponse plante occasionnellement parce que l'objet JSON contient une
      clé supplémentaire inattendue.

      Quelle est la correction structurelle attendue ?
    options:
      - "Ajouter output_config: {format: {type: \"json_schema\", schema: {...}}} avec additionalProperties: false et les champs requis explicitement listés — seule garantie structurelle contre les clés inattendues."
      - "Reformuler l'instruction textuelle du prompt pour insister sur « seulement ces champs, rien d'autre »."
      - "Ajouter 5 exemples few-shot montrant un objet sans clé superflue."
      - "Demander au modèle de relire sa propre réponse avant de la renvoyer, dans une instruction finale."
    answer: 0
    level: intermediaire
    tags: [prompt-engineering, structured-output]
    explanation: >
      output_config.format avec additionalProperties: false garantit, via décodage
      contraint, qu'aucune clé en dehors du schéma déclaré ne peut apparaître — une garantie
      du serveur, pas une question de formulation. Reformuler l'instruction (option 1),
      ajouter des exemples (option 2) ou demander une auto-relecture (option 3) restent des
      optimisations de prompt probabilistes : elles réduisent le risque sans jamais
      l'éliminer, contrairement au schéma structuré.

  - prompt: |
      Un développeur ajoute `strict: true` à son outil `create_invoice`, mais oublie
      `additionalProperties: false` dans le schéma d'entrée. Au premier appel, la requête
      échoue systématiquement avec une erreur 400, alors qu'il s'attendait à ce que Claude
      s'exécute simplement sans la garantie renforcée du mode strict.

      Quelle est l'explication correcte ?
    options:
      - "C'est un bug de l'API : strict: true devrait fonctionner même sans additionalProperties: false, en dégradant simplement la garantie."
      - "additionalProperties: false (avec required correctement listé) est un prérequis structurel du mode strict : un schéma qui l'omet est rejeté avec une erreur 400 au moment de l'appel, il n'est jamais exécuté en mode dégradé."
      - "strict: true ne fonctionne que sur des schémas contenant uniquement des chaînes de caractères."
      - "Il faut aussi ajouter tool_choice: {\"type\": \"none\"} pour que strict s'applique pleinement."
    answer: 1
    level: avance
    tags: [prompt-engineering, structured-output]
    explanation: >
      additionalProperties: false est un prérequis structurel du mode strict, documenté
      comme tel : sans lui (ou sans required correctement renseigné), l'API ne peut pas
      compiler une grammaire de décodage contraint complètement déterminée et rejette la
      requête avec une erreur 400 — elle ne l'exécute jamais silencieusement en mode
      dégradé. Les champs absents de required restent utilisables comme paramètres
      optionnels du schéma, dans la limite documentée d'environ 24 paramètres optionnels au
      total par requête, toutes réparties entre schémas stricts et sorties JSON. Ce n'est
      donc pas un bug de l'API. strict: true ne se limite pas aux schémas de type chaîne de
      caractères. tool_choice: none empêcherait tout appel d'outil, ce qui est contraire au
      besoin d'appeler create_invoice.

  - prompt: |
      Un champ `postal_code` porte la contrainte `minLength: 5` dans un schéma utilisé avec
      `output_config.format`. Le modèle renvoie un JSON syntaxiquement valide (une chaîne de
      caractères), mais avec seulement 2 caractères pour ce champ.

      output_config.format aurait-il dû empêcher cette valeur ?
    options:
      - "C'est un bug de l'API : output_config.format aurait dû rejeter cette valeur."
      - "Il faut ajouter strict: true en plus de output_config.format pour que minLength soit respecté."
      - "Non : les contraintes de longueur comme minLength ne sont pas appliquées par le décodage contraint ; il faut valider ce champ côté client après réception, comme toute règle qui dépasse la forme structurelle du JSON."
      - "C'est normal uniquement si le modèle utilisé est un modèle léger de type Haiku."
    answer: 2
    level: avance
    tags: [prompt-engineering, structured-output]
    explanation: >
      Le décodage contraint garantit le type, la présence des champs requis et l'absence de
      propriétés additionnelles, mais pas les contraintes de valeur comme minLength,
      maxLength ou pattern : celles-ci doivent être validées côté client après réception.
      Ce n'est pas un bug de l'API (option 0). strict: true (option 1) concerne les
      paramètres d'un outil, pas le comportement de output_config.format, et ne couvre de
      toute façon pas non plus ce type de contrainte. Le comportement ne dépend pas du
      modèle utilisé (option 3).

  - prompt: |
      Une équipe doit reformater des notes de réunion en une structure de puces très
      spécifique et inhabituelle, difficile à décrire précisément en langage naturel, mais
      facile à montrer par l'exemple.

      Est-il pertinent d'ajouter quelques exemples few-shot au prompt ?
    options:
      - "Non, les exemples few-shot n'apportent jamais de valeur pour des tâches de reformulation."
      - "Non, il suffit d'ajouter un output_config.format pour garantir ce style précis."
      - "Oui : le format de sortie est ici ambigu à décrire en langage naturel, c'est exactement le cas où quelques exemples few-shot illustrant le style attendu aident réellement."
      - "Non, un seul exemple suffit toujours, peu importe la complexité du style demandé."
    answer: 2
    level: intermediaire
    tags: [prompt-engineering]
    explanation: >
      Les exemples few-shot aident précisément quand le format de sortie est ambigu à
      décrire en langage naturel — un style de puces inhabituel en est un cas typique.
      Affirmer que les exemples n'apportent jamais de valeur généralise à tort une règle qui
      dépend du contexte. output_config.format garantit une structure JSON, pas un style de
      mise en forme textuelle libre comme des puces stylisées. Fixer arbitrairement le
      nombre d'exemples à un seul ignore la complexité réelle du style à illustrer.

  - prompt: |
      Une tâche d'extraction utilise déjà `output_config.format` avec un schéma complet
      (types, champs requis, additionalProperties: false). L'équipe ajoute malgré tout 8
      exemples few-shot « pour être sûre », ce qui alourdit sensiblement le coût de chaque
      requête.

      Quelle est l'évaluation la plus juste de cet ajout ?
    options:
      - "C'est redondant : le schéma garantit déjà la forme de la sortie, les exemples n'apportent de valeur que pour orienter le contenu ou le style, pas la structure déjà garantie par le schéma."
      - "C'est indispensable : sans few-shot, output_config.format ne peut pas garantir la structure à lui seul."
      - "C'est redondant, mais uniquement si le modèle utilisé est Opus."
      - "C'est nécessaire pour que strict: true fonctionne correctement sur l'outil correspondant."
    answer: 0
    level: intermediaire
    tags: [prompt-engineering, structured-output]
    explanation: >
      output_config.format garantit déjà la structure via décodage contraint : les exemples
      few-shot n'ajoutent de valeur que pour le contenu ou le style, pas pour la forme déjà
      assurée par le schéma — leur ajout ici est un coût en tokens sans bénéfice
      structurel. L'option 1 inverse la réalité : output_config.format garantit la structure
      indépendamment de tout exemple. L'option 2 introduit une condition sur le modèle sans
      fondement. L'option 3 confond output_config.format (sortie texte) et strict: true
      (paramètres d'un outil), deux mécanismes distincts.

  - prompt: |
      Un assistant de FAQ interne préremplit systématiquement le tour assistant avec
      `"Answer: "` pour que chaque réponse commence directement par le contenu utile, sans
      phrase d'introduction. Après une migration vers un modèle récent, ces appels échouent
      systématiquement avec une erreur.

      Quelle est la cause, et la correction attendue ?
    options:
      - "Le format texte libre n'est plus supporté du tout par les modèles récents."
      - "Il manque le header bêta 'structured-outputs' dans la requête."
      - "Le préfill de la réponse assistant sur le dernier tour n'est plus supporté sur les modèles récents (erreur 400) ; il faut demander directement dans le system prompt de répondre sans phrase d'introduction, plutôt que de préremplir la réponse."
      - "Le problème vient de max_tokens, trop bas pour accepter un préfill."
    answer: 2
    level: avance
    tags: [prompt-engineering]
    explanation: >
      Sur les modèles récents, un message assistant préfillé sur le dernier tour est rejeté
      avec une erreur 400 : ce n'est plus une technique supportée. Pour éliminer la phrase
      d'introduction, la correction structurelle est une instruction directe dans le system
      prompt (« réponds directement par le contenu utile, sans phrase d'introduction »), pas
      un préfill. Le texte libre reste parfaitement supporté par ailleurs. Aucun header
      bêta de ce nom n'est requis ici. max_tokens n'a aucun rapport avec le rejet d'un
      préfill.

  - prompt: |
      Une équipe préremplissait historiquement le tour assistant avec le caractère `"{"`
      pour forcer le début d'un JSON. Après avoir migré vers un modèle récent, ces appels
      sont désormais rejetés avec une erreur.

      Quelle est la correction structurelle recommandée, au-delà de simplement contourner le
      rejet ?
    options:
      - "Il suffit de remplacer le préfill « { » par un préfill « [ » pour contourner le rejet."
      - "Il faut ajouter le header bêta 'json-prefill' pour réactiver ce comportement."
      - "output_config.format (structured outputs) : il garantit tout le schéma de sortie, pas seulement le premier caractère, et fonctionne sans dépendre d'un préfill devenu incompatible avec les modèles récents."
      - "Il faut revenir à un modèle plus ancien qui accepte encore les préfills, aucune autre solution n'existe."
    answer: 2
    level: avance
    tags: [prompt-engineering, structured-output]
    explanation: >
      output_config.format remplace structurellement l'usage historique du préfill pour
      forcer un format : il garantit tout le schéma, pas seulement le premier caractère, et
      ne dépend d'aucun préfill devenu incompatible. Remplacer « { » par « [ » (option 0) ne
      résout rien : le rejet porte sur le mécanisme de préfill lui-même, pas sur le
      caractère utilisé. Aucun header bêta de ce nom n'existe pour réactiver ce comportement
      (option 1). Revenir à un modèle plus ancien (option 3) est un contournement régressif,
      alors qu'une solution structurelle et pérenne existe.

  - prompt: |
      Un chatbot de support doit toujours répondre dans la langue détectée du client. Cette
      règle est actuellement ajoutée uniquement au dernier message utilisateur de chaque
      tour, jamais dans le system prompt. Après une quinzaine de tours d'une conversation
      longue, un audit constate que le chatbot répond parfois en anglais à des clients
      francophones.

      Quelle est la correction structurelle recommandée ?
    options:
      - "Répéter la règle dans chaque message utilisateur suivant, à chaque tour de la conversation."
      - "Limiter la conversation à 5 tours maximum pour éviter la dilution de la règle."
      - "Ajouter la règle comme description d'un outil, même si aucun outil de traduction n'est utilisé."
      - "Déplacer la règle dans le system prompt, qui porte l'autorité de l'opérateur et reste présent à chaque tour indépendamment de la longueur de la conversation."
    answer: 3
    level: intermediaire
    tags: [prompt-engineering]
    explanation: >
      Une règle métier destinée à s'appliquer à toute la conversation doit être placée dans
      le system prompt, qui porte l'autorité de l'opérateur et est envoyé à chaque appel,
      contrairement à une répétition dans un message utilisateur qui perd en priorité
      relative au fil d'une conversation longue. Répéter la règle à chaque tour (option 0)
      est une rustine coûteuse en tokens et fragile. Limiter le nombre de tours (option 1)
      ne traite pas la cause du problème. Ajouter la règle à la description d'un outil non
      utilisé (option 2) n'a aucun effet sur le comportement du modèle.

  - prompt: |
      Une équipe doit produire une relecture d'un contrat juridique complexe où un premier
      jet manque parfois des conflits de clauses subtils. Elle envisage un pipeline
      draft → critique → version finale, pour ce cas précis à fort enjeu.

      Est-ce une décision structurelle justifiée ?
    options:
      - "Oui : la tâche est complexe et à fort enjeu, une critique intermédiaire peut réellement améliorer la détection de conflits, le coût d'un appel supplémentaire est justifié."
      - "Non, un pipeline multi-pass double toujours le coût pour la même tâche, jamais justifié."
      - "Non, il suffirait d'ajouter output_config.format pour garantir qu'aucun conflit de clause n'est manqué."
      - "Oui, mais uniquement si le modèle utilisé est Haiku."
    answer: 0
    level: intermediaire
    tags: [prompt-engineering]
    explanation: >
      Un pipeline multi-pass se justifie quand la tâche est complexe et à fort enjeu et
      qu'une critique intermédiaire peut réellement améliorer la qualité — exactement le
      cas d'une relecture de contrat où des conflits subtils peuvent échapper à un premier
      jet. L'option 1 généralise à tort une règle de coût sans tenir compte de l'enjeu.
      output_config.format (option 2) garantit une structure de sortie, pas la profondeur
      d'analyse juridique d'un texte libre. Le choix du modèle (option 3) n'est pas le
      facteur qui détermine la pertinence d'un pipeline multi-pass.

  - prompt: |
      Une équipe doit traduire un court slogan marketing (« Simple. Rapide. Fiable. ») vers
      l'espagnol. Elle envisage malgré tout un pipeline draft → critique → version finale
      « pour être sûre », ce qui triple le coût et la latence pour cette tâche.

      Ce choix est-il justifié ?
    options:
      - "C'est justifié : toute tâche de traduction bénéficie systématiquement d'un pipeline multi-pass."
      - "C'est justifié uniquement si le slogan dépasse 10 mots."
      - "Ce n'est pas justifié, mais seulement parce qu'aucun schéma structuré n'est utilisé ici."
      - "Ce n'est pas justifié : la tâche est simple et à faible enjeu, la variabilité qu'un pipeline multi-pass corrige n'existe pas ici ; un appel simple suffit et coûte trois fois moins cher."
    answer: 3
    level: intermediaire
    tags: [prompt-engineering]
    explanation: >
      Un slogan court et un enjeu faible ne présentent pas la variabilité ou le risque
      qu'un pipeline multi-pass est censé corriger : un appel simple suffit, pour un coût
      trois fois moindre. Généraliser à toute traduction, sans distinguer la complexité ou
      l'enjeu, est une règle fausse. Poser un seuil de longueur de texte comme condition est
      arbitraire et sans fondement. Se rabattre sur l'absence de schéma structuré se trompe
      de raison : ce n'est pas l'absence d'un tel schéma qui rend le multi-pass injustifié,
      mais la simplicité et le faible enjeu de la tâche elle-même.

  - prompt: |
      Un outil `book_flight` porte `strict: true` avec un schéma valide. L'équipe veut, en
      plus de garantir des paramètres conformes, s'assurer qu'un outil sera **toujours**
      appelé à ce tour précis, sans jamais laisser Claude répondre uniquement en texte.

      Quelle combinaison de paramètres répond exactement à ce double besoin ?
    options:
      - "tool_choice: {\"type\": \"auto\"} seul, qui garantit déjà les deux propriétés par défaut."
      - "strict: true seul sur l'outil, sans toucher à tool_choice."
      - "tool_choice: {\"type\": \"any\"} combiné à strict: true sur la définition de l'outil : any garantit qu'un outil sera appelé, strict garantit que son entrée respectera le schéma."
      - "tool_choice: {\"type\": \"none\"} combiné à output_config.format."
    answer: 2
    level: avance
    tags: [prompt-engineering, structured-output]
    explanation: >
      any force l'appel d'un outil (peu importe lequel), et strict: true garantit que
      l'entrée de cet outil respecte le schéma déclaré : combinés, ils couvrent exactement
      les deux exigences. auto (option 0) laisse Claude libre de répondre en texte, sans
      garantir qu'un outil soit appelé. strict seul (option 1) ne force aucun appel d'outil,
      Claude pourrait toujours répondre en texte. none (option 3) empêche justement tout
      appel d'outil, contraire au besoin exprimé.

  - prompt: |
      Un outil `book_flight`, avec `strict: true`, garantit des paramètres structurellement
      valides. Mais une règle métier de l'entreprise limite le nombre total de passagers
      qu'un même client peut réserver par jour, toutes réservations confondues — une règle
      qui porte sur plusieurs appels successifs, impossible à exprimer dans un unique schéma
      JSON.

      Quelle est l'approche structurelle correcte pour appliquer cette règle ?
    options:
      - "Ajouter la règle de quota comme une simple description supplémentaire sur le champ passengers du schéma, strict: true la fera respecter."
      - "Ajouter minimum et maximum sur le champ passengers, ce qui suffit à couvrir une règle portant sur plusieurs appels."
      - "Répéter la règle de quota trois fois dans le system prompt pour renforcer son respect par le modèle."
      - "Valider cette règle métier côté client après réception (elle porte sur plusieurs appels, hors de portée d'un schéma unique) et renvoyer l'erreur au modèle dans une boucle de retry si une correction automatique est souhaitée."
    answer: 3
    level: avance
    tags: [prompt-engineering, structured-output]
    explanation: >
      Une règle qui porte sur l'agrégation de plusieurs appels ne peut, par nature, être
      exprimée dans le schéma d'un seul appel d'outil : elle doit être validée côté client,
      avec une boucle de retry qui renvoie l'erreur au modèle si une correction automatique
      est souhaitée. Une description de champ (option 0) reste une indication textuelle, non
      garantie par le décodage contraint. minimum/maximum (option 1) contraignent un seul
      appel, pas un cumul entre plusieurs réservations. Répéter la règle dans le system
      prompt (option 2) reste probabiliste, sans jamais garantir le respect effectif du
      quota.

  # ========================= TOOL DESIGN & MCP (11) =========================
  - prompt: |
      Un outil `close_ticket` porte la description `"Closes a support ticket."`. En
      production, Claude appelle parfois cet outil dès qu'un client écrit simplement
      « merci », alors que le ticket est toujours en cours de traitement.

      Quelle est la correction la plus pertinente ?
    options:
      - "Réécrire la description pour préciser explicitement quand l'appeler (seulement après confirmation explicite que le problème est résolu) et ce qui ne doit pas déclencher l'appel (un simple remerciement)."
      - "Passer tool_choice à {\"type\": \"none\"} pour empêcher tout appel accidentel de cet outil."
      - "Fusionner close_ticket avec un autre outil pour réduire les risques de confusion."
      - "Ajouter strict: true sur l'outil pour garantir qu'il n'est appelé qu'au bon moment."
    answer: 0
    level: intermediaire
    tags: [outils-mcp]
    explanation: >
      La description ne précise que ce que fait l'outil, pas quand l'appeler ni ce qui ne
      doit pas le déclencher : la corriger pour être prescriptive sur ces deux points est la
      correction structurelle attendue. tool_choice: none (option 1) empêcherait tout appel
      de l'outil, y compris les cas légitimes. Fusionner les outils (option 2) est une
      régression qui n'a rien à voir avec le problème de déclenchement. strict: true
      (option 3) garantit la conformité des paramètres, pas le bon moment d'appel.

  - prompt: |
      Une équipe veut que Claude puisse librement décider, selon la situation, de répondre
      directement en texte ou d'appeler un outil parmi ceux disponibles — le comportement
      standard, sans contrainte particulière.

      Quelle valeur de tool_choice correspond à ce besoin ?
    options:
      - "{\"type\": \"tool\", \"name\": \"...\"}, pour garder un contrôle total sur l'outil choisi."
      - "{\"type\": \"any\"}, pour s'assurer qu'un outil est toujours appelé."
      - "{\"type\": \"auto\"}, le comportement par défaut dès qu'un tableau tools est fourni : Claude décide librement d'appeler un outil ou de répondre en texte."
      - "{\"type\": \"none\"}, pour laisser Claude répondre uniquement en texte."
    answer: 2
    level: intermediaire
    tags: [outils-mcp, tool-choice]
    explanation: >
      auto est le comportement par défaut dès qu'un tableau tools est fourni : Claude
      décide librement d'appeler un outil ou de répondre en texte, exactement le besoin
      décrit. Forcer {"type": "tool", "name": "..."} impose un outil précis, retirant toute
      liberté de décision. {"type": "any"} force l'appel d'un outil, empêchant toute réponse
      en texte seul. {"type": "none"} empêche tout appel d'outil, l'inverse du comportement
      souhaité.

  - prompt: |
      Un développeur construit un répartiteur domotique : il force
      `tool_choice: {"type": "any"}` pour garantir qu'un des outils de contrôle d'appareil
      (lumière, chauffage, volet) est toujours appelé, et souhaite que Claude explique
      brièvement en texte lequel il choisit et pourquoi, avant le bloc `tool_use`. Il
      observe qu'aucun texte n'est jamais émis avant l'appel, malgré une instruction du
      prompt le demandant.

      Pourquoi, et quelle est la correction ?
    options:
      - "C'est un bug : ce type de tool_choice devrait toujours permettre du texte avant l'appel."
      - "Avec tool_choice de type any (ou tool), l'API préremplit le tour assistant pour forcer l'appel : aucun texte n'est émis avant le tool_use ; il faut rester en auto et guider via une instruction explicite dans le message utilisateur."
      - "Il faut passer disable_parallel_tool_use à true pour libérer un tour de texte avant l'outil."
      - "Il faut ajouter strict: true sur les outils pour autoriser un commentaire avant l'appel."
    answer: 1
    level: avance
    tags: [outils-mcp, tool-choice]
    explanation: >
      C'est un comportement documenté, pas un bug : any (comme tool) préremplit le tour
      pour garantir l'appel, ce qui empêche tout texte avant le tool_use ; la solution est
      de rester en auto et de pousser le comportement souhaité par une instruction explicite
      dans le message utilisateur. disable_parallel_tool_use contrôle uniquement le nombre
      d'outils appelés par tour, sans rapport avec l'émission de texte. strict concerne la
      conformité du schéma des paramètres, sans lien avec l'émission de texte avant l'appel.

  - prompt: |
      Un développeur écrit dans sa requête `{"disable_parallel_tool_use": true,
      "tool_choice": {"type": "auto"}}` directement au niveau racine de l'objet de requête.
      L'appel échoue avec une erreur 400 invalid_request_error signalant un champ inconnu,
      alors que le développeur pensait simplement désactiver l'appel parallèle d'outils.

      Quelle est la cause du problème ?
    options:
      - "C'est normal : disable_parallel_tool_use ne peut jamais être combiné avec tool_choice: auto."
      - "Le champ doit s'appeler parallel_tool_use: false, pas disable_parallel_tool_use."
      - "Il faut le placer dans input_schema de chaque outil, pas au niveau de la requête."
      - "disable_parallel_tool_use est un champ imbriqué DANS l'objet tool_choice, pas un paramètre de premier niveau : placé à la racine, l'API le rejette comme champ inconnu (400 invalid_request_error) ; il faut écrire {\"tool_choice\": {\"type\": \"auto\", \"disable_parallel_tool_use\": true}}."
    answer: 3
    level: avance
    tags: [outils-mcp, tool-choice]
    explanation: >
      disable_parallel_tool_use est un champ imbriqué dans l'objet tool_choice, pas un
      paramètre de premier niveau de la requête : l'API valide strictement la forme de la
      requête et rejette un champ inconnu placé à la racine avec une erreur 400
      invalid_request_error, elle ne l'ignore jamais silencieusement. Prétendre à une
      incompatibilité avec tool_choice: auto invente une règle qui n'existe pas ; combiné
      correctement à l'intérieur de tool_choice, il limite Claude à un seul outil par
      réponse. Le nom du champ est correct tel que documenté, ce n'est pas une erreur
      d'orthographe. input_schema décrit les paramètres d'un outil, pas le comportement de
      sélection d'outils au niveau de la requête.

  - prompt: |
      Une équipe implémente `is_error: true` pour son outil client `charge_payment` en cas
      d'échec. Elle envisage d'appliquer le même mécanisme aux réponses de l'outil serveur
      intégré `web_search`, pour signaler à Claude un échec de recherche.

      Est-ce nécessaire pour web_search ?
    options:
      - "Ce n'est pas nécessaire pour web_search : is_error ne s'applique qu'aux outils client ; les outils serveur gèrent leurs erreurs de façon transparente, sans tool_result à construire de ton côté."
      - "C'est nécessaire pour les deux, is_error s'applique identiquement à tout type d'outil."
      - "Ce n'est nécessaire que pour web_search, jamais pour un outil client comme charge_payment."
      - "is_error n'existe que pour les outils MCP, ni pour les outils client ni pour les outils serveur natifs."
    answer: 0
    level: intermediaire
    tags: [outils-mcp]
    explanation: >
      is_error s'applique uniquement aux outils client, ceux que le développeur exécute
      lui-même : pour un outil serveur comme web_search, exécuté chez Anthropic, les erreurs
      sont gérées de façon transparente, sans tool_result à construire. L'option 1 généralise
      à tort ce mécanisme aux outils serveur. L'option 2 inverse complètement la règle :
      c'est bien pour un outil client comme charge_payment que is_error est pertinent.
      L'option 3 est fausse : is_error concerne tout outil client, MCP ou non.

  - prompt: |
      Un outil client `send_sms_notification` appelle une passerelle télécom externe qui
      échoue de façon transitoire environ 12 % du temps (timeouts, erreurs 503
      momentanées). La seule mitigation actuelle de l'équipe est une ligne dans le system
      prompt : « Si l'envoi échoue, réessaie automatiquement jusqu'à ce que ça
      fonctionne ».

      Quelle est l'évaluation la plus juste de cette approche ?
    options:
      - "C'est suffisant : Claude relancera l'outil autant de fois que nécessaire d'après l'instruction du system prompt."
      - "C'est suffisant, à condition d'ajouter strict: true sur l'outil send_sms_notification."
      - "C'est insuffisant, mais uniquement parce qu'il manque un tool_choice: any qui forcerait la nouvelle tentative."
      - "C'est insuffisant : il faut un retry avec backoff côté harnais applicatif pour absorber les échecs transitoires, un is_error informatif pour les cas remontés, et une échappatoire (passerelle de secours ou escalade humaine) en cas d'échec persistant."
    answer: 3
    level: avance
    tags: [outils-mcp]
    explanation: >
      Compter sur une instruction de prompt pour gérer la résilience d'un outil externe est
      risqué et non structurel : la bonne réponse combine retry/backoff applicatif, is_error
      informatif, et une échappatoire pour les échecs persistants. Rien ne garantit que
      Claude relance effectivement l'outil un nombre de fois suffisant sur la seule foi
      d'une instruction non contraignante. strict: true ne concerne que la validité du
      schéma des paramètres, pas la résilience d'exécution face à des pannes transitoires.
      tool_choice: any force l'appel d'un outil, sans rapport avec la gestion des échecs
      transitoires d'exécution.

  - prompt: |
      Une équipe se demande si elle doit appliquer à l'outil serveur intégré
      `code_execution` les mêmes précautions de sandboxing et d'allowlist que celles mises
      en place pour son propre outil client `run_shell_command`.

      Quelle est la réponse correcte ?
    options:
      - "Oui, les deux s'exécutent chez le client et nécessitent exactement les mêmes précautions."
      - "Non, aucune précaution n'est jamais nécessaire pour un outil MCP ni serveur ni client."
      - "Non : code_execution s'exécute chez Anthropic (outil serveur), les précautions de sandboxing/allowlist ne concernent que les outils client comme run_shell_command, exécutés et sécurisés par toi."
      - "Oui, mais seulement si code_execution est combiné avec strict: true."
    answer: 2
    level: intermediaire
    tags: [outils-mcp]
    explanation: >
      code_execution est un outil serveur exécuté chez Anthropic : les précautions de
      sandboxing, d'allowlist et de validation de chemin ne concernent que les outils
      client comme run_shell_command, dont l'exécution et la sécurité relèvent entièrement
      du développeur. L'option 0 inverse la distinction serveur/client. L'option 1 ignore
      les précautions bien réelles nécessaires côté client. L'option 3 introduit une
      condition sans rapport : strict: true concerne la validité des paramètres, pas la
      sécurité d'exécution.

  - prompt: |
      Un développeur solo veut que Claude Code lise et écrive dans une base SQLite stockée
      localement sur son propre ordinateur, sans besoin de partager cette connexion avec qui
      que ce soit d'autre.

      Quel transport MCP est le plus adapté ?
    options:
      - "HTTP, le transport recommandé pour tout serveur MCP, y compris local."
      - "SSE, plus simple à configurer pour un usage strictement local."
      - "WebSocket, pour une connexion bidirectionnelle avec la base de données locale."
      - "stdio : le serveur tourne en process sur la même machine, sans besoin de réseau ni de partage avec une équipe."
    answer: 3
    level: intermediaire
    tags: [outils-mcp, mcp]
    explanation: >
      stdio est fait pour un serveur local, exécuté en process sur la même machine, sans
      réseau — exactement le besoin d'un développeur solo travaillant sur sa propre base
      SQLite locale. HTTP (option 0) est recommandé pour des services distants partagés, pas
      pour ce cas local. SSE (option 1) est de toute façon déprécié au profit de HTTP pour
      les services distants, et reste hors sujet pour un usage local. WebSocket (option 2)
      vise un push d'événements distant, sans rapport avec ce besoin strictement local.

  - prompt: |
      Un développeur déclare `tools=[{"type": "mcp_toolset", "mcp_server_name": "crm"}]`
      dans sa requête, mais oublie de déclarer le champ `mcp_servers` décrivant la connexion
      à ce serveur CRM. L'appel échoue.

      Quelle est l'explication correcte ?
    options:
      - "mcp_servers décrit la connexion (URL, authentification) et doit être déclaré séparément ; tools avec mcp_toolset ne fait qu'exposer les outils d'un serveur déjà déclaré dans mcp_servers — ce sont deux champs distincts et complémentaires."
      - "mcp_toolset suffit à lui seul, mcp_servers n'est nécessaire que pour les serveurs en transport stdio."
      - "Il faut remplacer mcp_toolset par tool_search_tool, seul type compatible avec un serveur MCP distant."
      - "Le problème vient d'un strict: true manquant sur l'entrée mcp_toolset."
    answer: 0
    level: avance
    tags: [outils-mcp, mcp]
    explanation: >
      mcp_servers décrit la connexion (URL, authentification) et mcp_toolset expose les
      outils d'un serveur déjà déclaré : ce sont deux champs distincts et complémentaires,
      les deux sont nécessaires. L'option 1 invente une exception liée au transport qui
      n'existe pas dans ce contexte d'appel API. tool_search_tool (option 2) sert à
      découvrir des outils à la demande, ce n'est pas un remplacement de mcp_toolset. strict
      (option 3) concerne la validité des paramètres d'un outil, sans rapport avec la
      déclaration de connexion MCP.

  - prompt: |
      Un outil MCP `list_all_orders` retourne d'un coup 50 000 lignes de résultats,
      saturant la fenêtre de contexte et ralentissant chaque tour suivant de la conversation.

      Quelle est la correction structurelle attendue ?
    options:
      - "Ajouter strict: true sur l'outil, pour limiter automatiquement le volume renvoyé."
      - "Passer tool_choice à {\"type\": \"none\"} pour empêcher Claude de rappeler cet outil."
      - "Paginer le résultat (retourner une page + un curseur de continuation), comme le ferait une bonne API REST, plutôt qu'un déversement complet en un seul appel."
      - "Activer le prompt caching sur le résultat de l'outil pour réduire son coût en tokens."
    answer: 2
    level: intermediaire
    tags: [outils-mcp, mcp]
    explanation: >
      Paginer (page + curseur de continuation) est la bonne pratique de conception d'un
      outil MCP qui peut retourner un volume important, exactement comme une API REST bien
      conçue. strict: true garantit la conformité des paramètres d'entrée, pas la taille de
      la sortie. tool_choice: none empêcherait tout appel de l'outil, le rendant
      inutilisable. Le prompt caching réduit le coût d'un préfixe réutilisé, il ne réduit
      pas le volume d'un résultat déjà généré dans le tour courant.

  - prompt: |
      Une entreprise de logistique expose 150 outils MCP répartis sur 8 serveurs de gestion
      d'entrepôts à un même agent. La précision de sélection d'outil se dégrade nettement,
      et chaque requête coûte un volume important de tokens dès le premier tour, avant même
      que la tâche ne commence. L'équipe veut résoudre le problème sans réduire les
      capacités fonctionnelles de l'agent.

      Quelle mesure structurelle est la plus adaptée ?
    options:
      - "Supprimer les outils les moins utilisés, en ne gardant que les 25 les plus fréquents."
      - "Marquer les outils peu utilisés avec defer_loading: true et ajouter un tool search tool (ex. tool_search_tool_regex_20251119) : Claude ne charge leur schéma complet qu'au moment où il les découvre par une recherche, réduisant drastiquement le coût initial tout en préservant la sélection."
      - "Fusionner les 150 outils en quelques outils génériques par entrepôt."
      - "Passer tool_choice à {\"type\": \"any\"} sur l'ensemble des 150 outils pour accélérer la sélection."
    answer: 1
    level: avance
    tags: [outils-mcp, mcp]
    explanation: >
      Le tool search (defer_loading + tool search tool, dont les types réels sont
      tool_search_tool_regex_20251119 et tool_search_tool_bm25_20251119) est fait
      précisément pour ce cas : il charge les schémas à la demande, réduit fortement le coût
      de tokens initial et préserve la précision de sélection en ne présentant que les
      outils pertinents. Supprimer des outils réduit les capacités, ce que la question
      exclut explicitement. Fusionner en outils génériques recrée un problème de
      description vague, difficile à utiliser correctement. tool_choice: any force un appel
      d'outil par tour, sans aucun effet sur le nombre de définitions chargées en contexte.

  # =================== CONTEXT MANAGEMENT & RELIABILITY (9) ===================
  - prompt: |
      Un microservice interne régénère la liste des définitions d'outils à partir d'une
      requête SQL sans `ORDER BY` : le contenu de chaque outil ne change jamais, mais leur
      ordre de sérialisation dans le tableau `tools` varie de façon non déterministe d'un
      appel à l'autre. Le system prompt et les messages restent par ailleurs rigoureusement
      identiques entre deux appels.

      Quelle est l'explication correcte ?
    options:
      - "Le cache suit la hiérarchie tools → system → messages : un changement à ce premier niveau — même un simple changement d'ordre non intentionnel — modifie le hash du préfixe dès ce point, invalidant en cascade tout ce qui suit, même si system et messages sont identiques mot pour mot."
      - "C'est sans effet : seul le contenu textuel des définitions d'outils compte pour le cache, jamais leur ordre."
      - "Cela n'a d'impact que si tool_choice est de type tool."
      - "Seul le niveau messages est affecté ; tools et system restent valides malgré le changement d'ordre."
    answer: 0
    level: avance
    tags: [contexte-fiabilite, prompt-caching]
    explanation: >
      La mise en cache suit la hiérarchie tools → system → messages : un changement au
      niveau tools, même un simple réordonnancement non intentionnel causé par une requête
      SQL sans tri stable, modifie le hash du préfixe dès ce niveau et invalide en cascade
      tout ce qui suit. Prétendre que seul le contenu textuel compte, jamais l'ordre, ignore
      que l'ordre de sérialisation fait partie du préfixe comparé. Conditionner l'effet au
      type de tool_choice n'a pas lieu d'être : c'est une propriété de la hiérarchie de
      cache elle-même, active dans tous les cas. Dire que seul messages est affecté inverse
      la cascade : c'est justement tools qui n'est pas épargné, entraînant l'invalidation de
      system et messages.

  - prompt: |
      Pour faciliter le traçage de ses journaux, une équipe insère un identifiant de
      corrélation aléatoire (`trace_id: <uuid>`) directement dans le bloc système mis en
      cache, au milieu des règles métier stables, couvert par un seul
      `cache_control: {"type": "ephemeral"}` bien positionné. Elle observe que
      `cache_read_input_tokens` reste obstinément à 0 sur toutes les requêtes.

      Quelle est la cause, et la correction ?
    options:
      - "Le cache expire trop vite (5 minutes) ; il faut passer systématiquement au cache d'1 heure."
      - "Le nombre de breakpoints (1 seul ici) est insuffisant ; il en faut au minimum 4."
      - "cache_control ne doit jamais être placé sur le system prompt, seulement sur les messages."
      - "L'identifiant de corrélation aléatoire change à chaque requête à l'intérieur du préfixe mis en cache, invalidant silencieusement le cache à chaque appel ; il faut sortir cet identifiant du bloc caché, en le plaçant après le dernier breakpoint."
    answer: 3
    level: avance
    tags: [contexte-fiabilite, prompt-caching]
    explanation: >
      L'identifiant de corrélation change à chaque requête à l'intérieur même du préfixe mis
      en cache : le préfixe n'est donc jamais identique deux fois, et le cache n'est jamais
      réutilisé, sans qu'aucune erreur ne le signale. La correction est de sortir cet
      identifiant du bloc caché, en le plaçant après le breakpoint. Le TTL de 5 minutes
      n'est pas en cause ici : le problème est une invalidation à CHAQUE requête, pas une
      expiration entre deux requêtes espacées. Le nombre de breakpoints n'a pas d'impact :
      un seul, bien placé, suffirait si le contenu était stable. cache_control peut
      parfaitement être posé sur le system prompt, c'est même l'un des usages les plus
      courants.

  - prompt: |
      Une équipe veut confirmer que le prompt caching fonctionne réellement en production
      pour son assistant de support, au-delà d'une simple impression de rapidité perçue.

      Quel champ de la réponse API consulter en priorité ?
    options:
      - "Le champ stop_reason de chaque réponse, qui indique explicitement si le cache a été utilisé."
      - "Le champ usage de chaque réponse : cache_read_input_tokens (lecture) et cache_creation_input_tokens (écriture) — s'ils restent tous deux à 0 sur une requête censée en bénéficier, le cache n'a pas matché."
      - "Le temps de réponse total de la requête, seul indicateur fiable de l'utilisation du cache."
      - "Le nombre de tool_use blocks renvoyés par la requête."
    answer: 1
    level: intermediaire
    tags: [contexte-fiabilite, prompt-caching]
    explanation: >
      Le champ usage expose cache_read_input_tokens et cache_creation_input_tokens : s'ils
      restent tous deux à 0 sur une requête censée bénéficier du cache, c'est le signal
      fiable que le cache n'a pas matché. stop_reason (option 0) ne contient aucune
      information sur le cache. Le temps de réponse perçu (option 2) est influencé par de
      nombreux facteurs et n'est pas une mesure fiable à lui seul. Le nombre de tool_use
      blocks (option 3) n'a aucun rapport avec le fonctionnement du cache.

  - prompt: |
      Pour décider si un document tient dans la fenêtre de contexte disponible avant de
      l'envoyer à Claude, une équipe utilise la bibliothèque `tiktoken` (conçue pour une
      autre famille de modèles) afin d'estimer le nombre de tokens du prompt.

      Cette approche est-elle fiable ?
    options:
      - "C'est fiable : tous les tokenizers de modèles de langage produisent des comptages équivalents."
      - "C'est fiable, à condition de multiplier le résultat de tiktoken par un facteur correctif constant."
      - "Ce n'est pas fiable : chaque famille de modèles a son propre tokenizer, les comptages ne sont pas interchangeables ; il faut utiliser l'endpoint count_tokens de l'API Claude (gratuit, estimation)."
      - "Ce n'est fiable que pour des prompts de moins de 1000 tokens."
    answer: 2
    level: intermediaire
    tags: [contexte-fiabilite]
    explanation: >
      Chaque famille de modèles dispose de son propre tokenizer : un comptage réalisé avec
      tiktoken (conçu pour une autre famille) ne correspond pas au tokenizer de Claude ; la
      seule mesure fiable est l'endpoint count_tokens de l'API Claude, gratuit et donné comme
      estimation. L'option 0 est fausse : les tokenizers ne sont pas interchangeables d'une
      famille de modèles à l'autre. L'option 1 invente un facteur correctif universel qui
      n'existe pas et ne compenserait pas fiablement l'écart. L'option 3 introduit un seuil
      de taille arbitraire sans fondement.

  - prompt: |
      Un assistant de développement interne doit se souvenir des conventions de style de
      code préférées d'un développeur (règles de linting, conventions de nommage) d'une
      session CLI à l'autre, potentiellement plusieurs jours après. L'équipe n'a mis en
      place que la compaction pour gérer la croissance du contexte au sein de chaque
      session.

      Cette configuration suffit-elle au besoin décrit ?
    options:
      - "Oui : la compaction résume déjà le contexte, ce résumé sera disponible à la prochaine session."
      - "Non : la compaction gère la croissance du contexte à l'intérieur d'une session, elle ne fait rien persister entre sessions — seul memory (fichiers persistants relus au début d'une session future) répond à ce besoin."
      - "Oui, à condition d'augmenter le seuil de déclenchement de la compaction."
      - "Non, il faut désactiver la compaction et la remplacer entièrement par du context editing."
    answer: 1
    level: intermediaire
    tags: [contexte-fiabilite]
    explanation: >
      La compaction résume le contenu ancien d'une session, mais n'a aucun mécanisme pour
      faire survivre cette information à la fin de la session ou à une session future —
      seul memory est conçu pour cet usage. Supposer que le résumé de compaction survit
      d'une session à l'autre, ou qu'augmenter son seuil suffirait, ignore à tort que sa
      portée reste intra-session. Le context editing a la même portée intra-session que la
      compaction : le remplacement proposé ne changerait rien au problème de persistance
      entre sessions.

  - prompt: |
      Un sous-pas de routage classe chaque message entrant dans l'une de 5 catégories
      fixes, à fort volume et à faible enjeu. Il tourne actuellement sur Opus avec
      `effort: high`, ce qui fait grimper les coûts sans gain de qualité mesurable par
      rapport à une configuration plus légère.

      Quelle correction structurelle est la plus adaptée ?
    options:
      - "Passer à un modèle plus léger (ex. Haiku) et/ou réduire effort : ce sous-pas est simple et à fort volume, le profil de tâche ne justifie pas Opus en effort élevé."
      - "Garder Opus et effort: high, car un classifieur ne doit jamais tourner sur un modèle léger."
      - "Passer à effort: max pour compenser un futur changement de modèle."
      - "Activer uniquement le prompt caching, sans toucher au modèle ni à effort."
    answer: 0
    level: intermediaire
    tags: [contexte-fiabilite]
    explanation: >
      Un sous-pas simple, à fort volume et faible enjeu, correspond exactement au profil
      d'un modèle léger avec un effort réduit : le coût baisse sans perte de qualité
      mesurable. L'option 1 pose une règle absolue infondée : le choix de modèle dépend du
      profil de la tâche, pas d'une contrainte générale sur les classifieurs. effort: max
      (option 2) augmente encore le coût, contraire au besoin de le réduire. Le prompt
      caching seul (option 3) n'adresse pas le levier principal ici, qui est le
      surdimensionnement modèle/effort par rapport à la tâche.

  - prompt: |
      Une équipe marketing doit générer, chaque nuit, une description produit personnalisée
      pour 1 million de références de son catalogue, sans contrainte de réponse immédiate
      (le résultat n'est publié que le lendemain), avec un budget serré.

      Quelle option réduit le plus directement le coût de ce traitement ?
    options:
      - "Passer effort à low sur un modèle plus capable, pour compenser la perte de qualité par la puissance du modèle."
      - "Activer uniquement le prompt caching, en espérant une remise équivalente à celle de l'API Batches."
      - "Répartir la charge sur plusieurs comptes API pour multiplier les remises de volume."
      - "Utiliser la Message Batches API pour ce traitement asynchrone : -50 % sur le tarif standard, avec un traitement généralement complété en moins d'une heure."
    answer: 3
    level: intermediaire
    tags: [contexte-fiabilite]
    explanation: >
      Fort volume, traitement asynchrone, pas de contrainte de latence immédiate : c'est
      exactement le cas d'usage central de la Batches API, avec une remise de -50%
      indépendante du prompt caching. Manipuler effort et le modèle pour compenser
      indirectement le coût reste incertain et sans rapport avec le vrai levier disponible
      ici. Le prompt caching seul réduit le coût d'un préfixe réutilisé, mais n'atteint pas
      -50% sur l'ensemble du traitement et ne remplace pas la Batches API. Multiplier les
      comptes n'est pas un mécanisme de remise reconnu.

  - prompt: |
      Un pipeline génère un document de conformité de 20 pages en une seule fois, sans
      streaming. Les requêtes échouent parfois avec un timeout HTTP, bien avant qu'un
      `stop_reason` ne soit jamais retourné — le problème n'est pas lié à `max_tokens`.

      Quelle est la correction structurelle attendue ?
    options:
      - "Augmenter max_tokens, qui résout aussi bien la troncature que le timeout de transport."
      - "Activer le prompt caching sur le prompt, pour réduire le temps de génération de la réponse."
      - "Streamer la réponse : c'est le mécanisme prévu pour éviter un timeout HTTP côté transport sur les sorties longues, sans rien changer à la qualité ou au contenu produit."
      - "Réduire max_tokens pour que la génération se termine avant le timeout."
    answer: 2
    level: intermediaire
    tags: [contexte-fiabilite]
    explanation: >
      Le streaming est le mécanisme prévu pour éviter un timeout HTTP côté transport sur des
      sorties longues, sans changer la qualité ou le contenu généré. max_tokens (options 0
      et 3) régit la troncature du contenu généré, un problème distinct d'un timeout de
      transport survenant avant même qu'un stop_reason ne soit retourné. Le prompt caching
      (option 1) réduit le coût d'un préfixe réutilisé, sans effet sur la durée de
      génération de la sortie ni sur le risque de timeout de transport.

  - prompt: |
      Un pipeline reçoit `stop_reason: "max_tokens"` sur environ 10 % de ses requêtes
      générant de longues sorties structurées. L'équipe compte entièrement sur le retry
      automatique par défaut du SDK (backoff sur 429/5xx) pour corriger le problème, mais
      la même troncature revient systématiquement.

      Quelle est l'explication correcte ?
    options:
      - "C'est le comportement attendu : le retry automatique du SDK est justement conçu pour ce cas de troncature."
      - "Il faut désactiver le retry automatique du SDK, qui est la cause du problème."
      - "Il faut ajouter du prompt caching, seul mécanisme capable de réduire la fréquence des troncatures."
      - "Le retry automatique du SDK cible les erreurs de transport (429, 5xx), pas une troncature déterministe par max_tokens : relancer à l'identique reproduit la même limite ; il faut augmenter max_tokens ou streamer/reprendre pour les sorties longues."
    answer: 3
    level: avance
    tags: [contexte-fiabilite]
    explanation: >
      Le retry automatique du SDK cible les erreurs de transport transitoires (429, 5xx),
      pas les troncatures dues à max_tokens, qui sont déterministes pour un contenu de
      longueur donnée : relancer à l'identique redonnera la même limite atteinte. L'option 0
      confond ces deux mécanismes de résilience distincts. Désactiver le retry (option 1) ne
      résout rien à la troncature, qui n'est pas de sa responsabilité. Le prompt caching
      (option 2) réduit le coût d'un préfixe réutilisé, sans rapport avec la longueur de
      sortie autorisée.
---

Ce test blanc de 60 questions reproduit le format réel du **Claude Certified Developer –
Foundations (CCDV-F)** : 5 domaines, angle développeur (implémenter, intégrer, déboguer,
opérer), une seule bonne réponse par question. Voir la leçon « Consignes » pour les
conditions de passage recommandées.
