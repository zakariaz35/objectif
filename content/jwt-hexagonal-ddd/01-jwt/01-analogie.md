---
title: "JWT : l'idée centrale et l'analogie du billet"
type: lesson
---

# 1. JWT — JSON Web Token (authentification)

Un **JWT** est une **carte d'identité numérique signée**. Le serveur la fabrique une fois (au login), la donne au client, et le client la présente à chaque requête.

> **L'idée centrale —** Le serveur n'a **rien à stocker**. Toute l'information (qui tu es, ton rôle, l'expiration) est **dans le token**, et la **signature** garantit que personne ne l'a modifié. On dit que c'est **stateless** (sans état serveur).

## Analogie : le billet de concert

Compare deux façons de gérer une entrée :

- **Session classique (stateful)** = un bracelet numéroté. À l'entrée, le videur vérifie le numéro *dans son registre*. Sans registre, le bracelet ne vaut rien. → Laravel : table `sessions` + cookie.
- **JWT (stateless)** = un billet *avec un sceau holographique infalsifiable*. Le videur vérifie le sceau, pas un registre. Tout est écrit sur le billet. → pas de table, pas de lookup DB.
