---
title: "HttpClient : get & post typés"
type: lesson
---

# Appeler une API avec `HttpClient`

## Brancher `HttpClient`

Dans une app standalone, on le fournit au démarrage :

```ts
import { bootstrapApplication } from '@angular/platform-browser'
import { provideHttpClient } from '@angular/common/http'
import { AppComponent } from './app.component'

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient()],
})
```

## Un service qui appelle l'API

On range les appels HTTP dans un **service**, jamais directement dans un composant.

```ts
import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'

export interface Product {
  id: number
  name: string
  price: number
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient)
  private baseUrl = '/api/products'

  // typed GET: the response is Product[]
  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl)
  }

  getOne(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`)
  }

  // typed POST: send a body, expect a Product back
  create(payload: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, payload)
  }
}
```

`http.get<Product[]>(...)` ne **valide pas** à l'exécution, mais type la réponse côté
TypeScript : tu obtiens l'autocomplétion et le contrôle de types en aval. Idem pour `post`,
qui prend un **corps** en deuxième argument.

## Consommer dans un composant

```ts
@Component({ /* ... */ })
export class ProductListComponent implements OnInit {
  private service = inject(ProductService)
  products: Product[] = []

  ngOnInit(): void {
    this.service.getAll().subscribe((products) => {
      this.products = products      // the GET fires only here, on subscribe
    })
  }
}
```

La requête ne part **qu'au `subscribe`** (Observable lazy). On verra à la leçon suivante une façon plus propre de consommer dans le template : le pipe `async`.

> **À retenir —** `provideHttpClient()` branche le client ; les appels vivent dans un **service** ; type tes réponses (`get<Product[]>`, `post<Product>`) pour la sécurité de types ; et rappelle-toi que **rien ne part avant le `subscribe`**.
