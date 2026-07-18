---
title: "Quiz — Headless / Decoupled Drupal"
type: quiz
questions:
  - prompt: |
      Quelle affirmation décrit correctement la différence entre "fully decoupled" et
      "progressively decoupled" ?
    options:
      - "Fully decoupled : Drupal ne rend aucun HTML, tout le front est une app séparée qui consomme des API ; progressively decoupled : Drupal rend toujours les pages, seuls des composants JS s'hydratent par-dessus"
      - "Fully decoupled : on utilise React ; progressively decoupled : on utilise Vue"
      - "Il n'y a pas de différence, ce sont deux noms pour la même architecture"
      - "Fully decoupled : Drupal reste responsable du HTML mais plus du CSS ; progressively decoupled : l'inverse"
    answer: 0
    tags: [headless, decoupled, architecture]
    level: debutant
    explanation: >
      "Fully decoupled" retire complètement Drupal du rendu HTML : c'est un front séparé
      (React, Next.js, app mobile) qui consomme JSON:API/GraphQL et affiche tout.
      "Progressively decoupled" garde Drupal comme moteur de rendu (Twig) et n'ajoute que
      des îlots JS ciblés (une recherche instantanée, un panier...) par-dessus des pages
      qui restent, pour l'essentiel, du Drupal classique.

  - prompt: |
      En JSON:API, quel paramètre d'URL permet de récupérer une entité liée (ex. l'image
      d'un article) dans la même requête, sans appel réseau supplémentaire ?
    options:
      - "?include=field_image,uid"
      - "?expand=field_image,uid"
      - "?with=field_image,uid"
      - "?relations=field_image,uid"
    answer: 0
    tags: [json-api, filters, include]
    level: debutant
    explanation: >
      `include` est le paramètre standard de la spécification JSON:API pour rapatrier des
      ressources liées (relationships) en une seule requête ; la réponse les place dans la
      clé `included` de l'enveloppe JSON, à côté de `data`.

  - prompt: |
      Sur une route comme `GET /jsonapi/node/article/{id}`, quel identifiant Drupal
      utilise-t-il pour `{id}` ?
    options:
      - "L'identifiant interne numérique (nid)"
      - "L'UUID de l'entité"
      - "Le slug de l'URL alias (ex. mon-article)"
      - "Le nom de la machine (machine name) du type de contenu"
    answer: 1
    tags: [json-api, uuid, rest]
    level: intermediaire
    explanation: >
      JSON:API expose toujours l'UUID de l'entité, jamais le `nid` interne utilisé par les
      routes classiques Drupal (`/node/42`). Ça découple l'identifiant public de l'ID
      auto-incrémenté en base de données, ce qui reste stable même en cas de migration
      entre environnements.

  - prompt: |
      Dans quel scénario GraphQL apporte un avantage réel face à JSON:API pour un front
      Drupal découplé ?
    options:
      - "Quand le front doit combiner en une seule requête plusieurs types de contenu indépendants (articles, bannière, menu) pour une page d'accueil"
      - "Quand on veut zéro configuration supplémentaire et rester au plus près du core Drupal"
      - "Quand une app mobile n'affiche qu'une liste simple d'articles sans relation à agréger"
      - "Quand on veut éviter d'installer tout module contrib supplémentaire"
    answer: 0
    tags: [graphql, json-api, tradeoffs]
    level: intermediaire
    explanation: >
      GraphQL brille quand un front doit agréger, en un seul aller-retour, plusieurs
      sources de contenu qui n'ont pas de relation entre elles dans le modèle de données
      (JSON:API ne peut `include` que des relations existantes). Pour un accès quasi 1:1
      à une seule ressource (liste/détail), JSON:API — déjà dans le core — suffit et évite
      d'installer/maintenir un schéma GraphQL sans bénéfice réel.

  - prompt: |
      Dans une offre d'emploi Drupal, la mention "Acquia" désigne le plus souvent...
    options:
      - "Une plateforme cloud d'hébergement et d'outillage managé pour Drupal (déploiement Git, environnements, Site Factory...)"
      - "Un framework front alternatif à React, spécifique à Drupal"
      - "Un remplaçant du module JSON:API pour exposer les entités"
      - "Une nouvelle version majeure de Drupal (« Drupal Acquia »)"
    answer: 0
    tags: [acquia, hosting, ecosystem]
    level: debutant
    explanation: >
      Acquia est une plateforme cloud/entreprise d'hébergement et d'outillage pour Drupal
      (environnements par branche Git, Site Factory pour le multi-site, Cloud IDE...) —
      pas une variante du code Drupal. Le code (Entity API, JSON:API, GraphQL) reste
      identique quel que soit l'hébergeur.

  - prompt: |
      Un site Next.js découplé continue d'afficher un article périmé plusieurs heures
      après sa publication dans Drupal, alors qu'ISR est configuré avec `revalidate: 3600`.
      Quelle est la cause la plus probable ?
    options:
      - "Le CDN devant Next.js met en cache indéfiniment sans jamais consulter le serveur"
      - "Aucun mécanisme n'invalide le cache à la demande (webhook Drupal → route de revalidation absente) : le contenu reste donc figé jusqu'à l'expiration naturelle de la fenêtre `revalidate`"
      - "GraphQL ne supporte aucune forme de cache, le problème vient forcément de là"
      - "JSON:API bloque par défaut la publication d'un contenu pendant 24h"
    answer: 1
    tags: [cache, isr, production-pitfalls]
    level: avance
    explanation: >
      `revalidate: 3600` régénère la page au plus une fois par heure — c'est un
      comportement attendu, pas un bug, tant qu'aucune invalidation à la demande n'est
      mise en place. Pour refléter une publication immédiatement, il faut un webhook
      Drupal (déclenché à la publication) qui appelle une route de revalidation Next.js
      (`revalidateTag`/`revalidatePath`), plutôt que d'attendre la fenêtre ISR.
---
