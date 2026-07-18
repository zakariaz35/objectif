---
title: "Routing manuel : découper une seule fonction en routes"
type: lesson
---

## Un seul point d'entrée, à toi de le découper

`http.createServer((req, res) => { ... })` reçoit **toutes** les requêtes,
quelle que soit l'URL ou la méthode HTTP — pas de routing par annotations ou
YAML comme en Symfony. Il faut router **manuellement**, en inspectant
`req.method` et `req.url`.

```js
import http from "node:http"
import { URL } from "node:url"

const server = http.createServer((req, res) => {
  const { pathname, searchParams } = new URL(req.url, `http://${req.headers.host}`)

  if (req.method === "GET" && pathname === "/health") {
    res.writeHead(200)
    res.end("OK")
    return
  }

  if (req.method === "GET" && pathname === "/users") {
    const active = searchParams.get("active") // query string, parsed properly
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ active }))
    return
  }

  // No route matched
  res.writeHead(404)
  res.end("Not Found")
})
```

> **Passerelle PHP/Symfony.** Ce `if`/`else` en cascade remplace ce que
> `#[Route('/users', methods: ['GET'])]` fait déclarativement en Symfony
> (matching automatique, extraction de paramètres). En HTTP natif Node, **le
> routing est un problème que tu résous toi-même**, à coup de comparaisons de
> chaînes — d'où l'intérêt rapide d'un framework de routing (Express, Fastify,
> NestJS) dès que le nombre de routes grandit.

## Le `URL` natif : parser correctement chemin et query string

`node:url` fournit une classe `URL` standard (la même API que dans le
navigateur) pour éviter de parser `req.url` à la main avec des regex fragiles.

```js
const url = new URL("/users/42?active=true&sort=name", "http://localhost")

url.pathname       // "/users/42"
url.searchParams.get("active") // "true"
url.searchParams.get("sort")   // "name"
url.searchParams.get("missing") // null
```

> ⚠️ **Erreur fréquente — oublier la base URL.** `req.url` ne contient
> **jamais** le protocole ni le nom d'hôte (juste `/users/42?active=true`) :
> le constructeur `new URL(...)` exige un second argument (« base »), sinon
> il lève une erreur pour un chemin relatif. `` `http://${req.headers.host}` ``
> est la base habituelle en HTTP natif Node.

## Extraire des paramètres dans le chemin (`/users/:id`)

Sans framework, il n'y a pas de syntaxe `:id` toute prête : il faut découper
le `pathname` soi-même et comparer les segments.

```js
function matchUserRoute(pathname) {
  const segments = pathname.split("/").filter(Boolean) // "/users/42" -> ["users", "42"]
  if (segments[0] === "users" && segments.length === 2) {
    return { id: segments[1] }
  }
  return null
}

const params = matchUserRoute("/users/42")
if (params) {
  console.log("User ID:", params.id) // "42"
}
```

> 💡 **À retenir.** C'est exactement ce genre de logique répétitive
> (découper les segments, comparer, extraire) qu'un framework de routing
> automatise avec une syntaxe déclarative (`/users/:id`) — comprendre le
> mécanisme manuel aide à savoir ce qui se cache **derrière** cette syntaxe,
> plutôt que de la traiter comme une boîte noire.

## À retenir

- `http.createServer` reçoit **toutes** les requêtes dans une seule fonction :
  le routing (comparer méthode + chemin) est **manuel**, sans déclaration
  YAML/annotations.
- `new URL(req.url, base)` (module `node:url`) parse proprement chemin et
  query string — à préférer à toute regex maison sur `req.url`.
- Extraire des paramètres de chemin (`/users/:id`) demande de découper les
  segments soi-même : un des premiers besoins qui justifie un framework de
  routing.
