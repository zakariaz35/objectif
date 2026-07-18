---
title: "Cartes mémo — Stockage EC2"
type: flashcards
cards:
  - q: |
      Un volume EBS doit être déplacé de la région `eu-west-3` vers `eu-west-1`. Est-ce
      possible directement ? Sinon, quelle est la procédure ?
    a: |
      **Non**, un volume EBS ne se déplace pas directement entre régions. Il faut créer
      un **snapshot** du volume, le **copier** vers la région cible, puis créer un
      nouveau volume à partir de ce snapshot copié.
  - q: |
      Pourquoi ne peut-on pas chiffrer directement un volume EBS existant non chiffré ?
      Quelle est la procédure pour y arriver ?
    a: |
      Le chiffrement se fixe à la création du volume, pas après coup. Procédure :
      snapshot du volume → copier le snapshot en activant le chiffrement → créer un
      nouveau volume depuis ce snapshot chiffré → l'attacher à la place de l'ancien.
  - q: |
      Une base de données transactionnelle a besoin d'IOPS élevées et prévisibles. Un
      pipeline de traitement de logs volumineux a besoin d'un bon débit séquentiel, sans
      exigence d'IOPS. Quels types EBS choisir pour chacun ?
    a: |
      Base transactionnelle → **io2** (IOPS provisionnées, élevées et constantes).
      Traitement de logs séquentiel → **st1** (HDD optimisé débit, coût réduit).
      Confondre les deux est un piège classique : IOPS ≠ débit.
  - q: |
      Une instance EC2 stocke un cache temporaire régénérable sur de l'Instance Store.
      Que se passe-t-il si l'instance est simplement arrêtée (stop) puis redémarrée ?
    a: |
      Les données de l'Instance Store sont **définitivement perdues**, même pour un
      simple stop/start (contrairement à EBS, qui survit à un stop). L'Instance Store ne
      doit contenir que des données qu'on accepte de perdre.
  - q: |
      Plusieurs instances EC2, réparties sur 3 AZ d'une même région, doivent partager le
      même système de fichiers Linux en lecture/écriture. EBS peut-il remplir ce
      besoin ? Que choisir à la place ?
    a: |
      **Non**, un volume EBS est lié à une AZ et à une instance (sauf multi-attach
      io1/io2, limité à une même AZ). Il faut **EFS**, système de fichiers NFS managé,
      accessible simultanément depuis plusieurs instances sur plusieurs AZ.
  - q: |
      Pourquoi construire sa propre AMI avant de configurer un Auto Scaling Group ?
    a: |
      Une AMI pré-configurée (paquets installés, code déployé) permet à une nouvelle
      instance de démarrer **beaucoup plus vite** qu'avec un script user data complet à
      chaque lancement — un gain important lors d'un scale-out.
---

Lis, réfléchis, révèle, auto-évalue.
