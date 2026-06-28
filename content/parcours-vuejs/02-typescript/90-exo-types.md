---
title: "Exercice — typer (et exécuter) un panier"
type: exercise
exercise:
  language: ts
  starter: |
    interface Article {
      nom: string
      prixCents: number
      quantite: number
    }

    function totalCents(articles: Article[]): number {
      // TODO : somme de prixCents * quantite pour chaque article
      return 0
    }
  tests:
    - name: "panier de 2 lignes"
      code: |
        const panier: Article[] = [
          { nom: 'Café', prixCents: 1000, quantite: 2 },
          { nom: 'Thé', prixCents: 500, quantite: 3 },
        ]
        console.log('panier :', panier)
        const total = totalCents(panier)
        console.log('total (cents) :', total)
        assertEqual(total, 3500, '2×1000 + 3×500 = 3500')
    - name: "panier vide → 0"
      code: |
        assertEqual(totalCents([]), 0, 'un panier vide coûte 0')
---

## Énoncé

Complète `totalCents` pour qu'elle renvoie la **somme** de `prixCents × quantite` de
chaque article. Le code est en **TypeScript** : les types sont là pour t'aider (l'éditeur
te prévient si tu te trompes), et il est **réellement exécuté** (transpilé en JS).

Indice : `articles.reduce(...)`.

<!--correction-->

## Correction

```ts
function totalCents(articles: Article[]): number {
  return articles.reduce((somme, a) => somme + a.prixCents * a.quantite, 0)
}
```

`reduce` accumule le total ligne par ligne. Le typage `Article[]` → `number` documente
l'intention et fait que l'éditeur **autocomplète** `a.prixCents`.
