---
title: "Exercice — filter + map"
type: exercise
exercise:
  language: js
  starter: |
    // users : [{ email, role, active }]
    // Returns the emails of users who are admin AND active.
    function adminEmails(users) {
      // TODO: filter then extract the emails
      return []
    }
  tests:
    - name: "garde les admins actifs et extrait les emails"
      code: |
        const users = [
          { email: 'a@x.fr', role: 'admin', active: true },
          { email: 'b@x.fr', role: 'user', active: true },
          { email: 'c@x.fr', role: 'admin', active: false },
        ]
        const got = adminEmails(users)
        console.log('input   :', users)
        console.log('result  :', got)
        assertEqual(got, ['a@x.fr'], 'only the active admin should remain')
    - name: "liste vide → []"
      code: |
        assertEqual(adminEmails([]), [], 'no users → empty array')
---

> ⏱️ **Durée conseillée : ~15 min.** Prends ton temps — comprendre plutôt qu'aller vite.

## Énoncé

On te donne une liste d'utilisateurs `{ email, role, active }`. Renvoie un tableau
des **emails** des utilisateurs qui sont à la fois `role === 'admin'` **et** `active`.

Indice : enchaîne `filter` (garder) puis `map` (extraire l'email).

<!--correction-->

## Correction

```js
function adminEmails(users) {
  return users
    .filter((u) => u.role === 'admin' && u.active)
    .map((u) => u.email)
}
```

`filter` garde uniquement les admins actifs, `map` ne conserve que l'email de chacun.
Les deux renvoient de **nouveaux** tableaux — l'entrée n'est pas modifiée.
