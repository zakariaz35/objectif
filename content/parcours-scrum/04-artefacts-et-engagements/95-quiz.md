---
title: "Quiz — Artefacts et engagements"
type: quiz
questions:
  - prompt: |
      Un Scrum Master explique à une nouvelle recrue : « Le Product Backlog, c'est
      simplement la liste des tickets, classés en Must/Should/Could ». Que manque-t-il à
      cette description, au regard du Guide ?
    options:
      - "Rien, cette description est fidèle au Guide"
      - "Il manque la notion d'ordre précis, item par item, et de liste émergente — un classement par étiquettes de priorité ne suffit pas"
      - "Il manque la mention que seul le Scrum Master peut modifier cette liste"
      - "Il manque la mention que la liste doit contenir exactement le même nombre d'items chaque Sprint"
    answer: 1
    tags: [artefacts]
    level: intermediaire
    explanation: |
      Le Guide décrit le Product Backlog comme « une liste **ordonnée** et **émergente** ».
      Un classement en 3-4 paquets de priorité (Must/Should/Could) n'atteint pas le niveau
      de granularité attendu : chaque item doit avoir une position précise dans l'ordre.
      L'option 2 attribue au Scrum Master un pouvoir qu'il n'a pas sur le contenu du
      backlog — c'est le Product Owner qui l'ordonne. L'option 3 invente une contrainte de
      taille absente du Guide.
  - prompt: |
      Un Developer termine le code d'un item mais n'a pas encore écrit les tests prévus par
      la Definition of Done. L'équipe le présente quand même en Sprint Review « pour
      montrer l'avancement ». Est-ce conforme au Guide ?
    options:
      - "Oui, tant que le Product Owner est prévenu que les tests manquent encore"
      - "Non : un élément qui ne satisfait pas la Definition of Done ne peut pas être présenté à la Sprint Review, il retourne au Product Backlog"
      - "Oui, à condition que ce soit précisé comme un Increment « partiel »"
      - "Non, mais uniquement si l'organisation impose une Definition of Done stricte incluant les tests"
    answer: 1
    tags: [artefacts]
    level: debutant
    explanation: |
      « Si un élément du Product Backlog n'est pas conforme à la Definition of Done, il ne
      peut pas être publié ni même présenté lors de la Sprint Review. Il est alors renvoyé
      au Product Backlog. » Il n'existe pas de statut d'« Increment partiel » (option 2) —
      c'est un principe binaire, indépendant de qui est prévenu (option 0) ou de la source
      de la Definition of Done (option 3, qui s'applique de toute façon si les tests en font
      partie).
  - prompt: |
      Qui est responsable du dimensionnement (la taille/l'effort) des éléments du Product
      Backlog ?
    options:
      - "Le Product Owner, qui connaît le mieux la valeur business de chaque item"
      - "Le Scrum Master, en tant que facilitateur du processus d'estimation"
      - "Les Developers, qui effectueront le travail — le Product Owner peut seulement les influencer en clarifiant le besoin"
      - "Un rôle externe dédié, l'estimateur, prévu par le Guide pour objectiver les tailles"
    answer: 2
    tags: [artefacts]
    level: debutant
    explanation: |
      « Les Developers qui effectueront le travail sont responsables du dimensionnement. Le
      Product Owner peut influencer les Developers en clarifiant ses explications. »
      Aucun rôle d'« estimateur externe » n'existe dans le Guide (option 3) : Scrum ne
      définit que trois responsabilités (PO, SM, Developers).
  - prompt: |
      Une équipe planifie une réunion hebdomadaire dédiée d'1 heure appelée « Backlog
      Refinement », inscrite à l'agenda comme un 6ᵉ événement Scrum obligatoire. Que dit
      le Guide sur ce point précis ?
    options:
      - "Le Guide impose effectivement une fréquence hebdomadaire pour l'affinement du Product Backlog"
      - "L'affinement est décrit comme une activité continue, sans timebox ni fréquence imposée par le Guide — cette réunion est une pratique d'entreprise valable mais hors Guide"
      - "Le Guide interdit toute réunion de refinement en dehors du Sprint Planning"
      - "Le Guide fixe le refinement à 10 % du temps du Sprint, arrondi à l'heure la plus proche"
    answer: 1
    tags: [artefacts]
    level: avance
    explanation: |
      « L'affinement du Product Backlog... est une activité continue. » Aucune fréquence ni
      timebox n'est prescrite : une réunion hebdomadaire dédiée est une pratique courante et
      légitime, mais elle n'est **pas** un événement Scrum au sens du Guide — la confondre
      avec les 5 événements est un piège classique. Les options 0 et 3 inventent des règles
      chiffrées absentes du texte ; l'option 2 est fausse, rien n'interdit une réunion
      dédiée, elle est simplement hors du cadre prescrit.
  - prompt: |
      L'Objectif de Sprint est décrit comme « un engagement fait par les Developers », mais
      il est aussi défini collectivement lors du Sprint Planning par toute la Scrum Team.
      Comment concilier les deux affirmations ?
    options:
      - "C'est une contradiction du Guide, qui a été corrigée dans une version ultérieure non encore publiée"
      - "La formulation initiale est collective (toute la Scrum Team), mais ce sont les Developers qui s'y engagent au jour le jour en pilotant le Sprint Backlog"
      - "Seuls les Developers séniors participent à la formulation, les autres membres de la Scrum Team ne font qu'observer"
      - "L'Objectif de Sprint est en réalité rédigé uniquement par le Product Owner, les Developers ne faisant que l'accepter"
    answer: 1
    tags: [artefacts]
    level: avance
    explanation: |
      Le Guide dit à la fois « l'ensemble de la Scrum Team collabore à définir un Objectif
      de Sprint » (Sprint Planning) et « bien que l'Objectif de Sprint soit un engagement
      fait par les Developers » (partie Sprint Backlog) — les deux se complètent : la
      construction est collective, l'engagement opérationnel quotidien (adapter le Sprint
      Backlog pour l'atteindre) revient aux Developers. Ce n'est pas une contradiction
      (option 0), ni une exclusivité PO (option 3) ni une hiérarchie d'ancienneté au sein de
      l'équipe (option 2), notion totalement absente du Guide.
  - prompt: |
      Si la Definition of Done définie par l'organisation impose des tests automatisés,
      une Scrum Team peut-elle décider de les retirer pour livrer plus vite un Sprint en
      retard ?
    options:
      - "Oui, si le Product Owner l'accepte explicitement pour ce Sprint uniquement"
      - "Oui, si le Scrum Master documente la dérogation dans la Sprint Retrospective suivante"
      - "Non : le standard organisationnel est un plancher minimal que toutes les Scrum Teams doivent suivre au minimum, une équipe ne peut aller en dessous"
      - "Non, mais uniquement si le produit est en phase de certification réglementaire"
    answer: 2
    tags: [artefacts]
    level: intermediaire
    explanation: |
      « Si la Definition of Done pour un Increment fait partie des standards de
      l'organisation, toutes les Scrum Teams doivent la suivre au minimum. » Ni l'accord du
      PO (option 0) ni une documentation a posteriori du SM (option 1) ne permettent de
      descendre sous ce plancher — ce serait aussi revenir sur « les objectifs de qualité
      ne sont jamais revus à la baisse », une des règles du Sprint. L'option 3 ajoute une
      condition sectorielle absente du Guide : la règle est générale, pas réservée aux
      contextes réglementés.
---

Six questions pour vérifier la maîtrise des 3 artefacts, de leurs engagements, et de
l'affinement continu — un terrain où les idées reçues d'entreprise trompent souvent les
seniors expérimentés.
