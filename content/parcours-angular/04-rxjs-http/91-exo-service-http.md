---
title: "Exercice — un service HTTP typé (reveal)"
type: exercise
---

## Énoncé

Cet exercice porte sur du code Angular qui ne s'exécute pas dans le bac à sable : écris-le
puis compare à la correction.

Crée un `UserService` qui :

1. injecte `HttpClient` ;
2. expose `getUsers(): Observable<User[]>` qui fait un `GET /api/users` **typé** ;
3. en cas d'erreur, renvoie une **liste vide** plutôt que de propager l'erreur ;
4. expose `createUser(name)` qui fait un `POST /api/users` avec `{ name }` et renvoie le
   `User` créé.

Le type : `interface User { id: number; name: string }`.

<!--correction-->

## Correction

```ts
import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, of, catchError, map } from 'rxjs'

export interface User {
  id: number
  name: string
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient)
  private baseUrl = '/api/users'

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl).pipe(
      catchError((err) => {
        console.error('failed to load users', err)
        return of([])           // fallback to an empty list
      }),
    )
  }

  createUser(name: string): Observable<User> {
    return this.http.post<User>(this.baseUrl, { name })
  }
}
```

Et côté composant, on consomme sans `subscribe` manuel grâce au pipe `async` :

```ts
@Component({
  standalone: true,
  selector: 'app-user-list',
  imports: [AsyncPipe],
  template: `
    @for (user of users$ | async; track user.id) {
      <li>{{ user.name }}</li>
    }
  `,
})
export class UserListComponent {
  private service = inject(UserService)
  users$ = this.service.getUsers()
}
```

Points clés : les appels vivent dans le **service** (le composant ne connaît pas l'URL) ;
les réponses sont **typées** (`get<User[]>`, `post<User>`) ; `catchError` + `of([])`
évitent que l'UI plante ; le pipe `async` gère l'abonnement et le désabonnement.
