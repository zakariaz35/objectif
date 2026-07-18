---
title: "Quiz — Scrum vécu"
type: quiz
questions:
  - prompt: |
      Un manager demande : « Selon le Guide Scrum, combien de points de complexité une
      équipe doit-elle prévoir par Sprint pour respecter les bonnes pratiques ? » Quelle
      est la réponse la plus juste ?
    options:
      - "Entre 20 et 40 points selon la taille de l'équipe, une fourchette recommandée par le Guide"
      - "Le Guide ne mentionne ni les points de complexité ni aucune fourchette : c'est une pratique d'industrie hors cadre, pas une règle Scrum"
      - "Exactement la moyenne des 3 derniers Sprints, formule imposée par le Guide"
      - "Cela dépend uniquement de la Definition of Done retenue par l'organisation"
    answer: 1
    tags: [scrum-vecu]
    level: debutant
    explanation: |
      Les story points n'apparaissent nulle part dans le Scrum Guide — poser la question en
      ces termes revient à chercher une règle qui n'existe pas dans le texte de référence.
      Les options 0 et 2 inventent des chiffres et des formules qui n'ont aucune source dans
      le Guide. L'option 3 mélange deux notions distinctes (Definition of Done et
      dimensionnement) sans lien de calcul entre elles.
  - prompt: |
      Une équipe A affiche une vélocité de 60 points par Sprint, une équipe B de 35 points
      sur un produit différent. Le management en conclut que l'équipe B est deux fois moins
      productive. Cette conclusion est-elle valide ?
    options:
      - "Oui, la vélocité est un indicateur de productivité directement comparable entre équipes"
      - "Non : les points sont relatifs à chaque équipe, comparer deux vélocités d'équipes différentes n'a pas de sens statistique"
      - "Oui, à condition que les deux équipes utilisent la même échelle de Fibonacci"
      - "Non, mais uniquement si les deux équipes travaillent sur des produits de complexité différente"
    answer: 1
    tags: [scrum-vecu]
    level: intermediaire
    explanation: |
      Un point de complexité n'a de sens que **relativement aux autres estimations de la
      même équipe** — il ne constitue pas une unité de mesure absolue et universelle.
      L'option 2 croit à tort qu'une échelle partagée (Fibonacci) rendrait les points
      comparables : ce n'est pas l'échelle qui pose problème, c'est l'absence de référentiel
      commun entre deux groupes de personnes différentes. L'option 3 introduit une
      condition qui ne change rien au problème de fond : même sur un produit identique, la
      comparaison resterait invalide.
  - prompt: |
      Une équipe distribuée sur 3 fuseaux horaires remplace intégralement son Daily Scrum
      par un message automatique posté chaque matin dans un canal Slack, sans jamais
      d'échange synchrone entre les Developers. Quel est le principal problème, au regard
      du Guide ?
    options:
      - "Aucun problème : le Guide n'impose pas de format particulier pour le Daily Scrum"
      - "Le format écrit perd la fonction d'inspection collective en temps réel que l'événement est censé remplir, même s'il respecte la fréquence quotidienne"
      - "Le problème est uniquement que le message n'est pas envoyé à la même heure chaque jour"
      - "Le problème est que le Product Owner ne reçoit pas le message en copie"
    answer: 1
    tags: [scrum-vecu]
    level: intermediaire
    explanation: |
      Le format est effectivement libre (« les Developers peuvent choisir la structure et
      les techniques qu'ils souhaitent »), mais l'objectif reste fixé : « inspecter la
      progression vers l'Objectif de Sprint et adapter le Sprint Backlog ». Un message
      automatique sans échange réel entre Developers ne permet pas cette inspection
      collective vivante — la forme (fréquence quotidienne) est respectée, le fond
      (inspection en commun) ne l'est plus. Les options 2 et 3 pointent des détails
      secondaires qui ne sont pas le vrai problème structurel.
  - prompt: |
      Une organisation combine Scrum au niveau de chaque équipe avec un tableau Kanban
      visualisant le Sprint Backlog (colonnes, limites de travail en cours). Est-ce
      compatible avec le Guide ?
    options:
      - "Non, Scrum et Kanban sont deux cadres concurrents qui ne peuvent pas coexister"
      - "Oui : le Guide n'interdit aucune technique de visualisation, et Scrum.org publie lui-même « The Kanban Guide for Scrum Teams »"
      - "Oui, mais uniquement si le tableau Kanban remplace intégralement le Sprint Backlog"
      - "Non, car les limites de travail en cours contredisent l'autogestion des Developers"
    answer: 1
    tags: [scrum-vecu]
    level: intermediaire
    explanation: |
      Rien dans le Guide n'interdit d'employer une technique de visualisation par-dessus le
      cadre Scrum — c'est même exactement ce que prévoit « divers processus, techniques et
      méthodes peuvent être employés dans ce cadre de travail ». Scrum.org publie
      officiellement *The Kanban Guide for Scrum Teams*, preuve que la combinaison est reconnue.
      L'option 2 est fausse : le tableau visualise le Sprint Backlog, il ne le remplace pas
      en tant qu'artefact. L'option 3 confond limiter le travail en cours (une discipline de
      flux) avec une contrainte imposée à l'équipe par une autorité externe — décider de sa
      propre limite de WIP reste un choix de la Scrum Team elle-même.
  - prompt: |
      Un manager annonce en entretien : « Chez nous, le Scrum Master fait aussi le
      reporting hebdomadaire des délais à la direction ». Quelle est la réponse la plus
      alignée avec le Guide, sans rejeter la conversation en bloc ?
    options:
      - "Accepter sans réserve : le reporting fait naturellement partie des tâches administratives du Scrum Master"
      - "Refuser catégoriquement toute discussion, le reporting étant explicitement interdit par le Guide"
      - "Faire remarquer que le Guide n'attribue aucune tâche de reporting managérial au Scrum Master, et proposer que la transparence s'appuie sur les artefacts eux-mêmes (Product Backlog, Increment en Sprint Review)"
      - "Proposer que ce soit le Product Owner qui fasse ce reporting à la place du Scrum Master"
    answer: 2
    tags: [scrum-vecu]
    level: avance
    explanation: |
      Le Guide ne liste aucune tâche de reporting managérial parmi les responsabilités du
      Scrum Master (voir les listes « sert la Scrum Team / le PO / l'organisation »). La
      bonne posture n'est ni d'accepter sans discussion (option 0) ni de refuser tout
      dialogue en invoquant une « interdiction » qui n'existe pas littéralement dans le
      Guide (option 1, trop absolue), mais de recentrer la conversation sur ce que le rôle
      prévoit réellement : la transparence par les artefacts. L'option 3 déplace juste le
      problème sur un autre rôle sans le résoudre — le PO n'a pas non plus de mandat de
      reporting managérial dans le Guide.
  - prompt: |
      Que répond le Guide lorsqu'une Scrum Team devient trop grande pour rester réactive,
      et en quoi cela diffère-t-il de ce que propose SAFe ?
    options:
      - "Le Guide impose de créer un Scrum of Scrums hebdomadaire, exactement comme le prévoit SAFe"
      - "Le Guide recommande de scinder en plusieurs Scrum Teams cohérentes partageant le même Objectif de Produit, sans détailler de mécanisme de coordination — contrairement à SAFe, qui prescrit des rôles et cadences supplémentaires"
      - "Le Guide et SAFe proposent tous deux exactement le même niveau de détail sur la coordination inter-équipes"
      - "Le Guide interdit explicitement toute forme de mise à l'échelle au-delà d'une seule Scrum Team"
    answer: 1
    tags: [scrum-vecu]
    level: avance
    explanation: |
      « Si les Scrum Teams deviennent trop grandes, elles devraient envisager de se
      réorganiser en plusieurs Scrum Teams cohérentes... elles doivent partager le même
      Objectif de Produit, le même Product Backlog et le même Product Owner. » Le Guide
      s'arrête là, volontairement incomplet sur la coordination inter-équipes — l'option 0
      invente un « Scrum of Scrums » qui n'est pas un terme du Guide 2020. SAFe, à
      l'inverse, ajoute de nombreux rôles et cadences prescrits (option 2 est donc fausse :
      les niveaux de détail diffèrent nettement). L'option 3 est fausse : le Guide ne
      l'interdit pas, il laisse simplement le sujet ouvert à d'autres cadres comme Nexus ou
      SAFe.
---

Six situations de terrain — estimation, vélocité, remote, Kanban/SAFe, management — pour
relier le Guide à ce qu'un senior a réellement vécu ou vivra en entretien.
