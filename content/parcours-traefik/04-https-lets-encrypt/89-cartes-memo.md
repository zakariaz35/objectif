---
title: "Cartes mémo — HTTPS Let's Encrypt"
type: flashcards
cards:
  - q: |
      Un certresolver Traefik peut-il être défini via un label sur un conteneur
      applicatif ?
    a: |
      **Non.** Comme les EntryPoints, un certresolver est de la configuration
      **statique** : il se définit sur le conteneur Traefik lui-même (`command:` ou
      `traefik.yml`). Seule son **utilisation** par un routeur (`tls.certresolver=<nom>`)
      se fait via un label dynamique.
  - q: |
      Quel est le seul challenge ACME capable de délivrer un certificat wildcard
      (`*.example.com`) ?
    a: |
      Le **`dnsChallenge`** : il prouve la propriété du domaine via un enregistrement
      DNS `TXT` temporaire, sans dépendre d'une exposition HTTP/HTTPS publique — le
      seul moyen de couvrir tous les sous-domaines d'un coup ou de valider un service
      non exposé sur 80/443.
  - q: |
      Pourquoi préférer une redirection HTTP→HTTPS au niveau de l'EntryPoint plutôt
      qu'un middleware `redirectscheme` répété sur chaque service ?
    a: |
      Une redirection au niveau de l'EntryPoint s'applique **une seule fois, pour tous
      les services**, en configuration statique — plus simple à maintenir dès que
      l'ensemble de la stack doit être HTTPS, sans répéter le même middleware partout.
  - q: |
      Quelles permissions le fichier `acme.json` doit-il avoir, et pourquoi ?
    a: |
      **600** (lecture/écriture pour le propriétaire uniquement) : ce fichier contient
      les **clés privées** des certificats obtenus. Des permissions trop ouvertes
      peuvent empêcher Traefik de démarrer ou constituer une fuite de sécurité.
  - q: |
      À quoi sert le serveur de staging Let's Encrypt, et que faut-il faire une fois la
      configuration validée ?
    a: |
      Il permet de tester la configuration ACME **sans épuiser les limites de débit**
      de la production (certificats non reconnus par les navigateurs, mais quasi sans
      limite). Une fois validé, il faut **retirer** l'option `caserver` (ou basculer
      vers l'URL de production) avant la mise en ligne réelle.
---

Lis, réfléchis, révèle, auto-évalue.
