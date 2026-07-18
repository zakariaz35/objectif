---
# GABARIT — exercice interactif (JS). Copie ce fichier dans un module et adapte-le.
# (Le dossier _templates n'est pas importé : pas de formation.yaml.)
title: "Exercice — <titre>"
type: exercise
exercise:
  language: js
  # Code pré-rempli dans l'éditeur. Laisse un TODO clair.
  starter: |
    function maFonction(x) {
      // TODO : à compléter
      return null
    }

    // (Optionnel) essaie ta fonction — la sortie s'affiche dans « Sortie (console) » :
    // console.log(maFonction(21))
  tests:
    # Chaque test : illustre avec console.log, puis vérifie avec assert / assertEqual.
    - name: "cas nominal"
      code: |
        const entree = 21
        const obtenu = maFonction(entree)
        console.log('entrée :', entree)
        console.log('obtenu :', obtenu)
        assertEqual(obtenu, 42, 'doit doubler la valeur')
    - name: "cas limite"
      code: |
        assertEqual(maFonction(0), 0, 'zéro reste zéro')
        assert(typeof maFonction(0) === 'number', 'doit renvoyer un nombre')
---

## Énoncé

Décris ici ce qu'il faut faire (et donne des indices si utile).

<!--correction-->

## Correction

```js
function maFonction(x) {
  return x * 2
}
```

Explique le raisonnement de la correction.
