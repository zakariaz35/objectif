---
title: "Quiz — HTTP natif"
type: quiz
questions:
  - prompt: |
      En Node, quel module joue le rôle qu'Apache/nginx + PHP-FPM jouent en
      PHP classique ?
    options:
      - "`node:http` : c'est le serveur web lui-même, intégré au runtime."
      - "`node:net`, mais uniquement pour les WebSockets."
      - "Il n'existe aucun équivalent, Node nécessite obligatoirement nginx."
    answer: 0
    tags: ["http-natif", "architecture"]
    level: debutant
    explanation: |
      `node:http` (via `http.createServer`) accepte directement les
      connexions TCP et parle HTTP : c'est le serveur, pas juste un exécuteur
      de script à l'intérieur d'un serveur préexistant. Un reverse-proxy
      (nginx) est courant devant en production, mais n'est pas
      **indispensable** pour que Node serve du HTTP.
  - prompt: |
      `req.url` dans un handler `http.createServer` contient-il directement
      le chemin ET les paramètres de query déjà séparés ?
    options:
      - |
        Oui, `req.url` est un objet avec `.pathname` et `.searchParams` déjà
        prêts, comme la `Request` de Symfony.
      - |
        Non, `req.url` est une chaîne **brute** (ex. `/users/42?active=true`)
        qu'il faut parser soi-même, par exemple avec `new URL(...)`.
      - |
        Non, `req.url` ne contient jamais la query string, seulement le chemin.
    answer: 1
    tags: ["http-natif", "req-url"]
    level: intermediaire
    explanation: |
      Contrairement à une `Request` Symfony déjà enrichie, `req.url` en HTTP
      natif Node est une simple **chaîne de caractères brute**. Il faut la
      parser explicitement (`new URL(req.url, base)`) pour séparer chemin et
      query string proprement.
  - prompt: |
      Pourquoi oublier `res.end()` dans un handler HTTP est-il particulièrement
      dangereux ?
    options:
      - |
        Ce n'est pas grave : Node ferme automatiquement la réponse après
        quelques secondes.
      - |
        La réponse ne se termine jamais : le client reste en attente, et la
        connexion TCP sous-jacente n'est jamais libérée — un risque de
        ressources épuisées sous charge.
      - |
        Cela provoque immédiatement un crash du process Node.
    answer: 1
    tags: ["http-natif", "res-end", "erreur-frequente"]
    level: intermediaire
    explanation: |
      Sans `res.end()`, la réponse HTTP ne se termine jamais explicitement :
      le client attend indéfiniment (jusqu'à un éventuel timeout côté
      client), et la connexion reste ouverte côté serveur. Sous forte charge,
      accumuler des connexions jamais fermées est une vraie source
      d'incidents en production.
  - prompt: |
      Que fait un middleware qui **ne appelle PAS** `next()` dans une chaîne
      de middlewares ?
    options:
      - |
        Rien de spécial, la chaîne continue automatiquement malgré tout.
      - |
        Il **court-circuite** la chaîne : aucun middleware suivant, ni le
        handler final, ne sera exécuté pour cette requête.
      - |
        Cela provoque une erreur de syntaxe au démarrage du serveur.
    answer: 1
    tags: ["middleware", "next"]
    level: intermediaire
    explanation: |
      `next()` est ce qui fait progresser la chaîne vers le middleware
      suivant (ou le handler final). Un middleware qui ne l'appelle pas — par
      exemple après avoir renvoyé un `401` — arrête volontairement le
      traitement : c'est exactement le mécanisme utilisé pour un garde
      d'authentification.
  - prompt: |
      À quel mécanisme Symfony la notion de middleware (chaîne de fonctions,
      chacune pouvant continuer ou arrêter la propagation) correspond-elle le
      plus directement ?
    options:
      - "Aux Repositories Doctrine."
      - |
        Aux `EventSubscriber` écoutant `kernel.request`, capables d'arrêter la
        propagation de l'événement avant d'atteindre le contrôleur.
      - "Aux Voters de sécurité, exclusivement."
    answer: 1
    tags: ["middleware", "symfony", "passerelle"]
    level: avance
    explanation: |
      Les `EventSubscriber` sur `kernel.request` (logging, CORS, sécurité...)
      forment, dans Symfony, une chaîne comparable : chacun peut laisser la
      main au suivant ou court-circuiter en fixant directement une réponse
      (`$event->setResponse(...)` + `stopPropagation()`) — exactement l'esprit
      du `next()` d'un middleware Node.
  - prompt: |
      Pourquoi passe-t-on généralement d'HTTP natif à un framework
      (Express, Fastify, NestJS) dès qu'un projet grandit ?
    options:
      - |
        Parce que `http.createServer` ne fonctionne pas en production.
      - |
        Pour éviter de réécrire, projet après projet, le routing déclaratif,
        le parsing de body, les middlewares courants et la gestion d'erreurs
        centralisée que l'API native ne fournit pas prête à l'emploi.
      - |
        Parce que HTTP natif ne supporte pas les méthodes autres que GET/POST.
    answer: 1
    tags: ["http-natif", "frameworks"]
    level: debutant
    explanation: |
      `http.createServer` fonctionne très bien en production, mais laisse
      tout à ta charge (routing, parsing, erreurs...). Un framework
      industrialise ces besoins transversaux communs à presque tous les
      projets — le sujet des parcours suivants sur Express/NestJS.
---

Six questions pour ancrer les notions du module : `node:http` comme serveur à
part entière, `req.url` brut à parser, l'importance de `res.end()`, le
mécanisme du middleware et son parallèle avec le kernel HTTP Symfony, et la
raison d'être des frameworks HTTP.
