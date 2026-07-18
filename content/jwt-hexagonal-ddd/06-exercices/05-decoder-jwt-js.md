---
title: "Exercice 5 — Décoder un JWT (JS, interactif)"
type: exercise
exercise:
  language: js
  starter: |
    // Returns the payload object of a JWT (the 2nd segment, base64url-encoded).
    // Hint: token.split('.'), then base64url -> base64 (- => +, _ => /), then atob + JSON.parse
    function decodePayload(token) {
      // TODO: to complete
      return null
    }

    // Try your function and look at the "Output (console)" by clicking Run:
    const token = 'h.' + btoa('{"sub":"42","role":"admin"}') + '.sig'
    console.log('payload =', decodePayload(token))
  tests:
    - name: "encode → décode : sub et role"
      code: |
        const payload = { sub: '123', role: 'admin' }
        const token = 'header.' + btoa(JSON.stringify(payload)) + '.signature'
        console.log('1) initial payload :', payload)
        console.log('2) encoded token   :', token)
        const decoded = decodePayload(token)
        console.log('3) decoded payload :', decoded)
        assert(decoded.sub === '123', "sub must equal '123'")
        assert(decoded.role === 'admin', "role must equal 'admin'")
    - name: "gère un autre payload"
      code: |
        const payload = { sub: 'abc', exp: 42 }
        const token = 'header.' + btoa(JSON.stringify(payload)) + '.signature'
        console.log('encoded →', token, ' / decoded →', decodePayload(token))
        const decoded = decodePayload(token)
        assert(decoded.sub === 'abc' && decoded.exp === 42, 'must decode the payload faithfully')
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
