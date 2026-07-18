---
title: "Quiz — Projet fil rouge"
type: quiz
questions:
  - prompt: |
      Dans la stack migrée, pourquoi `db` est-elle déployée en StatefulSet plutôt qu'en
      Deployment, contrairement à `api` et `web` ?
    options:
      - "Un Deployment ne peut techniquement pas exécuter une image postgres:16-alpine."
      - "db a besoin d'un stockage individuel stable et d'une identité réseau stable à travers les redémarrages ; api et web, sans état individuel, n'en ont pas besoin."
      - "StatefulSet est simplement l'ancien nom de Deployment dans les versions récentes de l'API apps/v1."
      - "C'est arbitraire : un Deployment aurait fonctionné à l'identique pour db."
    answer: 1
    tags: [statefulset, projet]
    level: debutant
    explanation: >
      Un Deployment peut très bien faire tourner n'importe quelle image (option 0
      fausse) ; StatefulSet et Deployment restent deux kinds bien distincts et
      coexistants dans apps/v1 (option 2 fausse). Le choix n'est pas arbitraire (option
      3 fausse) : seule une base de données a besoin du stockage individuel et de
      l'identité réseau stable que garantit un StatefulSet.
  - prompt: |
      Le Service `db` est déclaré avec `clusterIP: None`. Quelle conséquence directe
      cela a-t-il sur la résolution DNS de `db-0` ?
    options:
      - "Le nom db-0.db.shop.svc.cluster.local devient injoignable : un Service headless ne crée aucun enregistrement DNS."
      - "Le nom db-0.db.shop.svc.cluster.local pointe vers l'IP fixe de ce Pod précis, sans aucun équilibrage de charge."
      - "Toutes les requêtes vers ce nom sont automatiquement redirigées vers le Service ClusterIP par défaut du cluster."
      - "clusterIP: None force l'utilisation exclusive de NodePort pour joindre le Pod."
    answer: 1
    tags: [headless-service, dns]
    level: debutant
    explanation: >
      Un Service headless crée bien des enregistrements DNS, un par Pod matché (option 0
      fausse) — c'est justement son intérêt : cibler une réplique précise sans
      équilibrage de charge, contrairement à un Service ClusterIP classique (options 2 et
      3 fausses, aucun rapport avec NodePort).
  - prompt: |
      Le Secret `db-credentials` est référencé à la fois par le StatefulSet `db` et le
      Deployment `api`. Est-ce une pratique correcte, ou faut-il un Secret distinct par
      consommateur ?
    options:
      - "C'est incorrect : Kubernetes interdit qu'un même Secret soit référencé par plus d'un objet."
      - "C'est une pratique correcte et courante : un Secret peut être référencé par plusieurs Deployments/StatefulSets sans duplication de la valeur elle-même."
      - "C'est correct uniquement si les deux objets sont dans des namespaces différents."
      - "C'est correct uniquement pour les ConfigMap, jamais pour les Secret, qui sont à usage unique."
    answer: 1
    tags: [secret, configuration]
    level: intermediaire
    explanation: >
      Rien n'empêche techniquement Kubernetes de référencer le même Secret depuis
      plusieurs objets (option 0 fausse) ; un Secret reste d'ailleurs cantonné à **un
      seul** namespace, donc l'option 2 (namespaces différents) est incohérente. Aucune
      règle d'usage unique n'existe pour un Secret (option 3 fausse) — c'est même la
      pratique recommandée pour éviter la duplication d'une valeur sensible.
  - prompt: |
      Une équipe pose la NetworkPolicy `default-deny-ingress` dans le namespace `shop`,
      mais oublie la NetworkPolicy `allow-ingress-controller-to-web-and-api`. Quel est le
      symptôme observable depuis l'extérieur du cluster ?
    options:
      - "Aucun changement : l'ingress controller n'est jamais concerné par les NetworkPolicy d'un autre namespace applicatif."
      - "Les requêtes via l'Ingress Traefik échouent (timeout ou connexion refusée) : le trafic entrant de Traefik vers web/api n'est plus explicitement autorisé."
      - "Seules les requêtes vers /api échouent ; la racine (/) continue de fonctionner normalement."
      - "L'Ingress bascule automatiquement en mode dégradé sans NetworkPolicy, en autorisant tout le trafic par sécurité."
    answer: 1
    tags: [network-policy, ingress, projet]
    level: avance
    explanation: >
      Traefik, même dans un autre namespace (`kube-system`), reste soumis aux
      NetworkPolicy du namespace `shop` qu'il cherche à joindre (option 0 fausse) ; sans
      l'autorisation explicite, **tout** le trafic entrant échoue, `/api` comme `/`
      (option 2 fausse). Kubernetes ne bascule jamais en mode "tout autorisé" par
      défaut en l'absence d'une policy (option 3 fausse) — c'est même l'inverse : sans
      règle d'autorisation, le trafic reste bloqué par le deny-all déjà en place.
  - prompt: |
      Dans l'Ingress du projet, l'annotation `router.middlewares` référence
      `shop-api-stripprefix@kubernetescrd`. Que se passerait-il si ce Middleware était
      supprimé du cluster, l'Ingress restant inchangé ?
    options:
      - "L'Ingress refuse de router quoi que ce soit tant que le Middleware manquant n'est pas recréé, sur tous les chemins."
      - "Les requêtes vers /api atteignent le Pod api avec le préfixe /api toujours présent dans le chemin, au lieu d'être retiré."
      - "Traefik recrée automatiquement un Middleware par défaut équivalent, sans configuration supplémentaire."
      - "Le trafic vers / (servi par web) cesse également de fonctionner, par effet de bord."
    answer: 1
    tags: [ingress, middleware, projet]
    level: avance
    explanation: >
      Un Middleware manquant désactive seulement l'effet de ce middleware précis sur
      les routes qui le référencent : la requête continue d'être routée vers `api`,
      simplement sans que `/api` soit retiré du chemin (option 1). Traefik ne bloque pas
      tout le routage pour un middleware manquant (option 0 fausse), ne recrée rien
      automatiquement (option 2 fausse), et le routage vers `web` (`/`) reste indépendant
      de ce Middleware (option 3 fausse).
---

Vérifie ta compréhension globale du projet fil rouge : migration compose -> Kubernetes.
