---
title: "http.createServer : un serveur HTTP à la main"
type: lesson
---

## Pas de serveur web séparé : Node EST le serveur

En PHP, Apache/nginx + PHP-FPM forment le serveur web : PHP ne fait
qu'exécuter un script **à l'intérieur** d'un serveur déjà en place. En Node,
le module natif `node:http` **est** le serveur web — il n'y a rien d'autre à
installer ou configurer pour accepter des connexions TCP et parler HTTP.

```js
import http from "node:http"

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" })
  res.end("Hello from Node!")
})

server.listen(3000, () => {
  console.log("Server listening on http://localhost:3000")
})
```

> **Passerelle PHP/Symfony.** Il n'existe pas d'équivalent direct en PHP
> classique (Apache/nginx font ce travail, invisible du code applicatif).
> Le plus proche : le serveur de développement Symfony (`symfony server:start`,
> basé sur PHP intégré) — sauf qu'en Node, **c'est ce même mécanisme qui tourne
> aussi en production**, il n'y a pas de bascule vers un serveur web différent
> entre dev et prod (même si, en pratique, on place souvent un reverse-proxy
> comme nginx *devant* Node, pour le TLS, la compression, ou servir des
> fichiers statiques efficacement).

## L'objet `req` (requête entrante)

`req` est un `Readable` **stream** (module 4) qui hérite d'`EventEmitter` :

```js
import http from "node:http"

const server = http.createServer((req, res) => {
  console.log(req.method)  // "GET", "POST", "PUT", "DELETE"...
  console.log(req.url)     // "/users/42?active=true" — raw path AND query string, not split yet
  console.log(req.headers) // { host: "localhost:3000", "user-agent": "...", ... }

  res.end("OK")
})
```

> ⚠️ **Erreur fréquente — croire que `req.url` est déjà découpé en
> chemin/query/params.** Contrairement à une `Request` Symfony déjà riche
> (`$request->query->get(...)`, `$request->attributes->get(...)`), `req.url`
> est une **chaîne brute** (`/users/42?active=true`). C'est à toi de la
> parser — avec `node:url` (prochaine leçon) ou un framework qui s'en charge.

## L'objet `res` (réponse à construire)

`res` est un `Writable` **stream** : on y écrit la réponse, morceau par
morceau si besoin, puis on la termine explicitement.

```js
const server = http.createServer((req, res) => {
  res.statusCode = 200                              // or res.writeHead(200, {...})
  res.setHeader("Content-Type", "application/json")
  res.write(JSON.stringify({ status: "processing" })) // can write in several chunks
  res.end()                                          // MUST be called to close the response
})
```

> ⚠️ **Erreur fréquente — oublier `res.end()`.** Sans lui, la réponse ne se
> termine **jamais** : le client reste en attente indéfiniment (timeout côté
> navigateur), et la connexion TCP sous-jacente n'est jamais libérée —
> ressource qui finit par manquer sous charge. Chaque chemin de code (succès,
> erreur, cas limite) doit obligatoirement se terminer par un `res.end(...)`.

## Lire le corps d'une requête (POST/PUT)

Comme `req` est un stream, lire un corps de requête (par exemple un JSON
envoyé en `POST`) demande d'accumuler ses chunks avant de pouvoir le parser —
il n'y a **pas de `$request->getContent()` tout prêt** en HTTP natif.

```js
import http from "node:http"

const server = http.createServer((req, res) => {
  if (req.method === "POST") {
    const chunks = []
    req.on("data", (chunk) => chunks.push(chunk))
    req.on("end", () => {
      const body = Buffer.concat(chunks).toString("utf8")
      const data = JSON.parse(body)
      res.writeHead(201, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ received: data }))
    })
  } else {
    res.writeHead(405)
    res.end("Method Not Allowed")
  }
})
```

> **Passerelle PHP/Symfony.** `$request->getContent()`/`$request->request->all()`
> font ce travail pour toi, en coulisses, une fois pour toutes. En HTTP natif
> Node, c'est un exemple concret de **pourquoi** on passe rapidement à un
> framework (Express, NestJS...) dès qu'un projet grandit : ce genre de code
> répétitif (parser un body, gérer les erreurs de parsing JSON...) devient vite
> pénible à réécrire pour chaque route.

## À retenir

- `node:http` est **le** serveur : pas de couche Apache/nginx séparée
  indispensable pour exécuter du code Node (même si un reverse-proxy est
  courant devant, en production).
- `req` (Readable) et `res` (Writable) sont des **streams** : `req.url` est
  une chaîne brute à parser, `res.end()` est **obligatoire** pour terminer
  chaque réponse.
- Lire un corps de requête demande d'accumuler manuellement les chunks de
  `req` — un des points qui motivent l'usage d'un framework au-dessus de
  l'API HTTP native.
