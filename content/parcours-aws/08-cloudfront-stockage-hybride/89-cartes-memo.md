---
title: "Cartes mémo — CloudFront & stockage hybride"
type: flashcards
cards:
  - q: |
      Pourquoi configurer OAC (Origin Access Control) entre CloudFront et une origine
      S3 ?
    a: |
      Pour que **seul CloudFront** puisse lire le bucket : sans OAC, un utilisateur
      pourrait contourner le cache et les contrôles de CloudFront en accédant
      **directement** à l'URL du bucket S3 (qui doit rester privé, Block Public Access
      activé).
  - q: |
      Un scénario exige des adresses IP **statiques** à whitelister dans un pare-feu
      d'entreprise partenaire, pour un trafic non-HTTP. CloudFront ou Global
      Accelerator ?
    a: |
      **Global Accelerator** — il fournit 2 IP Anycast statiques et fonctionne au
      niveau TCP/UDP (couche 4), sans se limiter au HTTP/HTTPS comme CloudFront (dont
      les IP ne sont pas garanties fixes).
  - q: |
      À partir de quel ordre de grandeur de temps de transfert réseau doit-on envisager
      la Snow Family plutôt qu'un transfert classique ?
    a: |
      Quand le transfert prendrait de l'ordre de **plus d'une semaine** avec la bande
      passante réellement disponible sur site — le transport physique devient alors
      plus rapide (et souvent moins cher) qu'un lien réseau saturé pendant des
      semaines.
  - q: |
      Une entreprise migre une infrastructure NetApp on-premise existante vers AWS,
      sans vouloir réécrire ses workflows de snapshots/clonage. Quel service FSx choisir ?
    a: |
      **FSx for NetApp ONTAP** — il expose les fonctionnalités ONTAP habituelles
      (snapshots, clonage, multi-protocole NFS/SMB/iSCSI), pensé pour un lift-and-shift
      depuis une infra NetApp existante.
  - q: |
      Quelle est la différence entre Storage Gateway et DataSync ?
    a: |
      Storage Gateway fournit un **accès continu** (façon fichier/bloc/bande) à du
      stockage AWS depuis le on-premise. DataSync effectue un **transfert automatisé,
      planifié ou ponctuel**, sans exposer d'interface de fichier permanente — c'est
      une synchronisation, pas un accès quotidien.
  - q: |
      Quelle variante de Storage Gateway choisir pour un logiciel de sauvegarde legacy
      pensé pour des bandes physiques, sans changer d'outillage ?
    a: |
      **Tape Gateway** — elle simule une bibliothèque de bandes virtuelle (iSCSI-VTL)
      compatible avec les logiciels de sauvegarde existants, en stockant les données
      réellement sur S3/Glacier.
---

OAC, CloudFront vs Global Accelerator, Snow Family, FSx et Storage Gateway.
