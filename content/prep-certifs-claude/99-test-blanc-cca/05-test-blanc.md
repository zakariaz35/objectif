---
title: "Test blanc — CCA-F (60 questions, conditions réelles)"
type: quiz
strategy: linear
questions:
  # ======================= AGENTIC ARCHITECTURE — DESIGN (16) =======================
  - prompt: |
      Une équipe support veut qu'un agent résolve seul environ 80 % des tickets entrants
      (remboursements simples, questions de suivi de commande, changements d'adresse) et
      escalade les 20 % restants vers un humain, sans jamais improviser sur les cas ambigus.
      L'équipe hésite entre construire un unique agent conversationnel avec tous les outils
      disponibles en permanence, ou une architecture plus découpée.

      Quelle architecture correspond le mieux à ce besoin ?
    options:
      - "Un seul agent conversationnel avec tous les outils toujours actifs, guidé par une instruction système du type « escalade si le cas te semble compliqué »."
      - "Un workflow entièrement déterministe qui couvre les 80 % de cas par des règles if/else exhaustives, sans aucune boucle agentique, en rejetant simplement les 20 % restants."
      - "Une architecture en trois blocs : un triage/routage déterministe (workflow), un agent borné qui tente la résolution avec les outils métier appropriés à la catégorie, et un gate d'escalade humaine déclenché par un seuil de confiance ou un nombre d'échecs — pas un unique bloc monolithique."
      - "Un agent unique dont le seul outil est « escalader_vers_humain », sans aucun autre outil métier, qui décide à chaque tour d'escalader ou de répondre en texte."
    answer: 2
    level: intermediaire
    tags: [agents, orchestration]
    explanation: >
      Le besoin combine une partie prévisible (trier/router les demandes, un workflow) et une
      partie qui nécessite une décision adaptative outillée (résoudre, un agent borné), plus
      un critère de coût d'erreur qui impose un gate humain explicite — une architecture en
      couches, pas un bloc unique. L'option 0 concentre tout dans un agent monolithique guidé
      par une simple instruction de prudence, non garantie structurellement. L'option 1 ignore
      que la résolution effective (remboursement, adresse, suivi) dépend souvent d'une
      exploration outillée que des règles if/else exhaustives ne peuvent pas couvrir
      indéfiniment. L'option 3 retire à l'agent tout outil de résolution utile, le rendant
      incapable de traiter les 80 % de cas visés.

  - prompt: |
      Dans le système de support de la question précédente, l'agent de résolution obtient
      une confiance très élevée sur un cas de remboursement de 1 200 $ et souhaite l'exécuter
      immédiatement sans repasser par un humain, car son taux de succès historique sur ce type
      de cas dépasse 99 %.

      Quelle est la décision d'architecture correcte concernant cette action précise ?
    options:
      - "Extraire cette action comme une étape dotée d'un gate humain obligatoire au-delà d'un seuil de montant, indépendamment de la confiance affichée par l'agent — le coût d'erreur élevé de l'action, pas la performance historique du modèle, doit dicter ce garde-fou."
      - "Faire confiance au taux de succès historique de l'agent et le laisser exécuter le remboursement directement, comme n'importe quelle autre action de la boucle."
      - "Réduire max_tokens sur ce tour précis pour empêcher l'agent de formuler l'appel d'outil de remboursement."
      - "Ajouter une instruction système demandant à l'agent d'être « extra prudent » avant tout remboursement supérieur à 500 $."
    answer: 0
    level: avance
    tags: [agents, reliability]
    explanation: >
      Le coût d'une erreur (un remboursement de 1 200 $ à tort) justifie un gate humain
      structurel au-delà d'un seuil, quelle que soit la confiance affichée par le modèle — la
      performance historique n'élimine jamais le risque d'un cas atypique. L'option 1 fait
      reposer une décision à fort enjeu sur un indicateur statistique global, pas sur une
      garantie par cas. L'option 2 casserait la réponse par troncature sans empêcher
      structurellement l'exécution. L'option 3 reste une consigne de prudence non
      contraignante, exactement le type de réponse que l'examen sanctionne.

  - prompt: |
      Un système de recherche multi-agents reçoit une question complexe qui se décompose en
      20 sous-recherches web indépendantes (aucune ne dépend du résultat d'une autre), avant
      une étape finale de synthèse. Une première version du système les traite une par une,
      dans une seule conversation, en accumulant chaque résultat de recherche dans le même
      fil.

      Quelle architecture corrige structurellement ce système ?
    options:
      - "Garder un traitement séquentiel dans un seul fil, mais réduire le nombre d'outils disponibles pour accélérer chaque recherche."
      - "Décomposer en 20 sous-agents en fan-out parallèle, chacun avec un contexte isolé pour sa propre recherche, renvoyant un résumé condensé à un orchestrateur chargé de la synthèse finale."
      - "Concaténer les 20 sous-recherches en un seul appel, pour éviter la coordination entre plusieurs agents."
      - "Passer tool_choice à {\"type\": \"any\"} sur l'agent unique, pour l'obliger à accélérer ses appels d'outils."
    answer: 1
    level: intermediaire
    tags: [agents, subagents]
    explanation: >
      20 sous-recherches indépendantes sont le cas d'usage canonique du fan-out parallèle :
      chaque sous-agent absorbe le volume de sa propre recherche dans un contexte isolé,
      l'orchestrateur ne recevant que l'essentiel, ce qui réduit la latence totale et évite la
      dilution du fil principal. L'option 0 conserve le vrai problème (accumulation inutile de
      contexte) sans le résoudre. L'option 2 ferait porter 20 recherches à un seul appel, avec
      un risque majeur de dépassement de fenêtre et de perte de qualité. L'option 3 force un
      appel d'outil par tour mais ne répond en rien au besoin de parallélisation ni
      d'isolation de contexte.

  - prompt: |
      Dans ce même système de recherche multi-agents, l'équipe réalise que le nombre exact de
      sous-recherches nécessaires (et leur sujet précis) ne peut pas être connu à l'avance :
      il dépend de ce que les premières recherches remontent (une piste peut en ouvrir deux
      autres, une autre s'avérer sans intérêt). Un développeur propose malgré tout de figer à
      l'avance une liste de 20 sous-recherches dans un workflow.

      Quelle est l'évaluation la plus juste de cette proposition ?
    options:
      - "C'est correct : un nombre fixe de sous-recherches simplifie toujours la coordination, quel que soit le sujet."
      - "Ce n'est pas adapté, mais seulement parce que 20 est un nombre trop élevé de sous-recherches à paralléliser."
      - "C'est correct, à condition de remplacer les sous-agents par de simples appels séquentiels."
      - "Ce n'est pas adapté : puisque le chemin de résolution (quelles sous-recherches lancer, combien) dépend du contenu découvert en cours de route, il faut une étape de planification dynamique confiée à un agent orchestrateur, qui décide et ajuste les sous-recherches à lancer au fil de l'exploration, plutôt qu'un workflow figé à l'avance."
    answer: 3
    level: avance
    tags: [agents, orchestration]
    explanation: >
      Un chemin de résolution qui dépend de ce qui est découvert en cours de route est la
      définition même d'un besoin agentique (critère de complexité) : un workflow qui fige à
      l'avance la liste des sous-recherches ne peut pas s'adapter aux pistes ouvertes ou
      fermées en cours de route, contrairement à un orchestrateur qui planifie dynamiquement.
      L'option 0 généralise à tort un avantage de simplicité qui ne s'applique pas quand le
      chemin est réellement inconnaissable à l'avance. L'option 1 se trompe de cause : ce
      n'est pas la quantité qui pose problème, mais le caractère figé du plan. L'option 2
      supprime la parallélisation sans justification et n'ajoute aucune capacité de
      planification.

  - prompt: |
      Dans le même système, chaque sous-agent de recherche renvoie actuellement à
      l'orchestrateur la totalité de sa transcription brute (requêtes, pages consultées,
      extraits complets), et non un résumé. L'orchestrateur, chargé de synthétiser les
      20 résultats en un rapport final, voit sa fenêtre de contexte saturée bien avant la fin
      de la synthèse.

      Quelle est la correction structurelle attendue ?
    options:
      - "Faire renvoyer à chaque sous-agent un résumé condensé de ses trouvailles pertinentes, pas sa transcription brute complète — l'orchestrateur n'a besoin que de l'essentiel pour synthétiser, le détail exploratoire reste dans le contexte isolé de chaque sous-agent."
      - "Réduire le nombre de sous-agents à 5 pour que leurs transcriptions tiennent dans la fenêtre de l'orchestrateur."
      - "Activer le prompt caching sur les transcriptions des sous-agents pour réduire leur coût en tokens dans le fil de l'orchestrateur."
      - "Passer les 20 sous-agents en délégation asynchrone pour que leurs transcriptions n'arrivent jamais toutes en même temps."
    answer: 0
    level: avance
    tags: [agents, subagents]
    explanation: >
      La bonne raison de déléguer à un sous-agent est de garder son volume exploratoire hors
      du fil principal : lui faire renvoyer un résumé condensé, pas sa transcription complète,
      est exactement ce qui préserve la fenêtre de l'orchestrateur pour la synthèse. Réduire
      le nombre de sous-agents (option 1) sacrifie la couverture de la recherche sans traiter
      la cause réelle (le format du résultat renvoyé). Le prompt caching (option 2) réduit un
      coût de préfixe réutilisé, pas le volume de contenu unique accumulé dans un seul fil. La
      délégation asynchrone (option 3) change le moment d'arrivée des résultats, pas leur
      volume une fois qu'ils arrivent tous.

  - prompt: |
      Un pipeline de traitement de commandes suit toujours la même séquence connue à
      l'avance : extraire les champs d'une commande, valider leur cohérence, enrichir avec les
      données client, sauvegarder en base. Une équipe construit ce pipeline comme un agent
      doté d'une boucle autonome et de quatre outils, « pour plus de flexibilité si un jour
      une étape doit changer ».

      Quelle est l'évaluation la plus juste de cette architecture ?
    options:
      - "C'est justifié : la flexibilité d'une boucle agentique est toujours préférable à un pipeline figé, même pour des étapes connues."
      - "C'est justifié, mais uniquement si l'entreprise prévoit d'ajouter une cinquième étape dans les six prochains mois."
      - "Ce n'est pas justifié, mais seulement parce qu'un agent ne peut pas exécuter d'opération de sauvegarde en base."
      - "Ce n'est pas justifié : la séquence est connue et stable à l'avance, un workflow (orchestré par du code, éventuellement avec des appels LLM à certaines étapes) suffit et reste plus prévisible et auditable qu'une boucle agentique pour ce cas."
    answer: 3
    level: intermediaire
    tags: [agents, orchestration]
    explanation: >
      Une séquence d'étapes connue et stable à l'avance est la définition même d'un
      workflow : il reste plus prévisible et auditable qu'une boucle agentique, sans
      sacrifier la possibilité de faire appel au modèle à certaines étapes. L'option 0
      généralise à tort la flexibilité comme un avantage toujours supérieur, ignorant le coût
      de prévisibilité perdue. L'option 1 anticipe un changement futur hypothétique qui ne
      justifie pas une architecture plus complexe aujourd'hui. L'option 2 invente une
      limitation technique qui n'existe pas : un agent peut parfaitement exécuter une
      sauvegarde en base via un outil.

  - prompt: |
      Un agent de diagnostic doit identifier pourquoi un déploiement client a échoué : selon
      les cas, la cause peut être dans la configuration réseau, un service tiers, ou une
      erreur de code — et le nombre d'étapes nécessaires pour la trouver n'est jamais le même
      d'un incident à l'autre. Une équipe, échaudée par un précédent projet en
      sur-ingénierie, propose de forcer ce diagnostic dans un workflow à embranchements fixes
      (if/else) pour rester « simple et prévisible ».

      Quelle est l'évaluation la plus juste de cette proposition ?
    options:
      - "C'est justifié : un workflow reste toujours préférable à un agent, quel que soit le degré d'imprévisibilité du chemin de résolution."
      - "C'est justifié, à condition d'ajouter un cinquième embranchement au workflow pour couvrir un cas de plus."
      - "Ce n'est pas justifié : le nombre et la nature des étapes ne peuvent pas être connus à l'avance (ils dépendent de ce que le diagnostic découvre en cours de route), c'est exactement le critère qui justifie un agent doté d'une boucle et d'outils d'investigation, pas un embranchement figé."
      - "Ce n'est pas justifié, mais seulement parce qu'un workflow ne peut jamais appeler d'outil."
    answer: 2
    level: avance
    tags: [agents, orchestration]
    explanation: >
      Le critère de complexité (le chemin de résolution dépend du contenu découvert en cours
      de route) pointe ici clairement vers un agent : un diagnostic dont la cause varie d'un
      incident à l'autre ne peut pas être couvert par un nombre fini d'embranchements connus à
      l'avance. L'option 0 généralise à tort la simplicité comme toujours supérieure, ce qui
      mène ici à de la sous-ingénierie (résister à l'over-engineering ne veut pas dire refuser
      un agent quand il est réellement justifié). L'option 1 ne résout rien : ajouter un
      embranchement de plus ne couvre pas l'imprévisibilité structurelle du problème.
      L'option 3 est fausse : un workflow peut très bien inclure des appels LLM ou des outils
      à certaines étapes.

  - prompt: |
      Une organisation veut déployer des dizaines d'agents d'automatisation internes
      (facturation, RH, support) définis et gouvernés de façon centralisée par une petite
      équipe plateforme : chaque agent doit être versionné, référencé par un identifiant
      unique, et utilisable par des équipes métier non techniques sans qu'aucune de ces
      équipes n'ait à construire ou héberger sa propre infrastructure d'exécution.

      Quelle architecture correspond le mieux à cette exigence de gouvernance centralisée ?
    options:
      - "Le Claude Agent SDK, à héberger et faire évoluer indépendamment par chacune des équipes métier concernées."
      - "Managed Agents : les agents sont définis une fois, référencés par ID, avec un sandbox hébergé par Anthropic (ou auto-hébergé sur demande) — aucune équipe métier n'a besoin de construire sa propre infrastructure pour les utiliser."
      - "Une boucle manuelle sur l'API Messages, dupliquée dans chaque équipe métier selon ses propres besoins."
      - "Le Tool Runner du SDK, à condition que chaque équipe écrive et héberge ses propres outils indépendamment des autres."
    answer: 1
    level: avance
    tags: [agents, orchestration]
    explanation: >
      Managed Agents correspond exactement à ce besoin de gouvernance centralisée : les
      agents sont définis et versionnés une fois par la plateforme, référencés par ID, avec un
      sandbox hébergé par Anthropic — aucune équipe métier n'a à construire d'infrastructure.
      Le Claude Agent SDK (option 0) exigerait que chaque équipe métier héberge et maintienne
      sa propre instance, contraire à l'objectif de centralisation. Une boucle manuelle
      dupliquée (option 2) est l'antithèse d'une gouvernance centralisée. Le Tool Runner
      (option 3) suppose également que chaque équipe écrive et héberge ses propres outils,
      sans bénéficier d'une définition centrale partagée.

  - prompt: |
      Une startup veut proposer un « coéquipier de code IA » en SaaS à des milliers de
      clients, chaque session isolée manipulant le dépôt privé d'un client, pouvant durer de
      quelques minutes à plusieurs heures, avec une charge très variable d'un jour à l'autre.
      L'équipe technique est petite et n'a ni l'intention ni les ressources de construire une
      infrastructure de sandbox multi-tenant capable de monter en charge elle-même.

      Quelle architecture correspond le mieux à ces contraintes ?
    options:
      - "Le Claude Agent SDK, hébergé sur l'infrastructure de la startup, qui devra construire elle-même l'isolation multi-tenant et la mise à l'échelle élastique du sandbox."
      - "Une boucle manuelle sur l'API Messages, la plus simple à écrire pour une petite équipe technique."
      - "Le Tool Runner du SDK, qui gère nativement l'isolation entre les sessions de différents clients."
      - "Managed Agents : le sandbox est hébergé et mis à l'échelle par Anthropic par session, sans que la startup ait à construire ni maintenir sa propre infrastructure multi-tenant élastique."
    answer: 3
    level: avance
    tags: [agents, orchestration]
    explanation: >
      Managed Agents est pensé précisément pour ce profil : sandbox hébergé et mis à l'échelle
      par Anthropic par session, sans que l'équipe n'ait à construire une infrastructure
      multi-tenant élastique — exactement la contrainte de ressources décrite. Le Claude Agent
      SDK (option 0) reporterait cette charge d'infrastructure sur la petite équipe technique,
      contraire à l'exigence. Une boucle manuelle (option 1) n'apporte aucune isolation ni
      mise à l'échelle : tout resterait à construire. Le Tool Runner (option 2) ne gère ni
      sandbox ni isolation entre sessions, seulement la mécanique de boucle.

  - prompt: |
      Un architecte conçoit un agent de gestion d'incidents dont chaque appel d'outil sensible
      (redémarrage de service, purge de cache) doit passer par une porte d'approbation humaine,
      avec journalisation de chaque tour et possibilité de modifier un résultat d'outil avant
      de le renvoyer au modèle. L'équipe refuse de réécrire la boucle agentique à la main, mais
      exige que l'exécution des outils reste sur son infrastructure.

      Quelle approche répond à ces trois exigences (contrôle par tour, boucle fournie,
      exécution interne) sans sur-ingénierie ?
    options:
      - "Managed Agents : c'est la seule approche qui offre un contrôle humain par tour, grâce à son sandbox géré."
      - "Le Tool Runner du SDK : ses hooks par tour permettent portes d'approbation, journalisation et interception/modification des résultats, la boucle est fournie et les outils s'exécutent sur l'infrastructure de l'équipe."
      - "Une boucle manuelle sur l'API Messages : dès qu'un contrôle par tour est requis, aucun helper du SDK ne peut convenir."
      - "Le Claude Agent SDK : ses outils intégrés fichiers/bash sont indispensables pour journaliser les tours d'un agent."
    answer: 1
    level: intermediaire
    tags: [agents, sdk]
    explanation: >
      Les hooks par tour du Tool Runner couvrent exactement ces besoins de contrôle —
      porte d'approbation avant exécution, journalisation, interception d'erreurs et
      modification du résultat d'un outil — sans réécrire la boucle, et les outils déclarés
      s'exécutent sur l'infrastructure de l'équipe. Managed Agents déplace au contraire la
      boucle d'orchestration (et par défaut le sandbox) chez Anthropic, à l'opposé de
      l'exigence d'exécution interne. La boucle manuelle fonctionnerait mais réécrit
      précisément la mécanique que l'équipe refuse de maintenir : « j'ai besoin de contrôle »
      n'impose pas de descendre à la boucle manuelle quand des hooks par tour existent. Le
      Claude Agent SDK embarque un harnais complet avec outils intégrés fichiers/bash, inutiles
      ici et sans rapport avec la journalisation des tours.

  - prompt: |
      Un agent d'investigation de conformité doit croiser, à chaque nouvelle étape,
      l'ensemble des indices déjà rassemblés dans les 30 tours précédents de son enquête ; le
      résultat détaillé de l'étape en cours sera directement réutilisé dans les tours suivants
      du même fil. Un architecte propose malgré tout de déléguer cette étape à un sous-agent,
      « pour garder le fil principal léger ».

      Quelle est l'évaluation la plus juste de cette proposition ?
    options:
      - "Ce n'est pas justifié : l'étape a besoin de tout l'historique d'indices déjà accumulé et son résultat sera réutilisé directement ensuite — déléguer à un sous-agent isolé ajouterait de la latence et de la complexité sans bénéfice, puisqu'il faudrait soit lui transmettre tout ce contexte, soit que l'orchestrateur réintègre le détail perdu à l'isolation."
      - "C'est justifié : déléguer à un sous-agent allège toujours le fil principal, quelle que soit la nature de l'étape."
      - "C'est justifié, à condition de restreindre les outils du sous-agent au strict minimum."
      - "C'est justifié, en passant cette délégation en asynchrone pour ne pas bloquer le fil principal."
    answer: 0
    level: avance
    tags: [agents, subagents]
    explanation: >
      La bonne raison de déléguer est d'isoler du contexte non réutile ; ici c'est l'inverse,
      l'étape a besoin de tout l'historique déjà accumulé et son résultat sera réutilisé
      directement — déléguer ajouterait de la latence sans bénéfice réel. L'option 1
      généralise à tort la délégation comme toujours bénéfique. Restreindre les outils du
      sous-agent (option 2) ne compense en rien le couplage fort au contexte principal déjà
      accumulé. La délégation asynchrone (option 3) répond à un besoin de ne pas bloquer sur
      une tâche longue dont seul le résultat final compte, pas à une dépendance stricte au
      contexte déjà présent.

  - prompt: |
      Une organisation exploite plusieurs dizaines d'agents d'automatisation, chacun
      développé par une équipe différente. Certaines équipes ajoutent une limite d'itérations
      dans leur propre code, d'autres l'oublient. Un incident récent (un agent ayant retenté
      40 fois la même action défaillante) relance le débat sur la bonne échelle à laquelle
      appliquer les garde-fous anti-boucle.

      Quelle est la correction structurelle la plus adaptée à l'échelle de l'organisation ?
    options:
      - "Documenter dans un guide interne que chaque équipe doit penser à ajouter max_iterations et une escalade humaine dans son propre code."
      - "Ajouter, dans le system prompt de chaque agent, une instruction demandant d'éviter de boucler indéfiniment."
      - "Intégrer max_iterations, la détection d'échecs répétés (replanification) et l'escalade humaine directement dans le harnais/la bibliothèque partagée utilisée par toutes les équipes, pour que le garde-fou soit garanti par construction plutôt que par la discipline individuelle de chaque équipe."
      - "Réduire max_tokens sur tous les agents de l'organisation pour limiter la longueur de chaque réponse individuelle."
    answer: 2
    level: intermediaire
    tags: [agents, reliability]
    explanation: >
      Un incident dû à une équipe qui a oublié le garde-fou révèle que compter sur la
      discipline individuelle ne suffit pas à l'échelle d'une organisation : intégrer ces
      garde-fous dans le harnais partagé les rend garantis par construction pour toutes les
      équipes. Un guide interne (option 0) reste une recommandation non contraignante,
      exactement le point faible qui a causé l'incident. Une instruction dans le system prompt
      (option 1) reste une consigne non structurelle. Réduire max_tokens (option 3) ne borne
      pas le nombre d'itérations d'une boucle, seulement la longueur d'une réponse
      individuelle.

  - prompt: |
      Une organisation constate que la décision d'exiger une confirmation humaine avant une
      action irréversible (suppression de données, déploiement en production, transaction
      financière) est aujourd'hui laissée à l'appréciation de chaque équipe qui construit un
      agent — certaines l'implémentent, d'autres non, selon leur sensibilité personnelle au
      risque.

      Quelle architecture applique ce garde-fou de façon fiable à l'échelle de toute
      l'organisation ?
    options:
      - "Une charte interne recommandant aux équipes d'ajouter une confirmation humaine « quand elles le jugent nécessaire »."
      - "Une politique centrale, appliquée structurellement au niveau du harnais ou de la couche d'exécution des outils partagée : tout outil marqué comme à fort risque déclenche systématiquement un gate humain avant exécution, indépendamment de l'équipe qui a construit l'agent."
      - "Une instruction système standardisée, copiée dans le prompt de chaque agent, demandant de confirmer avant toute action destructive."
      - "Un outil supplémentaire optionnel que chaque équipe peut choisir d'ajouter à son agent si elle le souhaite."
    answer: 1
    level: avance
    tags: [agents, reliability]
    explanation: >
      Une garantie qui doit s'appliquer de façon fiable à toute une organisation doit être
      structurelle et centralisée — un gate au niveau du harnais/de la couche d'exécution
      partagée, déclenché automatiquement pour tout outil marqué à fort risque, indépendamment
      de la discipline de chaque équipe. Une charte (option 0) et une instruction système
      standardisée (option 2) restent des recommandations non contraignantes que le modèle ou
      l'équipe peuvent ne pas respecter à la lettre. Un outil optionnel (option 3) laisse
      justement à chaque équipe le choix de l'adopter ou non, ce qui est précisément le
      problème identifié.

  - prompt: |
      Un agent de revue de code automatisée intégré à la CI doit commenter chaque pull
      request. Pour une PR qui modifie une seule ligne de configuration, le système lance
      actuellement le même parcours complet que pour une PR de refactoring cross-fichiers :
      récupération du diff, exploration du reste du dépôt, lecture de fichiers liés,
      exécution de tests ciblés, puis commentaire.

      Quelle architecture serait la plus adaptée ?
    options:
      - "Garder un unique parcours agentique pour toutes les PR, quelle que soit leur complexité, par souci d'uniformité du pipeline."
      - "Toujours privilégier le parcours le plus simple (un appel unique), y compris pour les PR de refactoring cross-fichiers, pour limiter les coûts."
      - "Faire dépendre l'architecture de la complexité du diff : un simple appel (ou un petit workflow) qui récupère le diff et commente directement pour les changements triviaux et isolés, réservant la boucle agentique avec exploration du dépôt aux PR dont l'impact traverse plusieurs fichiers ou nécessite d'examiner du code lié."
      - "Remplacer entièrement l'agent par un ensemble de règles de linter statiques, sans jamais faire appel à un modèle."
    answer: 2
    level: intermediaire
    tags: [agents, orchestration]
    explanation: >
      La complexité réelle du diff est le bon critère de décision : un changement trivial et
      isolé ne nécessite aucune exploration dynamique du dépôt (appel simple ou petit workflow
      suffit), tandis qu'un refactoring cross-fichiers a un chemin de résolution qui dépend de
      ce que l'exploration découvre (justifiant un agent). L'option 0 applique un parcours
      coûteux même quand il n'apporte rien. L'option 1 sous-dimensionne les cas complexes qui
      ont réellement besoin d'exploration. L'option 3 abandonne toute capacité de jugement
      contextuel qu'un modèle apporte, ce que l'énoncé ne justifie pas.

  - prompt: |
      Un agent d'assistance au développement reçoit la demande : « trouve tous les appels à
      cette fonction dépréciée dans le monorepo et propose un plan de migration ». Explorer
      l'ensemble du monorepo pour lister ces appels peut générer un volume important de
      résultats intermédiaires (chemins de fichiers, extraits de code) qui ne seront pas
      nécessaires une fois le plan de migration rédigé.

      Quelle architecture est la plus adaptée pour cette étape d'exploration ?
    options:
      - "Traiter l'exploration directement dans le fil principal de la conversation, en gardant tous les extraits de code trouvés dans le contexte pour la suite."
      - "Refuser la demande, car explorer un monorepo entier dépasse toujours la fenêtre de contexte disponible."
      - "Forcer tool_choice à {\"type\": \"any\"} sur le fil principal pour accélérer l'exploration."
      - "Déléguer l'exploration à un sous-agent dédié, avec un contexte isolé et des outils de lecture/recherche restreints : il renvoie une liste condensée des occurrences pertinentes au fil principal, sans y faire persister l'intégralité des extraits explorés."
    answer: 3
    level: avance
    tags: [agents, subagents]
    explanation: >
      Une exploration qui produirait un volume important de contenu intermédiaire non réutile
      au-delà de son résultat condensé est exactement le cas où déléguer à un sous-agent isolé
      apporte un bénéfice : le fil principal ne reçoit que l'essentiel pour établir le plan de
      migration. Tout traiter dans le fil principal (option 0) ferait grossir inutilement son
      contexte. Refuser la demande (option 1) est excessif : un sous-agent dédié rend
      justement cette exploration gérable. Forcer tool_choice (option 2) ne change rien au
      volume de contenu généré par l'exploration elle-même.

  - prompt: |
      Une entreprise régulée impose que toute action d'un agent manipulant des données
      sensibles soit inspectable par son équipe sécurité avec des outils d'instrumentation
      standards, construits directement autour des appels bruts de l'API Messages (logs de
      chaque `tool_use`/`tool_result`, sans dépendre d'un tableau de bord propriétaire
      externe).

      Quelle architecture, parmi les quatre façons de construire un agent, est la plus
      compatible avec cette exigence d'observabilité ?
    options:
      - "Une boucle manuelle sur l'API Messages (ou le Tool Runner du SDK) : le code qui appelle l'API et exécute les outils tourne entièrement chez l'entreprise, ce qui permet d'y brancher directement l'instrumentation et la journalisation exigées par l'équipe sécurité."
      - "Managed Agents, dont le harnais est hébergé et exécuté par Anthropic, hors de portée directe de l'instrumentation interne de l'équipe sécurité."
      - "Le Claude Agent SDK, car il empêche par principe toute journalisation des appels d'outils."
      - "Peu importe l'option choisie, l'observabilité ne dépend jamais de qui héberge la boucle agentique."
    answer: 0
    level: avance
    tags: [agents, sdk]
    explanation: >
      Une boucle manuelle ou le Tool Runner s'exécutent entièrement dans l'infrastructure de
      l'entreprise : l'équipe sécurité peut y brancher directement sa propre instrumentation
      autour de chaque appel d'outil, sans dépendre d'un tableau de bord tiers. Managed Agents
      (option 1) héberge la boucle chez Anthropic, ce qui limite l'accès direct à une
      instrumentation interne construite autour des appels bruts. Le Claude Agent SDK
      n'empêche pas la journalisation (option 2 fausse) mais n'est pas non plus le choix qui
      répond le mieux ici, l'exigence portant sur qui héberge et exécute le code observable.
      L'option 3 ignore que l'hébergement de la boucle détermine directement ce qui est
      observable ou non par l'entreprise elle-même.

  # ===================== CLAUDE CODE CONFIGURATION (12) =====================
  - prompt: |
      Une équipe de 15 développeurs sur un même monorepo veut que trois choses profitent
      automatiquement à toute l'équipe : (1) les commandes exactes de build/test à lancer
      avant de committer, (2) une procédure détaillée de 150 lignes pour provisionner un
      nouveau microservice, rarement utilisée, et (3) une convention de nommage des
      branches. L'équipe hésite sur la meilleure façon d'organiser cette configuration
      Claude Code partagée.

      Quelle organisation est la plus adaptée ?
    options:
      - "Tout regrouper dans un seul CLAUDE.md de portée projet, y compris la procédure de 150 lignes, pour que tout soit au même endroit."
      - "Placer les commandes de build/test et la convention de nommage (courtes, utiles à chaque session) dans un CLAUDE.md de portée projet, et déplacer la procédure de provisionnement (longue, rarement utilisée) dans une skill de portée projet, chargée seulement quand elle est invoquée."
      - "Mettre les trois éléments dans les CLAUDE.md personnels (~/.claude/CLAUDE.md) de chacun des 15 développeurs."
      - "Mettre les trois éléments dans un CLAUDE.local.md à la racine du dépôt, pour itérer rapidement sans processus de revue."
    answer: 1
    level: intermediaire
    tags: [claude-code]
    explanation: >
      Séparer ce qui est court et utile à chaque session (CLAUDE.md projet, versionné) de ce
      qui est long et rarement invoqué (une skill projet, chargée à la demande) évite de
      gonfler le contexte de chaque session avec une procédure que la plupart des tâches
      n'utilisent jamais. L'option 0 charge inutilement 150 lignes rarement utiles à chaque
      session. L'option 2 (portée utilisateur dupliquée 15 fois) ne bénéficie à personne
      d'autre que son auteur et doit être répétée pour chaque nouvel arrivant. L'option 3
      (CLAUDE.local.md) est justement pensée pour rester locale et gitignorée, pas partagée
      avec l'équipe.

  - prompt: |
      Une organisation impose une règle de conformité non négociable à appliquer à **tous**
      ses projets Claude Code, quel que soit le repo : ne jamais générer de code qui écrit
      des identifiants dans un fichier en clair. Elle veut que cette règle ne puisse être ni
      oubliée ni supprimée par un mainteneur de repo, même par erreur.

      Quelle portée de configuration correspond à cette exigence ?
    options:
      - "Un CLAUDE.md de portée projet, ajouté par la plateforme dans chaque dépôt existant et à ajouter manuellement dans chaque nouveau dépôt créé."
      - "Un CLAUDE.md personnel (~/.claude/CLAUDE.md), à répliquer sur la machine de chaque développeur de l'organisation."
      - "Une skill projet dans chaque dépôt, que chaque mainteneur peut librement modifier ou supprimer selon les besoins de son équipe."
      - "Une politique managée (managed policy), déployée par l'organisation au niveau le plus large, non modifiable par un mainteneur de repo ni par un développeur individuel."
    answer: 3
    level: avance
    tags: [claude-code]
    explanation: >
      Une règle non négociable, applicable à toute l'organisation et non modifiable par un
      mainteneur de repo, correspond exactement à la portée managed policy — la plus large des
      quatre portées, déployée par l'organisation elle-même. L'option 0, même ajoutée partout,
      resterait modifiable ou supprimable par n'importe quel mainteneur de repo, ce que
      l'exigence exclut. L'option 1 ne profite qu'à son auteur et doit être répliquée
      manuellement, sans aucune garantie de non-suppression. L'option 2 reste, comme un
      CLAUDE.md de projet, modifiable par le mainteneur du repo.

  - prompt: |
      Plusieurs équipes d'une même organisation ont chacune recréé, dans leur portée
      personnelle (~/.claude/skills/), une skill quasi identique « comment rédiger un bon
      rapport de bug », avec de légères variations qui divergent au fil du temps. Un
      architecte veut mettre fin à cette duplication.

      Quelle correction structurelle est la plus adaptée ?
    options:
      - "Consolider la procédure en une seule skill de portée projet (ou partagée via un mécanisme équivalent de contrôle de version), commitée et maintenue à un seul endroit, plutôt que dupliquée dans les portées personnelles de chaque développeur."
      - "Laisser chaque développeur garder sa propre version personnelle, car les skills personnelles ne peuvent techniquement pas être partagées."
      - "Convertir chaque copie personnelle en CLAUDE.md personnel, ce qui règle le problème de duplication."
      - "Supprimer purement et simplement toutes les copies, sans les remplacer, puisqu'une telle procédure n'apporte de toute façon aucune valeur."
    answer: 0
    level: intermediaire
    tags: [claude-code, skills]
    explanation: >
      Une procédure destinée à toute l'équipe doit vivre en un seul endroit versionné et
      partagé (portée projet), pas dupliquée dans les portées personnelles de chaque
      développeur où elle diverge inévitablement au fil du temps. L'option 1 se trompe : rien
      n'empêche de déplacer une skill personnelle vers une portée partagée. L'option 2 ne
      change rien à la duplication, un CLAUDE.md personnel restant tout aussi individuel
      qu'une skill personnelle. L'option 3 ignore la valeur réelle de la procédure, qui est de
      la consolider, pas de la supprimer.

  - prompt: |
      Une équipe construit un assistant de revue de code qui doit, avant de rédiger ses
      commentaires, explorer largement le dépôt (lire de nombreux fichiers liés, comprendre
      l'historique de modifications récentes) pour rassembler du contexte. Ce travail
      d'exploration produit un volume important de contenu qui n'est plus utile une fois les
      commentaires de revue rédigés. L'équipe hésite entre packager cette exploration comme
      une skill ou comme un sous-agent dédié.

      Quel choix est le plus adapté, et pourquoi ?
    options:
      - "Une skill : elle charge une procédure réutilisable dans le contexte courant, exactement ce qu'il faut pour une exploration volumineuse."
      - "Ni l'un ni l'autre : ce type d'exploration doit toujours rester dans le fil principal pour garantir la cohérence des commentaires."
      - "Un sous-agent dédié à l'exploration, avec un contexte isolé et des outils restreints en lecture seule (Read, Grep, Glob) : le volume exploratoire reste dans son propre contexte, et seul un résumé condensé revient à la conversation principale de revue."
      - "Une skill, à condition de restreindre ses outils via le champ tools: de son front-matter."
    answer: 2
    level: avance
    tags: [claude-code, subagents]
    explanation: >
      Une skill (option 0) charge son contenu dans le contexte **courant** : l'exploration
      volumineuse gonflerait directement la conversation principale de revue, l'inverse du
      bénéfice recherché — un sous-agent absorbe ce volume dans un contexte isolé et ne
      renvoie qu'un résumé condensé. L'option 1 ignore le risque réel de saturation du
      contexte principal par une exploration large. L'option 3 est fausse : le champ tools:
      restreint les outils d'un sous-agent, pas d'une skill — les skills ont leurs propres
      champs (allowed-tools/disallowed-tools) et même restreintes, elles chargeraient
      toujours l'exploration dans le contexte courant, sauf à les exécuter en sous-agent
      (context: fork), ce qui revient à la réponse correcte.

  - prompt: |
      Une équipe de 15 développeurs veut concevoir sa stratégie de hooks Claude Code : une
      suite de tests complète (12 minutes) doit garantir la qualité avant fusion, mais ne
      doit jamais bloquer chaque itération locale d'un développeur ; un contrôle rapide de
      syntaxe/lint (quelques secondes), en revanche, doit s'exécuter à chaque édition locale
      pour un feedback immédiat.

      Quelle répartition est la plus adaptée ?
    options:
      - "Exécuter la suite complète de 12 minutes dans un hook PostToolUse local à chaque édition, pour détecter les problèmes le plus tôt possible."
      - "Supprimer tout hook local et tout hook CI, en comptant uniquement sur la relecture manuelle des développeurs."
      - "Exécuter le contrôle rapide de lint uniquement en CI, et la suite complète de 12 minutes en local à chaque édition."
      - "Réserver la suite complète de 12 minutes à la CI (déclenchée à la pull request), et garder dans un hook local (PostToolUse ou PreToolUse, selon le besoin de blocage) uniquement le contrôle rapide de lint/syntaxe pour un feedback immédiat sans bloquer chaque itération."
    answer: 3
    level: avance
    tags: [claude-code, hooks]
    explanation: >
      Un hook lent bloque le flux à chaque déclenchement : la vérification lourde doit vivre
      en CI (où l'attente est acceptable, à la fréquence d'une pull request), tandis que le
      hook local ne garde qu'un contrôle rapide, cohérent avec l'exigence de ne jamais
      ralentir chaque itération. L'option 0 reproduit exactement le problème que l'énoncé
      cherche à éviter. L'option 1 fait perdre toute garantie automatisée. L'option 2 inverse
      la répartition : la suite longue en local bloquerait chaque itération, l'inverse du
      besoin exprimé.

  - prompt: |
      Une équipe veut que tous les contributeurs juniors soient structurellement empêchés
      d'exécuter des commandes destructives en production (`Bash(git push --force*)`,
      suppression de ressources cloud), tandis que les mainteneurs seniors doivent conserver
      plus de latitude sur certaines opérations d'infrastructure légitimes. Les permissions
      Claude Code se configurent par portée de fichier (projet, utilisateur, local), pas
      nativement par « rôle » de personne.

      Quelle architecture de permissions répond le mieux à ce besoin ?
    options:
      - "Une seule allowlist partagée par toute l'équipe, sans distinction entre juniors et seniors, faute de pouvoir exprimer des rôles."
      - "Une règle deny sur les commandes vraiment destructives dans le settings.json de portée projet (partagé, donc un plancher garanti pour tout le monde, puisqu'une règle deny l'emporte toujours quelle que soit sa portée), en laissant les mainteneurs seniors ajuster des allow supplémentaires plus larges dans leur propre portée locale/utilisateur pour le reste."
      - "Une règle allow très permissive dans settings.json de portée projet, à charge pour chaque junior de s'auto-discipliner sur les commandes destructives."
      - "Des instructions dans le CLAUDE.md de projet demandant aux juniors de ne pas exécuter de commandes destructives."
    answer: 1
    level: intermediaire
    tags: [claude-code, permissions]
    explanation: >
      Puisqu'une règle deny l'emporte toujours sur un allow, quelle que soit la portée d'où
      elle vient, la placer dans le settings.json de projet (partagé par toute l'équipe) crée
      un plancher garanti pour tout le monde, y compris les juniors, tandis que les seniors
      peuvent ajuster des permissions supplémentaires dans leur portée personnelle pour le
      reste. L'option 0 ignore le besoin explicite de différencier juniors et seniors.
      L'option 2 inverse la logique : une allowlist permissive combinée à de l'auto-discipline
      n'est pas une garantie structurelle. L'option 3 reste une instruction textuelle non
      contraignante, exactement le type de réponse que l'examen sanctionne.

  - prompt: |
      Un serveur MCP de reporting interne doit être accessible à l'ensemble de
      l'organisation d'ingénierie, à travers des dizaines de dépôts différents, pas
      seulement un seul projet. Une équipe propose de committer un `.mcp.json` identique
      dans chacun des dizaines de dépôts concernés pour que tout le monde y ait accès.

      Quel est le problème avec cette approche, et quelle est l'alternative structurelle ?
    options:
      - "Aucun problème : dupliquer .mcp.json dans chaque dépôt est la pratique recommandée pour un serveur partagé par toute l'organisation."
      - "Il faut renommer le fichier .mcp.local.json dans chaque dépôt pour éviter la duplication."
      - "La duplication dans des dizaines de dépôts crée un risque de dérive (versions différentes au fil des mises à jour) ; il est préférable de configurer ce serveur une fois en portée utilisateur pour chaque développeur, ou via un mécanisme de configuration centralisé au niveau organisation, plutôt que de le committer indépendamment dans chaque dépôt."
      - "Il faut désactiver ce serveur MCP dans tous les dépôts sauf un, désigné comme source de vérité unique."
    answer: 2
    level: intermediaire
    tags: [claude-code, mcp]
    explanation: >
      Dupliquer une configuration partagée dans des dizaines de dépôts indépendants crée un
      risque de dérive silencieuse (une mise à jour appliquée à un dépôt mais oubliée dans un
      autre) ; une configuration utilisateur ou une gestion centralisée organisationnelle
      évite cette duplication répétée. L'option 0 ignore ce risque de dérive à l'échelle de
      dizaines de dépôts. L'option 1 ne change rien au problème de duplication, seulement au
      nom du fichier. L'option 3 casserait l'accès pour tous les dépôts sauf un, contraire à
      l'exigence d'accès pour toute l'organisation.

  - prompt: |
      Un produit est découpé en plusieurs services au sein d'un même monorepo (un seul
      dépôt Git, plusieurs sous-dossiers de services). Une équipe s'inquiète de devoir
      dupliquer sa skill de check-list de revue de code dans le dossier de chaque service
      pour qu'elle soit disponible partout dans le monorepo.

      Quelle est l'évaluation correcte de cette inquiétude ?
    options:
      - "L'inquiétude n'est pas fondée : un monorepo constitue un seul dépôt, donc une seule portée projet — une skill placée à la racine (.claude/skills/) est déjà disponible pour l'ensemble du monorepo, sans duplication nécessaire dans chaque sous-dossier de service."
      - "L'inquiétude est justifiée : chaque sous-dossier de service nécessite sa propre copie de la skill pour être reconnue par Claude Code."
      - "L'inquiétude est justifiée, mais seulement si le monorepo dépasse 10 services."
      - "L'inquiétude n'est pas fondée, mais seulement si chaque service a son propre dépôt Git séparé (sous-module)."
    answer: 0
    level: intermediaire
    tags: [claude-code, skills]
    explanation: >
      Un monorepo, quelle que soit sa structure interne en services, reste un seul dépôt : la
      portée projet couvre l'ensemble du monorepo depuis sa racine, une skill placée à
      `.claude/skills/` y est donc déjà disponible partout, sans duplication. L'option 1
      confond la structure interne (sous-dossiers) avec des portées de configuration
      distinctes, ce qu'elles ne sont pas. L'option 2 introduit un seuil arbitraire sans
      rapport avec le mécanisme réel de portée. L'option 3 inverse la situation : des
      sous-modules avec leurs propres dépôts Git seraient effectivement des portées projet
      distinctes, contrairement au monorepo unique décrit dans l'énoncé.

  - prompt: |
      Un dépôt partagé accumule au fil du temps 40 skills dans `.claude/skills/`, écrites
      par des développeurs différents avec des styles de description très variables
      (certaines vagues, d'autres précises). L'équipe observe que Claude déclenche
      fréquemment la mauvaise skill, ou aucune, pour des demandes pourtant courantes.

      Quelle correction structurelle s'applique à l'échelle de l'ensemble des 40 skills ?
    options:
      - "Réduire arbitrairement le nombre de skills à 10, en supprimant les moins utilisées, sans toucher aux descriptions restantes."
      - "Instaurer une discipline de rédaction des descriptions comme levier de gouvernance transversal : exiger, pour toute skill créée ou modifiée, une description prescriptive (ce qu'elle fait, quand l'invoquer, ce qui l'exclut), au lieu de laisser chaque développeur décrire sa skill à sa propre convenance."
      - "Convertir toutes les skills en sous-agents, qui se déclenchent toujours correctement quelle que soit la qualité de leur description."
      - "Renommer toutes les skills avec des identifiants numériques séquentiels pour éviter toute ambiguïté de nom."
    answer: 1
    level: intermediaire
    tags: [claude-code, skills]
    explanation: >
      À l'échelle de 40 skills écrites par des développeurs différents, le problème est un
      manque de discipline collective sur la qualité des descriptions (le signal de
      déclenchement) : l'imposer comme norme transversale au moment de la création/
      modification de toute skill est la correction qui s'applique à l'ensemble. Supprimer des
      skills (option 0) ne corrige pas la qualité de description de celles qui restent. Les
      sous-agents (option 2) se déclenchent eux aussi via leur propre champ description :
      convertir n'importe quelle skill en sous-agent ne règle en rien un problème de
      description vague. Renommer par identifiants numériques (option 3) supprimerait
      justement toute information utile au déclenchement automatique.

  - prompt: |
      Une organisation a accumulé, au fil du temps et à travers différentes équipes, des
      dizaines de sous-agents personnalisés (revue de code, résumé de changelog,
      exploration de schéma de base de données, génération de tests). Chaque équipe a
      choisi le modèle de son sous-agent au hasard, souvent le plus capable par défaut, sans
      réflexion sur le profil réel de la tâche. L'architecte veut établir une convention
      transversale de choix de modèle pour l'ensemble de ces sous-agents.

      Quelle convention est la plus adaptée ?
    options:
      - "Établir une convention par profil de tâche dans le champ model: du front-matter de chaque sous-agent : un modèle léger et rapide pour les tâches simples et à fort volume (résumé de changelog, classification), un modèle plus capable réservé aux tâches complexes ou à fort enjeu (revue de code approfondie), indépendamment du modèle utilisé par la conversation principale qui invoque ces sous-agents."
      - "Fixer le même modèle (le plus capable disponible) pour tous les sous-agents de l'organisation, par souci d'uniformité et de simplicité de maintenance."
      - "Ne jamais définir model: dans le front-matter des sous-agents, pour qu'ils héritent tous automatiquement du modèle le plus économique disponible."
      - "Réduire max_tokens sur tous les sous-agents pour compenser un modèle jugé trop capable pour leur tâche."
    answer: 0
    level: avance
    tags: [claude-code, subagents]
    explanation: >
      Le champ model: du front-matter d'un sous-agent est indépendant du modèle de la
      conversation principale : établir une convention par profil de tâche (léger pour le
      simple/fort volume, plus capable pour le complexe/fort enjeu) est le levier structurel
      adapté à l'échelle de dizaines de sous-agents. L'option 1 uniformise sans tenir compte du
      profil réel de chaque tâche, gaspillant du coût sur les tâches simples. L'option 2 est
      fausse : omettre model: hérite du modèle de la conversation principale, pas d'un modèle
      économique par défaut. max_tokens (option 3) régit la longueur de sortie autorisée, pas
      le modèle utilisé ni son coût par token.

  - prompt: |
      Une organisation formalise sa politique de configuration Claude Code pour l'ensemble
      de ses équipes : (a) « lancer `composer test` avant de considérer une tâche terminée »
      doit s'appliquer à tous les développeurs sur ce projet ; (b) une procédure détaillée de
      200 lignes pour provisionner un nouveau microservice, rarement utilisée, doit rester
      disponible pour l'équipe mais ne pas alourdir chaque session ; (c) « je préfère des
      messages de commit détaillés » est une préférence strictement personnelle d'un
      développeur, sur tous ses projets ; (d) l'URL d'un environnement de test personnel ne
      doit jamais être partagée avec le reste de l'équipe.

      Quelle affectation de portées est correcte pour ces quatre éléments ?
    options:
      - "(a) CLAUDE.md utilisateur ; (b) CLAUDE.md de projet ; (c) skill de projet ; (d) managed policy."
      - "(a) skill de projet ; (b) CLAUDE.md de projet ; (c) CLAUDE.local.md ; (d) CLAUDE.md utilisateur."
      - "(a), (b), (c) et (d) doivent tous vivre dans le même CLAUDE.md de projet, pour centraliser toute la configuration en un seul endroit."
      - "(a) CLAUDE.md de projet ; (b) skill de projet ; (c) CLAUDE.md utilisateur (~/.claude/CLAUDE.md) ; (d) CLAUDE.local.md."
    answer: 3
    level: avance
    tags: [claude-code]
    explanation: >
      (a) est une règle courte s'appliquant à tous, donc CLAUDE.md de projet ; (b) est une
      procédure longue et rarement invoquée, donc une skill de projet chargée à la demande ;
      (c) est une préférence strictement personnelle valable sur tous les projets d'un
      développeur, donc son CLAUDE.md utilisateur ; (d) est une information locale,
      personnelle, à ne jamais partager, donc CLAUDE.local.md (gitignoré). L'option 0 inverse
      (a) et (c), et invente un besoin de managed policy pour une simple URL locale. L'option 1
      place à tort une règle courte d'équipe en skill, et une préférence personnelle en fichier
      local plutôt qu'utilisateur. L'option 2 ignore complètement la logique de portée et
      gonflerait le contexte de chaque session avec du contenu non pertinent pour la plupart
      des tâches.

  - prompt: |
      Une équipe de 15 développeurs veut garantir qu'aucune session Claude Code, sur la
      machine d'aucun développeur ni en CI, ne puisse exécuter `Bash(git push --force *)`
      vers la branche principale — une garantie qui doit tenir même si un développeur a, par
      erreur ou par convenance, une règle plus permissive dans son propre
      `settings.local.json`.

      Où cette règle doit-elle être placée pour offrir cette garantie ?
    options:
      - "Uniquement dans un hook côté CI, puisque c'est là que les conséquences d'un force-push sont les plus visibles."
      - "Dans le CLAUDE.md de projet, sous forme d'instruction demandant de ne jamais faire de force-push vers la branche principale."
      - "Dans le settings.json de portée projet, commité dans le dépôt : une règle deny à ce niveau l'emporte toujours sur un allow local, et s'applique automatiquement à toute personne qui clone le dépôt — développeurs comme CI."
      - "Dans le settings.local.json de chaque développeur individuellement, en demandant à chacun de l'ajouter lui-même."
    answer: 2
    level: intermediaire
    tags: [claude-code, permissions]
    explanation: >
      Une règle deny de portée projet, commitée, s'applique automatiquement à quiconque clone
      le dépôt (développeurs et CI) et l'emporte toujours sur un allow local plus permissif :
      c'est la seule option qui offre une garantie qui ne dépend pas de la configuration
      locale de chaque poste. Un hook uniquement côté CI (option 0) laisserait les sessions
      locales des développeurs sans protection. Une instruction dans le CLAUDE.md (option 1)
      reste une consigne textuelle non contraignante. Compter sur chaque développeur pour
      l'ajouter individuellement dans son propre settings.local.json (option 3) est exactement
      le scénario de défaillance décrit dans l'énoncé (un développeur peut l'oublier ou le
      contourner).

  # ================ PROMPT ENGINEERING & STRUCTURED OUTPUT (12) ================
  - prompt: |
      Un pipeline d'extraction traite des documents entrants et transmet ses résultats à
      six microservices en aval (facturation, CRM, analytique, archivage, notifications,
      audit), chacun attendant exactement la même forme de données en sortie de l'étape
      d'extraction.

      Quelle architecture garantit le mieux la cohérence entre l'étape d'extraction et ses
      six consommateurs ?
    options:
      - "Définir un unique schéma JSON, exposé via output_config.format (type: json_schema), versionné comme le contrat partagé entre l'étape d'extraction et les six microservices consommateurs — une seule source de vérité pour la forme des données, garantie par décodage contraint plutôt qu'espérée par convention."
      - "Laisser l'étape d'extraction produire du texte libre, à charge pour chacun des six microservices d'écrire son propre parseur ad hoc pour interpréter la sortie."
      - "Demander dans le prompt de l'étape d'extraction de « bien respecter le format attendu par chaque microservice en aval »."
      - "Laisser chaque microservice définir son propre schéma indépendamment, sans concertation, et faire converger les différences plus tard si des incohérences apparaissent."
    answer: 0
    level: intermediaire
    tags: [prompt-engineering, structured-output]
    explanation: >
      Un schéma unique, exposé via output_config.format et versionné comme contrat partagé,
      garantit structurellement (par décodage contraint) que les six consommateurs reçoivent
      toujours la même forme de données, sans dépendre d'un accord tacite ou d'un parsing
      individuel fragile. Laisser chaque service écrire son propre parseur (option 1)
      multiplie les points de défaillance pour un même problème. Une instruction de prompt
      (option 2) reste probabiliste. Laisser chaque service définir son propre schéma
      indépendamment (option 3) recrée exactement le problème de divergence que l'architecture
      doit éviter.

  - prompt: |
      Le schéma partagé de la question précédente doit évoluer : un nouveau champ
      obligatoire (`document_source`) doit être ajouté pour un besoin de traçabilité.
      Certains des six microservices consommateurs ne seront prêts à le gérer que dans
      plusieurs semaines.

      Quelle est la démarche d'architecture la plus sûre pour faire évoluer ce contrat
      partagé ?
    options:
      - "Modifier directement le schéma en production dès que le champ est prêt côté extraction, sans coordination avec les équipes consommatrices."
      - "Ajouter le champ comme obligatoire immédiatement, en informant les équipes consommatrices par un simple message a posteriori."
      - "Verser le nouveau champ comme optionnel dans un premier temps (ou publier une nouvelle version versionnée du schéma), coordonner la migration avec les équipes consommatrices, puis ne le rendre obligatoire pour tous qu'une fois tous les consommateurs prêts — plutôt que de muter silencieusement le contrat partagé en place."
      - "Ne jamais faire évoluer un schéma une fois qu'il a été partagé avec plusieurs consommateurs, quelle que soit la raison."
    answer: 2
    level: avance
    tags: [prompt-engineering, structured-output]
    explanation: >
      Faire évoluer un contrat partagé par plusieurs consommateurs exige une coordination de
      version (champ d'abord optionnel ou nouvelle version explicite) pour éviter de casser
      silencieusement les services pas encore prêts. Modifier directement en production sans
      coordination (option 0) romprait les microservices non préparés dès la mise en
      production. Rendre le champ obligatoire immédiatement avec juste un message a posteriori
      (option 1) revient au même risque, la notification informelle n'étant pas une garantie
      de préparation réelle. Refuser toute évolution (option 3) est intenable à long terme et
      n'est pas la réponse structurelle attendue.

  - prompt: |
      Un harnais de revue de code automatisée intégré à la CI poste en moyenne
      15 commentaires par pull request, dont environ 40 % sont jugés par les développeurs
      comme des remarques mineures sans réelle valeur (nitpicks). L'équipe envisage
      d'ajouter au prompt du reviewer une instruction « sois moins pointilleux et ne
      commente que ce qui compte vraiment ».

      Quel changement structurel serait le plus efficace pour réduire durablement ce taux de
      faux positifs ?
    options:
      - "Se contenter d'ajuster l'instruction du prompt comme envisagé, en espérant que le modèle applique mieux ce jugement de pertinence."
      - "Désactiver entièrement la revue automatisée en CI, en revenant à une revue 100 % humaine."
      - "Augmenter le nombre de commentaires postés par PR, pour compenser statistiquement le taux de faux positifs."
      - "Restructurer le harnais en deux passes : une première passe qui dresse une liste large de préoccupations possibles, puis une seconde passe de critique/filtrage qui ne retient que celles dépassant un seuil de matérialité explicite avant de les poster — plutôt que de compter sur une seule instruction de prudence dans le prompt."
    answer: 3
    level: intermediaire
    tags: [prompt-engineering]
    explanation: >
      Un problème récurrent et mesurable (40 % de faux positifs) justifie une correction
      structurelle : une seconde passe dédiée au filtrage par un seuil de matérialité
      explicite retient ce qui compte réellement, plutôt que de dépendre d'un unique jugement
      de pertinence en une seule passe. Ajuster uniquement l'instruction du prompt (option 0)
      reste probabiliste et n'a montré aucune garantie de fiabilité pour ce type de jugement
      nuancé. Désactiver la revue automatisée (option 1) abandonne toute la valeur du système
      au lieu de le corriger. Augmenter le nombre de commentaires (option 2) aggraverait
      directement le problème plutôt que de le résoudre.

  - prompt: |
      Après avoir mis en place le pipeline draft → critique → filtrage de la question
      précédente, l'équipe applique ce parcours complet à **toutes** les pull requests, y
      compris une PR qui ne modifie qu'une valeur de configuration sur une ligne — ce qui
      triple la latence et le coût de la revue pour ce cas trivial, sans gain de qualité
      perceptible.

      Quelle correction structurelle est la plus adaptée ?
    options:
      - "Garder le pipeline complet pour toutes les PR, la latence supplémentaire étant un coût acceptable pour garantir l'uniformité du processus."
      - "Router dynamiquement selon la complexité du diff (taille, nombre de fichiers touchés, un heuristique simple) : une passe unique pour les changements triviaux et isolés, réservant le pipeline complet draft → critique → filtrage aux PR complexes ou à fort enjeu."
      - "Supprimer la passe de critique pour toutes les PR, en ne gardant que le draft initial, quelle que soit la complexité de la PR."
      - "Ajouter une troisième passe supplémentaire à toutes les PR pour compenser la perte de qualité perçue sur les cas triviaux."
    answer: 1
    level: intermediaire
    tags: [prompt-engineering]
    explanation: >
      Router le pipeline selon la complexité réelle du diff applique le principe du
      multi-pass là où il apporte une valeur réelle (PR complexes/à fort enjeu) sans imposer
      son coût aux cas triviaux qui n'en ont pas besoin. Garder le pipeline complet pour
      toutes les PR (option 0) maintient exactement le surcoût inutile décrit. Supprimer la
      passe de critique pour tout le monde (option 2) sacrifierait la qualité sur les PR
      complexes qui en ont réellement besoin. Ajouter une passe de plus partout (option 3)
      aggraverait encore le problème de coût sans justification.

  - prompt: |
      Un template de system prompt est partagé par 30 agents internes différents dans une
      même organisation. Au fil du temps, chaque équipe y ajoute ses propres instructions de
      cas particuliers directement dans ce bloc commun, qui grossit continuellement et finit
      par diluer l'attention du modèle pour les équipes dont les instructions ne les
      concernent pas.

      Quelle architecture corrige structurellement ce problème ?
    options:
      - "Continuer à ajouter les instructions de chaque équipe dans le même bloc partagé, en les triant simplement par ordre alphabétique pour plus de clarté."
      - "Supprimer le system prompt partagé et laisser chaque équipe écrire son system prompt indépendamment, sans aucun socle commun."
      - "Déplacer l'intégralité du bloc partagé, cas particuliers inclus, dans le premier message utilisateur de chaque conversation plutôt que dans le system prompt."
      - "Séparer un socle commun réduit aux règles réellement universelles à tous les 30 agents, et composer, au moment du déploiement de chaque agent, ce socle avec des extensions spécifiques à l'équipe ou à l'agent concerné — plutôt qu'un unique bloc partagé qui grossit sans limite pour tout le monde."
    answer: 3
    level: avance
    tags: [prompt-engineering]
    explanation: >
      Séparer un socle universel réduit d'extensions par équipe, composées au déploiement,
      évite que les instructions spécifiques d'une équipe diluent l'attention du modèle pour
      toutes les autres équipes qui ne sont pas concernées. Continuer à tout empiler dans le
      même bloc (option 0) ne traite pas la cause du problème, seulement sa présentation.
      Supprimer tout socle commun (option 1) ferait perdre les règles réellement
      transversales à cohérer entre les 30 agents. Déplacer le bloc entier en message
      utilisateur (option 2) ferait perdre l'autorité d'opérateur et la persistance à chaque
      tour propres au system prompt, sans résoudre le problème de dilution.

  - prompt: |
      Une plateforme interne fournit une bibliothèque d'exemples de prompts que différentes
      équipes copient-collent pour démarrer leurs intégrations. Cette bibliothèque inclut
      systématiquement une dizaine d'exemples few-shot, même pour les équipes dont la tâche
      utilise déjà output_config.format avec un schéma complet — ce qui alourdit
      inutilement le coût de chaque requête à l'échelle de toute la plateforme.

      Quelle recommandation d'architecture la plateforme devrait-elle formaliser ?
    options:
      - "Documenter clairement que les exemples few-shot sont redondants pour toute tâche déjà contrainte par un schéma structuré complet (la forme est déjà garantie), et ne les recommander que pour les tâches dont le style ou le contenu reste ambigu à décrire en langage naturel — une règle de la bibliothèque, pas une décision au cas par cas non documentée."
      - "Garder systématiquement les dix exemples few-shot dans tous les cas, par souci d'uniformité entre les équipes."
      - "Interdire l'usage de tout exemple few-shot sur la plateforme, quelle que soit la tâche."
      - "Réserver les exemples few-shot uniquement aux équipes utilisant le modèle le plus capable disponible."
    answer: 0
    level: intermediaire
    tags: [prompt-engineering]
    explanation: >
      Formaliser la règle au niveau de la bibliothèque partagée (few-shot redondant si un
      schéma structuré complet existe déjà, utile sinon pour l'ambiguïté de style) évite que
      chaque équipe reproduise le même surcoût inutile à l'échelle de la plateforme. Garder
      systématiquement les dix exemples (option 1) maintient le problème identifié. Interdire
      tout few-shot (option 2) priverait les équipes dont la tâche a réellement un format
      ambigu d'un outil utile. Réserver le few-shot à un modèle particulier (option 3)
      introduit un critère sans rapport avec la véritable raison d'utilité des exemples.

  - prompt: |
      Un pipeline traite plusieurs milliers d'extractions structurées par heure. Une règle
      métier impose que la somme des lignes d'une facture corresponde exactement au total
      déclaré — une contrainte qui porte sur plusieurs champs à la fois et ne peut pas être
      exprimée dans un schéma JSON unique.

      Quelle architecture applique cette règle à l'échelle de ce volume de traitement ?
    options:
      - "Ajouter la règle de cohérence comme description supplémentaire sur le schéma de sortie, en comptant sur output_config.format pour la faire respecter automatiquement."
      - "Construire une boucle de validation côté client : vérifier la cohérence des champs après réception, et si elle échoue, renvoyer l'erreur précise au modèle pour une nouvelle tentative bornée par un nombre maximal d'essais, avec une file d'attente d'examen humain pour les cas qui ne convergent pas après ces tentatives."
      - "Répéter la règle de cohérence trois fois dans le prompt de chaque extraction pour renforcer son respect par le modèle."
      - "Augmenter la taille du modèle utilisé (passer à un modèle plus capable), qui garantira mécaniquement le respect de cette règle métier."
    answer: 1
    level: avance
    tags: [prompt-engineering, structured-output]
    explanation: >
      Une règle qui porte sur la cohérence entre plusieurs champs ne peut pas être garantie
      par le décodage contraint d'un schéma JSON : elle doit être validée côté client, avec
      une boucle de retry bornée et une échappatoire vers un examen humain pour les cas qui ne
      convergent pas — une architecture qui tient à l'échelle de milliers d'extractions par
      heure. Ajouter la règle comme simple description (option 0) reste une indication
      textuelle non garantie par le décodage contraint. Répéter la règle dans le prompt
      (option 2) reste probabiliste. Changer de modèle (option 3) n'offre aucune garantie
      structurelle de cohérence arithmétique entre plusieurs champs.

  - prompt: |
      Une plateforme héberge des dizaines d'intégrations internes historiques qui
      préremplissent encore le tour assistant (certaines avec `{` pour amorcer un JSON,
      d'autres avec une phrase fixe pour éviter un préambule), écrites à l'époque de modèles
      plus anciens. La plateforme migre l'ensemble de ses intégrations vers des modèles
      récents.

      Quelle démarche d'architecture est la plus adaptée pour cette migration ?
    options:
      - "Ne rien changer avant la migration : les intégrations continueront de fonctionner à l'identique sur les modèles récents."
      - "Ajouter un header bêta spécifique pour réactiver le comportement historique du préfill sur les modèles récents."
      - "Auditer l'ensemble des intégrations utilisant un préfill de la réponse assistant sur le dernier tour, et les remplacer systématiquement par output_config.format (pour un JSON garanti) ou par une instruction directe dans le system prompt (pour éviter un préambule) — car un préfill sur le dernier tour est rejeté avec une erreur 400 sur les modèles récents."
      - "Ne migrer que les intégrations qui préremplissent avec un caractère JSON, en laissant les autres inchangées."
    answer: 2
    level: intermediaire
    tags: [prompt-engineering]
    explanation: >
      Un audit systématique, remplaçant chaque usage de préfill par le mécanisme structurel
      adapté (schéma de sortie ou instruction système), est la seule démarche qui couvre
      l'ensemble des intégrations avant qu'elles échouent en production, puisque le préfill
      sur le dernier tour est rejeté (erreur 400) sur les modèles récents. Ne rien changer
      (option 0) mène droit à des pannes en production dès la migration. Aucun header bêta ne
      réactive ce comportement (option 1) : c'est une suppression définitive sur ces modèles.
      Ne migrer qu'une partie des intégrations (option 3) laisserait les autres échouer tout
      autant.

  - prompt: |
      Une entreprise de legal-tech applique systématiquement un pipeline en trois passes
      (brouillon, critique adverse, version finale) à **chaque** document généré, y compris
      des documents standardisés à faible enjeu, au motif que « plus de passes est toujours
      plus sûr ».

      Quelle est l'évaluation la plus juste de cette politique, et quelle architecture
      serait préférable ?
    options:
      - "La politique est justifiée telle quelle : appliquer systématiquement trois passes à tout document est toujours la décision la plus sûre, quel que soit l'enjeu."
      - "La politique est insuffisante : il faudrait systématiquement une quatrième passe pour tout document, quel que soit son enjeu."
      - "La politique n'a de sens que si l'entreprise change de modèle entre chaque passe."
      - "La politique généralise à tort une règle qui ne se justifie que pour les documents complexes et à fort enjeu ; une politique par palier serait préférable : documents standardisés/à faible risque en une seule passe avec un schéma structuré, documents complexes/à fort enjeu réservés au pipeline complet en trois passes."
    answer: 3
    level: intermediaire
    tags: [prompt-engineering]
    explanation: >
      Le multi-pass se justifie par la complexité et l'enjeu de la tâche, pas par principe :
      une politique par palier applique le pipeline complet là où il apporte une réelle
      valeur (documents complexes/à fort enjeu) sans imposer son coût aux documents
      standardisés à faible risque. L'option 0 généralise à tort une règle de sécurité sans
      tenir compte du profil de chaque document. L'option 1 aggraverait encore le surcoût
      sans justification supplémentaire. L'option 2 introduit une condition sur le changement
      de modèle qui n'est pas le facteur pertinent ici.

  - prompt: |
      Un chatbot de support est vendu comme produit à de nombreuses entreprises clientes,
      chacune avec ses propres règles persistantes (ne jamais révéler sa formule de
      tarification interne, toujours répondre dans la langue du client final, etc.). Une
      équipe envisage d'injecter ces règles dans le premier message utilisateur de chaque
      conversation, en les adaptant par client.

      Quelle architecture serait la plus fiable à l'échelle de nombreux clients ?
    options:
      - "Garder les règles dans le premier message utilisateur de chaque conversation, en les adaptant dynamiquement pour chaque client, comme prévu."
      - "Regrouper les règles de tous les clients dans un seul system prompt générique, commun à toutes les conversations, quel que soit le client concerné."
      - "Construire dynamiquement, pour chaque requête, un bloc system prompt propre à chaque client à partir de sa configuration stockée : les règles persistantes du client gardent ainsi l'autorité de l'opérateur et restent présentes à chaque tour, quelle que soit la longueur de la conversation, plutôt que d'être diluées dans un message utilisateur du premier tour."
      - "Ne définir les règles qu'une seule fois, lors du tout premier déploiement du produit, sans jamais les adapter par client."
    answer: 2
    level: avance
    tags: [prompt-engineering]
    explanation: >
      Une règle métier persistante par client doit être assemblée dans le system prompt (qui
      porte l'autorité de l'opérateur et reste présent à chaque tour), pas dans un message
      utilisateur qui peut se diluer au fil d'une conversation longue — construire ce bloc
      dynamiquement à partir de la configuration de chaque client permet de tenir cette
      garantie à l'échelle de nombreux clients. L'option 0 reproduit exactement le risque de
      dilution déjà documenté pour ce type de règle. L'option 1 perdrait la spécificité de
      chaque client, contraire au besoin d'un produit multi-tenant. L'option 3 ignore que
      chaque client a des règles différentes qui doivent pouvoir être configurées
      indépendamment.

  - prompt: |
      Un agent interagit principalement via des appels d'outils tout au long de sa boucle,
      et ne produit une réponse en texte libre qu'à la toute fin, sous la forme d'un résumé
      destiné à un tableau de bord humain. L'équipe se demande si strict: true sur les
      définitions d'outils suffit à garantir également la forme de ce résumé final.

      Quelle est l'architecture correcte ?
    options:
      - "strict: true garantit uniquement la conformité des paramètres passés aux outils ; pour garantir la forme du résumé final destiné au tableau de bord, il faut appliquer output_config.format sur cette réponse finale spécifiquement — deux mécanismes distincts, à composer chacun là où il s'applique."
      - "strict: true sur les outils suffit également à garantir la forme du résumé final en texte libre, les deux mécanismes étant équivalents."
      - "Aucun des deux mécanismes ne s'applique à un agent qui utilise des outils : il faut nécessairement une boucle de validation manuelle pour tout garantir."
      - "Il suffit d'ajouter strict: true au niveau du system prompt de l'agent pour couvrir à la fois les outils et la réponse finale."
    answer: 0
    level: avance
    tags: [prompt-engineering, structured-output]
    explanation: >
      strict: true et output_config.format sont deux mécanismes distincts qui s'appliquent à
      des endroits différents : le premier garantit les paramètres d'un appel d'outil, le
      second garantit la forme d'une réponse texte — les composer chacun où il s'applique est
      l'architecture correcte pour ce système mixte outils + résumé final. L'option 1 confond
      les deux mécanismes, qui ne se substituent pas l'un à l'autre. L'option 2 ignore que ces
      deux mécanismes couvrent justement ce cas sans boucle de validation manuelle
      supplémentaire. strict: true (option 3) est un champ d'une définition d'outil, pas un
      paramètre de system prompt.

  - prompt: |
      Une plateforme d'intégration multi-tenant doit produire des sorties structurées dont
      le format de nommage des champs diffère selon le client (certains attendent du
      snake_case, d'autres du camelCase). L'équipe a d'abord déployé (a) un schéma unique
      avec un transformateur de noms de champs appliqué après coup côté serveur — mais deux
      incidents de production ont déjà été causés par des bugs de cette couche de
      transformation (champs imbriqués oubliés, collisions de noms). L'alternative étudiée :
      (b) générer, à la demande, un output_config.format différent par client à partir de sa
      préférence stockée.

      Quelle option est architecturalement préférable, et pourquoi ?
    options:
      - "L'option (a) : un schéma unique avec transformation après coup est toujours plus simple à maintenir qu'un schéma par client."
      - "L'option (b) : générer le schéma directement à partir de la préférence de chaque client garantit la conformité par décodage contraint dès la génération, sans dépendre d'une étape de transformation de chaînes après coup qui peut elle-même comporter des bugs."
      - "Les deux options sont strictement équivalentes en termes de garantie offerte aux clients."
      - "Aucune des deux : il faut demander dans le prompt à Claude d'adapter lui-même la casse des noms de champs selon le client visé."
    answer: 1
    level: avance
    tags: [prompt-engineering, structured-output]
    explanation: >
      Générer le schéma par client directement depuis sa préférence stockée place la garantie
      de conformité au niveau du décodage contraint dès la génération, plutôt que de dépendre
      d'une étape de transformation supplémentaire après coup qui introduit son propre risque
      de bug. L'option 0 déplace la garantie hors du mécanisme structurel garanti, vers du
      code de transformation classique, potentiellement fragile. L'option 2 ignore cette
      différence de niveau de garantie entre les deux approches. Compter sur une instruction
      de prompt pour la casse des champs (option 3) reste probabiliste, exactement le type de
      réponse que l'examen sanctionne pour un besoin de conformité de format.

  # ========================= TOOL DESIGN & MCP (11) =========================
  - prompt: |
      Une entreprise construit son intégration MCP interne et hésite entre exposer un
      unique serveur MCP monolithique regroupant 150 outils (facturation, CRM, support,
      infrastructure) ou quatre serveurs MCP séparés, un par domaine métier, chacun ne
      portant que ses propres outils.

      Quelle architecture est la plus adaptée ?
    options:
      - "Un unique serveur monolithique de 150 outils : plus simple à déployer, puisqu'il n'y a qu'un seul service à maintenir."
      - "Un unique serveur monolithique, à condition d'activer strict: true sur chacun de ses 150 outils."
      - "Quatre serveurs MCP distincts, un par domaine métier (facturation, CRM, support, infrastructure), chacun déployable, scalable et contrôlable en accès indépendamment des autres — un agent n'attache que les serveurs pertinents à sa tâche."
      - "Quatre serveurs distincts, mais tous partageant le même token d'authentification pour simplifier la gestion des accès."
    answer: 2
    level: intermediaire
    tags: [outils-mcp, mcp]
    explanation: >
      Un serveur par domaine métier permet un déploiement, une mise à l'échelle et un
      contrôle d'accès indépendants pour chaque domaine, et laisse chaque agent n'attacher
      que les serveurs pertinents à sa tâche — réduisant le rayon d'impact d'un incident sur
      un seul domaine. Le monolithe (option 0) couple artificiellement des domaines
      indépendants, avec un rayon d'impact plus large en cas de problème. strict: true
      (option 1) garantit la conformité des paramètres d'un outil, pas l'architecture de
      déploiement des serveurs. Un token partagé entre quatre serveurs distincts (option 3)
      contredit le principe de moindre privilège que la séparation en domaines cherche
      justement à permettre.

  - prompt: |
      Avec les quatre serveurs MCP par domaine de la question précédente, une organisation
      doit configurer l'authentification pour des dizaines d'agents internes ayant des
      niveaux de confiance différents (certains ne font que consulter des rapports, d'autres
      déclenchent des actions d'écriture sensibles).

      Quelle architecture d'authentification est la plus adaptée à cette échelle ?
    options:
      - "Un token par serveur, scoping chaque agent au minimum de privilèges nécessaire à sa tâche (par exemple un scope lecture seule pour un agent de reporting, un scope écriture réservé au seul agent qui en a réellement besoin) — pas un accès uniforme à privilège maximal pour tous."
      - "Un unique token « superutilisateur », partagé par tous les agents, pour simplifier la configuration."
      - "Un token unique par agent, mais donnant systématiquement accès en écriture à l'ensemble des quatre serveurs, pour éviter toute erreur de configuration liée à des scopes multiples."
      - "Aucune authentification, les quatre serveurs étant internes à l'organisation et donc considérés comme intrinsèquement sûrs."
    answer: 0
    level: avance
    tags: [outils-mcp, mcp]
    explanation: >
      Scoper chaque token au minimum de privilège nécessaire, par serveur et par agent,
      applique le principe de moindre privilège à l'échelle d'une flotte d'agents aux niveaux
      de confiance variés. Un token superutilisateur partagé (option 1) expose l'ensemble des
      quatre domaines au moindre incident sur un seul agent. Un accès en écriture uniforme
      par agent (option 2) contredit le principe de moindre privilège pour les agents qui
      n'ont besoin que de lecture. L'absence d'authentification (option 3) ignore un risque
      réel, même en interne, surtout pour des outils d'écriture sensibles.

  - prompt: |
      Une équipe plateforme conçoit, en amont, les outils MCP du domaine CRM et hésite entre
      exposer un unique outil générique `query_crm(sql: string)` (flexibilité maximale) ou
      un ensemble d'outils scoppés par action métier (`get_customer_orders`,
      `create_support_ticket`, `update_customer_address`).

      Quelle conception est la plus adaptée dès la conception initiale de ce domaine ?
    options:
      - "L'outil générique query_crm(sql), qui couvre par construction tous les besoins futurs sans avoir à ajouter de nouveaux outils."
      - "Un ensemble d'outils scoppés par action métier claire, chacun avec une description prescriptive et un schéma d'entrée précis — plus sûr (surface d'attaque réduite) et plus fiable (Claude n'a pas à deviner une syntaxe SQL) qu'un outil générique exposant toute la surface de la base de données."
      - "L'outil générique query_crm(sql), à condition d'ajouter strict: true sur son schéma d'entrée pour sécuriser les requêtes générées."
      - "Un unique outil par table de la base de données CRM, indépendamment des actions métier réellement utiles aux agents consommateurs."
    answer: 1
    level: intermediaire
    tags: [outils-mcp]
    explanation: >
      Des outils scoppés par action métier claire réduisent la surface d'attaque (pas
      d'accès SQL libre à toute la base) et évitent à Claude de deviner une syntaxe,
      contrairement à un outil générique qui expose l'intégralité de la base de données.
      L'outil générique (option 0) semble couvrir plus de besoins futurs mais au prix d'un
      risque de sécurité et d'une fiabilité d'usage bien moindres. strict: true (option 2)
      garantirait la conformité du schéma d'entrée mais ne réduit en rien la surface
      d'attaque d'un accès SQL libre. Un outil par table sans lien avec les actions métier
      réelles (option 3) reproduit un découpage technique déconnecté des besoins réels des
      agents consommateurs.

  - prompt: |
      Une plateforme conçoit, dès la phase de design, un catalogue interne exposant plus de
      300 outils internes répartis sur de nombreux domaines, à disposition d'un assistant
      interne généraliste. L'équipe débat de l'architecture à adopter par défaut pour ce
      catalogue, avant même sa mise en production.

      Quel principe de conception devrait être appliqué dès le départ ?
    options:
      - "Charger la totalité des 300 définitions d'outils par défaut à chaque requête, quitte à optimiser plus tard si un problème de performance apparaît en production."
      - "Répartir les 300 outils en 300 serveurs MCP séparés, un par outil, pour maximiser la granularité."
      - "Limiter dès la conception le catalogue à un maximum de 10 outils au total, quitte à refuser toute nouvelle intégration au-delà de ce nombre."
      - "Concevoir dès le départ la couche de service des outils autour du tool search : marquer par défaut les outils peu susceptibles d'être utilisés à chaque requête avec defer_loading: true, et exposer un tool search tool pour que Claude découvre et charge leur schéma complet à la demande — un principe de conception proactif au-delà du seuil de 30-50 outils, pas un correctif a posteriori."
    answer: 3
    level: avance
    tags: [outils-mcp, mcp]
    explanation: >
      Au-delà de 30-50 outils, la précision de sélection se dégrade et le coût de tokens
      initial explose : concevoir la couche de service autour du tool search (defer_loading +
      tool search tool) dès le départ évite d'avoir à retrofiter cette architecture après un
      incident de production, tout en préservant le prompt caching du préfixe. Charger tous
      les outils par défaut (option 0) reproduit exactement le problème que la conception
      proactive doit éviter. Un serveur par outil (option 1) est un éclatement excessif qui
      ne résout en rien le problème de sélection ni de coût initial. Limiter arbitrairement à
      10 outils (option 2) sacrifie des capacités réelles au lieu d'adopter le mécanisme
      prévu pour passer à l'échelle.

  - prompt: |
      Une plateforme interne permet à chaque équipe d'enregistrer librement ses propres
      outils MCP, sans revue centralisée. Au fil du temps, les descriptions deviennent
      hétérogènes (certaines prescriptives, d'autres purement descriptives comme de la
      documentation d'API), et des agents partagés entre équipes commencent à confondre des
      outils aux fonctions voisines.

      Quelle gouvernance devrait être mise en place à l'échelle de la plateforme ?
    options:
      - "Laisser chaque équipe continuer à rédiger ses descriptions à sa convenance, la confusion étant un coût acceptable de l'autonomie des équipes."
      - "Centraliser tous les outils de toutes les équipes dans un seul outil générique, pour éliminer tout risque de confusion entre outils voisins."
      - "Interdire l'enregistrement de nouveaux outils par les équipes, seule l'équipe plateforme étant autorisée à en créer."
      - "Imposer, au moment de l'enregistrement de tout nouvel outil sur la plateforme, un gabarit de description prescriptif obligatoire (ce que fait l'outil, quand l'appeler, ce qui l'exclut, en quoi il diffère des outils voisins) — les descriptions d'outils deviennent un levier de gouvernance appliqué systématiquement, pas une convention informelle laissée à chaque équipe."
    answer: 3
    level: intermediaire
    tags: [outils-mcp]
    explanation: >
      Imposer un gabarit prescriptif obligatoire au moment de l'enregistrement fait des
      descriptions un levier de gouvernance systématique à l'échelle de la plateforme,
      corrigeant la cause réelle (hétérogénéité de rédaction) plutôt que de la tolérer.
      Laisser chaque équipe continuer sans contrainte (option 0) maintient le problème
      identifié. Fusionner tous les outils en un seul générique (option 1) recrée le problème
      inverse déjà documenté (perte de spécificité, syntaxe à deviner). Interdire aux équipes
      de créer des outils (option 2) est excessif et contraire à l'autonomie recherchée par
      une plateforme en self-service.

  - prompt: |
      Un serveur MCP de reporting est consommé par des dizaines d'agents internes
      différents. Plusieurs de ses outils peuvent, selon la requête, retourner des volumes
      de résultats très importants. Certaines équipes consommatrices ont commencé, chacune
      de leur côté, à tronquer défensivement les résultats après coup dans leur propre code,
      avec des règles différentes d'une équipe à l'autre.

      Quelle architecture règle ce problème pour l'ensemble des consommateurs ?
    options:
      - "Laisser chaque équipe consommatrice continuer à tronquer les résultats après coup selon ses propres règles, sans intervention côté serveur."
      - "Concevoir la pagination (page + curseur de continuation) une fois, au niveau du contrat de schéma du serveur MCP lui-même, pour que tous les outils concernés et tous les agents consommateurs en bénéficient uniformément, sans dépendre d'un contournement défensif propre à chaque équipe consommatrice."
      - "Ajouter strict: true sur les outils du serveur, ce qui limitera automatiquement la taille des résultats retournés."
      - "Demander à chaque équipe consommatrice d'ajouter dans son propre prompt une instruction limitant la taille des réponses attendues."
    answer: 1
    level: avance
    tags: [outils-mcp, mcp]
    explanation: >
      Concevoir la pagination une fois, au niveau du contrat du serveur, garantit un
      comportement uniforme pour tous les consommateurs actuels et futurs, sans dépendre de
      contournements défensifs disparates écrits indépendamment par chaque équipe. Laisser
      chaque équipe tronquer à sa façon (option 0) perpétue l'incohérence déjà observée.
      strict: true (option 2) garantit la conformité des paramètres d'entrée, pas la taille
      des résultats retournés par l'outil. Une instruction de prompt côté consommateur
      (option 3) reste probabiliste et ne change rien à ce que le serveur retourne
      réellement.

  - prompt: |
      Une équipe construit un agent d'assistance au développement qui doit à la fois
      exécuter des actions de déploiement internes propriétaires (des scripts maison,
      spécifiques à l'entreprise) et interagir avec un système de tickets tiers du marché
      (Jira, Linear, ou équivalent).

      Quelle architecture est la plus adaptée pour intégrer ces deux catégories de
      capacités ?
    options:
      - "Exposer les scripts de déploiement internes comme des outils propriétaires directement définis pour l'agent, et connecter le système de tickets tiers via un serveur MCP existant (ou à écrire une seule fois, réutilisable), plutôt que de développer un client HTTP sur mesure pour ce dernier."
      - "Écrire un client HTTP personnalisé pour le système de tickets tiers, comme pour les scripts de déploiement internes, en traitant les deux de la même façon."
      - "Connecter les deux catégories de capacités via MCP, y compris les scripts de déploiement internes propriétaires, en écrivant un serveur MCP pour chacun d'eux avant même d'évaluer si un simple outil natif suffirait."
      - "Renoncer à l'intégration du système de tickets tiers, MCP n'étant pas conçu pour des services externes au marché."
    answer: 0
    level: intermediaire
    tags: [outils-mcp, mcp]
    explanation: >
      Les capacités propriétaires internes se prêtent naturellement à des outils définis
      directement pour l'agent, tandis qu'un système tiers du marché bénéficie de MCP, qui
      standardise l'intégration sans code de client HTTP sur mesure à maintenir. Traiter les
      deux de la même façon avec un client HTTP personnalisé (option 1) ignore l'intérêt de
      MCP pour le service tiers. Écrire systématiquement un serveur MCP même pour des scripts
      internes simples (option 2) ajoute de la complexité sans bénéfice si un outil natif
      suffit. MCP est au contraire particulièrement adapté aux services externes standardisés
      (option 3 fausse).

  - prompt: |
      Lors d'un audit de sécurité, un architecte découvre que l'accès aux bases analytiques
      passe par un serveur MCP en stdio : chaque développeur fait tourner sa propre copie
      locale du serveur, et les identifiants de la base de production sont donc distribués
      sur des dizaines de postes de travail et de runners CI (variables d'environnement,
      fichiers de config locaux).

      Quel est le problème structurel, et quelle est la correction d'architecture ?
    options:
      - "Le seul problème est la consommation mémoire des copies locales ; il suffit de mutualiser le binaire du serveur sur un partage réseau."
      - "Chaque copie locale constitue un point de fuite des identifiants de production ; la correction est de centraliser l'accès derrière un unique service MCP distant (transport HTTP), qui devient la seule frontière détenant les identifiants, les clients ne portant plus qu'un token d'accès à ce service."
      - "Il faut chiffrer les variables d'environnement sur chaque poste : la distribution des identifiants sur tous les postes est inévitable avec MCP."
      - "Il faut abandonner MCP pour cet usage : un protocole standardisé ne peut pas servir de frontière de sécurité pour des bases de production."
    answer: 1
    level: avance
    tags: [outils-mcp, mcp]
    explanation: >
      Le problème n'est pas le protocole mais la topologie : en stdio, le serveur tourne sur
      la machine de chaque consommateur, donc les identifiants de production doivent exister
      partout où il tourne — chaque poste et chaque runner devient un point de fuite possible.
      Centraliser derrière un service MCP distant en HTTP inverse la frontière : un seul
      système détient les identifiants de la base, les clients ne reçoivent qu'un token
      d'accès au service, révocable et auditable en un point unique. Mutualiser le binaire ne
      change rien à la distribution des secrets. Chiffrer localement les variables traite le
      symptôme en laissant les secrets distribués — et cette distribution n'a rien
      d'inévitable, c'est un choix de transport. Abandonner MCP jette le standard alors que le
      correctif est topologique, pas protocolaire.

  - prompt: |
      Dans un système de recherche multi-agents, chaque sous-agent de recherche a pour
      unique mission d'interroger un outil de recherche web et de renvoyer un résultat
      condensé à l'orchestrateur — aucun humain ne lit directement la sortie de ces
      sous-agents, seul l'orchestrateur exploite leur résultat structuré.

      Est-il approprié, dans cette architecture précise, de forcer tool_choice à
      {"type": "any"} (ou à un outil précis) pour ces sous-agents ?
    options:
      - "Non, jamais : forcer tool_choice supprime toujours toute valeur, quel que soit le contexte du système."
      - "Non, car forcer tool_choice empêcherait techniquement l'outil de recherche web de s'exécuter."
      - "Oui, mais uniquement si l'orchestrateur utilise lui aussi tool_choice: none pour compenser."
      - "Oui, c'est architecturalement approprié ici : puisqu'aucun humain ne lit le commentaire en langage naturel qu'un sous-agent pourrait produire avant l'appel, et que sa seule mission est de rechercher, forcer l'appel garantit l'exécution de la recherche sans ambiguïté, sans perte de valeur perceptible (contrairement à un agent conversationnel destiné à un utilisateur humain, où préserver un commentaire en texte a de la valeur)."
    answer: 3
    level: avance
    tags: [outils-mcp, tool-choice]
    explanation: >
      La pertinence de forcer tool_choice dépend du contexte du système : ici, aucun humain
      ne lit un commentaire en texte des sous-agents, dont la seule mission est de
      rechercher — forcer l'appel garantit l'exécution sans coût de valeur perdue,
      contrairement à un agent conversationnel où un commentaire visible à l'utilisateur
      aurait de la valeur. L'option 0 généralise à tort une règle sans tenir compte du
      contexte réel d'usage. L'option 1 est fausse : forcer tool_choice garantit au contraire
      qu'un outil sera appelé, ce qui inclut l'exécution de la recherche. L'option 2 introduit
      une condition sans rapport : le réglage de tool_choice de l'orchestrateur est
      indépendant de celui de chaque sous-agent.

  - prompt: |
      Un assistant multi-domaines reçoit, en un seul tour, trois blocs tool_use ciblant
      trois serveurs MCP différents (facturation, CRM, infrastructure). Le harnais actuel
      exécute correctement les trois appels en concurrence, mais renvoie le résultat de
      chaque serveur dans un message user distinct, dès qu'il est disponible, pour ne pas
      attendre les autres.

      Quel est le problème architectural de cette implémentation ?
    options:
      - "Aucun problème : streamer chaque résultat dès qu'il est prêt, indépendamment du serveur d'origine, est une bonne pratique de latence quel que soit le nombre de serveurs MCP impliqués."
      - "Le problème est que l'exécution devrait être séquentielle plutôt que concurrente, dès que plusieurs serveurs MCP distincts sont impliqués."
      - "Le harnais doit rassembler tous les tool_result d'un même tour, quel que soit le serveur MCP dont ils proviennent, dans un seul message user avant de le renvoyer à l'API — c'est un invariant du harnais qui doit tenir même sur une architecture multi-serveurs, pas seulement pour un unique serveur."
      - "Le problème est que chacun des trois serveurs MCP devrait porter son propre tool_choice indépendant des deux autres."
    answer: 2
    level: avance
    tags: [outils-mcp, tool-choice]
    explanation: >
      Exécuter en concurrence reste correct (l'option 1 se trompe en remettant en cause la
      concurrence elle-même) ; le vrai problème est uniquement dans le regroupement des
      résultats. Streamer sans regrouper (option 0) est justement le piège d'examen : cela
      dégrade le parallélisme attendu et peut provoquer des erreurs de formatage. tool_choice
      (option 3) se règle au niveau de la requête globale, pas par serveur MCP individuel, et
      n'a de toute façon aucun rapport avec le regroupement des résultats.

  - prompt: |
      Une plateforme expose un outil de notification (Slack/email) partagé par des dizaines
      d'agents internes différents. Le service de notification sous-jacent connaît des
      indisponibilités transitoires d'environ 3 % du temps. Chacune des dizaines d'équipes
      consommatrices a, de son côté, écrit sa propre logique de retry ad hoc autour de
      l'appel à cet outil, avec des politiques différentes d'une équipe à l'autre.

      Quelle architecture serait la plus adaptée pour gérer cette résilience à l'échelle de
      la plateforme ?
    options:
      - "Laisser chaque équipe consommatrice continuer à maintenir sa propre logique de retry ad hoc, la diversité des politiques n'ayant pas d'impact réel."
      - "Centraliser le retry avec backoff, la remontée d'un is_error informatif et une échappatoire (notification de secours ou escalade) une seule fois, au niveau du serveur MCP partagé ou d'un client wrapper commun, plutôt que de laisser des dizaines d'équipes réimplémenter chacune sa propre logique de résilience autour du même outil."
      - "Demander à chaque équipe d'ajouter dans son propre system prompt une instruction de nouvelle tentative en cas d'échec de la notification."
      - "Supprimer l'outil de notification partagé, chaque équipe devant construire son propre canal de notification indépendant."
    answer: 1
    level: avance
    tags: [outils-mcp]
    explanation: >
      Centraliser la logique de résilience (retry/backoff, is_error informatif,
      échappatoire) une seule fois au niveau du serveur ou d'un client partagé évite la
      duplication de dizaines de politiques ad hoc divergentes et garantit un comportement
      cohérent pour tous les consommateurs de l'outil. Laisser chaque équipe maintenir sa
      propre logique (option 0) perpétue l'incohérence déjà observée. Une instruction de
      prompt par équipe (option 2) reste probabiliste et ne centralise rien. Supprimer
      l'outil partagé (option 3) fait perdre tout le bénéfice de mutualisation sans résoudre
      le vrai problème de résilience.

  # =================== CONTEXT MANAGEMENT & RELIABILITY (9) ===================
  - prompt: |
      Une entreprise exécute chaque jour des milliers de sessions d'agent indépendantes et
      courtes (chacune une conversation distincte, sans lien entre elles), toutes partageant
      exactement le même system prompt et les mêmes définitions d'outils. Un architecte se
      demande si le prompt caching a un intérêt ici, puisqu'aucune de ces sessions ne
      poursuit une conversation précédente.

      Quelle est l'évaluation correcte ?
    options:
      - "Le prompt caching n'a aucun intérêt ici : il ne fonctionne qu'à l'intérieur d'une même conversation multi-tours qui se poursuit dans le temps."
      - "Le prompt caching ne fonctionnerait que si toutes ces sessions étaient reliées via --continue à une session initiale commune."
      - "Le prompt caching n'a d'intérêt qu'au-delà de 4 breakpoints explicites par requête."
      - "Le prompt caching reste pertinent : le cache est un cache de préfixe, pas de conversation — poser cache_control sur le bloc system+tools stable et identique permet à des milliers de sessions indépendantes mais partageant ce même préfixe de bénéficier de lectures de cache (0,1x), même si chacune est une conversation techniquement différente."
    answer: 3
    level: avance
    tags: [contexte-fiabilite, prompt-caching]
    explanation: >
      Le cache suit un préfixe identique, pas une continuité de conversation : des milliers
      de sessions indépendantes partageant le même system prompt et les mêmes outils peuvent
      toutes bénéficier de lectures de cache dès lors que ce préfixe reste inchangé d'une
      session à l'autre. L'option 0 confond à tort portée du cache et continuité
      conversationnelle. L'option 1 invente une exigence de continuité de session qui
      n'existe pas pour le mécanisme de cache. L'option 2 introduit une condition sans
      rapport : le nombre de breakpoints est un plafond (maximum 4), pas une condition
      d'activation.

  - prompt: |
      Dans le système de la question précédente, la toute première session de la journée
      doit payer le coût d'écriture du cache (1,25x le tarif standard) pour ce préfixe
      partagé, avant que les milliers de sessions suivantes n'en bénéficient en lecture
      (0,1x). Un ingénieur propose de désactiver le cache pour éviter de payer ce surcoût
      d'écriture.

      Cette proposition est-elle justifiée ?
    options:
      - "Non : le surcoût d'écriture d'une seule session est largement amorti par les milliers de lectures à 0,1x qui suivent dans la même journée — désactiver le cache ferait payer le tarif plein à chacune de ces milliers de sessions, un coût bien supérieur au surcoût d'une unique écriture."
      - "Oui : éviter tout surcoût d'écriture est toujours la décision la plus économique, quel que soit le volume de sessions qui suivraient."
      - "Non, mais uniquement si le cache est configuré en durée de vie d'une heure plutôt que cinq minutes."
      - "Oui, à condition d'augmenter le nombre de breakpoints à 4 pour compenser le coût d'écriture."
    answer: 0
    level: avance
    tags: [contexte-fiabilite, prompt-caching]
    explanation: >
      À l'échelle de milliers de sessions par jour partageant le même préfixe, le surcoût
      d'écriture d'une unique session est négligeable comparé à l'économie cumulée de
      milliers de lectures à 0,1x — désactiver le cache ferait au contraire payer le tarif
      plein à toutes ces sessions. L'option 1 ignore l'effet de volume qui rend
      l'investissement rentable dès la deuxième réutilisation. L'option 2 introduit une
      condition sur le TTL sans rapport avec la décision d'investir ou non dans le cache.
      L'option 3 confond le nombre de breakpoints (un plafond structurel) avec un levier de
      compensation de coût, ce qu'il n'est pas.

  - prompt: |
      Le corpus de documentation qui alimente un pipeline d'extraction à 100 000 documents
      par jour grossit en continu, mis à jour par plusieurs équipes tout au long de la
      journée, et doit rester fiable à quelques minutes près pour les traitements en cours.

      Quelle architecture de gestion de ce corpus est la plus adaptée à cette échelle et
      cette fraîcheur exigée ?
    options:
      - "Charger l'intégralité du corpus en long contexte direct dans chaque requête, avec du prompt caching pour maîtriser le coût."
      - "Long contexte direct, à condition d'augmenter effort à max pour compenser la taille et la fraîcheur du corpus."
      - "RAG (récupération ciblée à la demande) : le corpus dépasse probablement la fenêtre de contexte disponible et, surtout, sa mise à jour continue par plusieurs équipes exige une fraîcheur que ni le long contexte ni le cache ne peuvent garantir sans réinvalider constamment un préfixe figé."
      - "Aucune des deux architectures ne convient à un corpus mis à jour aussi fréquemment ; il faut geler les mises à jour à une fois par semaine."
    answer: 2
    level: intermediaire
    tags: [contexte-fiabilite]
    explanation: >
      Un corpus qui grossit en continu et doit rester frais à quelques minutes près justifie
      RAG, qui récupère à la demande sur la version la plus récente. Le long contexte avec
      caching (option 0) suppose un corpus relativement stable, ce qui contredit l'énoncé.
      effort (option 1) ajuste l'intensité de raisonnement du modèle, sans rapport avec la
      taille ou la fraîcheur du corpus accessible. Geler les mises à jour (option 3)
      sacrifierait un besoin métier réel pour contourner un problème d'architecture, alors
      qu'une solution structurelle (RAG) existe.

  - prompt: |
      À l'inverse, un corpus juridique de référence (environ 200 réglementations stables,
      amendées seulement une à deux fois par an) doit permettre à un agent de croiser
      simultanément de nombreuses clauses entre elles à chaque requête, et tient
      confortablement dans la fenêtre de contexte disponible.

      Quelle architecture est la plus adaptée ici ?
    options:
      - "RAG, systématiquement préférable à un long contexte dès qu'un corpus de référence existe, quelle que soit sa taille ou sa fréquence de mise à jour."
      - "Long contexte direct (avec prompt caching pour maîtriser le coût, le préfixe restant stable pendant des mois) : le corpus est petit et stable, et le raisonnement croisé entre de nombreuses clauses à la fois est justement le point fort du long contexte, que la récupération fragmentée de RAG limiterait."
      - "RAG, car aucun corpus ne devrait jamais être chargé intégralement en contexte, quelle que soit sa taille."
      - "Long contexte direct, mais sans prompt caching, le corpus étant trop stable pour en bénéficier."
    answer: 1
    level: avance
    tags: [contexte-fiabilite]
    explanation: >
      Un corpus petit et stable qui tient dans la fenêtre, avec un besoin de raisonnement
      croisé sur de nombreuses clauses à la fois, est le cas d'usage exact du long contexte
      direct, qui bénéficie en plus du prompt caching puisque le préfixe reste stable pendant
      des mois. RAG (options 0 et 2) limiterait le raisonnement aux seuls fragments
      récupérés, ce qui contredit le besoin de croiser de nombreuses clauses simultanément,
      et généralise à tort RAG comme toujours préférable. L'option 3 se trompe : un corpus
      stable est au contraire le cas idéal pour bénéficier pleinement du prompt caching.

  - prompt: |
      Un agent de supervision d'infrastructure tourne en continu pendant plusieurs jours,
      traitant un flux d'alertes. Il doit occasionnellement se souvenir d'un fait précis
      remonté trois jours plus tôt, dans une session totalement différente après un
      redémarrage, tout en évitant que sa session courante ne sature de contenu à force
      d'accumuler d'anciennes charges utiles d'alertes.

      Quelle architecture couvre l'ensemble de ces besoins ?
    options:
      - "Combiner les trois mécanismes, chacun sur sa propre portée : context editing pour élaguer au fil de l'eau les anciennes charges utiles d'alertes devenues inutiles dans la session courante, compaction pour résumer automatiquement une fois un seuil de tokens atteint dans cette même session, et memory pour faire persister spécifiquement les faits qui doivent survivre à un redémarrage vers une session future."
      - "La compaction seule suffit : elle résume automatiquement tout le contenu ancien, y compris entre deux sessions séparées par un redémarrage."
      - "Le context editing seul suffit, à condition d'élaguer également les faits qui doivent survivre à un redémarrage."
      - "Remplacer entièrement la compaction et le context editing par memory, qui couvre à lui seul la gestion du contexte intra-session et inter-session."
    answer: 0
    level: avance
    tags: [contexte-fiabilite]
    explanation: >
      Les trois mécanismes ont des portées distinctes et complémentaires : context editing
      et compaction gèrent la croissance du contexte à l'intérieur d'une même session, tandis
      que memory est seul conçu pour faire persister des faits au-delà d'un redémarrage — les
      combiner est nécessaire pour couvrir l'ensemble du besoin décrit. La compaction seule
      (option 1) n'a aucune portée inter-session, contrairement à ce que suggère l'option. Le
      context editing seul (option 2) n'a pas non plus de mécanisme de persistance
      inter-session, quelle que soit la façon dont on l'élague. Remplacer les trois par
      memory seul (option 3) ferait perdre la gestion fine intra-session que compaction et
      context editing apportent spécifiquement.

  - prompt: |
      Une architecture de support à grande échelle se décompose en trois étages : un
      routeur qui classe chaque ticket entrant dans une catégorie (tâche simple, très fort
      volume), un travailleur qui rédige la résolution proposée (tâche substantielle, volume
      moyen), et un superviseur qui approuve les actions à fort enjeu avant exécution (tâche
      peu fréquente, fort enjeu).

      Quelle répartition modèle/effort est la plus adaptée à ces trois étages ?
    options:
      - "Le même modèle et le même effort élevé sur les trois étages, pour garantir une qualité maximale uniforme."
      - "Le modèle le plus capable sur le routeur et le travailleur, et un modèle léger réservé au superviseur, pour économiser sur l'étage le plus critique."
      - "Un seul modèle léger sur les trois étages, l'effort étant le seul paramètre à faire varier entre eux."
      - "Un modèle léger (type Haiku) avec un effort faible pour le routeur, un modèle équilibré (type Sonnet) avec un effort moyen pour le travailleur, et le modèle le plus capable (type Opus) avec un effort élevé pour le superviseur — chaque étage dimensionné selon son profil réel de volume et d'enjeu."
    answer: 3
    level: intermediaire
    tags: [contexte-fiabilite]
    explanation: >
      Dimensionner chaque étage selon son profil réel (léger pour le tri à fort
      volume/faible enjeu, équilibré pour le travail substantiel, le plus capable pour la
      supervision peu fréquente mais à fort enjeu) optimise le coût sans sacrifier la qualité
      là où elle compte le plus. Uniformiser sur le modèle le plus capable (option 0) gaspille
      du coût sur l'étage de routage qui n'en a pas besoin. Inverser la répartition (option 1)
      réserve le modèle le plus capable aux étages qui en ont le moins besoin, et le modèle
      léger à l'étage le plus critique. Garder un seul modèle léger partout (option 2)
      sous-dimensionne l'étage de supervision, à fort enjeu.

  - prompt: |
      Un pipeline d'extraction traite environ 100 000 documents par jour. Une petite
      fraction (environ 5 %) est déclenchée par un utilisateur qui attend un résultat
      immédiat dans une interface ; la grande majorité (environ 95 %) est ingérée la nuit,
      sans personne en attente du résultat avant le lendemain matin.

      Quelle architecture de traitement est la plus adaptée à ce mélange de charges ?
    options:
      - "Traiter l'intégralité des 100 000 documents quotidiens via la Message Batches API, y compris les 5 % attendus en temps réel par un utilisateur dans l'interface."
      - "Segmenter le pipeline selon le profil de latence : les 5 % attendus en temps réel passent par des appels standards à l'API Messages, tandis que les 95 % restants, sans contrainte de réponse immédiate, passent par la Message Batches API (-50 % sur le tarif standard) — pas un traitement monolithique unique pour l'ensemble du volume."
      - "Traiter l'intégralité des 100 000 documents quotidiens en appels standards à l'API Messages, la Batches API n'étant pertinente qu'en dessous de 10 000 documents par jour."
      - "Alterner entre Batches API et appels standards selon l'heure de la journée, indépendamment de qui attend réellement chaque résultat."
    answer: 1
    level: intermediaire
    tags: [contexte-fiabilite]
    explanation: >
      Le bon critère de segmentation est la contrainte de latence réelle par sous-charge,
      pas le volume total : les 5 % attendus en temps réel exigent des appels standards,
      tandis que les 95 % sans contrainte de délai bénéficient pleinement de la remise
      Batches. Traiter tout en Batches (option 0) casserait l'expérience des utilisateurs
      attendant un résultat immédiat. Traiter tout en appels standards (option 2) invente un
      seuil de volume arbitraire et ferait perdre la remise sur l'écrasante majorité du
      volume qui pourrait en bénéficier. Alterner par heure de la journée sans lien avec qui
      attend réellement (option 3) ne capture pas le vrai critère de segmentation.

  - prompt: |
      Une plateforme fait tourner de nombreux agents en production, développés par
      différentes équipes. Quand un effet de bord inattendu est constaté (une donnée
      modifiée à tort), les ingénieurs n'ont aujourd'hui aucun moyen fiable de reconstituer
      quelle session, quelle séquence d'appels d'outils, et quels paramètres ont mené à cet
      effet de bord, les logs de chaque service étant dispersés sans lien entre eux.

      Quelle architecture d'observabilité répond à ce besoin ?
    options:
      - "Augmenter max_tokens sur tous les agents, pour que chaque réponse contienne une explication plus détaillée de ses actions."
      - "Se fier uniquement à stop_reason de la réponse finale de chaque session, qui indique déjà la cause exacte de tout effet de bord survenu en cours de route."
      - "Propager un identifiant de requête/session cohérent à travers chaque appel d'outil, et journaliser à chaque étape la séquence complète des appels d'outils (nom, paramètres, résultat, is_error) rattachée à cet identifiant, pour permettre une traçabilité de bout en bout à travers les différents services impliqués."
      - "Ne journaliser que les appels d'outils ayant échoué (is_error: true), les appels réussis n'ayant pas besoin d'être conservés."
    answer: 2
    level: intermediaire
    tags: [contexte-fiabilite]
    explanation: >
      Un identifiant cohérent propagé à travers chaque appel, combiné à la journalisation
      systématique de la séquence complète des appels d'outils, permet de reconstituer après
      coup le fil exact qui a mené à un effet de bord, à travers des services distribués et
      disparates. Augmenter max_tokens (option 0) régit la longueur de génération, sans
      rapport avec la traçabilité d'un incident déjà survenu. stop_reason (option 1) n'indique
      que la raison d'arrêt de génération du dernier appel, pas la séquence complète des
      actions ayant précédé un effet de bord. Ne journaliser que les échecs (option 3)
      empêcherait justement de reconstituer la séquence menant à un effet de bord provoqué
      par un appel qui, lui, a techniquement réussi.

  - prompt: |
      Une équipe d'architecture conçoit la stratégie de fiabilité d'une flotte d'agents de
      production et doit couvrir quatre types d'échecs distincts : des erreurs réseau/5xx
      transitoires, des réponses tronquées par max_tokens, des refus de contenu
      (stop_reason: refusal), et des actions irréversibles à fort enjeu.

      Quelle architecture couvre correctement l'ensemble de ces quatre cas, à l'échelle de
      la flotte ?
    options:
      - "Une seule politique de retry générique, appliquée de façon identique aux quatre types d'échecs, pour simplifier la maintenance."
      - "Un unique gate humain avant chaque appel, quel que soit le type d'échec anticipé, par principe de précaution générale."
      - "Ignorer les erreurs réseau transitoires, qui se résolvent toujours d'elles-mêmes sans intervention à l'échelle d'une flotte de production."
      - "Quatre réponses structurelles distinctes, chacune adaptée à son type d'échec : retry automatique du SDK avec backoff pour les erreurs transport transitoires, augmentation de max_tokens ou streaming/reprise pour les troncatures, lecture de stop_details et bascule éventuelle vers un modèle de repli pour les refus, et un gate humain systématique pour toute action irréversible à fort enjeu."
    answer: 3
    level: avance
    tags: [contexte-fiabilite]
    explanation: >
      Chaque type d'échec relève d'un mécanisme structurel différent : confondre troncature
      et erreur transitoire (ou refus et coût d'erreur élevé) mène à des corrections
      inefficaces. Une politique de retry générique unique (option 0) reproduirait la même
      troncature en cas de max_tokens, puisqu'elle est déterministe et non transitoire. Un
      gate humain avant chaque appel (option 1) casserait la fluidité de la flotte pour des
      cas qui n'en ont pas besoin, comme une simple erreur réseau transitoire. Ignorer les
      erreurs transitoires (option 2) laisserait des requêtes échouer sans nécessité alors
      qu'un retry automatique les résoudrait.
---

Ce test blanc de 60 questions reproduit le format réel du **Claude Certified Architect –
Foundations (CCA-F)** : 5 domaines, angle architecte (concevoir, choisir, arbitrer des
compromis structurels à l'échelle d'un système, d'une équipe ou d'une organisation), une
seule bonne réponse par question. Voir la leçon « Consignes » pour les conditions de
passage recommandées.
