---
title: "Exercice — concevoir le partitionnement d'un topic `payments`"
type: exercise
---

> ⏱️ **Durée conseillée : ~15 min.**

## Énoncé

Une plateforme e-commerce te confie la conception d'un topic `payments`, qui reçoit trois
types d'événements pour chaque paiement :

- `PaymentInitiated`
- `PaymentCaptured`
- `PaymentRefunded`

Contraintes fonctionnelles :

1. Pour **un même paiement donné**, ces trois événements doivent **toujours** être lus
   dans l'ordre où ils se sont produits par le service de réconciliation comptable.
2. Le service de réconciliation doit pouvoir **scaler** (plusieurs instances qui se
   répartissent la charge) sans jamais traiter deux fois le même événement ni perdre
   l'ordre garanti par la contrainte 1.
3. Le volume attendu est d'environ 500 paiements/seconde en pic, et l'équipe
   infrastructure dispose de 4 brokers.

Réponds aux questions suivantes :

1. Quelle **clé de partition** choisirais-tu pour les messages de ce topic ? Justifie.
2. Combien de **partitions** donnerais-tu, au minimum, à ce topic pour que la contrainte 2
   soit satisfaisable ? Que se passe-t-il si tu mets **moins** de partitions que
   d'instances du service de réconciliation ? Et **plus** ?
3. Un collègue propose de partitionner par **type d'événement** (`PaymentInitiated` sur la
   partition 0, `PaymentCaptured` sur la partition 1, `PaymentRefunded` sur la partition
   2). Pourquoi cette idée casse la contrainte 1 ?

<!--correction-->

## Correction

**1. Clé de partition : l'identifiant du paiement (`paymentId`).**

C'est l'identifiant de **l'entité dont l'ordre compte** — exactement le réflexe de la
leçon 3. En hachant `paymentId`, les trois événements (`Initiated`, `Captured`,
`Refunded`) d'un même paiement tombent systématiquement sur la **même partition**, donc
sont lus dans leur ordre d'écriture par n'importe quel consommateur de cette partition.
`hash(paymentId) % N` est déterministe : peu importe quel broker ou quel producteur émet
le message, le résultat est le même.

**2. Nombre de partitions : au moins autant que le nombre d'instances du service de
réconciliation qu'on veut pouvoir faire tourner en parallèle** — par exemple 8 ou 12
partitions pour se laisser de la marge de scaling futur, réparties sur les 4 brokers
disponibles (2 ou 3 partitions par broker).

- **Moins de partitions que d'instances** : les instances excédentaires du consumer group
  restent **inactives** — un consommateur ne peut lire qu'**une seule** partition à la
  fois au sein d'un groupe (détail au module 2). Avec 4 partitions et 6 instances, 2
  instances ne recevront jamais rien.
- **Plus de partitions que d'instances** : aucun problème de correction — chaque instance
  se voit simplement affecter **plusieurs** partitions. C'est même la situation normale
  qui permet d'augmenter le parallélisme plus tard (ajouter des instances) sans changer le
  topic.

**3. Partitionner par type d'événement casse l'ordre garanti.**

Si `PaymentInitiated` va systématiquement en partition 0 et `PaymentCaptured` en partition
1, alors pour un **même** paiement, ces deux événements sont lus par potentiellement
**deux consommateurs différents**, sans aucune garantie sur lequel des deux traite son
message en premier. Kafka ne garantit l'ordre **qu'à l'intérieur d'une partition** — deux
partitions différentes n'ont aucune relation d'ordre entre elles. Le service de
réconciliation pourrait alors voir un `PaymentRefunded` avant même d'avoir vu le
`PaymentCaptured` correspondant, ce qui est exactement le bug que la contrainte 1 interdit.

> Retiens le principe général : **la clé de partition doit correspondre à l'entité dont on
> veut garantir l'ordre**, jamais au type ou à la catégorie du message.
