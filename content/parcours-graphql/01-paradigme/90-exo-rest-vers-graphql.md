---
title: "Exercice — d'une page REST à une requête GraphQL"
type: exercise
---

> ⏱️ **Durée conseillée : ~10 min.**

## Énoncé

Une page « fiche article de blog » appelle aujourd'hui **trois** endpoints
REST :

```bash
GET /api/posts/7
# { "id": 7, "title": "...", "body": "...", "authorId": 3, "createdAt": "...", "updatedAt": "..." }

GET /api/users/3
# { "id": 3, "name": "...", "email": "...", "bio": "...", "createdAt": "..." }

GET /api/posts/7/comments
# [ { "id": 1, "body": "...", "authorName": "...", "createdAt": "..." }, ... ]
```

La page n'affiche, en réalité, que :

- le **titre** et le **corps** de l'article,
- le **nom** de l'auteur (pas son email, ni sa bio),
- pour chaque commentaire : son **corps** et le **nom** de son auteur (pas
  les dates de création).

En te basant sur le schéma GraphQL suivant (déjà disponible sur le serveur) :

```graphql
type Post {
  id: ID!
  title: String!
  body: String!
  author: User!
  comments: [Comment!]!
}

type User {
  id: ID!
  name: String!
  email: String!
  bio: String
}

type Comment {
  id: ID!
  body: String!
  author: User!
}

type Query {
  post(id: ID!): Post
}
```

1. Écris la **requête GraphQL unique** qui remplace les trois appels REST,
   en ne demandant **que** les champs réellement affichés.
2. Combien d'allers-retours réseau cette requête économise-t-elle par rapport
   à la version REST ?

<!--correction-->

## Correction

```graphql
query PostPage($id: ID!) {
  post(id: $id) {
    title
    body
    author {
      name
    }
    comments {
      body
      author {
        name
      }
    }
  }
}
```

```json
{ "id": "7" }
```

- **Une seule requête**, contre **trois appels REST** (`/posts/7`,
  `/users/3`, `/posts/7/comments`) — l'exercice économise **deux**
  allers-retours réseau.
- Aucun champ inutile ne transite : ni `email`/`bio` de l'auteur, ni les
  dates de création/mise à jour des commentaires ou de l'article — alors que
  les trois réponses REST les incluaient toutes (over-fetching).
- Remarque que la requête demande `author { name }` **deux fois** — une fois
  pour l'article, une fois par commentaire. Rien n'empêche ça : chaque
  occurrence est résolue indépendamment. (Tu verras au module 3 que c'est
  précisément ce genre de champ répété, appelé une fois par élément d'une
  liste, qui est à l'origine du problème **N+1**.)
