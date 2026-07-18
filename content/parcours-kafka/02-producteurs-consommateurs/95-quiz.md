---
title: "Quiz — Producteurs & consommateurs"
type: quiz
questions:
  - prompt: |
      Avec `acks=all`, qu'attend le producteur avant de considérer l'écriture réussie ?
    options:
      - |
        Uniquement l'accusé de réception du broker leader de la partition.
      - |
        L'accusé de réception du leader ET de toutes les réplicas ISR de la partition.
      - |
        Rien : `acks=all` signifie que le producteur n'attend jamais de confirmation.
    answer: 1
    tags: [producteur, acks]
    level: débutant
    explanation: |
      acks=all est le réglage le plus durable : le producteur attend que le leader ET
      toutes les réplicas synchronisées (ISR) aient confirmé l'écriture avant de la
      considérer réussie.
  - prompt: |
      Un topic a 4 partitions. Un consumer group compte 8 instances. Combien d'instances
      recevront effectivement des messages de ce topic ?
    options:
      - |
        Les 8, chacune recevant une partie du trafic de chaque partition.
      - |
        Au maximum 4 : les 4 instances restantes n'auront aucune partition assignée.
      - |
        Aucune : le nombre d'instances doit être un diviseur du nombre de partitions.
    answer: 1
    tags: [consumer-group, partitions]
    level: débutant
    explanation: |
      Une partition n'est jamais lue par plus d'une instance à la fois au sein d'un même
      groupe. Avec 4 partitions, au maximum 4 instances peuvent être actives
      simultanément ; les autres restent sans partition assignée.
  - prompt: |
      Que risque `enable.auto.commit=true` sur un flux métier critique ?
    options:
      - |
        Rien de particulier : c'est le réglage recommandé pour tous les cas d'usage.
      - |
        Un offset peut être commité avant que le traitement du message associé ait
        réussi, provoquant une perte silencieuse en cas de crash.
      - |
        Le consumer ne peut jamais rejoindre un consumer group avec ce réglage.
    answer: 1
    tags: [commit-offset, at-least-once]
    level: intermédiaire
    explanation: |
      L'auto-commit valide périodiquement l'offset en arrière-plan, indépendamment du
      succès réel du traitement — un crash entre le commit et la fin du traitement perd
      silencieusement le message pour ce groupe.
  - prompt: |
      Quel est l'intérêt principal du `ConsumerRebalanceListener.onPartitionsRevoked` ?
    options:
      - |
        Empêcher tout rebalance de se produire.
      - |
        Commiter les offsets traités avant de perdre la propriété d'une partition, pour
        limiter le retraitement par le prochain propriétaire.
      - |
        Réassigner manuellement les partitions à d'autres instances.
    answer: 1
    tags: [rebalance, commit-offset]
    level: intermédiaire
    explanation: |
      onPartitionsRevoked est le dernier moment sûr pour commiter ce qui a été traité sur
      une partition avant qu'elle change de propriétaire — sans ce commit, le prochain
      propriétaire repart d'un offset plus ancien et retraite davantage de messages.
  - prompt: |
      Pourquoi `CooperativeStickyAssignor` est-il préféré à la stratégie eager par
      défaut historique en production ?
    options:
      - |
        Il élimine complètement les rebalances.
      - |
        Il ne révoque que les partitions qui doivent réellement changer de propriétaire,
        au lieu de révoquer et réassigner toutes les partitions à chaque changement.
      - |
        Il augmente le nombre maximal de partitions supportées par un topic.
    answer: 1
    tags: [rebalance, exploitation]
    level: avancé
    explanation: |
      Contrairement à l'assignation eager (qui révoque tout puis réassigne tout à chaque
      changement de composition du groupe), la stratégie cooperative sticky ne révoque
      que le strict nécessaire, réduisant fortement la pause de consommation induite par
      chaque rebalance.
  - prompt: |
      Deux consumer groups différents (`billing-service` et `analytics-service`) lisent
      le même topic `orders`. Que se passe-t-il ?
    options:
      - |
        Ils se partagent les messages : chaque message n'est reçu que par l'un des deux
        groupes.
      - |
        Chaque groupe reçoit l'intégralité des messages, indépendamment de la
        progression de l'autre groupe.
      - |
        C'est impossible : un topic ne peut être lu que par un seul consumer group.
    answer: 1
    tags: [consumer-group, fondamentaux]
    level: débutant
    explanation: |
      Chaque consumer group maintient sa propre progression d'offsets par partition. Deux
      groupes différents lisent donc le même topic de façon totalement indépendante,
      chacun recevant l'intégralité du flux.
---
