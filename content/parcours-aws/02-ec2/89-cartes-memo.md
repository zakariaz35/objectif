---
title: "Cartes mémo — EC2"
type: flashcards
cards:
  - q: |
      Une instance `t3.medium` fonctionne très bien pendant des mois, puis devient
      soudainement lente en continu (pas juste un pic) sous charge soutenue. Pourquoi,
      et quelle famille choisir à la place ?
    a: |
      Les instances **T** utilisent des **crédits CPU** pour absorber les pics : sous
      charge **soutenue**, les crédits s'épuisent et la performance retombe au niveau de
      base. Il faut basculer vers une famille sans crédit, comme `M` (généraliste) ou
      `C` (calcul).
  - q: |
      Une connexion à une application EC2 **time out** (aucune réponse). Où chercher en
      premier, et pourquoi pas un « connection refused » ?
    a: |
      Un **Security Group** (ou une NACL) trop restrictif bloque silencieusement le
      trafic → timeout. Un « connection refused » indiquerait au contraire que le
      Security Group laisse déjà passer le trafic, mais que l'application elle-même ne
      répond pas sur ce port (service arrêté, mauvais port).
  - q: |
      Un batch de traitement d'images tourne quelques heures par nuit, peut être coupé
      et relancé sans problème (il reprend où il s'est arrêté). Quelle option d'achat
      minimise le coût ?
    a: |
      **Spot Instances** (jusqu'à ~90 % de remise) : la charge est tolérante à
      l'interruption, exactement le profil pour lequel le Spot est fait.
  - q: |
      Un système distribué type Cassandra doit tourner sur des centaines d'instances, en
      isolant des groupes d'instances sur des racks physiques distincts. Cluster,
      Spread ou Partition Placement Group ?
    a: |
      **Partition** : conçu pour un grand nombre d'instances (jusqu'à des centaines),
      réparties en partitions logiques sur des racks séparés (alimentation/réseau
      indépendants) — exactement le profil Big Data distribué.
  - q: |
      Une Elastic IP est associée à une instance qui reste arrêtée plusieurs jours. Est-
      ce gratuit ?
    a: |
      **Non.** Une Elastic IP n'est gratuite que si elle est attachée à une instance **en
      cours d'exécution**. Non attachée, ou attachée à une instance arrêtée, elle est
      facturée — pour dissuader de geler des IPv4 inutilisées.
  - q: |
      Pourquoi une IAM Access Key codée en dur dans le code d'une application EC2 est-
      elle une mauvaise pratique, et que fait-on à la place ?
    a: |
      C'est un **secret statique** exposé au risque de fuite, sans rotation automatique.
      On attache plutôt un **IAM Role** à l'instance : le SDK récupère des credentials
      **temporaires** via STS, automatiquement.
---

Lis, réfléchis, révèle, auto-évalue.
