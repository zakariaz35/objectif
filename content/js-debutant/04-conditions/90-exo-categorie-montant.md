---
title: "Exercice — classer une vente par montant"
type: exercise
exercise:
  language: js
  starter: |
    // On classe une VENTE dans une catégorie selon son montant (en euros) :
    //   - montant >= 1000        -> "Grand compte"
    //   - montant >= 500         -> "Standard"
    //   - montant >  0           -> "Petit panier"
    //   - montant === 0 (ou moins) -> "Aucune vente"
    // Renvoie la catégorie sous forme de chaîne.
    function categorieVente(montant) {
      // TODO : enchaîne les tests du plus restrictif au plus large (if / else if / else)
      return null
    }

    // (Optionnel) essaie ta fonction :
    // console.log(categorieVente(1500))
    // console.log(categorieVente(300))
    // console.log(categorieVente(0))
  tests:
    - name: "grand compte (>= 1000)"
      code: |
        console.log('1500 →', categorieVente(1500))
        console.log('1000 →', categorieVente(1000))
        assertEqual(categorieVente(1500), 'Grand compte', '1500 est un grand compte')
        assertEqual(categorieVente(1000), 'Grand compte', '1000 pile est déjà un grand compte')
    - name: "standard (>= 500)"
      code: |
        assertEqual(categorieVente(500), 'Standard', '500 pile est standard')
        assertEqual(categorieVente(750), 'Standard', '750 est standard')
    - name: "petit panier (> 0)"
      code: |
        console.log('300 →', categorieVente(300))
        assertEqual(categorieVente(300), 'Petit panier', '300 est un petit panier')
        assertEqual(categorieVente(1), 'Petit panier', '1 euro reste un petit panier')
    - name: "aucune vente (0 ou négatif)"
      code: |
        console.log('0 →', categorieVente(0))
        assertEqual(categorieVente(0), 'Aucune vente', '0 signifie aucune vente')
        assertEqual(categorieVente(-10), 'Aucune vente', 'un montant négatif compte comme aucune vente')
---

> ⏱️ **Durée conseillée : ~15 min.** Prends ton temps — l'objectif est de **comprendre**, pas d'aller vite. N'hésite pas à relire, modifier et relancer le code.

## Énoncé

Reprenons nos données de ventes. Complète `categorieVente(montant)` pour qu'elle
renvoie une **catégorie** (une chaîne) selon le montant :

| Condition sur le montant | Catégorie renvoyée |
|---|---|
| `montant >= 1000` | `"Grand compte"` |
| `montant >= 500` | `"Standard"` |
| `montant > 0` | `"Petit panier"` |
| `montant <= 0` (donc `0` ou négatif) | `"Aucune vente"` |

Deux pièges à surveiller :

- **L'ordre des tests.** Comme on s'arrête à la première condition vraie, commence par
  le seuil le **plus élevé** (`>= 1000`), sinon un montant de `1500` tomberait à tort
  dans une catégorie plus basse.
- **Le cas `0`.** Souviens-toi que `0` est **falsy** : n'écris pas `if (montant)` pour
  détecter « aucune vente ». Sois explicite avec `montant > 0` / `else`.

Utilise une cascade `if / else if / else`.

<!--correction-->

## Correction

```js
function categorieVente(montant) {
  if (montant >= 1000) {
    return "Grand compte"
  } else if (montant >= 500) {
    return "Standard"
  } else if (montant > 0) {
    return "Petit panier"
  } else {
    return "Aucune vente"
  }
}
```

- Les tests vont du **plus restrictif au plus large** : `>= 1000`, puis `>= 500`, puis
  `> 0`. Le premier vrai gagne, donc `1500` est bien capté par `>= 1000` avant tout.
- Le `else` final couvre `0` **et** les montants négatifs (`montant <= 0`) — pas besoin
  d'un test supplémentaire.
- On aurait pu se passer des `else` grâce au `return` (dès qu'on `return`, la fonction
  s'arrête). Cette version reste valable et tout aussi lisible :

```js
function categorieVente(montant) {
  if (montant >= 1000) return "Grand compte"
  if (montant >= 500) return "Standard"
  if (montant > 0) return "Petit panier"
  return "Aucune vente"
}
```
