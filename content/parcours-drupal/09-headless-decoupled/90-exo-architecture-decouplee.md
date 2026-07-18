---
title: "Exercice — Concevoir l'architecture découplée de TechCorp"
type: exercise
---

## Énoncé

L'agence te confie la refonte du site **TechCorp** — le même site que le projet fil
rouge du module 8, aujourd'hui en Drupal 10 classique (Twig). Le client formule cette
demande :

1. Le **site public** (page d'accueil qui agrège les derniers articles, une bannière
   promotionnelle et le menu principal) doit être **très bien référencé** (SEO critique
   pour l'activité du client) et rapide.
2. Une **application mobile** (React Native) doit afficher la liste des articles et le
   détail d'un article — rien de plus.
3. L'équipe éditoriale doit pouvoir **prévisualiser un article en brouillon** avant de le
   publier, depuis le nouveau front.
4. Drupal doit rester **l'unique source de vérité** du contenu (pas de duplication de
   données dans un autre système).

### Travail demandé

Rédige une courte note d'architecture (10-15 lignes suffisent) qui répond à ces
questions :

1. Cette refonte doit-elle être **fully** ou **progressively decoupled** ? Justifie en
   une phrase.
2. Pour la **page d'accueil** du site public : **JSON:API ou GraphQL** ? Pourquoi ?
3. Pour l'**app mobile** (liste + détail d'article) : **JSON:API ou GraphQL** ? Pourquoi ?
4. Quelle **stratégie de rendu Next.js** (SSR, SSG ou ISR) pour les pages publiques, et
   pourquoi ?
5. Comment gérer la **preview des brouillons** sans casser le cache des pages publiées ?
6. Où vit le **cache/CDN**, et qui **l'invalide** quand un article est publié ?

<!--correction-->

## Correction

### 1. Fully ou progressively decoupled ?

**Fully decoupled.** Le SEO et la performance sont explicitement prioritaires
(exigence 1), et rien dans la demande ne nécessite l'édition en place ou le Layout
Builder de Drupal — un site vitrine + blog n'a pas besoin de composition de page
complexe côté éditeur. Garder Drupal en fully decoupled (pas de thème Twig à maintenir)
simplifie le projet : une seule responsabilité de rendu, côté front.

### 2. Page d'accueil : GraphQL

La page d'accueil combine **trois types de contenu indépendants** — articles, bannière
promotionnelle, menu — qui n'ont **pas de relation entre eux** dans le modèle de données.
En JSON:API, `include` ne fonctionne que sur des relations existantes : il faudrait donc
**trois appels séparés** (un par type), avec trois allers-retours réseau. En GraphQL, une
seule requête imbriquée (`HomePage { nodeArticles { ... } blockContentPromoBanner { ...
} menu { ... } }`) résout tout en un aller-retour — exactement le cas d'usage GraphQL vu
en leçon 3.

### 3. App mobile : JSON:API

L'app mobile n'a besoin que d'un **accès quasi 1:1** à une ressource : lister des
articles, afficher le détail d'un article. Aucun besoin d'agréger plusieurs types
indépendants ni de schéma sur mesure. JSON:API est **déjà dans le core** (zéro dépendance
contrib supplémentaire), avec pagination (`page[limit]`) et sparse fieldsets
(`fields[node--article]=title,body,field_image`) suffisants pour ce besoin. Installer
GraphQL en plus ajouterait un schéma et des resolvers à maintenir pour un gain nul ici —
de l'over-engineering pour ce cas précis.

### 4. Rendu Next.js : SSG + ISR

**SSG avec revalidation (ISR)**, pas de SSR pur. Le SEO exige du HTML déjà pré-rendu au
moment où les robots crawlent (SSG répond à ça) ; ISR (`next: { revalidate: N }` ou
`revalidateTag`) permet de rafraîchir le contenu sans reconstruire l'intégralité du site
à chaque publication d'article. Un SSR complet (aucune option de cache) serait excessif
ici : rien dans la demande n'exige un contenu personnalisé par visiteur.

### 5. Preview des brouillons

Le mode « draft » de Next.js (cookie de preview signé) déclenche une requête
JSON:API/GraphQL authentifiée par un **token limité à un rôle « previewer »**, qui inclut
les nœuds en état `draft` (non publiés). Ce mode désactive temporairement le cache ISR
**pour la session de preview uniquement** — dès que la preview se termine (ou que
l'article est publié), le front repasse sur le contenu caché normal. Le brouillon ne doit
**jamais** être visible via l'endpoint public non authentifié.

### 6. Cache/CDN et invalidation

Le cache principal vit **devant le front** (CDN Next.js — Vercel Edge ou équivalent) sur
les pages SSG/ISR : c'est lui que voient les visiteurs. Drupal garde son propre cache
interne (dynamic page cache) devant l'API, mais celui-ci n'est consommé que par le front
au moment du build/de la revalidation — pas directement par l'utilisateur final.

**Invalidation** : un petit module custom Drupal (`hook_entity_update`/`hook_node_insert`
sur le type `article`) déclenche, à la publication, un appel HTTP vers une route de
revalidation exposée par le front (`POST /api/revalidate?tag=article-<nid>`, protégée par
un secret partagé) qui appelle `revalidateTag`. Sans ce webhook, le contenu resterait
figé jusqu'à l'expiration de la fenêtre `revalidate` — un délai potentiellement
inacceptable pour une actualité.
