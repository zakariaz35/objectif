---
title: "Exercice 5 — Décoder un JWT (JS, interactif)"
type: exercise
exercise:
  language: js
  starter: |
    // Renvoie l'objet du payload d'un JWT (le 2e segment, encodé en base64url).
    // Indice : token.split('.'), puis base64url -> base64 (- => +, _ => /), puis atob + JSON.parse
    function decodePayload(token) {
      // TODO : à compléter
      return null
    }
  tests:
    - name: "décode sub et role"
      code: |
        const token = 'h.' + btoa(JSON.stringify({ sub: '123', role: 'admin' })) + '.sig'
        const r = decodePayload(token)
        assert(r.sub === '123', "sub doit valoir '123'")
        assert(r.role === 'admin', "role doit valoir 'admin'")
    - name: "gère un autre payload"
      code: |
        const token = 'h.' + btoa(JSON.stringify({ sub: 'abc', exp: 42 })) + '.sig'
        const r = decodePayload(token)
        assert(r.sub === 'abc' && r.exp === 42, 'doit décoder fidèlement le payload')
---
## Énoncé

Le payload d'un JWT est le **2ᵉ segment** (`header.payload.signature`), encodé en
**base64url** (et non chiffré). Complète `decodePayload(token)` pour renvoyer l'objet
JSON du payload. Écris ton code dans l'éditeur, puis lance les tests.

<!--correction-->

## Correction

```js
function decodePayload(token) {
  const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(part))
}
```

On isole le 2ᵉ segment, on reconvertit l'alphabet base64url (`-` `_`) vers le base64
standard (`+` `/`), puis `atob` décode et `JSON.parse` reconstruit l'objet. Aucune
vérification de signature ici : décoder ≠ vérifier.
