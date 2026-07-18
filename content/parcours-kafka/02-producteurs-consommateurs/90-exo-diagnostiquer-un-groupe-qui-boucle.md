---
title: "Exercice — diagnostiquer un consumer group qui n'avance pas"
type: exercise
---

> ⏱️ **Durée conseillée : ~15 min.**

## Énoncé

L'équipe qui exploite le service `notifications-service` te contacte : depuis le dernier
déploiement, le consumer group `notifications-service` **traite très peu de messages**,
alors que le topic source `user-events` reçoit un flux constant et que la base de données
cible ne montre aucun signe de saturation.

Voici ce que tu observes :

- Le topic `user-events` a **6 partitions**.
- Le déploiement utilise **12 pods** Kubernetes, tous membres du même `group.id`
  (autoscaling horizontal activé, cible 12 replicas).
- Le déploiement redémarre fréquemment des pods : le `readinessProbe` de l'équipe a un
  seuil trop bas, et Kubernetes tue/relance des pods toutes les 20-30 secondes.
- La configuration du consumer utilise la stratégie d'assignation par défaut historique
  (`RangeAssignor`), pas `CooperativeStickyAssignor`.

Réponds :

1. Sur les 12 pods, combien peuvent réellement lire des messages **au même instant** ?
   Pourquoi ?
2. En quoi les redémarrages fréquents de pods aggravent-ils la situation ? Quel mécanisme
   Kafka est déclenché à chaque redémarrage ?
3. Propose **deux** changements concrets pour corriger la situation (un sur le
   dimensionnement, un sur la configuration du consumer).

<!--correction-->

## Correction

**1. Au maximum 6 pods actifs simultanément — un par partition.**

Un consumer group ne peut avoir **plus d'instances actives que de partitions** sur le
topic source : chaque partition n'est assignée qu'à **une seule** instance à la fois.
Avec 6 partitions et 12 pods, **6 pods restent systématiquement sans partition assignée**
— ils tournent, consomment des ressources, mais ne lisent jamais rien. C'est cohérent
avec l'observation « peu de messages traités » malgré une base cible qui n'est pas
saturée : le goulot n'est **pas** le traitement, c'est le **partitionnement insuffisant**
par rapport au nombre d'instances voulu.

**2. Chaque redémarrage de pod déclenche un rebalance du groupe.**

À chaque fois qu'un pod est tué puis relancé, Kafka détecte le départ (timeout de
heartbeat ou déconnexion explicite) puis le retour d'une instance du groupe : ça
déclenche un **rebalance**. Avec `RangeAssignor` (stratégie *eager*), **toutes** les
partitions sont révoquées à **toutes** les instances puis réassignées depuis zéro — la
consommation du groupe entier **s'arrête** le temps du rebalance, à chaque redémarrage.
Avec un redémarrage toutes les 20-30 secondes, le groupe passe une part significative de
son temps à rééquilibrer plutôt qu'à consommer : c'est la deuxième cause, cumulée à la
première, du très faible débit observé.

**3. Deux corrections concrètes :**

- **Dimensionnement** : soit augmenter le nombre de partitions du topic `user-events` (par
  exemple à 12, pour matcher la cible de 12 replicas — en gardant à l'esprit que ça
  n'affecte que les nouveaux messages pour l'affectation clé→partition, cf. module 1),
  soit réduire la cible d'autoscaling à 6 replicas maximum pour ce service tant que le
  topic garde 6 partitions. Le nombre de partitions doit être **au moins égal** au nombre
  maximal d'instances qu'on veut voir consommer en parallèle.
- **Configuration** : corriger le `readinessProbe` pour arrêter les redémarrages en
  cascade (cause racine côté infra), **et** passer à
  `partition.assignment.strategy=CooperativeStickyAssignor` pour que les rebalances
  restants (déploiements normaux, autoscaling légitime) ne révoquent que les partitions
  qui doivent réellement changer de propriétaire, sans interrompre tout le groupe à chaque
  fois.

> Le bon diagnostic ici passe par vérifier, dans l'ordre : le nombre de partitions vs le
> nombre d'instances actives, puis la fréquence des rebalances (visible via les logs du
> consumer ou `kafka-consumer-groups.sh --describe`) — pas de se précipiter sur le code
> de traitement métier, qui n'est pas en cause.
