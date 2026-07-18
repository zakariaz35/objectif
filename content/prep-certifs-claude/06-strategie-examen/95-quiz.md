---
title: "Quiz — Les examens en pratique"
type: quiz
questions:
  - prompt: |
      Deux profils envisagent de passer une certification Anthropic Foundations.
      Le premier intègre l'API Claude dans une application de support client :
      il configure des outils, gère le format des réponses, met en place le prompt
      caching et la gestion des erreurs. Le second est chargé, au niveau de
      l'organisation, de décider s'il faut adopter du RAG ou du long contexte pour un
      corpus documentaire, et de choisir quel modèle utiliser pour chaque type de
      requête dans une architecture multi-agents.

      Quelle certification correspond le mieux à chaque profil ?
    options:
      - "Les deux profils devraient viser CCA-F : les décisions d'architecture priment toujours sur l'implémentation."
      - "Le premier profil correspond à CCDV-F (implémenter), le second à CCA-F (concevoir/choisir) — bien que les deux examens couvrent les mêmes domaines de connaissance."
      - "Les deux profils devraient viser CCDV-F : la certification Architect ne concerne que les équipes qui ne codent jamais."
      - "Le premier profil correspond à CCA-F et le second à CCDV-F, car choisir un modèle est une tâche d'implémentation technique."
    answer: 1
    tags: [examen]
    level: debutant
    explanation: >
      Le premier profil (intégrer l'API, configurer des outils, gérer le caching et
      les erreurs) correspond à l'angle "comment implémenter" de CCDV-F. Le second
      (choisir une architecture RAG vs long contexte, choisir un modèle par type de
      requête) correspond à l'angle "quoi choisir et pourquoi" de CCA-F. Les options
      qui orientent tout le monde vers une seule certification (0 et 2) ignorent que
      les deux profils ont des besoins réels différents. L'option 3 inverse
      simplement les deux profils, ce qui ne correspond pas à la distinction
      implémenter/concevoir.
  - prompt: |
      Un système de génération de contenu produit occasionnellement un texte qui
      dépasse la longueur maximale autorisée par la plateforme de publication cible.
      Parmi les options suivantes, laquelle représente une réponse STRUCTURELLE plutôt
      qu'un ajustement de prompt non garanti ?
    options:
      - "Ajouter au system prompt : 'Assure-toi de toujours respecter la limite de longueur.'"
      - "Ajouter au system prompt : 'Sois concis.'"
      - "Définir un schéma de sortie structuré (ex. via output_config) pour le champ concerné, puis valider la longueur du texte généré côté application après réception — le schéma structuré garantit le format, pas une contrainte de longueur."
      - "Répéter deux fois l'instruction de longueur dans le prompt pour renforcer sa prise en compte."
    answer: 2
    tags: [examen]
    level: intermediaire
    explanation: >
      Les options 0, 1 et 3 sont toutes des variantes de la même approche non
      garantie : une instruction en langage naturel influence la probabilité du
      résultat, sans jamais le garantir mécaniquement — répéter l'instruction
      (option 3) n'ajoute pas de garantie supplémentaire. La réponse structurelle
      combine un schéma de sortie structuré (garantit la forme : JSON valide, champs
      requis) et une validation applicative de la longueur après génération — les
      contraintes de longueur (minLength/maxLength) ne sont pas appliquées par le
      décodage contraint : les SDK les retirent du schéma envoyé au modèle, il faut
      donc les vérifier soi-même côté client, pas s'appuyer sur le schéma pour les
      faire respecter mécaniquement.
  - prompt: |
      Un candidat passe une certification de 60 questions en 120 minutes. Arrivé à la
      question 22, après 55 minutes déjà écoulées, il bloque sur un scénario long et
      ambigu qui lui semble avoir plusieurs réponses plausibles.

      Quelle est la meilleure stratégie à ce stade ?
    options:
      - "Continuer à analyser cette question jusqu'à être certain à 100%, quitte à dépasser largement 2 minutes, car chaque question compte autant."
      - "Passer à la question suivante immédiatement sans même la marquer, pour ne pas perdre de temps à y revenir plus tard."
      - "Marquer la question pour y revenir, passer à la suivante, et rééquilibrer si besoin en fin de session : 55 minutes pour 21 questions traitées est déjà au-delà du budget moyen de 2 minutes/question."
      - "Abandonner l'examen et le reprogrammer, car un tel retard est rédhibitoire."
    answer: 2
    tags: [examen]
    level: debutant
    explanation: >
      55 minutes pour 21 questions correspond à environ 2,6 min/question, déjà
      au-dessus du budget moyen (2 min pour 60 questions/120 min) — un signal à
      corriger, pas à ignorer. S'acharner sur une question ambiguë (option 0)
      aggraverait ce retard pour toutes les questions restantes. Passer à la suivante
      sans la marquer (option 1) fait perdre la possibilité d'y revenir avec un
      regard neuf en fin de session. Abandonner (option 3) est disproportionné à ce
      stade : marquer et revenir est la stratégie standard pour ce type de situation.
  - prompt: |
      Un candidat se souvient d'un score de réussite de 720/1000 et d'une validité de
      12 mois pour la certification CCDV-F, informations lues dans une formation
      datant de plusieurs mois. Il s'apprête à s'inscrire sans autre vérification.

      Quelle est l'attitude la plus rigoureuse ?
    options:
      - "S'inscrire directement : ces chiffres sont fixés une fois pour toutes par Anthropic et ne changent jamais."
      - "Revérifier ces informations (score, validité, mais aussi tarif et modalités) sur anthropic-partners.skilljar.com et pearsonvue.com avant de s'inscrire, car ces détails peuvent évoluer."
      - "Ignorer ces chiffres : le score de réussite n'a aucune importance tant qu'on répond du mieux possible."
      - "Contacter uniquement le support Pearson VUE, qui est seul responsable de la définition du score de réussite."
    answer: 1
    tags: [examen]
    level: debutant
    explanation: >
      Les modalités d'examen (tarifs, score de réussite, validité, plateforme)
      relèvent d'Anthropic et de son réseau de certification, et peuvent évoluer dans
      le temps (option 0 imprudente) — les sources de vérité restent les sites
      officiels du programme (anthropic-partners.skilljar.com) et de l'organisme
      d'examen (pearsonvue.com), pas une formation tierce aussi récente soit-elle. Le
      score de réussite conditionne directement l'obtention du certificat (option 2
      fausse). Pearson VUE gère la logistique de passage mais ne définit pas seul le
      score de réussite, qui est un critère du programme de certification
      d'Anthropic (option 3 fausse).
  - prompt: |
      Un candidat n'a que deux jours de révision avant son examen CCDV-F. Son test
      blanc révèle des lacunes à peu près équivalentes dans tous les domaines. Les
      pondérations officielles : Agentic Architecture 27 %, Claude Code Configuration
      20 %, Prompt Engineering 20 %, Tool Design & MCP 18 %, Context Management 15 %.

      Comment devrait-il répartir son temps de révision ?
    options:
      - "À parts égales entre les 5 domaines : l'examen exige un niveau minimum dans chacun."
      - "Uniquement sur Context Management : c'est le domaine le plus technique, donc le plus discriminant."
      - "En priorité sur Agentic Architecture (27 %), puis Claude Code et Prompt Engineering (20 % chacun) : à lacunes égales, chaque heure investie rapporte proportionnellement au poids du domaine dans le score."
      - "Uniquement sur Tool Design & MCP : c'est le plus gros domaine de l'examen."
    answer: 2
    tags: [examen]
    level: intermediaire
    explanation: >
      À lacunes équivalentes, le rendement d'une heure de révision est proportionnel
      au poids du domaine : Agentic Architecture pèse à lui seul plus d'un quart du
      score (27 %), et les deux domaines à 20 % complètent le trio prioritaire —
      ensemble ils représentent 67 % de l'examen. La répartition égale (option 0)
      ignore cette asymétrie ; il n'existe par ailleurs pas de score minimum par
      domaine, seul le score global compte. Context Management (option 1) est au
      contraire le domaine le MOINS pondéré (15 %). L'option 3 est factuellement
      fausse : Tool Design & MCP (18 %) est le 4e domaine sur 5, pas le premier.
  - prompt: |
      En plein examen, un candidat tombe sur une question de type « multiple
      response » : un scénario suivi de six propositions, avec la consigne
      « sélectionnez DEUX réponses ». Il est sûr d'une réponse, hésite entre deux
      autres pour la seconde, et se demande comment ce format est noté.

      Quelle approche correspond au fonctionnement réel de ce format ?
    options:
      - "Sélectionner trois réponses pour maximiser ses chances : les réponses justes rapportent des points même accompagnées d'une réponse fausse."
      - "Sélectionner exactement deux réponses : la sélection est généralement notée en tout ou rien (pas de crédit partiel), il faut donc verrouiller la réponse sûre puis départager les deux candidates en éliminant celle qui contredit un fait du scénario."
      - "Ne sélectionner que la réponse dont il est sûr : une réponse juste sur deux garantit la moitié des points de la question."
      - "Ce format n'existe pas dans les certifications Anthropic, qui ne comportent que des questions à choix unique."
    answer: 1
    tags: [examen]
    level: intermediaire
    explanation: >
      D'après la FAQ officielle du programme, les examens mélangent questions à choix
      unique et questions scenario-based multiple response, chacune précisant le
      nombre de réponses attendu. Ce format est généralement noté en tout ou rien :
      sélectionner trop de réponses (option 0) ou trop peu (option 2) ne rapporte
      pas de crédit partiel — d'où la méthode : verrouiller les certitudes, puis
      départager les candidates restantes par élimination factuelle contre le
      scénario. L'option 3 contredit la FAQ officielle du programme, qui mentionne
      explicitement ce format aux côtés du choix unique.
---

CCDV-F vs CCA-F, méthode structurelle, gestion du temps, logistique à vérifier.
