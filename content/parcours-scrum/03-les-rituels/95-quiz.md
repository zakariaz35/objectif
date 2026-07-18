---
title: "Quiz — Les rituels"
type: quiz
questions:
  - prompt: |
      Une équipe tient un Daily Scrum de 45 minutes chaque matin, où chaque Developer
      rapporte son avancement au Scrum Master, qui note les blocages dans un tableau
      partagé avec le management. Quel est le problème principal au regard du Guide ?
    options:
      - "Le problème est la durée : 45 minutes dépasse largement le timebox de 15 minutes prévu pour cet événement"
      - "Il n'y a aucun problème : le Scrum Master est légitime pour centraliser les blocages remontés par l'équipe"
      - "Le problème est que le Sprint devrait durer un mois exactement, pas moins"
      - "Le problème est que le Product Owner devrait être présent pour valider chaque avancement"
    answer: 0
    tags: [rituels]
    level: debutant
    explanation: |
      Le Daily Scrum est fixé à **15 minutes** quelle que soit la durée du Sprint — un
      dépassement à 45 minutes rompt directement le timebox. Le fond du problème (un
      rapport au Scrum Master plutôt qu'une inspection par et pour les Developers) est réel
      aussi, mais l'option la plus directement vérifiable et sourcée est la durée. L'option
      2 est absurde : rien n'impose une durée de Sprint précise d'un mois. L'option 3
      inverse le rôle du PO, qui ne « valide » pas l'avancement au Daily Scrum.
  - prompt: |
      Le Product Owner d'une équipe distribuée organise la Sprint Review comme une
      présentation PowerPoint de 30 minutes suivie d'un « merci, à la prochaine », sans
      question ni retour des stakeholders présents. Que manque-t-il fondamentalement,
      selon le Guide ?
    options:
      - "Rien : la durée de 30 minutes respecte largement le timebox de 4 heures"
      - "Le caractère de session de travail collaborative : la Sprint Review ne doit jamais se limiter à une présentation"
      - "La présence du Scrum Master, seul habilité à animer cet événement"
      - "Un vote formel des stakeholders pour valider ou refuser l'Increment"
    answer: 1
    tags: [rituels]
    level: intermediaire
    explanation: |
      « La Sprint Review est une session de travail et la Scrum Team doit éviter de la
      limiter à une session de présentation. » Le respect du timebox (option 0) est vrai
      mais ne répond pas à la vraie question posée. Le Guide n'attribue pas l'animation de
      la Sprint Review au seul Scrum Master (option 2). Il ne prévoit aucun « vote formel »
      de validation (option 3) — la Sprint Review vise la collaboration sur la suite, pas
      un jalon binaire go/no-go.
  - prompt: |
      Une Scrum Team travaille sur des Sprints de 2 semaines. Combien de temps, au maximum,
      peut durer sa Sprint Retrospective selon une lecture stricte du Guide ?
    options:
      - "Exactement 1h30, la moitié du maximum prévu pour un Sprint d'un mois"
      - "Le Guide donne un principe de proportionnalité (« généralement plus court ») mais ne fixe aucune formule ni durée précise pour un Sprint de 2 semaines"
      - "3 heures, comme pour un Sprint d'un mois, le timebox étant fixe quelle que soit la durée du Sprint"
      - "Aucune limite : la Sprint Retrospective n'est jamais timeboxée, contrairement aux autres événements"
    answer: 1
    tags: [rituels]
    level: avance
    explanation: |
      Le Guide dit littéralement : « Pour les Sprints plus courts, l'événement est
      généralement plus court » — sans donner de formule de calcul exacte (contrairement à
      une idée reçue très répandue de « diviser proportionnellement »). L'option 0 invente
      une règle de calcul absente du texte. L'option 2 confond ce timebox avec celui du
      Daily Scrum, seul événement dont la durée reste fixe (15 minutes) indépendamment de
      la longueur du Sprint. L'option 3 est fausse : tous les événements Scrum sont
      timeboxés, y compris la Sprint Retrospective.
  - prompt: |
      Pendant le Sprint, un stakeholder important demande un changement de périmètre qui,
      selon les Developers, ne remettrait pas en cause l'Objectif de Sprint. Que dit le
      Guide sur cette situation ?
    options:
      - "Aucun changement de périmètre n'est jamais permis une fois le Sprint Planning terminé"
      - "Le périmètre peut être clarifié et renégocié avec le Product Owner selon ce qu'on en apprend, tant que l'Objectif de Sprint n'est pas menacé"
      - "Seul le Scrum Master peut valider un changement de périmètre en cours de Sprint"
      - "Le changement nécessite d'annuler le Sprint en cours et d'en relancer un nouveau"
    answer: 1
    tags: [rituels]
    level: intermediaire
    explanation: |
      « Le périmètre peut être clarifié et renégocié avec le Product Owner selon ce qu'on
      en apprend » — c'est l'une des 4 règles explicites « durant le Sprint », tant que
      l'Objectif de Sprint reste protégé. L'option 0 est trop absolue et contredit
      directement cette règle. L'option 2 attribue au Scrum Master un pouvoir de validation
      qu'il n'a pas sur le contenu du Sprint Backlog. L'option 3 est disproportionnée :
      l'annulation du Sprint est réservée au cas où l'Objectif de Sprint devient obsolète,
      pas à un simple ajustement de périmètre.
  - prompt: |
      Une Sprint Retrospective se termine systématiquement par une liste de constats
      (« on devrait mieux communiquer », « les tests prennent trop de temps ») sans qu'
      aucune action concrète ne soit reprise au Sprint suivant. Quel principe du Guide
      est directement enfreint ?
    options:
      - "Le timebox de 3 heures, qui serait nécessairement dépassé dans ce cas"
      - "Les améliorations les plus impactantes doivent être abordées dès que possible, éventuellement ajoutées au Sprint Backlog suivant"
      - "La Sprint Retrospective doit obligatoirement produire un rapport écrit transmis au management"
      - "Aucun principe n'est enfreint tant que la Scrum Team respecte la durée de l'événement"
    answer: 1
    tags: [rituels]
    level: intermediaire
    explanation: |
      « Les améliorations ayant le plus d'impact sont abordées dès que possible. Elles
      peuvent même être ajoutées au Sprint Backlog pour le prochain Sprint. » Constater sans
      jamais agir contredit ce principe, même si le timebox est respecté (donc l'option 0
      est hors sujet et l'option 3 fausse). L'option 2 invente une obligation de reporting
      écrit absente du Guide.
  - prompt: |
      Dans quel ordre chronologique exact les 4 événements internes se déroulent-ils au
      sein d'un même Sprint ?
    options:
      - "Daily Scrum, Sprint Planning, Sprint Retrospective, Sprint Review"
      - "Sprint Planning, Sprint Review, Daily Scrum, Sprint Retrospective"
      - "Sprint Planning, Daily Scrum (répété), Sprint Review, Sprint Retrospective"
      - "Sprint Retrospective, Sprint Planning, Daily Scrum, Sprint Review"
    answer: 2
    tags: [rituels]
    level: debutant
    explanation: |
      Le Sprint Planning lance le Sprint, le Daily Scrum se répète chaque jour ouvré
      pendant toute sa durée, la Sprint Review est « l'avant-dernier événement », et la
      Sprint Retrospective « conclut le Sprint ». Les trois autres options mélangent l'ordre
      — un piège fréquent consiste à inverser Review et Retrospective, ou à placer le Daily
      Scrum après la Review.
---

Six scénarios sur le cœur du Guide — le module que l'examen creuse le plus, et celui que
vous vivez le plus au quotidien.
