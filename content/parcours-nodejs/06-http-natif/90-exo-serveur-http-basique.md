---
title: "Exercice — un mini serveur HTTP avec routing et middleware"
type: exercise
---

> ⏱️ **Durée conseillée : ~25 min.** Cet exercice utilise un vrai
> `http.createServer` : il se fait en **lecture** (le bac à sable du
> navigateur ne peut pas ouvrir de vrai serveur TCP).

## Énoncé

Écris un serveur HTTP natif (`server.mjs`) qui expose deux routes :

1. `GET /health` : répond `200` avec le texte `OK` — accessible **sans**
   authentification.
2. `GET /profile` : répond `200` avec `{ "user": "ada" }` en JSON, mais
   **uniquement** si l'en-tête `Authorization` est présent. Sinon, `401`.
3. Toute autre route : `404`.

Implémente-le avec le **patron middleware** vu dans la leçon (une chaîne de
fonctions `(req, res, next)`), pas avec un simple `if`/`else` répété : tu dois
avoir un middleware de **logging** (affiche méthode + chemin de chaque
requête) appliqué à **toutes** les routes, et un middleware d'**authentification**
appliqué uniquement à `/profile`.

Réflexes utiles :

- Réutilise `applyMiddlewares(...)` de la leçon tel quel.
- `new URL(req.url, \`http://${req.headers.host}\`).pathname` pour extraire
  proprement le chemin.
- N'oublie **jamais** `res.end(...)` sur chaque chemin de code (rappel du
  danger d'une réponse qui ne se termine jamais).

<!--correction-->

## Correction

```js
// server.mjs
import http from "node:http"
import { URL } from "node:url"

function applyMiddlewares(middlewares, req, res, finalHandler) {
  let index = 0
  function next() {
    if (index >= middlewares.length) {
      finalHandler(req, res)
      return
    }
    const middleware = middlewares[index]
    index++
    middleware(req, res, next)
  }
  next()
}

function loggingMiddleware(req, res, next) {
  console.log(`${req.method} ${req.url}`)
  next()
}

function authMiddleware(req, res, next) {
  if (!req.headers.authorization) {
    res.writeHead(401, { "Content-Type": "text/plain" })
    res.end("Unauthorized")
    return
  }
  next()
}

const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`)

  if (req.method === "GET" && pathname === "/health") {
    applyMiddlewares([loggingMiddleware], req, res, (req, res) => {
      res.writeHead(200, { "Content-Type": "text/plain" })
      res.end("OK")
    })
    return
  }

  if (req.method === "GET" && pathname === "/profile") {
    applyMiddlewares([loggingMiddleware, authMiddleware], req, res, (req, res) => {
      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ user: "ada" }))
    })
    return
  }

  applyMiddlewares([loggingMiddleware], req, res, (req, res) => {
    res.writeHead(404, { "Content-Type": "text/plain" })
    res.end("Not Found")
  })
})

server.listen(3000, () => console.log("Listening on http://localhost:3000"))
```

```bash
# Try it out
curl http://localhost:3000/health
# -> OK

curl http://localhost:3000/profile
# -> 401 Unauthorized

curl -H "Authorization: Bearer token123" http://localhost:3000/profile
# -> {"user":"ada"}
```

- Chaque route construit sa **propre** liste de middlewares
  (`[loggingMiddleware]` pour `/health`, `[loggingMiddleware, authMiddleware]`
  pour `/profile`) : le logging s'applique **partout**, l'authentification
  **seulement** là où c'est nécessaire — exactement comme des
  `EventSubscriber` Symfony qui peuvent cibler certaines routes via des
  attributs, ou s'appliquer globalement.
- `authMiddleware` **court-circuite** la chaîne (`return` sans appeler
  `next()`) dès que l'en-tête manque : le handler final de `/profile` n'est
  **jamais** appelé dans ce cas, exactement le comportement attendu d'un
  garde d'accès.
- Le routing reste manuel (comparaisons `req.method`/`pathname`) : c'est
  précisément ce que remplacerait un framework comme Express
  (`app.get("/profile", authMiddleware, handler)`), une fois les bases
  comprises.
