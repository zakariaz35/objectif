---
title: "Écosystème et prod : Acquia, alternatives, et les pièges"
type: lesson
---

# Écosystème et prod : Acquia, alternatives, et les pièges

Une offre « Drupal headless » mentionne presque toujours **Acquia**. Voici ce que ça
recouvre réellement, sans en faire une religion : c'est avant tout de l'**ops**, qui
s'apprend sur le tas, projet après projet.

## Qu'est-ce qu'Acquia ?

**Acquia** est la plateforme cloud/entreprise historique de l'écosystème Drupal (fondée
par Dries Buytaert, le créateur de Drupal). Dans une offre, « Acquia » désigne
généralement un ou plusieurs de ces éléments :

- **Acquia Cloud Platform** : hébergement managé pour Drupal — environnements
  dev/stage/prod par branche Git, déploiement via `git push`, CDN et cache Varnish
  intégrés.
- **Acquia CLI (`acli`)** : outil en ligne de commande pour piloter les environnements,
  récupérer les logs, lancer des tâches Drush à distance.
- **Site Factory** : gestion de **dizaines/centaines de sites Drupal** à partir d'une
  seule codebase (multi-site à grande échelle — utile pour un réseau de sites de
  marque/franchise).
- **Acquia Cloud IDE** : environnement de dev dans le navigateur, pré-configuré pour un
  projet Acquia.
- **Acquia Search** : Solr managé, prêt à l'emploi.

> 💡 **À retenir.** Une mention « Acquia » dans une offre signifie presque toujours :
> *« tu vas travailler avec cette plateforme d'hébergement et son outillage de
> déploiement »* — pas *« le code Drupal sera différent »*. Le code (Entity API,
> JSON:API, GraphQL) reste strictement le même quel que soit l'hébergeur.

## Alternatives

| Plateforme | Positionnement |
|---|---|
| **Acquia** | Historique, entreprise, Site Factory pour le multi-site à grande échelle |
| **Platform.sh** | Hébergement conteneurisé générique (pas Drupal-only), forte intégration CI/CD par branche |
| **Pantheon** | Concurrent direct d'Acquia, workflow Git similaire, orienté agences |
| **Auto-hébergé (Docker/Kubernetes)** | Contrôle total, mais toute l'infra (cache, CDN, scaling) est à la charge de l'équipe |

> **Réflexe à prendre.** Ne mémorise pas les menus de la console Acquia par cœur avant un
> entretien — retiens le **principe** (déploiement Git-based, environnements par branche,
> cache/CDN managé) : c'est transférable à Pantheon ou Platform.sh. Les détails
> d'interface s'apprennent en une journée sur le projet réel.

## Les pièges du découplé en production

Le découplé introduit des problèmes qui n'existaient pas en Drupal monolithique — parce
que **deux systèmes** ont désormais chacun leur cache, leur cycle de vie, leur
déploiement.

### Piège 1 : cache et CDN désynchronisés

Un article publié dans Drupal ne rafraîchit pas automatiquement les pages déjà mises en
cache côté front (SSG/ISR). Sans mécanisme d'invalidation, l'utilisateur voit du contenu
périmé jusqu'à l'expiration de la fenêtre `revalidate`.

**Solution** : un hook Drupal (`hook_entity_update` / `hook_node_insert` dans un petit
module custom) qui appelle, à la publication, une route de revalidation exposée par le
front :

```bash
# Called by a custom Drupal module on node publish (via hook_entity_update)
curl -X POST "https://my-frontend.example.com/api/revalidate?tag=article-42&secret=$REVALIDATE_SECRET"
```

```ts
// app/api/revalidate/route.ts — Next.js Route Handler triggered by Drupal on publish
import { revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret")
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 })
  }

  const tag = request.nextUrl.searchParams.get("tag")
  if (tag) revalidateTag(tag)

  return NextResponse.json({ revalidated: true })
}
```

### Piège 2 : preview des brouillons

L'éditeur veut voir un brouillon avant publication — mais le front est optimisé pour
servir du contenu **publié et caché**. Il faut un chemin dédié : un token de preview, une
requête JSON:API/GraphQL qui inclut explicitement le contenu non publié, et le
« draft mode » de Next.js qui désactive temporairement son propre cache pour cette
session.

### Piège 3 : SEO et rendu

Drupal génère nativement les balises meta (module Metatag), le sitemap (Simple Sitemap),
les données structurées — tout ça disparaît en fully decoupled : le front doit
**reconstruire** cette couche (balises `<meta>` via les APIs SEO de Next.js, sitemap
généré côté front). Un front rendu uniquement côté client (sans SSR/SSG) est un risque
SEO réel pour du contenu public.

### Piège 4 : double maintenance

Deux codebases, deux pipelines de CI/CD, deux jeux de dépendances à faire monter de
version (module 7 de ce cours côté Drupal, npm côté front), potentiellement deux équipes
d'astreinte. Un changement de modèle de contenu côté Drupal (renommer un champ, changer
un type) **casse silencieusement** le front s'il n'y a pas de contrat de schéma stable
(JSON:API est plutôt stable sur cet aspect ; un schéma GraphQL doit évoluer en ajoutant,
jamais en retirant brutalement un champ).

> ⚠️ **Erreur fréquente — sous-estimer le coût d'astreinte du découplé.** Un projet
> monolithique a un seul point de défaillance à surveiller. Un projet découplé en a (au
> moins) deux : si Drupal répond lentement, l'ISR du front expire et régénère lentement ;
> si le front est down, même un Drupal parfaitement sain ne sert plus rien à
> l'utilisateur final. Prévoir un monitoring sur les **deux** systèmes, pas seulement le
> backend.

## À retenir

- **Acquia** (et ses équivalents Pantheon, Platform.sh) est une couche d'**hébergement et
  d'outillage** — pas une variante du code Drupal. Ça s'apprend surtout sur le projet
  réel ; retenir le principe (déploiement Git, environnements, cache managé) suffit en
  amont.
- Les pièges du découplé en prod sont réels et prévisibles : **cache/CDN désynchronisé**
  (résolu par des webhooks de revalidation), **preview des brouillons** (token dédié +
  contournement de cache), **SEO à reconstruire** côté front, et **double maintenance**
  (deux codebases, deux cycles de version).
- Aucun de ces pièges n'est bloquant — mais tous doivent être **anticipés dès le choix
  d'architecture** (leçon 1), pas découverts en production.
