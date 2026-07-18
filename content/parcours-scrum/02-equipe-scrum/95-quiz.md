---
title: "Quiz — L'équipe Scrum"
type: quiz
questions:
  - prompt: |
      Un stakeholder important exige, en dehors de tout événement Scrum, qu'un Developer
      ajoute une tâche urgente au Sprint en cours, en court-circuitant le Product Backlog.
      Que dit le Guide sur la façon légitime de faire évoluer le travail de la Scrum Team ?
    options:
      - "Le stakeholder peut demander directement aux Developers, qui restent libres d'accepter ou non"
      - "Toute personne souhaitant modifier le travail doit essayer de convaincre le Product Owner, seul habilité à faire évoluer le Product Backlog"
      - "Seul le Scrum Master peut arbitrer ce type de demande urgente"
      - "La demande est automatiquement intégrée si elle vient d'un stakeholder clé de l'organisation"
    answer: 1
    tags: [equipe]
    level: intermediaire
    explanation: |
      « Ceux qui souhaitent modifier le Product Backlog peuvent le faire en essayant de
      convaincre le Product Owner. » L'option 0 contredit le principe que le Sprint Backlog
      est un plan « par et pour les Developers », pas un canal ouvert aux demandes
      extérieures directes. L'option 2 attribue au Scrum Master un pouvoir d'arbitrage sur
      le contenu du backlog qu'il n'a pas — ce rôle revient au PO. L'option 3 n'a aucune
      base dans le Guide : aucune demande n'est automatique, même venant d'un stakeholder
      important.
  - prompt: |
      Une organisation crée un « comité produit » de 4 personnes qui vote chaque changement
      d'ordre du Product Backlog à la majorité. Est-ce conforme au Guide ?
    options:
      - "Oui, tant que le comité reste stable dans sa composition"
      - "Non : le Product Owner est une personne, pas un comité — il peut représenter plusieurs parties prenantes mais reste seul décisionnaire"
      - "Oui, à condition que le Scrum Master préside le comité"
      - "Non, car un comité produit est réservé aux organisations de plus de 50 personnes"
    answer: 1
    tags: [equipe]
    level: debutant
    explanation: |
      « Le Product Owner est une personne et non un comité. » Un vote à la majorité
      dilue exactement la redevabilité individuelle que le Guide cherche à préserver. Les
      options 0 et 2 tentent de sauver le principe du comité en ajoutant des conditions
      absentes du Guide. L'option 3 invente un seuil d'effectif qui n'existe nulle part
      dans le texte.
  - prompt: |
      Pendant le Sprint, le Scrum Master constate que deux Developers passent activement du
      temps à coder un élément du Sprint Backlog. Comment participent-ils au Daily Scrum
      dans ce cas, selon le Guide ?
    options:
      - "Ils ne participent pas, le Daily Scrum étant réservé aux Developers désignés au départ du Sprint"
      - "Ils participent en tant qu'observateurs silencieux, sans droit de parole"
      - "Ils participent en tant que Developers, puisqu'ils travaillent activement sur des éléments du Sprint Backlog"
      - "Ils participent uniquement si le Scrum Master les y autorise explicitement"
    answer: 2
    tags: [equipe, rituels]
    level: intermediaire
    explanation: |
      Le Guide vise le Product Owner et le Scrum Master dans cette clause, mais le principe
      général s'applique : « Si le Product Owner et/ou le Scrum Master travaillent
      activement sur des éléments du Sprint Backlog, ils participent en tant que
      Developers. » Ici, ce sont bien des Developers qui travaillent sur le Sprint Backlog :
      leur participation est celle, normale, de Developers — pas une exception. Les
      distracteurs inventent des restrictions (observateur silencieux, autorisation du SM)
      absentes du texte.
  - prompt: |
      Un Scrum Master assigne chaque matin les tickets du Sprint Backlog aux membres de
      l'équipe, « pour gagner du temps ». Que dit le Guide sur cette pratique ?
    options:
      - "C'est conforme, car le Scrum Master facilite ainsi l'organisation du travail"
      - "Ce n'est pas conforme : la Scrum Team est autogérée, elle décide en interne qui fait quoi, quand et comment — pas le Scrum Master seul"
      - "C'est conforme uniquement si les Developers valident l'assignation en fin de journée"
      - "Ce n'est pas conforme, car seul le Product Owner peut assigner les tickets"
    answer: 1
    tags: [equipe]
    level: intermediaire
    explanation: |
      « Elles sont également autogérées, elles décident en interne qui fait quoi, quand et
      comment. » Assigner unilatéralement les tickets contredit directement l'autogestion,
      quel que soit qui le fait. L'option 3 est fausse : le PO n'a pas non plus ce pouvoir
      d'assignation — ce n'est le rôle de personne à l'extérieur de la décision collective
      des Developers.
  - prompt: |
      Le Sprint Goal risque de devenir obsolète suite à un changement stratégique majeur de
      l'entreprise. Qui, et seulement qui, a le pouvoir formel d'annuler le Sprint en cours ?
    options:
      - "Le Scrum Master, en concertation avec les Developers"
      - "La Scrum Team entière, par consensus"
      - "Le management de l'organisation, en tant que sponsor du produit"
      - "Le Product Owner, seul"
    answer: 3
    tags: [equipe, rituels]
    level: debutant
    explanation: |
      « Seul le Product Owner a le pouvoir d'annuler le Sprint. » C'est une prérogative
      strictement individuelle et non partagée : ni un consensus d'équipe (option 1), ni le
      Scrum Master (option 0), ni un acteur externe à la Scrum Team comme le management
      (option 2) n'ont cette autorité, même en cas de changement stratégique légitime.
  - prompt: |
      Un tech lead impose à l'équipe une architecture technique précise « pour garantir la
      qualité », sans que les Developers aient été consultés sur le comment. Où cela pose-t-il
      un problème au regard du Guide ?
    options:
      - "Nulle part : la qualité technique relève naturellement d'une autorité technique externe à la Scrum Team"
      - "Le Guide impose que ce soit le Scrum Master qui valide les choix d'architecture"
      - "Le Guide confie exclusivement aux Developers la décision de comment transformer le travail en Increment : une autorité externe imposant le « comment » sort du cadre"
      - "Le Guide impose que ce soit le Product Owner qui valide les choix d'architecture, la qualité faisant partie de la valeur du produit"
    answer: 2
    tags: [equipe]
    level: avance
    explanation: |
      « La façon de procéder est laissée à la seule discrétion des Developers. Personne
      d'autre ne leur dit comment transformer les éléments du Product Backlog en Increments
      de valeur. » Une autorité technique externe qui impose une architecture sans
      consultation contredit ce principe, même avec de bonnes intentions sur la qualité.
      Ni le Scrum Master (option 1) ni le Product Owner (option 3) n'ont cette autorité sur
      le « comment » : le PO porte la Definition of Done attendue à travers la valeur du
      produit, mais la manière technique d'y arriver reste aux Developers.
---

Six scénarios réalistes pour vérifier qui décide de quoi dans l'équipe Scrum — le terrain
d'examen le plus fertile en pièges.
