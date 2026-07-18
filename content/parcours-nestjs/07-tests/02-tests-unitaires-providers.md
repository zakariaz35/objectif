---
title: "Tester un provider en isolation"
type: lesson
---

## Un service, testé seul, sans base de données ni serveur HTTP

```ts
// orders.service.ts
import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Product } from "../products/product.entity"
import { Order } from "./order.entity"

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Product) private readonly productsRepository: Repository<Product>,
    @InjectRepository(Order) private readonly ordersRepository: Repository<Order>,
  ) {}

  async createOrder(productId: number, quantity: number): Promise<Order> {
    const product = await this.productsRepository.findOneBy({ id: productId })
    if (!product) {
      throw new NotFoundException(`Product #${productId} not found`)
    }
    const order = this.ordersRepository.create({ product, quantity })
    return this.ordersRepository.save(order)
  }
}
```

```ts
// orders.service.spec.ts
import { NotFoundException } from "@nestjs/common"
import { getRepositoryToken } from "@nestjs/typeorm"
import { Test, TestingModule } from "@nestjs/testing"
import { OrdersService } from "./orders.service"
import { Product } from "../products/product.entity"
import { Order } from "./order.entity"

describe("OrdersService", () => {
  let service: OrdersService
  let productsRepository: { findOneBy: jest.Mock }
  let ordersRepository: { create: jest.Mock; save: jest.Mock }

  beforeEach(async () => {
    productsRepository = { findOneBy: jest.fn() }
    ordersRepository = { create: jest.fn(), save: jest.fn() }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Product), useValue: productsRepository },
        { provide: getRepositoryToken(Order), useValue: ordersRepository },
      ],
    }).compile()

    service = module.get(OrdersService)
  })

  it("creates an order when the product exists", async () => {
    const product = { id: 1, name: "Book", price: 12 }
    productsRepository.findOneBy.mockResolvedValue(product)
    ordersRepository.create.mockReturnValue({ product, quantity: 2 })
    ordersRepository.save.mockResolvedValue({ id: 1, product, quantity: 2 })

    const order = await service.createOrder(1, 2)

    expect(order.quantity).toBe(2)
    expect(ordersRepository.save).toHaveBeenCalledTimes(1)
  })

  it("throws NotFoundException when the product does not exist", async () => {
    productsRepository.findOneBy.mockResolvedValue(null)

    await expect(service.createOrder(999, 1)).rejects.toThrow(NotFoundException)
  })
})
```

> **Symfony → NestJS.** Rigoureusement le même principe qu'un test PHPUnit
> classique de service Symfony : on construit le service testé avec des
> **doubles de test** en paramètre (au lieu du vrai `EntityManager`/
> Repository Doctrine), on programme leur comportement (`mockResolvedValue`
> ↔ `willReturn(...)` d'un mock PHPUnit), puis on vérifie le résultat
> (`expect(...).toBe(...)` ↔ `$this->assertEquals(...)`) et les
> **interactions** (`toHaveBeenCalledTimes(1)` ↔
> `$mock->expects($this->once())->method(...)`).

> 💡 **À retenir.** Un test de provider **ne doit jamais** toucher une
> vraie base de données ni faire une vraie requête réseau : tout ce qui
> sort du périmètre de l'unité testée (Repository, appel HTTP externe...)
> doit être un **mock**. C'est ce qui rend ces tests rapides (millisecondes)
> et fiables (aucune dépendance à un état externe).

## À retenir

- Un test de provider construit le service avec des **mocks** en
  dépendance, jamais de vraie base/API — le même réflexe qu'un test
  unitaire PHPUnit de service Symfony.
- `mockResolvedValue`/`mockReturnValue` programment le comportement d'un
  mock ; `toHaveBeenCalledTimes(...)` vérifie les **interactions**, pas
  seulement le résultat final.
- `rejects.toThrow(...)` teste qu'une Promise rejette avec le bon type
  d'exception — utile pour vérifier les cas d'erreur (`NotFoundException`
  et consorts, vus au module 3).
