---
title: "Quiz — Architectures, DR & Well-Architected"
type: quiz
questions:
  - prompt: |
      Une application web répartie sur plusieurs instances derrière un ALB utilise
      uniquement la stickiness (session affinity) pour garantir qu'un utilisateur reste
      sur la même instance pendant son parcours d'achat. Une instance tombe en panne en
      pleine session d'un client. Que se passe-t-il ?
    options:
      - "Rien, l'ALB migre automatiquement la session vers une autre instance sans perte."
      - "La session est perdue, car la stickiness ne fait que router le trafic, elle ne réplique pas l'état de session."
      - "La session est automatiquement sauvegardée dans DynamoDB par défaut par l'ALB."
      - "Le client est automatiquement redirigé vers Route 53 pour recommencer sa session ailleurs."
    answer: 1
    tags: [architecture, resilience]
    level: intermediaire
    explanation: >
      La stickiness ne fait que router un même client vers la même instance ; elle ne
      réplique ni ne sauvegarde l'état de session ailleurs. Si l'instance tombe, la
      session est perdue. Pour la faire survivre à une panne d'instance, il faut un
      magasin de session partagé (ElastiCache ou DynamoDB) — l'ALB ne le fait jamais
      automatiquement.
  - prompt: |
      Le métier définit pour une application un RPO de 15 minutes et un RTO de 2 heures.
      Que signifie concrètement ce RPO de 15 minutes ?
    options:
      - "Le service doit être rétabli en moins de 15 minutes après un incident."
      - "On accepte de perdre au maximum 15 minutes de données depuis la dernière sauvegarde/réplication valide."
      - "Les sauvegardes doivent être conservées pendant 15 minutes seulement."
      - "L'application doit répondre en moins de 15 minutes en cas de forte charge."
    answer: 1
    tags: [dr, well-architected]
    level: intermediaire
    explanation: >
      Le RPO mesure la perte de données tolérée, pas un temps de rétablissement (ça,
      c'est le RTO) ni une durée de rétention de sauvegarde, ni un temps de réponse sous
      charge. Un RPO de 15 minutes implique des sauvegardes/réplications au moins toutes
      les 15 minutes.
  - prompt: |
      Une architecture de reprise après sinistre maintient en permanence une réplique
      active de la base de données dans la région de secours, mais tous les serveurs
      applicatifs y sont éteints et doivent être démarrés (Auto Scaling) au moment de la
      bascule. Quelle stratégie DR décrit ce scénario ?
    options:
      - "Backup & Restore"
      - "Pilot Light"
      - "Warm Standby"
      - "Multi-Site Active/Active"
    answer: 1
    tags: [dr]
    level: intermediaire
    explanation: >
      Le Pilot Light se caractérise précisément par une donnée active en continu et des
      serveurs applicatifs éteints à démarrer lors de la bascule. Backup & Restore
      n'aurait même pas de réplique active en continu. Warm Standby aurait des serveurs
      déjà actifs (à capacité réduite). Multi-Site Active/Active fait tourner toute
      l'architecture en parallèle, avec du trafic réel des deux côtés.
  - prompt: |
      Une entreprise migre une base Oracle on-premises vers Amazon Aurora PostgreSQL.
      L'équipe prévoit d'utiliser uniquement AWS DMS pour toute la migration. Quel
      élément manque à ce plan ?
    options:
      - "Rien, DMS gère seul intégralement les migrations hétérogènes de bout en bout."
      - "La conversion du schéma via AWS SCT, à réaliser avant la réplication des données par DMS."
      - "Il faut utiliser AWS MGN à la place de DMS pour une base de données."
      - "Il faut d'abord migrer vers MySQL avant de migrer vers Aurora PostgreSQL."
    answer: 1
    tags: [dms, migration]
    level: avance
    explanation: >
      DMS ne migre que les données, jamais le schéma. Pour une migration hétérogène
      (moteurs différents), AWS SCT doit d'abord convertir le schéma Oracle vers un
      schéma compatible PostgreSQL, avant que DMS ne réplique les données. MGN sert à
      migrer des serveurs entiers, pas une base de données ciblée ; passer par MySQL
      comme étape intermédiaire n'est ni nécessaire ni pertinent.
  - prompt: |
      Une entreprise doit transférer environ 400 To de données d'archives vers S3. Sa
      connexion Internet actuelle rendrait ce transfert théoriquement possible en
      environ 5 semaines. Quelle option AWS est la plus adaptée ?
    options:
      - "AWS DataSync, conçu pour ce type de transfert ponctuel et volumineux."
      - "Snowball Edge (ou plusieurs, en parallèle), un transport physique plus rapide qu'un transfert réseau aussi long."
      - "Direct Connect, à mettre en place immédiatement pour ce transfert unique."
      - "Augmenter la bande passante Internet de façon permanente pour ce seul transfert."
    answer: 1
    tags: [migration, cout]
    level: avance
    explanation: >
      Au-delà d'un temps de transfert réseau estimé à environ une semaine, un transport
      physique (Snowball Edge, voire Snowmobile pour un volume encore plus massif)
      devient généralement plus rapide et plus économique. DataSync cible les transferts
      récurrents, pas ce cas ponctuel. Direct Connect a un délai de mise en place de
      semaines à mois, incompatible avec un besoin ponctuel immédiat ; augmenter la
      bande passante en continu pour un seul transfert n'est pas économique.
  - prompt: |
      Un scénario d'examen contient l'expression « quelle solution est la **MOST**
      cost-effective tout en respectant un RTO de 30 minutes ? » avec 4 options
      techniquement viables pour atteindre ce RTO. Quelle est la bonne approche pour
      choisir ?
    options:
      - "Choisir systématiquement l'option la plus sophistiquée techniquement, par sécurité."
      - "Éliminer les options qui ne respectent pas le RTO de 30 minutes, puis parmi celles qui le respectent, choisir la moins chère."
      - "Ignorer le mot-clé MOST cost-effective, il n'a pas d'impact sur la bonne réponse."
      - "Choisir la première option de la liste, l'ordre alphabétique n'a pas d'importance de toute façon."
    answer: 1
    tags: [well-architected]
    level: intermediaire
    explanation: >
      La méthode attendue : d'abord filtrer les options qui respectent la contrainte
      dure (le RTO donné), puis parmi les survivantes, choisir celle qui respecte le
      mot-clé qualificatif (ici MOST cost-effective = la moins chère). Choisir par
      réflexe la solution la plus sophistiquée ignore justement ce que l'examen teste :
      le bon compromis contextuel, pas la performance technique maximale.
---

Vérifie tes réflexes architectures évolutives, DR (RTO/RPO), migration et méthode d'examen.
