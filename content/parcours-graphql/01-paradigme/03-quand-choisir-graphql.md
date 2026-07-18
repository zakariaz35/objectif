---
title: "Quand (ne pas) choisir GraphQL"
type: lesson
---

## GraphQL n'est pas un remplacement universel de REST

Après deux leçons qui vantent les mérites de GraphQL, il est temps de
nuancer : GraphQL **résout des problèmes précis**, et en introduit d'autres.
Ce n'est pas « toujours meilleur que REST », c'est un **outil de plus**, à
choisir selon le contexte.

### Là où GraphQL brille

- **Plusieurs clients, plusieurs besoins** : une appli web, une appli mobile
  et un back-office qui consomment la même donnée mais n'affichent pas les
  mêmes champs. Un seul schéma, chaque client demande sa forme.
- **Relations imbriquées et profondes** : produit → avis → auteur → autres
  avis de cet auteur... En REST, chaque niveau est souvent un aller-retour
  HTTP en plus ; en GraphQL, une seule requête imbriquée.
- **Itération rapide côté frontend** : ajouter un champ à un écran ne
  nécessite pas de créer une nouvelle route côté serveur — juste l'ajouter au
  schéma (s'il n'existe pas déjà) et à la requête.
- **Agréger plusieurs sources** (BFF - *Backend For Frontend*) : un schéma
  GraphQL peut combiner des données venant de plusieurs services/API en une
  seule requête pour le client, qui n'a pas à le savoir.

### Là où REST reste pertinent (ou où GraphQL coûte plus qu'il ne rapporte)

- **API simples, CRUD basique** : si chaque écran correspond presque
  exactement à une ressource, l'over/under-fetching n'est pas un vrai
  problème — le coût d'un schéma GraphQL (écrire les types, les resolvers,
  gérer le N+1...) ne se justifie pas forcément.
- **Cache HTTP standard** : REST profite nativement du cache HTTP (`ETag`,
  `Cache-Control`, CDN devant une `GET /products/42`). GraphQL passe presque
  toujours par `POST` : le cache HTTP classique ne s'applique pas de la même
  façon (Apollo Client compense avec son **cache applicatif** — module 4 —
  mais ce n'est pas la même chose qu'un cache CDN).
- **Fichiers/uploads binaires** : GraphQL décrit des données structurées ; un
  upload de fichier reste, en général, plus simple en REST (ou en complément,
  via une route dédiée à côté du schéma GraphQL).
- **Surface de sécurité plus large** : un client peut construire des requêtes
  arbitrairement profondes ou coûteuses — un risque que REST, avec ses routes
  figées, ne pose pas de la même façon (module 5 y consacre une leçon
  entière).

> ⚠️ **Erreur fréquente — croire que GraphQL est « plus simple » que REST.**
> Le langage de requête est plus expressif, mais le **serveur** est souvent
> plus complexe à bien faire : gérer le N+1 (module 3), la profondeur et le
> coût des requêtes, la mise en cache côté client (module 4)... GraphQL
> déplace de la complexité, il ne la supprime pas.

> **API Platform → GraphQL.** Un indice révélateur : API Platform propose du
> **REST et du GraphQL sur les mêmes entités Doctrine**, au choix (ou les
> deux en même temps). Ce n'est pas un hasard — c'est bien la preuve que
> GraphQL est un **outil supplémentaire** pour certains besoins (clients
> multiples, requêtes imbriquées), pas un remplacement systématique de REST.

## À retenir

- GraphQL excelle quand plusieurs clients ont des besoins différents, ou
  quand les données sont profondément imbriquées.
- REST reste très pertinent pour des API simples, et profite nativement du
  cache HTTP — un atout que GraphQL n'a pas de la même façon.
- Choisir GraphQL, c'est accepter de gérer sa complexité propre : N+1,
  profondeur/coût des requêtes, cache côté client. Les modules 3, 4 et 5
  donnent les outils pour ça.
