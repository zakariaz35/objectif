---
title: "Exercice — un mini Repository en mémoire (façon TypeORM)"
type: exercise
exercise:
  language: ts
  starter: |
    // A SIMPLIFIED, in-memory repository mimicking the SHAPE of a TypeORM
    // Repository (create/find/update/remove), backed by a plain array
    // instead of a real database — no @nestjs/typeorm import needed here.

    interface Product {
      id: number
      name: string
      price: number
    }

    class InMemoryProductsRepository {
      private products: Product[] = []
      private nextId = 1

      // Creates a NEW product (auto-assigns an incrementing id, starting
      // at 1), stores it, and returns the created entity.
      create(data: { name: string; price: number }): Product {
        // TODO
        return { id: 0, name: "", price: 0 }
      }

      // Returns ALL products currently stored, in insertion order.
      findAll(): Product[] {
        // TODO
        return []
      }

      // Returns the product with this id, or null if none exists.
      findOneById(id: number): Product | null {
        // TODO
        return null
      }

      // Merges `changes` into the existing product with this id, and
      // returns the UPDATED entity. Returns null (and changes nothing) if
      // no product has this id.
      update(id: number, changes: Partial<{ name: string; price: number }>): Product | null {
        // TODO
        return null
      }

      // Removes the product with this id. Returns true if something was
      // actually removed, false if no product had this id.
      remove(id: number): boolean {
        // TODO
        return false
      }
    }
  tests:
    - name: "create assigne des ids auto-incrementes, a partir de 1"
      code: |
        const repo = new InMemoryProductsRepository()
        const first = repo.create({ name: "Keyboard", price: 89 })
        const second = repo.create({ name: "Mouse", price: 45 })
        console.log("first:", first)
        console.log("second:", second)
        assertEqual(first.id, 1, "the first created product must get id 1")
        assertEqual(second.id, 2, "the second created product must get id 2")
    - name: "findAll renvoie tous les produits, dans l'ordre d'insertion"
      code: |
        const repo = new InMemoryProductsRepository()
        repo.create({ name: "Keyboard", price: 89 })
        repo.create({ name: "Mouse", price: 45 })
        const all = repo.findAll()
        assertEqual(
          all.map((p) => p.name),
          ["Keyboard", "Mouse"],
          "findAll must return every stored product, in insertion order",
        )
    - name: "findOneById retrouve le bon produit, ou null si absent"
      code: |
        const repo = new InMemoryProductsRepository()
        const created = repo.create({ name: "Keyboard", price: 89 })
        assertEqual(repo.findOneById(created.id), created, "findOneById must return the matching product")
        assertEqual(repo.findOneById(999), null, "findOneById must return null for an unknown id")
    - name: "update fusionne les changements et renvoie l'entite mise a jour"
      code: |
        const repo = new InMemoryProductsRepository()
        const created = repo.create({ name: "Keyboard", price: 89 })
        const updated = repo.update(created.id, { price: 79 })
        assertEqual(updated, { id: created.id, name: "Keyboard", price: 79 }, "update must merge changes, keeping untouched fields")
        assertEqual(repo.findOneById(created.id).price, 79, "the change must be persisted in the repository")
    - name: "update sur un id inconnu renvoie null et ne cree rien"
      code: |
        const repo = new InMemoryProductsRepository()
        repo.create({ name: "Keyboard", price: 89 })
        const result = repo.update(999, { price: 10 })
        assertEqual(result, null, "updating an unknown id must return null")
        assertEqual(repo.findAll().length, 1, "no new product must be created by an update on an unknown id")
    - name: "remove supprime le produit et renvoie true, sinon false"
      code: |
        const repo = new InMemoryProductsRepository()
        const created = repo.create({ name: "Keyboard", price: 89 })
        const removed = repo.remove(created.id)
        assertEqual(removed, true, "remove must return true when a product was actually deleted")
        assertEqual(repo.findAll(), [], "the removed product must no longer be in the repository")
        assertEqual(repo.remove(created.id), false, "removing an already-removed id must return false")
