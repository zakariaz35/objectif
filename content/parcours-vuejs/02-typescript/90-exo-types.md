---
title: "Exercice — typer un panier"
type: exercise
---

## Énoncé

Type ce code d'un mini-panier. Écris :

1. une **interface `Article`** avec `nom: string`, `prixCents: number`, `quantite: number` ;
2. la fonction `totalCents` qui prend un **tableau d'`Article`** et renvoie un **`number`**.

```ts
// à typer :
interface Article { /* ... */ }

function totalCents(articles /* : ? */) /* : ? */ {
  return articles.reduce((s, a) => s + a.prixCents * a.quantite, 0)
}
```

Indice : le paramètre est un `Article[]`, le retour un `number`.

<!--correction-->

## Correction

```ts
interface Article {
  nom: string
  prixCents: number
  quantite: number
}

function totalCents(articles: Article[]): number {
  return articles.reduce((s, a) => s + a.prixCents * a.quantite, 0)
}
```

Avec ce typage, l'éditeur **autocomplète** `a.prixCents`, et **refuse** un article
sans `quantite` ou un appel `totalCents("oops")`. C'est tout l'intérêt : les erreurs
sont attrapées **avant** l'exécution.
