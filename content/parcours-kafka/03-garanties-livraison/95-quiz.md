---
title: "Quiz — Garanties de livraison"
type: quiz
questions:
  - prompt: |
      Un consumer committe l'offset AVANT d'avoir terminé le traitement du message. Quel
      risque cette configuration introduit-elle ?
    options:
      - |
        Un doublon possible, mais jamais de perte.
      - |
        Une perte possible (at-most-once), mais jamais de doublon.
      - |
        Aucun risque : Kafka garantit l'exactly-once par défaut.
    answer: 1
    tags: [garanties, at-most-once]
    level: débutant
    explanation: |
      Committer avant la fin du traitement, c'est le schéma at-most-once : un crash entre
      le commit et la fin du traitement fait que le message ne sera jamais relu — perte
      possible, mais jamais de retraitement en double.
  - prompt: |
      Pourquoi le modèle at-least-once (commit après traitement réussi) est-il le choix
      par défaut recommandé pour un flux métier critique ?
    options:
      - |
        Parce qu'il élimine tout risque de doublon.
      - |
        Parce qu'il élimine le risque de perte silencieuse ; le doublon résiduel se gère
        ensuite via l'idempotence applicative.
      - |
        Parce qu'il ne nécessite aucune configuration particulière côté consumer.
    answer: 1
    tags: [garanties, at-least-once]
    level: intermédiaire
    explanation: |
      L'at-least-once garantit qu'aucun message n'est perdu (au pire, il est relu), au
      prix d'un risque de doublon — risque qu'on neutralise ensuite par un traitement
      idempotent, plutôt que de chercher à empêcher tout retraitement.
  - prompt: |
      Que protège précisément `enable.idempotence=true` côté producteur ?
    options:
      - |
        Tout effet de bord applicatif dupliqué côté consommateur (écriture en base,
        appel API).
      - |
        Les doublons dans le log causés par les retries réseau du producteur lui-même
        (accusé de réception perdu, message en réalité déjà écrit).
      - |
        La perte de messages en cas de panne du broker leader.
    answer: 1
    tags: [producteur, idempotence]
    level: intermédiaire
    explanation: |
      Le producteur idempotent numérote ses envois (Producer ID + numéro de séquence) ce
      qui permet au broker de détecter et ignorer un doublon dû à un retry réseau — ce
      n'est pas une garantie sur ce qui se passe ensuite côté consommateur.
  - prompt: |
      Que couvrent réellement les transactions Kafka, dans le cadre du fameux
      « exactly-once » de Kafka ?
    options:
      - |
        L'atomicité d'un flux read-process-write entièrement interne à Kafka (consommer
        un offset et produire des messages ensemble, en tout ou rien).
      - |
        La garantie qu'un consommateur n'écrira jamais deux fois la même donnée dans une
        base de données externe.
      - |
        L'élimination de tout rebalance sur les consumer groups impliqués.
    answer: 0
    tags: [transactions, exactly-once]
    level: avancé
    explanation: |
      Les transactions Kafka rendent atomique un ensemble d'écritures Kafka (et le commit
      de l'offset consommé) — mais n'ont aucune emprise sur un effet de bord qui sort de
      Kafka, comme une écriture en base ou un appel API.
  - prompt: |
      Un consommateur écrit en base de données après avoir lu un événement Kafka. Quelle
      technique le protège le mieux contre un doublon en cas de retraitement
      (at-least-once) ?
    options:
      - |
        Configurer acks=all côté producteur.
      - |
        Utiliser une clé d'idempotence portée par l'événement, combinée à une contrainte
        d'unicité (ou un UPSERT) côté base de données.
      - |
        Réduire auto.commit.interval.ms pour committer plus souvent.
    answer: 1
    tags: [idempotence, consommateur]
    level: intermédiaire
    explanation: |
      Ni acks=all ni la fréquence de l'auto-commit ne protègent un effet de bord externe.
      Seule une clé d'idempotence exploitée par une contrainte d'unicité (ou un UPSERT
      naturellement idempotent) garantit qu'un retraitement n'a pas d'effet supplémentaire.
  - prompt: |
      Pourquoi dit-on que « l'exactly-once end-to-end » est en grande partie un mythe
      dès qu'un effet de bord externe à Kafka est impliqué ?
    options:
      - |
        Parce que Kafka ne supporte aucune forme de transaction.
      - |
        Parce que rien ne protège nativement un appel externe (DB, API) contre un
        retraitement dû à l'at-least-once — c'est à l'application de garantir
        l'idempotence de cet effet de bord.
      - |
        Parce que les consumer groups ne peuvent pas committer d'offset de façon fiable.
    answer: 1
    tags: [exactly-once, idempotence]
    level: avancé
    explanation: |
      Les mécanismes internes de Kafka (idempotence producteur, transactions) ne couvrent
      que ce qui se passe à l'intérieur de Kafka. Dès qu'un consommateur produit un effet
      de bord externe, il doit lui-même garantir l'idempotence de cet effet — sinon
      l'at-least-once (la réalité de la plupart des systèmes) produira des doublons.
---
