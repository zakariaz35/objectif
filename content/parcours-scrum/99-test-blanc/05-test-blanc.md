---
title: "Test blanc — PSM I (40 questions, demi-format réel)"
type: quiz
strategy: linear
questions:
  # ======================= FONDATIONS (6) =======================
  - prompt: |
      Pourquoi le Guide affirme-t-il que Scrum utilise une approche itérative et
      incrémentale ?
    options:
      - "Pour réduire le coût des licences logicielles associées au produit"
      - "Pour se conformer à une norme ISO de gestion de projet"
      - "Pour optimiser la prédictibilité et contrôler le risque"
      - "Pour remplacer la pensée Lean, jugée dépassée dans les environnements complexes"
    answer: 2
    tags: [fondations]
    level: debutant
    explanation: |
      Citation exacte : « Scrum utilise une approche itérative et incrémentale pour
      optimiser la prédictibilité et le contrôle du risque. » Aucune norme ISO n'est
      mentionnée dans le Guide (option 1 inventée). Le coût des licences (option 0) n'a
      aucun rapport avec la théorie Scrum. La pensée Lean n'est pas remplacée mais
      complémentaire de l'empirisme (option 3 fausse — voir module 1).
  - prompt: |
      Que signifie exactement l'expression « Scrum est volontairement incomplet » ?
    options:
      - "Le Guide ne définit que les parties nécessaires à la théorie Scrum ; le reste (techniques, outils) est laissé à la discrétion de ceux qui l'utilisent"
      - "Scrum impose l'usage de story points, mais laisse le choix de l'outil de suivi"
      - "Scrum doit être complété obligatoirement par un cadre de mise à l'échelle comme SAFe pour être utilisable"
      - "Scrum ne peut fonctionner qu'accompagné d'une méthode de développement logiciel comme XP"
    answer: 0
    tags: [fondations]
    level: debutant
    explanation: |
      « Le cadre de travail Scrum est volontairement incomplet, ne définissant que les
      parties nécessaires pour mettre en œuvre la théorie Scrum. » Aucune technique
      d'estimation n'est imposée (option 1 fausse — les story points n'apparaissent nulle
      part dans le Guide). Aucun cadre de mise à l'échelle n'est requis pour que Scrum
      fonctionne à l'échelle d'une équipe (option 2). Le Guide 2020 a explicitement retiré
      toute référence exclusive au développement logiciel (option 3).
  - prompt: |
      Quel lien le Guide établit-il directement entre les 5 valeurs Scrum et les 3 piliers
      empiriques (transparence, inspection, adaptation) ?
    options:
      - "Les valeurs remplacent les piliers empiriques dans les équipes matures"
      - "Lorsque les valeurs sont incarnées par la Scrum Team, les piliers empiriques émergent en consolidant la confiance"
      - "Les piliers empiriques créent les valeurs, jamais l'inverse"
      - "Il n'existe aucun lien explicite entre les deux listes dans le Guide"
    answer: 1
    tags: [fondations]
    level: intermediaire
    explanation: |
      « Lorsque ces valeurs sont incarnées par la Scrum Team et les personnes avec
      lesquelles elle travaille, alors les piliers empiriques Scrum de transparence,
      d'inspection et d'adaptation émergent en consolidant la confiance. » Le lien est donc
      explicite et dans ce sens précis. L'option 0 confond deux notions distinctes qui
      coexistent. L'option 2 inverse une causalité qui n'est pas formulée ainsi dans le
      texte. L'option 3 est fausse : le lien est écrit noir sur blanc dans le Guide.
  - prompt: |
      Une équipe ajoute une revue de code obligatoire avant que tout élément ne puisse
      compter comme Increment, en plus des règles habituelles de Scrum. Est-ce compatible
      avec le Guide ?
    options:
      - "Non, toute pratique ajoutée en plus du cadre prescrit dénature Scrum"
      - "Non, seule l'organisation entière peut décider d'ajouter une pratique à tous ses produits"
      - "Oui, mais uniquement si le Product Owner rédige cette règle dans le Product Backlog"
      - "Oui : le Guide n'interdit aucune pratique additionnelle, il précise même que Scrum englobe des pratiques existantes ou les rend inutiles"
    answer: 3
    tags: [fondations]
    level: intermediaire
    explanation: |
      « Divers processus, techniques et méthodes peuvent être employés dans ce cadre de
      travail. Scrum englobe des pratiques existantes ou les rend inutiles. » Ajouter une
      exigence de qualité (comme une revue de code) dans la Definition of Done est
      parfaitement compatible — ce n'est pas retirer un élément prescrit, mais en ajouter
      un. Les options 0 et 1 confondent « ajouter une pratique » avec « retirer un élément
      du cadre », ce qui est le vrai interdit du Guide. L'option 2 invente une formalité
      absente du texte.
  - prompt: |
      Le Guide précise que le terme « Developers » est utilisé dans Scrum. Pourquoi
      exactement ?
    options:
      - "Pour désigner exclusivement les ingénieurs logiciels au sein de l'équipe"
      - "Non pas pour exclure, mais pour simplifier — quiconque tire de la valeur de Scrum peut se considérer comme en faisant partie"
      - "Parce que le Guide est né dans le contexte du développement web dans les années 2010"
      - "Pour distinguer les Developers seniors des Developers juniors au sein de la Scrum Team"
    answer: 1
    tags: [fondations]
    level: intermediaire
    explanation: |
      « Nous utilisons le terme "Developers" dans Scrum non pas pour exclure, mais pour
      simplifier. Si vous obtenez de la valeur de Scrum, considérez-vous comme en faisant
      partie. » Le Guide précise explicitement que Scrum s'utilise « beyond le développement
      de produits logiciels » (option 0 fausse). Scrum a été développé au début des années 1990, mais la première version écrite du Guide date de 2010 (option 2
      fausse). Aucune distinction de séniorité n'existe dans le texte (option 3).
  - prompt: |
      Un manager affirme : « Si l'on suit les 5 événements et les 3 rôles à la lettre,
      Scrum garantit le succès du produit. » Que répond le Guide à cette affirmation ?
    options:
      - "Il a raison : le Guide garantit le succès si les 5 événements sont respectés"
      - "Il a en partie raison, mais uniquement pour les Scrum Teams de plus de 10 personnes"
      - "Il a tort : Scrum rend visible l'efficacité des pratiques et du management existants, il ne garantit pas le succès du produit"
      - "Il a raison, mais uniquement si l'organisation a adopté Nexus en complément"
    answer: 2
    tags: [fondations]
    level: avance
    explanation: |
      « Scrum est simple. Essayez-le tel qu'il est et déterminez si sa philosophie, sa
      théorie et sa structure aident à atteindre les objectifs et à créer de la valeur. »
      Et surtout : « Scrum rend visible l'efficacité relative du management existant, de
      l'environnement et des techniques de travail, afin que des améliorations puissent
      être apportées. » Rendre visible n'est pas garantir un résultat — les options 0, 1 et
      3 attribuent au Guide une promesse de succès qu'il ne fait nulle part, avec ou sans
      condition de taille ou de framework complémentaire.

  # ======================= EQUIPE SCRUM (8) =======================
  - prompt: |
      Un Scrum Master propose d'aider le Product Owner à ordonner le Product Backlog pour
      le « soulager » en période chargée. Que dit le Guide sur cette situation ?
    options:
      - "Ce n'est pas interdit que le Scrum Master aide, mais la décision finale d'ordonnancement et la redevabilité restent celles du Product Owner"
      - "C'est interdit : seul le Product Owner peut toucher physiquement au Product Backlog"
      - "C'est acceptable seulement si le Scrum Master devient temporairement Product Owner par délégation formelle"
      - "C'est un rôle réservé exclusivement aux Developers en l'absence du Product Owner"
    answer: 0
    tags: [equipe]
    level: debutant
    explanation: |
      « Le Product Owner peut effectuer le travail ci-dessus ou peut déléguer ce travail à
      d'autres. Quoi qu'il en soit, le Product Owner en demeure redevable. » Une aide
      ponctuelle du Scrum Master ne transfère jamais la redevabilité, contrairement à ce que
      suggèrent les options 1 (trop absolue) et 2 (qui invente une « délégation formelle de
      rôle » qui n'existe pas dans le Guide — les rôles ne se transfèrent pas ainsi).
      L'option 3 invente une règle absente du texte sur les Developers.
  - prompt: |
      Un Developer occupe aussi la fonction de Product Owner sur un produit totalement
      différent, en parallèle du même Sprint. Le Guide interdit-il formellement ce cumul ?
    options:
      - "Oui, un Scrum Master doit approuver formellement tout cumul de rôles avant chaque Sprint"
      - "Oui, mais uniquement si l'entreprise compte moins de 10 personnes"
      - "Non, le Guide encourage au contraire le cumul de rôles pour réduire les coûts"
      - "Non, le Guide ne l'interdit pas explicitement, mais la valeur de focus et l'engagement sur un seul objectif à la fois rendent ce cumul risqué en pratique"
    answer: 3
    tags: [equipe]
    level: intermediaire
    explanation: |
      Le Guide ne mentionne aucune interdiction explicite de cumul de rôles entre
      produits différents. Mais il insiste sur le focus (« leur focus principal est le
      travail du Sprint ») et sur l'Objectif de Produit comme « objectif à long terme »
      unique à la fois — un cumul sur deux produits distincts crée une tension réelle avec
      ce principe. Aucune procédure d'approbation par le Scrum Master n'existe (option 0),
      aucun seuil d'effectif n'est mentionné (option 1), et rien n'« encourage » ce cumul
      dans le Guide (option 2).
  - prompt: |
      Un nouveau Scrum Master constate que les Developers décident eux-mêmes de la
      répartition de leurs tâches, de leurs outils internes et de leur organisation
      quotidienne, sans validation hiérarchique. Comment qualifier cela selon le Guide ?
    options:
      - "Un dysfonctionnement à corriger d'urgence par une chaîne de validation"
      - "Une autogestion excessive, à encadrer par un chef de projet"
      - "Une autogestion normale, conforme au principe selon lequel la Scrum Team décide en interne qui fait quoi, quand et comment"
      - "Une pratique tolérée uniquement pour les équipes de plus de 10 personnes"
    answer: 2
    tags: [equipe]
    level: intermediaire
    explanation: |
      « Elles sont également autogérées, elles décident en interne qui fait quoi, quand et
      comment. » C'est exactement le comportement attendu, pas un dysfonctionnement (option
      0) ni un excès à corriger (option 1) — introduire un chef de projet contredirait
      directement l'autogestion. Aucune condition de taille d'équipe n'est requise pour que
      l'autogestion s'applique (option 3).
  - prompt: |
      Un Increment de mauvaise qualité est livré. Le management veut désigner une seule
      personne responsable (Product Owner, Scrum Master, ou un Developer précis). Que dit
      le Guide sur la redevabilité de l'Increment ?
    options:
      - "Le Product Owner seul, car il maximise la valeur du produit"
      - "Toute la Scrum Team est responsable de la création d'un Increment qui ait de la valeur et soit utile, à chaque Sprint — ce n'est pas la responsabilité d'un individu isolé"
      - "Le Scrum Master seul, car il est redevable de l'efficacité de l'équipe"
      - "Le Developer qui a techniquement écrit le code en question"
    answer: 1
    tags: [equipe]
    level: avance
    explanation: |
      « Toute la Scrum Team est responsable de la création d'un Increment qui ait de la
      valeur et qui soit utile, à chaque Sprint. » Chercher UN responsable individuel
      contredit ce principe collectif. Les options 0 et 2 confondent la redevabilité
      spécifique de chaque rôle (valeur du produit pour le PO, efficacité de l'équipe pour
      le SM) avec la redevabilité de l'Increment lui-même, qui est collective. L'option 3
      isole un Developer de la responsabilité partagée de toute la Scrum Team.
  - prompt: |
      Combien de Product Owners une Scrum Team peut-elle avoir simultanément ?
    options:
      - "Un seul — une personne, jamais un comité"
      - "Un par sous-équipe, si l'effectif dépasse 10 personnes"
      - "Deux, pour permettre une continuité en cas d'absence"
      - "Autant que de parties prenantes majeures identifiées"
    answer: 0
    tags: [equipe]
    level: debutant
    explanation: |
      « Le Product Owner est une personne et non un comité. » Il n'existe aucune clause de
      « sous-équipe » créant plusieurs PO (option 1) — au contraire, si des Scrum Teams se
      multiplient sur le même produit, elles doivent partager le même Product Owner
      (module 2). Aucune règle de « doublon pour continuité » (option 2) ni de proportion
      liée aux stakeholders (option 3) n'existe dans le Guide.
  - prompt: |
      Un Scrum Master consacre du temps à former d'autres équipes de l'organisation qui ne
      pratiquent pas encore Scrum, en dehors de sa propre Scrum Team. Est-ce conforme au
      Guide ?
    options:
      - "Non, le rôle de Scrum Master est strictement limité à sa propre Scrum Team"
      - "Non, cela relève exclusivement d'un rôle de coach agile distinct, absent du Guide"
      - "Oui, mais uniquement si le Product Owner l'autorise explicitement au préalable"
      - "Oui : le Guide précise explicitement que le Scrum Master sert aussi l'organisation, notamment en « accompagnant, formant et encadrant l'organisation dans son adoption de Scrum »"
    answer: 3
    tags: [equipe]
    level: intermediaire
    explanation: |
      Le Guide liste explicitement, parmi les façons dont « le Scrum Master rend service à
      l'organisation » : « Accompagner, former et encadrer l'organisation dans son adoption
      de Scrum. » Ce n'est donc pas limité à la seule Scrum Team du Scrum Master (option 0),
      ni un rôle distinct absent du Guide (option 1, qui invente une séparation
      Scrum Master/coach agile que le texte ne fait pas). Aucune autorisation du PO n'est
      requise pour cette activité (option 2).
  - prompt: |
      Un Developer refuse de rendre des comptes à ses collègues sur l'avancement d'une
      tâche complexe, invoquant son autonomie individuelle. Que dit le Guide sur ce point ?
    options:
      - "Il a raison : l'autogestion protège chaque Developer de toute forme de redevabilité envers ses pairs"
      - "Il a tort : les Developers sont explicitement tenus de « se tenir mutuellement responsables en tant que professionnels »"
      - "Il a raison, seul le Scrum Master peut lui demander des comptes"
      - "Il a tort, mais uniquement le Product Owner peut exiger ce compte-rendu"
    answer: 1
    tags: [equipe]
    level: intermediaire
    explanation: |
      Parmi les 4 responsabilités précises des Developers : « Se tenir mutuellement
      responsables en tant que professionnels. » L'autogestion (option 0) ne dispense
      jamais de cette redevabilité horizontale entre pairs — c'est même l'inverse de ce
      qu'elle implique. Ni le Scrum Master (option 2) ni le Product Owner (option 3) ne
      sont les seuls habilités à demander ce compte-rendu : il appartient à toute l'équipe.
  - prompt: |
      Une organisation cite le Guide 2020 pour justifier une règle stricte de « 3 à 9
      développeurs » par équipe. Cette citation est-elle exacte ?
    options:
      - "Non : ce chiffre appartenait à la version 2017 du Guide (Development Team seule) ; le Guide 2020 parle d'une Scrum Team entière, habituellement dix personnes au plus, PO et SM inclus"
      - "Oui, c'est exactement la règle actuelle du Guide 2020"
      - "Non, le Guide 2020 ne donne aucune indication de taille, ni minimale ni maximale"
      - "Oui, mais le chiffre s'applique uniquement aux Developers, sans compter PO ni SM, ce qui revient au même calcul"
    answer: 0
    tags: [equipe]
    level: avance
    explanation: |
      Le Guide 2020 dit : « La Scrum Team doit être suffisamment petite pour rester
      réactive et assez grande pour accomplir un travail significatif durant le Sprint,
      habituellement dix personnes au plus. » Ce chiffre concerne toute la Scrum Team (PO +
      SM + Developers), pas seulement les Developers — la règle « 3 à 9 » citée est un
      vestige de la version 2017. L'option 2 est fausse : le Guide 2020 donne bien une
      indication (« habituellement dix personnes au plus »). L'option 3 réintroduit à tort
      l'ancien découpage 2017.

  # ======================= LES RITUELS (14) =======================
  - prompt: |
      Une équipe termine un Sprint le vendredi. Quand le Sprint suivant doit-il commencer,
      selon le Guide ?
    options:
      - "Le lundi suivant, après un week-end de repos pour l'équipe"
      - "Dès que le Sprint Planning suivant est organisé, sans délai imposé par le Guide"
      - "Immédiatement après la fin du précédent, sans interruption"
      - "Après validation du Product Owner sur la pertinence de l'Objectif de Produit"
    answer: 2
    tags: [rituels]
    level: debutant
    explanation: |
      « Un nouveau Sprint commence immédiatement après la fin du précédent. » Aucune pause,
      aucun délai de validation n'est prévu (options 0, 1 et 3 introduisent toutes un
      flottement absent du texte).
  - prompt: |
      Lors du Sprint Planning, qui propose comment le produit pourrait augmenter sa valeur
      et son utilité pour le Sprint en cours (Thème 1 : « Pourquoi ») ?
    options:
      - "Le Scrum Master, en tant que facilitateur neutre de la discussion"
      - "Les Developers, en fonction de leur charge disponible"
      - "L'organisation, via une feuille de route (roadmap) annuelle"
      - "Le Product Owner, qui explique comment le produit pourrait augmenter sa valeur et son utilité"
    answer: 3
    tags: [rituels]
    level: intermediaire
    explanation: |
      « Le Product Owner explique comment augmenter la valeur du produit et son utilité
      pour le Sprint en cours. » C'est le point de départ du Thème 1, avant que « l'ensemble
      de la Scrum Team collabore » à formuler l'Objectif de Sprint. Le Scrum Master facilite
      l'événement mais ne propose pas le contenu de valeur (option 0). Les Developers
      interviennent surtout au Thème 2 (option 1). Aucune « feuille de route annuelle »
      n'est un concept du Guide (option 2).
  - prompt: |
      Un Developer est en congé pendant deux jours du Sprint. Le Daily Scrum doit-il être
      annulé ou reporté en son absence ?
    options:
      - "Non : le Guide ne prévoit aucune condition de quorum, le Daily Scrum a lieu chaque jour ouvré du Sprint quelles que soient les absences ponctuelles"
      - "Oui, il faut au moins la totalité des Developers présents"
      - "Oui, sauf si le Scrum Master valide explicitement une exception"
      - "Non, mais uniquement si le Product Owner est présent pour compenser l'absence"
    answer: 0
    tags: [rituels]
    level: intermediaire
    explanation: |
      « Le Daily Scrum est un événement de 15 minutes... tenu à la même heure et au même
      lieu, chaque jour ouvré du Sprint. » Aucune condition de quorum ou de présence
      minimale n'est mentionnée dans le Guide (options 1 et 2 inventent une règle absente).
      La présence du PO n'est jamais une condition de tenue de l'événement (option 3) — il
      n'y participe même qu'« en tant que Developer » s'il travaille sur le Sprint Backlog.
  - prompt: |
      Lors de la Sprint Review, des parties prenantes proposent de nouvelles opportunités
      de valeur non prévues initialement. Que doit-il se passer avec le Product Backlog,
      selon le Guide ?
    options:
      - "Rien : le Product Backlog n'est jamais modifié en dehors du Sprint Planning"
      - "Seul le Scrum Master peut décider de l'intégrer au Product Backlog"
      - "Le Product Backlog peut être ajusté pour répondre à ces nouvelles opportunités, comme le prévoit le Guide"
      - "Les nouvelles opportunités doivent attendre le Sprint suivant pour être évaluées formellement"
    answer: 2
    tags: [rituels]
    level: avance
    explanation: |
      « Le Product Backlog peut également être ajusté pour répondre à de nouvelles
      opportunités » — c'est explicitement prévu pendant la Sprint Review elle-même,
      contrairement à l'option 0 qui limite à tort les modifications au seul Sprint
      Planning (le Product Backlog est « émergent », modifiable en continu). L'option 1
      attribue au Scrum Master un pouvoir de décision sur le contenu du backlog qu'il n'a
      pas. L'option 3 impose un délai artificiel absent du texte.
  - prompt: |
      Quel est le tout dernier événement d'un Sprint, celui qui le conclut ?
    options:
      - "La Sprint Review"
      - "La Sprint Retrospective"
      - "Le Daily Scrum du dernier jour"
      - "Le Sprint Planning du Sprint suivant"
    answer: 1
    tags: [rituels]
    level: debutant
    explanation: |
      « La Sprint Retrospective conclut le Sprint. » La Sprint Review est décrite comme
      « l'avant-dernier événement du Sprint » (option 0 fausse). Le Daily Scrum n'a pas de
      statut de clôture particulier le dernier jour (option 2). Le Sprint Planning suivant
      appartient déjà au Sprint suivant, pas à celui qui se termine (option 3).
  - prompt: |
      Pour un Sprint de durée standard d'un mois, quelle est la timebox maximale du Sprint
      Planning ?
    options:
      - "4 heures"
      - "15 minutes"
      - "3 heures"
      - "8 heures"
    answer: 3
    tags: [rituels]
    level: intermediaire
    explanation: |
      « Le Sprint Planning est limité dans le temps à un maximum de huit heures pour un
      Sprint d'un mois. » 4 heures est le timebox de la Sprint Review (option 0), 15 minutes
      celui du Daily Scrum (option 1), 3 heures celui de la Sprint Retrospective (option 2)
      — trois confusions classiques entre les 4 timeboxes.
  - prompt: |
      Quel est l'objectif exact du Daily Scrum, tel que formulé par le Guide ?
    options:
      - "Informer le Scrum Master de l'avancement individuel de chaque Developer"
      - "Assigner les tâches de la journée à chaque Developer"
      - "Inspecter la progression vers l'Objectif de Sprint et adapter le Sprint Backlog si nécessaire"
      - "Vérifier que chaque Developer respecte son estimation initiale en points de complexité"
    answer: 2
    tags: [rituels]
    level: intermediaire
    explanation: |
      « L'objectif du Daily Scrum est d'inspecter la progression vers l'Objectif de Sprint
      et d'adapter le Sprint Backlog si nécessaire, en ajustant les futurs travaux
      planifiés. » Ce n'est ni un rapport individuel au Scrum Master (option 0), ni une
      séance d'assignation de tâches (option 1, contraire à l'autogestion), ni un contrôle
      d'estimations chiffrées — les points de complexité n'apparaissent d'ailleurs jamais
      dans le Guide (option 3).
  - prompt: |
      Un Scrum Master, absent pour cause de maladie, n'a pas pu s'assurer personnellement
      que les événements Scrum aient bien lieu pendant une semaine. Le Sprint Planning
      suivant, tenu sans lui, est-il valide au regard du Guide ?
    options:
      - "Oui : rien dans le Guide ne rend un événement invalide en l'absence du Scrum Master, la Scrum Team reste responsable de tenir les événements"
      - "Non, un événement Scrum sans Scrum Master n'est pas reconnu par le Guide"
      - "Non, il faut reporter le Sprint Planning jusqu'au retour du Scrum Master"
      - "Oui, mais seulement si le Product Owner assure formellement l'intérim du rôle de Scrum Master"
    answer: 0
    tags: [rituels]
    level: avance
    explanation: |
      Le Guide ne conditionne la validité d'aucun événement à la présence physique du
      Scrum Master — sa responsabilité est de s'assurer que les événements « ont bien lieu
      et sont efficients », mais rien n'indique qu'un événement tenu en son absence est
      « invalide » (option 1) ou doit être reporté (option 2). Aucune notion d'intérim
      formel de rôle n'existe dans le Guide (option 3) : les rôles ne se transfèrent pas
      ainsi, même temporairement.
  - prompt: |
      Qui, en plus de la Scrum Team, participe généralement à la Sprint Review selon le
      Guide ?
    options:
      - "Uniquement le management direct de l'organisation"
      - "Uniquement les autres Scrum Masters de l'organisation"
      - "Uniquement les utilisateurs finaux ayant signé un accord de confidentialité"
      - "Les principales parties prenantes (stakeholders) du produit"
    answer: 3
    tags: [rituels]
    level: debutant
    explanation: |
      « La Scrum Team présente les résultats de son travail aux principales parties
      prenantes. » Le Guide ne restreint la Sprint Review ni au seul management (option 0),
      ni aux autres Scrum Masters (option 1), ni à des utilisateurs sous accord spécifique
      (option 2) — ce sont des restrictions inventées, absentes du texte.
  - prompt: |
      Une équipe, en retard sur son Objectif de Sprint, décide de réduire ses tests
      unitaires pour « rattraper le temps perdu ». Est-ce conforme au Guide ?
    options:
      - "Oui, si le Product Owner valide ce compromis pour ce Sprint uniquement"
      - "Non : le Guide précise que « les objectifs de qualité ne sont jamais revus à la baisse » durant le Sprint"
      - "Oui, tant que la Definition of Done est mise à jour en fin de Sprint pour refléter ce choix"
      - "Non, mais uniquement si l'organisation impose des tests automatisés comme standard"
    answer: 1
    tags: [rituels]
    level: intermediaire
    explanation: |
      Parmi les règles « durant le Sprint » : « les objectifs de qualité ne sont jamais
      revus à la baisse. » Ni l'accord du Product Owner (option 0) ni une mise à jour a
      posteriori de la Definition of Done (option 2) ne rendent cette pratique conforme —
      ce serait précisément contourner la règle. L'option 3 introduit une condition
      sectorielle absente du texte : la règle de qualité est générale, indépendante d'un
      standard organisationnel préexistant.
  - prompt: |
      La Sprint Retrospective doit inspecter 5 axes précis selon le Guide. Lesquels ?
    options:
      - "Les individus, les interactions, les processus, les outils, et la Definition of Done"
      - "Le budget, les délais, la qualité, la satisfaction client et la vélocité"
      - "Les risques, les coûts, les bénéfices, le planning et les ressources"
      - "Le Product Backlog, le Sprint Backlog, l'Increment, l'Objectif de Produit et l'Objectif de Sprint"
    answer: 0
    tags: [rituels]
    level: intermediaire
    explanation: |
      « La Scrum Team inspecte le déroulement du dernier Sprint en ce qui concerne les
      individus, les interactions, les processus, les outils et leur Definition of Done. »
      Les autres options mélangent des notions de gestion de projet classique (budget,
      délais, risques — option 1 et 2) ou les 3 artefacts et leurs 2 engagements de
      Product/Sprint Goal (option 3), absents de cette liste précise du Guide.
  - prompt: |
      Un Sprint dure 2 semaines. L'Objectif de Sprint devient obsolète dès le 3ᵉ jour suite
      à un événement externe majeur. Que peut faire la Scrum Team, selon le Guide ?
    options:
      - "Continuer le Sprint tel quel jusqu'à la Sprint Review, où le sujet sera discuté"
      - "Le Scrum Master doit convoquer une Sprint Retrospective d'urgence pour trancher"
      - "Le Product Owner peut annuler le Sprint, puisqu'il a seul ce pouvoir en cas d'Objectif de Sprint devenu obsolète"
      - "La Scrum Team doit voter à la majorité pour décider d'une éventuelle annulation"
    answer: 2
    tags: [rituels]
    level: avance
    explanation: |
      « Un Sprint pourrait être annulé si l'Objectif de Sprint devient obsolète. Seul le
      Product Owner a le pouvoir d'annuler le Sprint. » C'est exactement le cas décrit ici —
      ni un vote collectif (option 3), ni une Retrospective anticipée (option 2, qui de
      toute façon conclut le Sprint plutôt que de statuer sur son annulation), ni une
      simple poursuite en l'état (option 0) ne correspondent à la prérogative individuelle
      et immédiate du Product Owner.
  - prompt: |
      À quelle fréquence le Daily Scrum a-t-il lieu, selon le Guide ?
    options:
      - "Deux fois par semaine, au choix de l'équipe"
      - "Une fois par semaine, le premier jour du Sprint"
      - "Uniquement les jours où un problème est signalé par un Developer"
      - "Chaque jour ouvré du Sprint, à la même heure et au même lieu"
    answer: 3
    tags: [rituels]
    level: debutant
    explanation: |
      « Il est tenu à la même heure et au même lieu, chaque jour ouvré du Sprint. »
      Aucune fréquence hebdomadaire (options 0 et 1) ni conditionnelle à un signalement de
      problème (option 2) n'est prévue — le Daily Scrum est systématique, pas déclenché par
      un événement particulier.
  - prompt: |
      Une organisation impose une réunion mensuelle de pilotage qui revoit les 4 Sprints
      écoulés et fixe les priorités du trimestre suivant, en dehors de toute Sprint Review.
      Cette réunion remplace-t-elle une exigence du Guide ?
    options:
      - "Oui, elle remplace valablement la Sprint Review, qui devient alors facultative"
      - "Non : elle ne remplace aucun événement Scrum prescrit ; chacun des 4 Sprints concernés doit avoir sa propre Sprint Review et sa propre Sprint Retrospective"
      - "Oui, si elle inclut à la fois le Product Owner et le Scrum Master"
      - "Non, mais uniquement si l'organisation compte plusieurs Scrum Teams distinctes"
    answer: 1
    tags: [rituels]
    level: intermediaire
    explanation: |
      Aucun mécanisme du Guide ne prévoit qu'une réunion de pilotage externe puisse se
      substituer à un événement prescrit — chaque Sprint doit avoir sa Sprint Review (« la
      Sprint Review est une session de travail... ») et sa Sprint Retrospective (« conclut
      le Sprint »), qui ont chacune leurs participants et leur objectif propres. Ni la
      présence du PO et du SM (option 2) ni le nombre de Scrum Teams concernées (option 3)
      ne changent cette règle — elle s'applique de la même façon à une seule Scrum Team.

  # ======================= ARTEFACTS ET ENGAGEMENTS (8) =======================
  - prompt: |
      Quel engagement (commitment) est associé au Sprint Backlog dans le Guide ?
    options:
      - "La Definition of Done"
      - "L'Objectif de Produit"
      - "L'Objectif de Sprint"
      - "Le Plan de Release"
    answer: 2
    tags: [artefacts]
    level: debutant
    explanation: |
      « Pour le Sprint Backlog, c'est l'Objectif de Sprint. » La Definition of Done est
      l'engagement associé à l'Increment (option 0), l'Objectif de Produit à celui du
      Product Backlog (option 1). Le « Plan de Release » (option 3) n'est pas un concept du
      Guide.
  - prompt: |
      Le Product Backlog est-il un document figé, défini une fois pour toutes au
      lancement du produit ?
    options:
      - "Non : c'est une liste ordonnée et émergente, qui évolue en continu tout au long de la vie du produit"
      - "Oui, il est figé dès la formulation de l'Objectif de Produit"
      - "Oui, sauf changement majeur de stratégie approuvé par le management"
      - "Non, mais il ne peut être modifié qu'au moment du Sprint Planning"
    answer: 0
    tags: [artefacts]
    level: intermediaire
    explanation: |
      « Le Product Backlog est une liste ordonnée et émergente de ce qui est nécessaire
      pour améliorer le produit. » « Émergente » signifie qu'il évolue en continu, pas
      seulement lors d'un jalon particulier — il peut d'ailleurs être ajusté durant la
      Sprint Review elle-même (voir plus haut), pas uniquement au Sprint Planning (option
      3). Les options 1 et 2 le décrivent à tort comme figé.
  - prompt: |
      Un item du Product Backlog est estimé à une taille donnée par les Developers, mais
      le Product Owner exige qu'ils la revoient à la baisse pour « faire rentrer » plus
      d'éléments dans le Sprint. Est-ce conforme au Guide ?
    options:
      - "Oui, le Product Owner a autorité sur toutes les décisions du Product Backlog, dimensionnement inclus"
      - "Non : le dimensionnement relève des Developers seuls ; le Product Owner peut seulement influencer en clarifiant le besoin, pas imposer une taille"
      - "Oui, tant que la Definition of Done reste inchangée pour ce Sprint"
      - "Non, mais uniquement si un Scrum Master s'y oppose formellement"
    answer: 1
    tags: [artefacts]
    level: intermediaire
    explanation: |
      « Les Developers qui effectueront le travail sont responsables du dimensionnement. Le
      Product Owner peut influencer les Developers en clarifiant ses explications. »
      Influencer n'est pas imposer : le PO ne peut pas dicter une taille (option 0 fausse,
      même en gardant la Definition of Done inchangée comme le suggère l'option 2).
      L'accord ou le refus du Scrum Master n'entre pas en jeu ici (option 3) : ce n'est pas
      son domaine de décision.
  - prompt: |
      Deux Scrum Teams distinctes travaillent sur le même produit, chacune avec son propre
      Objectif de Produit et son propre Product Backlog. Est-ce conforme au Guide ?
    options:
      - "Oui, chaque Scrum Team doit avoir son propre Objectif de Produit pour rester focalisée"
      - "Oui, tant qu'elles se coordonnent via une réunion hebdomadaire commune"
      - "Non, car deux Scrum Teams ne peuvent jamais travailler sur le même produit"
      - "Non : si plusieurs Scrum Teams travaillent sur le même produit, elles doivent partager le même Objectif de Produit, le même Product Backlog et le même Product Owner"
    answer: 3
    tags: [artefacts]
    level: avance
    explanation: |
      « Si les Scrum Teams deviennent trop grandes, elles devraient envisager de se
      réorganiser en plusieurs Scrum Teams cohérentes, chacune axée sur le même produit. Par
      conséquent, elles doivent partager le même Objectif de Produit, le même Product
      Backlog et le même Product Owner. » Avoir deux objectifs et deux backlogs séparés sur
      un même produit contredit directement ce principe (options 0 et 1 le manquent).
      L'option 2 est trop absolue : plusieurs Scrum Teams peuvent bien coexister sur un même
      produit, à condition de partager ces 3 éléments.
  - prompt: |
      À quel moment précis un élément du Product Backlog se transforme-t-il en Increment ?
    options:
      - "Dès qu'il satisfait à la Definition of Done"
      - "Dès qu'il est présenté en Sprint Review"
      - "Dès qu'il est déployé en production"
      - "Dès que le Product Owner l'accepte formellement lors d'une cérémonie de recette"
    answer: 0
    tags: [artefacts]
    level: debutant
    explanation: |
      « Dès qu'un élément du Product Backlog satisfait à la Definition of Done, il se
      transforme en Increment. » Cela peut précéder la Sprint Review (option 1) ou même le
      déploiement effectif en production (option 2, un Increment peut être « utilisable »
      sans être immédiatement déployé). Aucune « cérémonie de recette » du Product Owner
      n'est un concept du Guide (option 3).
  - prompt: |
      Qui doit se conformer à la Definition of Done une fois celle-ci établie ?
    options:
      - "Uniquement le Scrum Master, qui en est le garant du respect"
      - "Uniquement le Product Owner, qui l'a validée"
      - "Les Developers, qui sont tenus de s'y conformer — et l'ensemble des Scrum Teams si plusieurs travaillent sur le même produit"
      - "Uniquement les parties prenantes externes, lors de la Sprint Review"
    answer: 2
    tags: [artefacts]
    level: intermediaire
    explanation: |
      « Les Developers sont tenus de se conformer à la Definition of Done. Si plusieurs
      Scrum Teams travaillent ensemble sur un même produit, elles doivent la définir
      ensemble et s'y conformer. » Ce n'est ni une garantie portée par le seul Scrum Master
      (option 0), ni une validation à sens unique du Product Owner (option 1), ni une
      responsabilité qui incomberait aux parties prenantes externes (option 3).
  - prompt: |
      L'Objectif de Produit peut-il changer en cours de route, par exemple si le marché
      évolue radicalement ?
    options:
      - "Non, l'Objectif de Produit est immuable une fois fixé, par définition"
      - "Le Guide ne l'interdit pas explicitement, mais précise que la Scrum Team doit atteindre ou abandonner un objectif avant de s'attaquer au suivant — un changement radical n'est donc pas anodin"
      - "Oui, il peut être revu à chaque Sprint sans aucune condition particulière"
      - "Oui, mais uniquement via un vote formel d'un comité produit"
    answer: 1
    tags: [artefacts]
    level: intermediaire
    explanation: |
      « L'Objectif de Produit est l'objectif à long terme de la Scrum Team. Ils doivent
      atteindre (ou abandonner) un objectif avant de s'attaquer au suivant. » Le Guide ne
      formule pas d'interdiction absolue (option 0 trop catégorique) mais insiste sur la
      nature de long terme et la nécessité d'atteindre ou d'abandonner l'objectif — un
      changement fréquent « sans condition » (option 2) viderait cette notion de son sens.
      Aucun « comité produit » n'existe dans le Guide, qui précise au contraire que le
      Product Owner est une personne, non un comité (option 3).
  - prompt: |
      Une organisation impose une Definition of Done minimale (tests unitaires uniquement)
      comme standard global. Une Scrum Team souhaite y ajouter des tests d'intégration pour
      son produit spécifique. Est-ce conforme au Guide ?
    options:
      - "Non, la Definition of Done organisationnelle est la seule autorisée, sans aucune adaptation possible"
      - "Non, seul le Product Owner peut modifier la Definition of Done, jamais l'équipe entière"
      - "Oui, mais uniquement si le Scrum Master l'approuve formellement au nom de l'organisation"
      - "Oui : le standard organisationnel est un plancher minimal à suivre au minimum ; la Scrum Team peut créer une Definition of Done plus stricte, adaptée à son produit"
    answer: 3
    tags: [artefacts]
    level: avance
    explanation: |
      « Si la Definition of Done pour un Increment fait partie des standards de
      l'organisation, toutes les Scrum Teams doivent la suivre au minimum. » « Au minimum »
      signifie explicitement qu'aller plus loin est permis, voire encouragé — l'option 0 est
      trop restrictive. La Definition of Done est définie par la Scrum Team dans son
      ensemble, pas par le seul Product Owner (option 1) ni sous validation exclusive du
      Scrum Master au nom de l'organisation (option 2, un mécanisme absent du Guide).

  # ======================= SCRUM VÉCU (4) =======================
  - prompt: |
      Une équipe utilise le planning poker pour estimer ses tickets en points de
      complexité. Cette pratique est-elle prescrite par le Scrum Guide ?
    options:
      - "Oui, c'est la méthode d'estimation officiellement recommandée par le Guide"
      - "Oui, mais uniquement en complément obligatoire des story points"
      - "Non : ni le planning poker ni les story points n'apparaissent dans le Guide ; c'est une pratique d'industrie hors cadre, même si très répandue"
      - "Non, le Guide impose au contraire le t-shirt sizing comme seule méthode valide"
    answer: 2
    tags: [scrum-vecu]
    level: intermediaire
    explanation: |
      Une recherche dans le texte du Guide ne renvoie aucune occurrence de « story point »,
      « planning poker » ni « t-shirt sizing » — le Guide se limite à confier le
      dimensionnement aux Developers, sans imposer de méthode. Les options 0, 1 et 3
      inventent chacune une prescription qui n'existe nulle part dans le texte de
      référence.
  - prompt: |
      Une organisation adopte SAFe pour coordonner 12 équipes travaillant sur le même
      produit. Cette décision est-elle une conséquence directe d'une prescription du Scrum
      Guide ?
    options:
      - "Oui, le Guide impose SAFe dès qu'une Scrum Team dépasse 10 personnes"
      - "Non : le Guide se limite à recommander de scinder en plusieurs Scrum Teams cohérentes partageant le même Objectif de Produit, sans prescrire de mécanisme de coordination — SAFe est un choix hors Guide, parmi d'autres possibles comme Nexus"
      - "Oui, car SAFe est mentionné explicitement dans le Guide comme solution recommandée au-delà de 10 personnes"
      - "Non, car le Guide interdit formellement toute forme de mise à l'échelle"
    answer: 1
    tags: [scrum-vecu]
    level: avance
    explanation: |
      Le Guide s'arrête à : « elles devraient envisager de se réorganiser en plusieurs
      Scrum Teams cohérentes... elles doivent partager le même Objectif de Produit, le même
      Product Backlog et le même Product Owner. » Aucun mécanisme de coordination entre ces
      équipes n'est détaillé, et SAFe (comme Nexus, publié par Scrum.org lui-même) n'est
      jamais nommé dans le Guide (options 0 et 2 inventent une prescription absente).
      L'option 3 est fausse également : rien n'interdit la mise à l'échelle, le sujet est
      simplement laissé ouvert à d'autres cadres.
  - prompt: |
      Une équipe distribuée sur 3 fuseaux horaires respecte scrupuleusement les timeboxes,
      les participants et les objectifs des 5 événements, mais les tient entièrement en
      visioconférence plutôt qu'en présentiel. Est-ce conforme au Guide ?
    options:
      - "Oui : le Guide exprime seulement une préférence de simplicité pour le présentiel (« idéalement... à la même heure et au même lieu »), sans l'imposer"
      - "Non, le Guide impose le présentiel pour au moins le Sprint Planning et la Sprint Review"
      - "Non, un Daily Scrum tenu en visioconférence perd automatiquement sa valeur d'inspection"
      - "Oui, mais uniquement pour les équipes de moins de 5 personnes"
    answer: 0
    tags: [scrum-vecu]
    level: intermediaire
    explanation: |
      « Idéalement, tous les événements se tiennent à la même heure et au même lieu pour
      réduire la complexité » — une préférence, pas une obligation. Rien n'impose le
      présentiel pour des événements précis (option 1), et rien n'indique qu'un format
      distanciel « perd automatiquement » sa valeur d'inspection (option 2) tant que le but
      de l'événement est effectivement rempli. Aucune condition de taille d'équipe n'est
      posée par le Guide sur ce sujet (option 3).
  - prompt: |
      Un manager affirme qu'un Scrum Master doit nécessairement avoir une autorité
      hiérarchique sur les Developers pour « faire respecter » les timeboxes des
      événements. Que répond le Guide à cette affirmation ?
    options:
      - "Il a raison : le Guide attribue au Scrum Master un pouvoir hiérarchique explicite sur l'équipe"
      - "Il a en partie raison, mais uniquement pour les Sprints de plus d'un mois"
      - "Il a raison, car sans autorité hiérarchique, aucun événement ne pourrait être garanti dans son timebox"
      - "Il a tort : le Scrum Master est un leader qui sert la Scrum Team (« il n'y a pas d'équipe dans l'équipe ni de hiérarchies »), il assure les événements par le service et la facilitation, pas par l'autorité hiérarchique"
    answer: 3
    tags: [scrum-vecu]
    level: avance
    explanation: |
      « Le Scrum Master est, avant tout, un véritable leader au service de la Scrum Team et de l'ensemble de l'organisation. » et « il n'y a pas d'équipe dans l'équipe ni de
      hiérarchies. » Le respect des timeboxes est assuré par le service et la facilitation
      (« s'assurer que tous les événements Scrum ont bien lieu et sont... kept within the
      timebox »), pas par une autorité de commandement. Les options 0, 1 et 2 attribuent
      toutes au Scrum Master un pouvoir hiérarchique qu'aucune phrase du Guide ne confirme —
      un Sprint de plus d'un mois n'existe d'ailleurs pas, la durée maximale étant justement
      d'un mois.
---

40 questions — la moitié du format réel du PSM I, dans les mêmes proportions de temps
(30 minutes). Relis toutes les explications après le test, y compris celles des questions
réussies : c'est là que se loge l'essentiel de l'apprentissage.
