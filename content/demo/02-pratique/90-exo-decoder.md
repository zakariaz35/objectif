---
title: Décoder un token
type: exercise
---
## Énoncé

Écris une fonction `decode(token)` qui renvoie le payload d'un JWT.

<!--correction-->
## Correction

```js
function decode(token) {
  const [, payload] = token.split('.');
  return JSON.parse(atob(payload));
}
```
