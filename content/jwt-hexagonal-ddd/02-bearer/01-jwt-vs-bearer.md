---
title: "Bearer : comment le token voyage"
type: lesson
---

# 2. Bearer — comment le token voyage (authentification)

Erreur fréquente : confondre JWT et Bearer. Ce sont deux choses à des niveaux différents :

| Concept | Répond à la question | Exemple |
| --- | --- | --- |
| **JWT** | Quel est le *format / contenu* du jeton ? | un token signé en 3 parties |
| **Bearer** | Comment je *transporte* le jeton dans la requête HTTP ? | un en-tête `Authorization` |

**« Bearer »** (= « porteur ») est un **schéma d'authentification HTTP**. Le principe : *« quiconque porte ce jeton y a droit »* — comme un billet de train au porteur. On l'envoie dans l'en-tête :

```http
GET /api/factures HTTP/1.1
Host: api.reforged.dev
Authorization: Bearer eyJhbGci….eyJzdW….SflKx…
              └─schéma─┘ └──────────── le token (souvent un JWT) ──────────┘
```

> **Le mot-clé compte —** Le préfixe `Bearer ` (avec l'espace) dit au serveur *comment* interpréter ce qui suit. Autres schémas : `Basic` (login:password en base64), `Digest`, `Negotiate`… Bearer est celui des tokens/API modernes.

## Bearer ≠ JWT obligatoirement

Un token Bearer **peut** être un JWT, mais pas forcément. Un token Sanctum opaque voyage aussi en `Authorization: Bearer xxx`. Bearer décrit l'**enveloppe**, JWT décrit le **contenu de la lettre**.
