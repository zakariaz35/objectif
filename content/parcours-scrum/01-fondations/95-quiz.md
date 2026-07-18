---
title: "Quiz — Fondations"
type: quiz
questions:
  - prompt: |
      Un consultant présente Scrum comme « la méthodologie de gestion de projet la plus
      utilisée en agilité ». Un développeur senior, qui a lu le Guide, tique sur le mot
      « méthodologie ». Pourquoi a-t-il raison de tiquer ?
    options:
      - "Parce que Scrum est un cadre de travail (framework), volontairement incomplet, et non une méthodologie qui prescrit tout"
      - "Parce que Scrum n'est utilisable qu'en développement logiciel, contrairement à une méthodologie généraliste"
      - "Parce que le terme correct est « approche agile », Scrum n'étant qu'un exemple parmi d'autres"
      - "Parce que Scrum est une norme ISO, ce qui est incompatible avec le terme « méthodologie »"
    answer: 0
    tags: [fondations]
    level: debutant
    explanation: |
      Le Guide ouvre littéralement sur « Scrum est un **cadre de travail léger**... ». Un
      cadre pose des règles minimales ; une méthodologie prescrirait le détail de chaque
      pratique. L'option 1 est fausse : le Guide 2020 a justement retiré toute référence
      exclusive au logiciel, Scrum sert à « des problèmes complexes » en général. L'option 2
      confond vocabulaire marketing et définition du Guide. L'option 3 est une invention :
      Scrum n'a aucun statut de norme ISO.
  - prompt: |
      Une équipe pratique un « Scrum » où le Daily Scrum a été supprimé (« on communique
      déjà assez sur Slack ») mais où Sprint Planning, Review et Retrospective sont
      maintenus avec soin. Que peut-on dire de cette pratique au regard du Guide ?
    options:
      - "C'est toujours du Scrum, puisque 3 événements sur 4 sont respectés avec sérieux"
      - "Ce n'est plus du Scrum au sens du Guide : retirer un événement prescrit sort du cadre, même partiellement bien exécuté par ailleurs"
      - "C'est du Scrum allégé, une variante officiellement reconnue pour les équipes matures"
      - "Cela dépend uniquement de la taille de l'équipe : en dessous de 5 personnes, le Daily Scrum est optionnel"
    answer: 1
    tags: [fondations]
    level: intermediaire
    explanation: |
      « Bien que la mise en œuvre uniquement de certaines parties de Scrum soit possible, le
      résultat ne sera pas du Scrum. Scrum n'existe que dans sa totalité. » Le nombre
      d'événements bien exécutés par ailleurs (option 0) n'entre pas en compte : c'est un
      cadre entier ou rien. L'option 2 invente une variante qui n'existe nulle part dans le
      Guide. L'option 3 est fausse : aucune clause de taille d'équipe n'exempte du Daily
      Scrum — au contraire, le Guide précise juste que le PO/SM y participent « en tant que
      Developers » s'ils travaillent sur le Sprint Backlog, sans lien avec l'effectif.
  - prompt: |
      Quel est le rôle exact de la « pensée Lean » telle que citée dans la théorie Scrum ?
    options:
      - "Elle sert à choisir la durée idéale d'un Sprint selon la charge de l'équipe"
      - "Elle réduit le gaspillage et focalise sur l'essentiel, en complément de l'empirisme"
      - "Elle remplace l'empirisme dans les organisations qui pratiquent le Kanban"
      - "Elle impose l'utilisation d'un tableau Kanban à côté du Product Backlog"
    answer: 1
    tags: [fondations]
    level: debutant
    explanation: |
      Citation exacte : « L'empirisme affirme que la connaissance provient de l'expérience...
      La pensée Lean réduit le gaspillage et se focalise sur l'essentiel. » Les deux
      coexistent, l'une ne remplace pas l'autre (option 2 fausse). Rien dans le Guide ne lie
      la pensée Lean à la durée du Sprint (option 0) ni à un outil Kanban obligatoire
      (option 3) — Scrum et Kanban restent deux cadres distincts.
  - prompt: |
      Une Scrum Team en Sprint Retrospective identifie un problème récurrent (les tests
      manuels retardent chaque livraison), mais aucune décision concrète n'est prise :
      « on en reparlera la prochaine fois ». Quel pilier de l'empirisme est directement en
      défaut ici ?
    options:
      - "La transparence, parce que le problème n'a pas été formulé clairement"
      - "L'inspection, parce que la Scrum Team n'a pas assez creusé la cause du problème"
      - "L'adaptation, parce qu'un problème inspecté sans ajustement concret rend l'inspection infructueuse"
      - "Aucun pilier n'est en défaut : la Sprint Retrospective a bien eu lieu dans son timebox"
    answer: 2
    tags: [fondations]
    level: intermediaire
    explanation: |
      Le problème a bien été rendu visible et inspecté (options 0 et 1 fausses : la
      transparence et l'inspection ont eu lieu, l'énoncé le précise). Ce qui manque, c'est
      l'ajustement : « L'inspection permet l'adaptation. Une inspection sans adaptation est
      considérée comme infructueuse. » L'option 3 confond « avoir tenu l'événement dans les
      temps » avec « avoir rempli son but » — ce sont deux choses différentes.
  - prompt: |
      Parmi ces cinq mots, lesquels sont bien les **5 valeurs Scrum** listées dans le
      Guide ?
    options:
      - "Transparence, inspection, adaptation, confiance, collaboration"
      - "Engagement, focus, ouverture, respect, courage"
      - "Engagement, transparence, respect, agilité, courage"
      - "Focus, confiance, ouverture, courage, livraison continue"
    answer: 1
    tags: [fondations]
    level: debutant
    explanation: |
      Citation exacte : « Engagement, focus, ouverture, respect et courage. » Les trois
      autres options mélangent volontairement des mots qui existent bien dans Scrum
      (transparence, confiance, agilité) mais qui n'appartiennent pas à la liste précise des
      5 valeurs — un classique du QCM PSM I qui teste l'exactitude de la mémorisation, pas
      la compréhension générale du sujet.
  - prompt: |
      Un Scrum Master explique à son management : « Scrum ne dit pas comment estimer nos
      tickets, ni quel outil de suivi utiliser — c'est notre équipe qui décide ». Cette
      affirmation est-elle fidèle au Guide ?
    options:
      - "Non, le Guide impose les points de complexité (story points) comme unité d'estimation standard"
      - "Non, le Guide recommande explicitement les burndown charts comme seul outil valide"
      - "Oui : le Guide est volontairement incomplet et laisse les techniques d'estimation et les outils à la discrétion de ceux qui utilisent Scrum"
      - "Oui, mais uniquement pour les équipes de plus de 10 personnes"
    answer: 2
    tags: [fondations]
    level: intermediaire
    explanation: |
      Le Guide ne mentionne ni story points ni planning poker : « Diverses pratiques
      existent pour évaluer la progression, telles que les courbes de burn-down... Bien que
      leur utilité soit prouvée, ces courbes ne remplacent pas l'importance de
      l'empirisme » — il les cite comme *exemples*, sans les imposer. Les options 0 et 1
      inventent des obligations qui n'existent pas dans le Guide. L'option 3 invente une
      condition de taille d'équipe absente du texte.
---

Six questions pour vérifier que le socle théorique — cadre, empirisme, valeurs — est bien
en place avant d'attaquer les rituels.
