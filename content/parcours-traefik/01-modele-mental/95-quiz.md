---
title: "Quiz — Modèle mental Traefik"
type: quiz
questions:
  - prompt: |
      Une équipe héberge 5 applications sur un même serveur, chacune sur son propre
      port (`:8081` à `:8085`), sans reverse proxy. Quel est le principal problème de
      cette approche quand il faut passer en HTTPS ?
    options:
      - "Aucun problème : chaque application gère son certificat, c'est même plus sécurisé."
      - "Il faut gérer un certificat TLS par application/port, au lieu d'un point de terminaison unique — ça ne passe pas à l'échelle."
      - "HTTPS ne fonctionne que sur le port 443, donc c'est impossible sans reverse proxy."
      - "Le problème est uniquement esthétique (les numéros de port dans l'URL)."
    answer: 1
    tags: [reverse-proxy, https]
    level: debutant
    explanation: >
      HTTPS peut techniquement fonctionner sur n'importe quel port (option 3 fausse),
      mais gérer un certificat par service devient vite ingérable — renouvellement,
      configuration, sécurité multipliés par 5. Un reverse proxy centralise le
      terminaison TLS sur 80/443 pour tous les services derrière lui. Le problème
      dépasse largement l'esthétique (option 4).
  - prompt: |
      Une équipe habituée à nginx ajoute un nouveau conteneur applicatif et s'attend à
      devoir éditer un fichier de config puis recharger nginx. Avec Traefik et son
      provider Docker, quelle étape manuelle équivalente doit-elle effectuer ?
    options:
      - "Éditer un fichier traefik.yml listant les nouveaux backends, puis redémarrer Traefik."
      - "Aucune : poser les bons labels sur le conteneur suffit, Traefik découvre la route automatiquement."
      - "Exécuter `traefik reload` après chaque déploiement."
      - "Redémarrer Traefik pour qu'il relise l'API Docker."
    answer: 1
    tags: [traefik, docker]
    level: debutant
    explanation: >
      C'est tout l'intérêt du provider Docker : Traefik observe l'API Docker en continu,
      aucune étape manuelle n'est nécessaire au-delà de poser les labels sur le nouveau
      conteneur. Les options 1, 3 et 4 décrivent un fonctionnement de type nginx (config
      statique + reload), pas celui de Traefik.
  - prompt: |
      Dans le pipeline Traefik, une requête arrive sur le port 443. Range dans le bon
      ordre les étages qu'elle traverse ensuite jusqu'à atteindre le conteneur applicatif.
    options:
      - "Service → Middlewares → Router → EntryPoint"
      - "EntryPoint → Router → Middlewares → Service"
      - "Router → EntryPoint → Service → Middlewares"
      - "Middlewares → EntryPoint → Service → Router"
    answer: 1
    tags: [entrypoints, routers, middlewares, services]
    level: debutant
    explanation: >
      L'ordre est toujours EntryPoint (le port d'écoute) → Router (la règle qui capte la
      requête) → Middlewares (transformations/filtres optionnels) → Service (le backend
      final). Les autres options inversent cet ordre logique, ce qui n'a pas de sens
      opérationnel (on ne peut pas filtrer avant d'avoir identifié le router concerné,
      par exemple).
  - prompt: |
      Un développeur ajoute le label suivant sur un conteneur applicatif, en espérant
      ouvrir un nouveau port d'écoute sur Traefik : `traefik.entrypoints.custom.address=:8080`.
      Que se passe-t-il ?
    options:
      - "Le nouvel EntryPoint :8080 est créé dès que le conteneur démarre."
      - "Rien : un EntryPoint est de la configuration statique, il ne peut être créé qu'au démarrage du conteneur Traefik (traefik.yml ou command:), jamais via un label."
      - "Traefik redémarre automatiquement pour appliquer le nouvel EntryPoint."
      - "Le label fonctionne, mais seulement pour les conteneurs sur le même réseau Docker."
    answer: 1
    tags: [entrypoints, docker, labels]
    level: intermediaire
    explanation: >
      Les EntryPoints font partie de la configuration **statique** de Traefik : ils
      doivent exister au lancement du processus Traefik. Un label posé sur un conteneur
      applicatif ne peut définir que de la configuration dynamique (Routers, Services,
      Middlewares) — jamais un EntryPoint. C'est le piège de débutant le plus fréquent.
  - prompt: |
      En développement local, une équipe lance Traefik avec `--api.insecure=true` pour
      accéder facilement au dashboard. Que doit-elle impérativement faire avant de
      déployer la même configuration en production ?
    options:
      - "Rien : le dashboard est en lecture seule, donc sans risque même en production."
      - "Retirer l'option insecure et protéger le dashboard par un middleware d'authentification et une vraie règle Host, plutôt que de le laisser ouvert."
      - "Changer uniquement le port du dashboard pour le rendre moins visible."
      - "Désactiver totalement le dashboard, il est inutile en dehors du développement."
    answer: 1
    tags: [docker, https]
    level: intermediaire
    explanation: >
      Le dashboard en lecture seule expose quand même la cartographie complète des
      routes et services internes : une information précieuse pour un attaquant. La
      bonne pratique n'est pas de le désactiver (option 4, il reste utile pour debugger
      en prod aussi) mais de le protéger comme n'importe quelle route sensible
      (authentification + règle d'accès), comme vu dans le projet fil rouge.
---

Vérifie ta compréhension du modèle mental Traefik avant d'attaquer les labels.
