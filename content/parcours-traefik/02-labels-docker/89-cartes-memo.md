---
title: "Cartes mémo — Labels Docker"
type: flashcards
cards:
  - q: |
      Un label Docker est-il visible depuis l'intérieur du conteneur (par exemple par
      le processus applicatif via `process.env`) ?
    a: |
      **Non.** Un label est une métadonnée qui vit à côté du conteneur, dans Docker.
      Contrairement à une variable d'environnement, le processus qui tourne dans le
      conteneur ne la voit jamais. On l'inspecte depuis l'extérieur avec
      `docker inspect`.
  - q: |
      Pourquoi monter le socket Docker en lecture seule (`:ro`) dans le conteneur
      Traefik ?
    a: |
      Le socket Docker donne accès à l'intégralité de l'hôte Docker. Traefik n'a besoin
      que de **lire** la liste des conteneurs et leurs labels ; monter le socket en
      `:ro` limite les dégâts possibles en cas de compromission du conteneur Traefik.
  - q: |
      Avec `exposedByDefault: false`, un conteneur qui porte
      `traefik.http.routers.web.rule=Host(...)` mais **pas** `traefik.enable=true`
      obtient-il une route ?
    a: |
      **Non.** Sans `traefik.enable=true`, aucune route n'est créée, même si la règle
      est présente et bien écrite — vérifié en conditions réelles. C'est la première
      cause de « ma route n'apparaît pas ».
  - q: |
      Un conteneur expose deux ports (80 et 8080), et aucun label
      `loadbalancer.server.port` n'est déclaré. Que fait Traefik ?
    a: |
      Il **devine** un port — en pratique, le plus bas des ports exposés — sans
      garantie que ce soit le bon. Vérifié : ce comportement peut router vers un port
      qui n'écoute rien, produisant un **502 Bad Gateway**. Toujours déclarer le port
      explicitement dès qu'il y a plus d'un port exposé.
  - q: |
      Un router apparaît dans le dashboard Traefik (labels bien lus), mais toute
      requête vers lui reste sans réponse (timeout). Ce n'est pas un problème de
      label : à quoi penser en premier ?
    a: |
      Au **réseau Docker** : Traefik doit partager un réseau avec le conteneur cible
      pour pouvoir le joindre. Lire un label (via le socket Docker, qui voit tout
      l'hôte) ne suffit pas à transmettre le trafic si les deux conteneurs sont sur des
      réseaux différents.
  - q: |
      Deux routers peuvent matcher la même requête : l'un avec ``PathPrefix(`/`)``
      (générique), l'autre avec ``Host(...) && PathPrefix(`/special`)`` (spécifique).
      Comment garantir que le router spécifique gagne toujours ?
    a: |
      En fixant explicitement une **priorité plus haute** sur le router spécifique
      (`traefik.http.routers.<nom>.priority=10` par exemple, contre `1` sur le
      générique) plutôt que de dépendre du calcul implicite de Traefik basé sur la
      longueur de la règle.
---

Lis, réfléchis, révèle, auto-évalue.
