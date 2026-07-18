---
title: "Mise en œuvre et pièges"
type: lesson
---

# Mise en œuvre et pièges

Le certresolver est de la configuration statique (leçon précédente). Une fois défini,
son **utilisation par un service** redevient de la configuration **dynamique** : un
simple label sur le routeur concerné.

## Activer HTTPS sur un routeur : deux labels

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.my-app.rule=Host(`app.example.com`)"
  - "traefik.http.routers.my-app.entrypoints=websecure"     # listen on :443
  - "traefik.http.routers.my-app.tls.certresolver=le"       # request/renew via Let's Encrypt
```

`le` doit correspondre **exactement** au nom donné au certresolver dans la config
statique du conteneur Traefik (leçon précédente). Sans `tls.certresolver`, le routeur
sert bien du HTTPS s'il est sur l'entrypoint `websecure`, mais avec le certificat
**par défaut** de Traefik (auto-signé) — pas un certificat Let's Encrypt valide.

## Redirection globale HTTP → HTTPS

Plutôt que de répéter un middleware `redirectscheme` sur chaque service, la pratique la
plus propre est de rediriger **au niveau de l'EntryPoint lui-même**, une fois pour
toutes, en configuration statique :

```yaml
# docker-compose.yml — static config on the traefik service
command:
  - "--entrypoints.web.address=:80"
  - "--entrypoints.web.http.redirections.entrypoint.to=websecure"
  - "--entrypoints.web.http.redirections.entrypoint.scheme=https"
  - "--entrypoints.websecure.address=:443"
```

Tout ce qui arrive sur `:80` est redirigé vers `:443`, pour **tous** les services, sans
qu'aucun label de redirection ne soit nécessaire service par service. **Vérifié** (sur
une paire d'entrypoints équivalente en local) : une requête HTTP obtient bien un `301
Moved Permanently` avec `Location: https://...`, et le routeur HTTPS répond ensuite
normalement.

> **Repère —** deux approches coexistent : un middleware `redirectscheme` **par
> service** (flexible, si certains services doivent rester en HTTP) ou une redirection
> **globale au niveau de l'entrypoint** (plus simple, dès que tout doit être HTTPS). En
> pratique, la seconde est la norme pour une stack de production entièrement HTTPS.

## Le stockage `acme.json` — permissions 600

Traefik stocke les certificats obtenus (clé privée incluse) dans le fichier désigné par
`acme.storage` (souvent `acme.json`).

```yaml
volumes:
  - "./letsencrypt:/letsencrypt"
command:
  - "--certificatesresolvers.le.acme.storage=/letsencrypt/acme.json"
```

> **Piège classique —** ce fichier contient des **clés privées** : Traefik refuse de
> démarrer (ou log une erreur explicite) si ses permissions sont trop ouvertes. La
> bonne pratique est de forcer `600` (lecture/écriture pour le propriétaire
> uniquement) **avant** le premier démarrage :
>
> ```bash
> touch ./letsencrypt/acme.json
> chmod 600 ./letsencrypt/acme.json
> ```
>
> Un fichier créé automatiquement par Docker (bind mount sur un fichier inexistant) peut
> hériter de permissions trop larges selon l'environnement — vérifie-les explicitement,
> ne suppose jamais qu'elles sont correctes par défaut.

## Le staging Let's Encrypt — pour tester sans épuiser les quotas

Let's Encrypt applique des **limites de débit strictes en production** (nombre de
certificats par domaine et par semaine). Pendant que tu mets au point ta configuration
(et que tu répètes des essais/erreurs), utilise le **serveur de staging**, qui délivre
des certificats non reconnus par les navigateurs mais **sans limite pratique** :

```yaml
command:
  - "--certificatesresolvers.le.acme.caserver=https://acme-staging-v02.api.letsencrypt.org/directory"
```

> **Piège classique —** oublier de retirer cette ligne avant la mise en production
> laisse ton site avec un certificat **non reconnu par les navigateurs** (alerte de
> sécurité affichée à tous les visiteurs), alors que tout semblait fonctionner en
> local. Une fois la configuration validée en staging, **retire** `caserver` (ou
> pointe-le vers l'URL de production) pour la mise en ligne réelle.

## À retenir

- Activer HTTPS sur un routeur = 2 labels : `entrypoints=websecure` +
  `tls.certresolver=<nom-du-resolver>`.
- Redirection HTTP→HTTPS **globale** : configuration statique sur l'entrypoint `web`,
  plutôt qu'un middleware répété service par service.
- `acme.json` contient des clés privées : permissions **600** obligatoires.
- Utilise le **staging** Let's Encrypt pendant la mise au point ; retire-le avant la
  vraie mise en production (sinon certificat non reconnu par les navigateurs).
