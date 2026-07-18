---
title: "Quiz — Labels Docker"
type: quiz
questions:
  - prompt: |
      Un développeur ajoute ``traefik.http.routers.api.rule=Host(`api.example.com`)``
      sur un conteneur, redémarre Traefik, mais la route n'apparaît jamais dans le
      dashboard. Le provider Docker est bien configuré avec
      `exposedByDefault: false`. Quelle est la cause la plus probable ?
    options:
      - "Le label 'traefik.enable=true' est manquant sur ce conteneur."
      - "Il faut aussi redémarrer le conteneur applicatif, pas seulement Traefik."
      - "Le nom 'api' est un mot réservé, il faut en choisir un autre."
      - "Les routers ne peuvent être définis que sur le conteneur Traefik lui-même."
    answer: 0
    tags: [labels, docker]
    level: debutant
    explanation: >
      Avec exposedByDefault: false, un conteneur doit explicitement porter
      traefik.enable=true pour obtenir la moindre route, même si une règle valide est
      présente. Le nom du router (option 3) est libre, choisi par le développeur. Les
      routers se définissent bien sur les conteneurs applicatifs (option 4 est fausse) :
      c'est tout le principe du provider Docker.
  - prompt: |
      Un conteneur `metrics-app` expose deux ports dans son image : `9090` (métriques
      Prometheus) et `3000` (l'application web réelle). Aucun label
      `loadbalancer.server.port` n'est déclaré. Une fois routé via Traefik, l'app
      répond en 502 Bad Gateway. Pourquoi ?
    options:
      - "Traefik a choisi le port le plus bas (9090, les métriques) au lieu du port applicatif réel (3000)."
      - "Traefik ne supporte pas les conteneurs à plusieurs ports, il faut en isoler un par conteneur."
      - "Le label 'traefik.enable=true' doit être répété une fois par port exposé."
      - "Il faut désactiver le port 9090 dans le Dockerfile pour que Traefik route correctement."
    answer: 0
    tags: [services, labels]
    level: intermediaire
    explanation: >
      Sans loadbalancer.server.port explicite, Traefik devine un port parmi ceux
      exposés — en pratique le plus bas — sans savoir lequel sert réellement
      l'application HTTP. Ici il route vers 9090 (rien d'HTTP utile derrière côté
      routage attendu), d'où le 502. La solution est de déclarer explicitement le port
      3000, pas de restructurer les conteneurs (option 2) ni de désactiver un port dans
      l'image (option 4).
  - prompt: |
      Deux routers peuvent matcher la même requête : `general` (rule=PathPrefix(\`/\`))
      et `checkout` (rule=Host(\`shop.example.com\`) && PathPrefix(\`/checkout\`)), sans
      priorité fixée explicitement sur aucun des deux. Quel comportement est correct ?
    options:
      - "Une erreur de configuration est levée au démarrage : deux routers ne peuvent jamais se chevaucher."
      - "Traefik calcule une priorité implicite basée sur la spécificité/longueur de la règle ; en général la règle la plus spécifique gagne, mais fixer une priorité explicite reste recommandé pour garantir ce comportement."
      - "Le dernier router déclaré dans le fichier docker-compose.yml gagne toujours."
      - "Les deux routers répondent en parallèle et le client reçoit les deux réponses."
    answer: 1
    tags: [routers, labels]
    level: intermediaire
    explanation: >
      Traefik ne lève pas d'erreur pour des règles qui se chevauchent (option 1 fausse)
      et ne se base ni sur l'ordre de déclaration (option 3) ni ne répond en double
      (option 4, impossible en HTTP). Il calcule une priorité implicite, mais la
      recommandation reste de fixer priority explicitement quand le résultat doit être
      garanti et lisible.
  - prompt: |
      Le socket Docker (`/var/run/docker.sock`) est monté dans le conteneur Traefik en
      lecture-écriture (sans `:ro`) au lieu de lecture seule. Quel est le risque
      principal ?
    options:
      - "Aucun risque particulier, Traefik n'écrit jamais sur le socket de toute façon."
      - "Un conteneur Traefik compromis (faille, dépendance vulnérable) pourrait alors créer, modifier ou supprimer n'importe quel conteneur de l'hôte, pas seulement lire les labels."
      - "Cela ralentit uniquement la découverte des labels, sans impact sécurité."
      - "Cela empêche le dashboard de fonctionner correctement."
    answer: 1
    tags: [docker, labels]
    level: avance
    explanation: >
      Le socket Docker donne un accès total à l'API Docker de l'hôte. En lecture seule
      (:ro), Traefik ne peut que lister/inspecter les conteneurs (ce qui lui suffit).
      Sans :ro, un Traefik compromis hériterait d'un accès en écriture complet à
      l'hôte Docker — un risque de sécurité réel, indépendant des performances (option
      3) ou du dashboard (option 4).
  - prompt: |
      Un router Traefik apparaît correctement dans le dashboard, avec la bonne règle
      Host et le bon service associé, mais toute requête HTTP vers ce router reste en
      attente puis finit en timeout (aucune réponse, ni 200, ni 404, ni 502). Où
      chercher en priorité ?
    options:
      - "Réécrire le label 'rule' avec une syntaxe différente, c'est probablement une faute de frappe."
      - "Vérifier que Traefik et le conteneur cible partagent bien un réseau Docker commun : sans ça, Traefik ne peut pas joindre le conteneur même s'il a lu ses labels."
      - "Augmenter le nombre de répliques du service pour répartir la charge."
      - "Ajouter 'loadbalancer.server.port' même si le conteneur n'expose qu'un seul port."
    answer: 1
    tags: [docker, services]
    level: avance
    explanation: >
      Un timeout silencieux (pas de 404, pas de 502) alors que le router est bien
      reconnu dans le dashboard est la signature typique d'un problème réseau : Traefik
      a lu les labels (via le socket Docker, qui voit tout l'hôte) mais ne peut pas
      atteindre le conteneur car ils ne partagent aucun réseau Docker. Rien n'indique
      un problème de syntaxe de règle (option 1, qui donnerait un 404 si mal formée) ni
      de port unique déjà correctement deviné (option 4).
---

Vérifie tes réflexes sur les labels Docker et Traefik.
