---
title: "Quiz — Configuration et état"
type: quiz
questions:
  - prompt: |
      Un développeur stocke un mot de passe de base de données dans un objet Secret
      Kubernetes et considère le sujet "sécurisé". Quelle nuance manque à ce
      raisonnement ?
    options:
      - "Un Secret Kubernetes chiffre nativement sa valeur avec une clé gérée automatiquement par etcd — le raisonnement est donc correct."
      - "Un Secret n'est encodé qu'en base64 par défaut (réversible en une commande) ; un vrai chiffrement au repos ou un gestionnaire de secrets externe reste nécessaire pour une protection sérieuse."
      - "Les Secrets ne peuvent contenir que des certificats TLS, jamais des mots de passe applicatifs."
      - "Un Secret est automatiquement supprimé après 24h pour des raisons de sécurité, ce qui suffit à protéger la donnée."
    answer: 1
    tags: [secret, security]
    level: debutant
    explanation: >
      base64 est un encodage, pas un chiffrement (option 0 fausse) — `base64 -d` suffit
      à retrouver la valeur en clair. Rien ne limite un Secret aux certificats TLS
      (option 2 fausse), et un Secret n'expire jamais automatiquement (option 3 fausse).
      La vraie protection passe par le chiffrement au repos d'etcd et/ou un gestionnaire
      de secrets externe.
  - prompt: |
      Une PVC est créée seule, sans aucun Pod qui la référence, sur une StorageClass en
      mode `WaitForFirstConsumer`. Quel est son statut observable ?
    options:
      - "Bound, avec un PersistentVolume déjà alloué et prêt à l'emploi."
      - "Pending, car le disque physique n'est provisionné qu'au moment où un Pod la réclame réellement."
      - "Failed, car une PVC sans Pod associé est une erreur de configuration."
      - "Bound uniquement si son StorageClass est explicitement marquée default."
    answer: 1
    tags: [pvc, storageclass]
    level: debutant
    explanation: >
      `WaitForFirstConsumer` retarde volontairement le provisionnement jusqu'à ce qu'un
      Pod utilise la PVC (permet au scheduler de choisir un node avant de fixer la
      localisation du disque). Une PVC seule reste donc `Pending` (options 0 et 3
      fausses), et ce n'est pas une erreur de configuration (option 2 fausse).
  - prompt: |
      Un Pod monte une PVC, écrit un fichier, puis est supprimé (`kubectl delete pod`).
      Un nouveau Pod est créé, montant la **même** PVC (`claimName` identique). Que
      contient le fichier ?
    options:
      - "Le fichier a disparu : une PVC est réinitialisée à chaque nouveau Pod qui la monte."
      - "Le fichier est toujours présent : une PVC a un cycle de vie indépendant du Pod qui la monte, contrairement à un emptyDir."
      - "Le fichier n'est visible que si les deux Pods tournent sur le même node du cluster."
      - "Le contenu dépend du hasard : Kubernetes ne garantit aucune persistance sur un stockage de type local-path."
    answer: 1
    tags: [pvc, persistence]
    level: debutant
    explanation: >
      Une PersistentVolumeClaim survit à la suppression/recréation du Pod qui la monte
      (option 1) — c'est tout l'intérêt par rapport à un `emptyDir` lié au cycle de vie
      du Pod (option 0 fausse). Le node concerné n'a pas d'importance pour la
      persistance elle-même (option 2 fausse) ; ce n'est pas une question de hasard
      (option 3 fausse), c'est une garantie du contrôleur de volumes.
  - prompt: |
      Pourquoi une base de données PostgreSQL en cluster est-elle typiquement déployée
      via un StatefulSet, plutôt qu'un Deployment classique ?
    options:
      - "Un Deployment ne peut techniquement pas monter de PersistentVolumeClaim."
      - "Chaque réplique a besoin d'une identité réseau stable et de son propre stockage individuel préservé à travers les redémarrages — ce qu'un Deployment (Pods interchangeables, PVC partagé ou aucun) ne garantit pas."
      - "Un StatefulSet est simplement un Deployment avec une limite de replicas fixée à 1."
      - "PostgreSQL nécessite obligatoirement un StatefulSet pour des raisons de licence logicielle."
    answer: 1
    tags: [statefulset, deployment]
    level: intermediaire
    explanation: >
      Un Deployment peut très bien monter une PVC (option 0 fausse) — le vrai problème
      est qu'il traite ses Pods comme interchangeables, sans stockage individuel garanti
      par réplique. Un StatefulSet n'est pas limité à 1 réplique (option 2 fausse), et
      il n'y a aucune contrainte de licence en jeu (option 3 fausse).
  - prompt: |
      Un Pod affiche `STATUS: Running`, `RESTARTS: 0`, mais `READY: 0/1`, et le Service
      associé a des endpoints vides. Quelle probe est la cause la plus probable, et
      pourquoi le conteneur n'a-t-il pas redémarré ?
    options:
      - "livenessProbe a échoué ; elle ne redémarre jamais le conteneur, seulement le Service."
      - "readinessProbe a échoué ; son échec retire le Pod des endpoints du Service, sans jamais déclencher de redémarrage du conteneur."
      - "startupProbe a échoué ; elle ne fait que ralentir le démarrage, sans autre effet observable."
      - "Aucune probe n'est en cause : RESTARTS: 0 prouve qu'aucune probe n'est configurée sur ce Pod."
    answer: 1
    tags: [probes, readiness, debug]
    level: avance
    explanation: >
      C'est la signature exacte d'un échec de `readinessProbe` : Running + 0 restart +
      READY 0/1 + endpoints vides. `livenessProbe` agit sur le redémarrage du conteneur,
      jamais sur les endpoints du Service (option 0 fausse) ; `startupProbe`, si elle
      échoue durablement, entraîne un redémarrage comme `livenessProbe` (option 2
      fausse) ; enfin, `RESTARTS: 0` ne prouve rien sur l'absence de probes configurées
      (option 3 fausse) — c'est justement compatible avec une readinessProbe en échec.
---

Vérifie ta compréhension des ConfigMap/Secret, du stockage persistant, et des probes.
