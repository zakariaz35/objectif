---
title: "Exercice — parser un montant de façon robuste"
type: exercise
exercise:
  language: js
  starter: |
    // Fil rouge "ventes" : tes montants arrivent parfois sous forme de TEXTE
    // (issu d'un fichier, d'un formulaire...). Certains sont invalides ("abc", "").
    // Tu vas écrire du code ROBUSTE qui refuse les mauvaises valeurs proprement.

    // 1) Convertit un texte en nombre. Si le texte n'est PAS un nombre valide,
    //    DÉCLENCHE une erreur avec throw new Error("Montant invalide : " + texte).
    //    Indice : Number(texte) donne NaN si la conversion échoue ; teste avec Number.isNaN().
    function parserMontant(texte) {
      // TODO : convertir ; si invalide, throw ; sinon return le nombre
      return null
    }

    // 2) Version SÉCURISÉE : essaie de parser, et si ça échoue, renvoie 0 au lieu de planter.
    //    Indice : entoure l'appel à parserMontant d'un try / catch.
    function parserMontantSecurise(texte) {
      // TODO : try { ... } catch (e) { renvoyer 0 }
      return null
    }

    // 3) Prend un TABLEAU de textes et renvoie le TOTAL des montants valides,
    //    les invalides comptant pour 0 (grâce à parserMontantSecurise).
    function totalMontants(textes) {
      // TODO : accumule parserMontantSecurise(chaque texte)
      return null
    }

    // (Optionnel) essaie :
    // console.log(parserMontant("120"))
    // console.log(parserMontantSecurise("abc"))
    // console.log(totalMontants(["120", "abc", "80"]))
  tests:
    - name: "parserMontant convertit un texte numérique"
      code: |
        console.log('parserMontant("120") =', parserMontant("120"))
        assertEqual(parserMontant("120"), 120, '"120" -> 120')
    - name: "parserMontant lève une erreur sur un texte invalide"
      code: |
        let aLeve = false
        try {
          parserMontant("abc")
        } catch (e) {
          aLeve = true
          console.log('message capté :', e.message)
        }
        assert(aLeve, 'parserMontant("abc") doit déclencher une erreur (throw)')
    - name: "parserMontantSecurise renvoie 0 au lieu de planter"
      code: |
        console.log('parserMontantSecurise("abc") =', parserMontantSecurise("abc"))
        assertEqual(parserMontantSecurise("abc"), 0, 'texte invalide attrapé -> 0')
        assertEqual(parserMontantSecurise("80"), 80, 'texte valide -> 80')
    - name: "totalMontants ignore les valeurs invalides"
      code: |
        const obtenu = totalMontants(["120", "abc", "80"])
        console.log('total :', obtenu)
        assertEqual(obtenu, 200, '120 + 0 (abc) + 80 = 200')
    - name: "totalMontants d'un tableau vide vaut 0"
      code: |
        assertEqual(totalMontants([]), 0, 'aucun montant : total de 0')
---

> ⏱️ **Durée conseillée : ~20 min.** Prends ton temps — l'objectif est de **comprendre**, pas d'aller vite. N'hésite pas à relire, modifier et relancer le code.

## Énoncé

Dans la vraie vie, les données arrivent **sales** : un montant peut être `"abc"` ou vide.
Ton code doit **refuser** proprement les mauvaises valeurs plutôt que de propager un `NaN`.

1. `parserMontant(texte)` : convertit `texte` en nombre. Si la conversion **échoue**,
   **déclenche** une erreur : `throw new Error("Montant invalide : " + texte)`.
   Indice : `Number("abc")` vaut `NaN` ; on détecte ça avec `Number.isNaN(...)`.
2. `parserMontantSecurise(texte)` : **essaie** de parser dans un `try`, et si ça échoue,
   **attrape** l'erreur (`catch`) et renvoie `0` — le programme ne plante pas.
3. `totalMontants(textes)` : prend un **tableau** de textes et renvoie le **total** des
   montants valides (les invalides comptant pour `0`, grâce à `parserMontantSecurise`).

Réflexes utiles :

- **Pourquoi `throw` dans `parserMontant` ?** Une fonction ne doit pas renvoyer un résultat
  faux en silence : mieux vaut **signaler** l'entrée invalide et laisser l'appelant décider.
- **Pourquoi `try/catch` dans la version sécurisée ?** Pour convertir l'échec en une valeur
  de repli (`0`) et **continuer** le traitement des autres montants au lieu de tout arrêter.
- `Number.isNaN(n)` teste si `n` est le « pas-un-nombre ». Attention : `NaN === NaN` vaut
  `false`, d'où la fonction dédiée `Number.isNaN`.
- Pour le total, réutilise le patron **accumulateur** du module Boucles (`let total = 0`).

<!--correction-->

## Correction

```js
function parserMontant(texte) {
  const n = Number(texte)
  if (Number.isNaN(n)) {
    throw new Error("Montant invalide : " + texte)   // on refuse la mauvaise donnée
  }
  return n
}

function parserMontantSecurise(texte) {
  try {
    return parserMontant(texte)          // on essaie...
  } catch (e) {
    return 0                             // ...et si ça casse, valeur de repli
  }
}

function totalMontants(textes) {
  let total = 0
  for (const texte of textes) {
    total = total + parserMontantSecurise(texte)   // les invalides comptent pour 0
  }
  return total
}
```

- **`parserMontant`** fait le travail « strict » : elle **lève** une erreur explicite dès que
  l'entrée n'est pas convertible. Elle ne cache rien — l'appelant sait exactement ce qui cloche
  (le message contient la valeur fautive).
- **`parserMontantSecurise`** enveloppe l'appel dans un `try/catch`. Le `catch` **transforme**
  l'échec en `0` : c'est ici qu'on décide de la stratégie de repli. On sépare ainsi le
  « détecter » (dans `parserMontant`) du « comment réagir » (dans la version sécurisée) —
  chaque fonction a une responsabilité claire.
- **`totalMontants`** applique le patron accumulateur et **délègue** la robustesse à
  `parserMontantSecurise` : elle-même n'a pas à connaître les `try/catch`, elle additionne
  simplement des nombres (les invalides valant `0`).

> On aurait pu tout mettre dans une seule fonction avec un `try/catch` géant. Découper en
> « strict qui `throw` » + « sécurisé qui `catch` » est plus **réutilisable** : ailleurs, tu
> voudras peut-être que l'erreur remonte vraiment (formulaire à corriger) plutôt que d'être
> avalée. Garder les deux versions te laisse le choix selon le contexte.
