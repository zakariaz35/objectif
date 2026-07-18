---
title: "Quiz — HTTPS Let's Encrypt"
type: quiz
questions:
  - prompt: |
      Une équipe veut obtenir un certificat wildcard couvrant `*.example.com` pour
      héberger un nombre variable de sous-domaines créés dynamiquement. Quel challenge
      ACME doit-elle configurer ?
    options:
      - "httpChallenge, le plus simple à mettre en place"
      - "tlsChallenge, car il ne dépend pas du port 80"
      - "dnsChallenge, le seul capable de valider un certificat wildcard"
      - "N'importe lequel des trois fonctionne pour un wildcard"
    answer: 2
    tags: [https, lets-encrypt]
    level: intermediaire
    explanation: >
      httpChallenge et tlsChallenge valident un domaine précis via une requête
      HTTP/TLS directe sur ce domaine — impossible pour un wildcard qui doit couvrir
      des sous-domaines non prédéterminés. Seul dnsChallenge, via un enregistrement DNS
      TXT, peut prouver la propriété du domaine parent et donc couvrir tous ses
      sous-domaines.
  - prompt: |
      Un routeur porte les labels `entrypoints=websecure` et
      `tls.certresolver=le`, mais aucun certresolver nommé `le` n'a été défini dans la
      configuration statique du conteneur Traefik. Que se passe-t-il ?
    options:
      - "Traefik crée automatiquement un certresolver 'le' par défaut avec des valeurs par défaut."
      - "Le routeur sert du HTTPS avec un certificat auto-signé ou échoue à obtenir un certificat Let's Encrypt, car le nom référencé ne correspond à aucun resolver déclaré."
      - "Le label est ignoré silencieusement et le routeur bascule automatiquement en HTTP."
      - "Traefik refuse de démarrer avec une erreur fatale au lancement du conteneur applicatif."
    answer: 1
    tags: [https, labels]
    level: intermediaire
    explanation: >
      Un certresolver doit être défini dans la configuration statique du conteneur
      Traefik (command:) ; le référencer par un nom qui n'existe pas là-bas ne
      déclenche pas de création automatique (option 1 fausse). Le comportement typique
      est un certificat non valide (pas de Let's Encrypt effectif) plutôt qu'un crash
      du conteneur applicatif (option 4) ou un retour silencieux en HTTP (option 3).
  - prompt: |
      Le fichier acme.json a été créé avec des permissions 644 (lecture pour tous) au
      lieu de 600. Quel est le risque, et quelle commande corrige la situation ?
    options:
      - "Aucun risque : acme.json ne contient que des métadonnées publiques sur les domaines."
      - "Risque de fuite des clés privées des certificats stockées dans ce fichier ; chmod 600 ./letsencrypt/acme.json corrige les permissions."
      - "Le seul risque est un ralentissement du renouvellement automatique, sans impact sécurité."
      - "Il faut recréer entièrement le conteneur Traefik, chmod ne suffit jamais."
    answer: 1
    tags: [https, lets-encrypt]
    level: avance
    explanation: >
      acme.json contient les clés privées associées aux certificats obtenus : des
      permissions trop ouvertes (644) exposent ces clés à tout utilisateur du système
      hôte ayant accès au fichier. chmod 600 restreint l'accès au seul propriétaire, ce
      qui suffit à corriger le problème sans recréer le conteneur (option 4 fausse).
  - prompt: |
      Une stack complète doit forcer HTTPS sur l'ensemble de ses 6 services. Quelle
      approche évite de répéter un middleware redirectscheme sur chacun des 6 services ?
    options:
      - "Ajouter redirectscheme individuellement sur chaque service, il n'y a pas d'alternative."
      - "Configurer la redirection au niveau de l'EntryPoint 'web' lui-même (configuration statique), appliquée automatiquement à tout le trafic HTTP entrant, quel que soit le service."
      - "Utiliser un seul service 'catch-all' qui redirige tous les autres."
      - "Désactiver l'EntryPoint web : sans lui, aucune requête HTTP ne peut jamais arriver."
    answer: 1
    tags: [https, entrypoints]
    level: intermediaire
    explanation: >
      Configurer la redirection au niveau de l'EntryPoint (configuration statique du
      conteneur Traefik) l'applique une seule fois pour tout le trafic entrant sur ce
      port, sans avoir à dupliquer un middleware sur chacun des 6 services. Désactiver
      l'EntryPoint web (option 4) empêcherait justement toute redirection, puisqu'aucune
      requête HTTP n'atteindrait alors Traefik.
  - prompt: |
      Une équipe teste sa configuration Let's Encrypt en modifiant fréquemment ses
      labels et en relançant sa stack plusieurs fois par heure. Quelle pratique
      recommandée évite d'atteindre les limites de débit de Let's Encrypt en
      production ?
    options:
      - "Utiliser le serveur de staging (acme.caserver pointant vers l'URL de staging) le temps des essais, puis retirer cette option pour la mise en production."
      - "Espacer manuellement les redémarrages de 24h entre chaque test."
      - "Utiliser un certresolver différent à chaque test pour répartir la charge."
      - "Désactiver temporairement acme.storage pendant les tests."
    answer: 0
    tags: [https, lets-encrypt]
    level: avance
    explanation: >
      Le serveur de staging Let's Encrypt a des limites de débit beaucoup plus larges,
      conçues précisément pour ce cas d'usage : itérer sans consommer les quotas de
      production. Espacer les tests (option 1) ou changer de resolver (option 2) ne
      résout pas le problème et complique inutilement le travail ; désactiver
      acme.storage (option 3) casserait la persistance des certificats.
---

Vérifie tes réflexes sur HTTPS et Let's Encrypt avec Traefik.