---

> ⏱️ **Durée conseillée : ~25 min.**

## Énoncé

Le `Repository<Product>` de TypeORM (module 06, leçon 2) parle à une vraie
base de données ; ce mini-`InMemoryProductsRepository` fait strictement la
**même chose**, mais contre un simple tableau en mémoire — pour comprendre
le contrat d'un Repository sans avoir besoin d'une base réelle.

Implémente les cinq méthodes :

1. **`create(data)`** : assigne un `id` auto-incrémenté (commençant à `1`),
   construit le produit complet, le stocke, et le renvoie.
2. **`findAll()`** : renvoie tous les produits stockés, dans l'ordre où ils
   ont été créés.
3. **`findOneById(id)`** : renvoie le produit correspondant, ou `null` s'il
   n'existe pas.
4. **`update(id, changes)`** : fusionne `changes` dans le produit existant
   (les champs non fournis restent inchangés) et renvoie l'entité mise à
   jour ; renvoie `null` (sans rien créer) si l'`id` n'existe pas.
5. **`remove(id)`** : supprime le produit correspondant ; renvoie `true` si
   quelque chose a réellement été supprimé, `false` sinon.

Réflexes utiles :

- Un simple compteur `this.nextId` incrémenté à chaque `create` reproduit
  l'auto-incrémentation d'un `@PrimaryGeneratedColumn()`.
- `Array.prototype.find` pour retrouver un produit par `id` ;
  `Array.prototype.filter` pour en retirer un.
- Pour `update`, l'opérateur de *spread* (`{ ...existing, ...changes }`)
  fusionne proprement les champs modifiés avec ceux inchangés.

<!--correction-->

## Correction

```ts
interface Product {
  id: number
  name: string
  price: number
}

class InMemoryProductsRepository {
  private products: Product[] = []
  private nextId = 1

  create(data: { name: string; price: number }): Product {
    const product: Product = { id: this.nextId, ...data }
    this.nextId++
    this.products.push(product)
    return product
  }

  findAll(): Product[] {
    return [...this.products]   // a copy: callers can't mutate our internal array
  }

  findOneById(id: number): Product | null {
    return this.products.find((p) => p.id === id) ?? null
  }

  update(id: number, changes: Partial<{ name: string; price: number }>): Product | null {
    const index = this.products.findIndex((p) => p.id === id)
    if (index === -1) return null

    const updated = { ...this.products[index], ...changes }
    this.products[index] = updated
    return updated
  }

  remove(id: number): boolean {
    const index = this.products.findIndex((p) => p.id === id)
    if (index === -1) return false

    this.products.splice(index, 1)
    return true
  }
}
```

- **`create`** reproduit l'auto-incrémentation d'un
  `@PrimaryGeneratedColumn()` avec un simple compteur privé, incrémenté à
  chaque insertion — jamais réutilisé, même après une suppression.
- **`findOneById`** utilise `?? null` pour transformer le `undefined` que
  renvoie `Array.prototype.find` (rien trouvé) en `null` explicite,
  cohérent avec le contrat annoncé — comme `findOneBy(...)` de TypeORM, qui
  renvoie `null` (pas `undefined`) en absence de résultat.
- **`update`** localise l'index avec `findIndex` (pas `find`) : c'est ce qui
  permet de **remplacer** l'élément dans le tableau (`this.products[index]
  = updated`) plutôt que de modifier une copie perdue.
- **`remove`** utilise le même réflexe `findIndex`, puis `splice` pour
  retirer précisément **un** élément à cet index — renvoyant `true`/`false`
  selon qu'une suppression a réellement eu lieu.

> Le vrai `Repository` TypeORM ajoute évidemment beaucoup plus (SQL généré,
> transactions, relations, Query Builder...) — mais le contrat de base que
> tu viens d'implémenter (créer, lister, trouver, mettre à jour, supprimer)
> est exactement celui que `ProductsService` utilise, que le Repository
> parle à Postgres ou, ici, à un simple tableau.
