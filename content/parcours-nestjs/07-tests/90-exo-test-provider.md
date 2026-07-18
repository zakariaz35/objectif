---
title: "Exercice — écrire le test unitaire d'un provider"
type: exercise
---

> ⏱️ **Durée conseillée : ~20 min.**

## Énoncé

Voici un service déjà écrit, que tu ne dois **pas** modifier :

```ts
// products.service.ts
import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Product } from "./product.entity"

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async archive(id: number): Promise<Product> {
    const product = await this.productsRepository.findOneBy({ id })
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`)
    }
    product.inStock = false
    return this.productsRepository.save(product)
  }
}
```

Écris le fichier `products.service.spec.ts` correspondant, avec **deux**
tests :

1. **Cas nominal** : `productsRepository.findOneBy` renvoie un produit
   existant ; vérifie que `archive(id)` renvoie bien un produit avec
   `inStock: false`, et que `productsRepository.save` a été appelé
   **exactement une fois**.
2. **Cas d'erreur** : `productsRepository.findOneBy` renvoie `null` ;
   vérifie que `archive(id)` **rejette** avec une `NotFoundException`.

Utilise `Test.createTestingModule` avec un `Repository` **mocké** (via
`getRepositoryToken(Product)` + `useValue`), comme vu dans les leçons de ce
module.

<!--correction-->

## Correction

```ts
// products.service.spec.ts
import { NotFoundException } from "@nestjs/common"
import { getRepositoryToken } from "@nestjs/typeorm"
import { Test, TestingModule } from "@nestjs/testing"
import { Product } from "./product.entity"
import { ProductsService } from "./products.service"

describe("ProductsService", () => {
  let service: ProductsService
  let productsRepository: { findOneBy: jest.Mock; save: jest.Mock }

  beforeEach(async () => {
    productsRepository = {
      findOneBy: jest.fn(),
      save: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: productsRepository },
      ],
    }).compile()

    service = module.get(ProductsService)
  })

  it("archives an existing product", async () => {
    const product = { id: 1, name: "Book", price: 12, inStock: true } as Product
    productsRepository.findOneBy.mockResolvedValue(product)
    productsRepository.save.mockImplementation(async (p) => p)

    const result = await service.archive(1)

    expect(result.inStock).toBe(false)
    expect(productsRepository.save).toHaveBeenCalledTimes(1)
  })

  it("throws NotFoundException when the product does not exist", async () => {
    productsRepository.findOneBy.mockResolvedValue(null)

    await expect(service.archive(999)).rejects.toThrow(NotFoundException)
  })
})
```

- Le `Repository` réel est **entièrement remplacé** par un objet simple
  (`{ findOneBy: jest.fn(), save: jest.fn() }`) : aucune vraie base de
  données n'est sollicitée, le test s'exécute en quelques millisecondes.
- `getRepositoryToken(Product)` est **indispensable** : c'est le jeton
  exact que `@InjectRepository(Product)` utilise en interne pour demander
  sa dépendance — sans lui, Nest ne saurait pas quel provider substituer.
- Le premier test vérifie **à la fois** le résultat (`result.inStock ===
  false`) et l'**interaction** (`save` appelé une fois) — les deux
  méritent d'être vérifiés : un service pourrait modifier l'objet en
  mémoire sans jamais appeler `save`, ce qui ne persisterait rien en
  réalité.
- Le second test utilise `rejects.toThrow(NotFoundException)` : la bonne
  façon de tester qu'une `Promise` **rejette** avec un type d'exception
  précis, plutôt qu'un `try/catch` manuel.
