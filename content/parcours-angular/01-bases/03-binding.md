---
title: "Data binding : interpolation, propriétés, événements"
type: lesson
---

# Data binding

Le data binding relie la classe au template. Quatre formes à connaître, distinguées par leur **syntaxe** (accolades, crochets, parenthèses).

## 1. Interpolation `{{ }}` — afficher une valeur

```ts
@Component({
  standalone: true,
  selector: 'app-profile',
  template: `<p>{{ firstName }} — {{ age + 1 }} next year</p>`,
})
export class ProfileComponent {
  firstName = 'Ada'
  age = 36
}
```

L'expression entre `{{ }}` est évaluée et rendue en texte. On peut y mettre des opérations simples, pas des effets de bord.

## 2. Liaison de propriété `[prop]` — pousser une valeur vers le DOM

```html
<img [src]="avatarUrl" [alt]="firstName" />
<button [disabled]="isLoading">Save</button>
```

`[src]="avatarUrl"` lie la **propriété DOM** `src` à l'expression `avatarUrl`. Sans crochets, `src="avatarUrl"` passerait la chaîne littérale `"avatarUrl"`.

> Différence clé : `src="..."` = attribut HTML statique ; `[src]="..."` = valeur dynamique évaluée depuis la classe.

## 3. Liaison d'événement `(event)` — réagir à l'utilisateur

```ts
@Component({
  standalone: true,
  selector: 'app-counter',
  template: `<button (click)="increment()">Clicked {{ count }} times</button>`,
})
export class CounterComponent {
  count = 0
  increment(): void {
    this.count++
  }
}
```

`(click)="increment()"` appelle la méthode à chaque clic. On accède à l'événement natif via `$event` :

```html
<input (input)="onType($event)" />
```

```ts
onType(event: Event): void {
  const value = (event.target as HTMLInputElement).value
  console.log('typed:', value)
}
```

## 4. `[(ngModel)]` — liaison à double sens

Pour un champ de formulaire, on combine `[value]` et `(input)`. `[(ngModel)]` (« banana in a box ») fait les deux :

```ts
import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'

@Component({
  standalone: true,
  selector: 'app-search',
  imports: [FormsModule],          // ngModel lives in FormsModule
  template: `
    <input [(ngModel)]="query" placeholder="Search…" />
    <p>You typed: {{ query }}</p>
  `,
})
export class SearchComponent {
  query = ''
}
```

L'input écrit dans `query` à la frappe, et toute mise à jour de `query` se reflète dans l'input. Il faut importer `FormsModule`.

> **À retenir —** mnémo des syntaxes : `{{ }}` affiche, `[ ]` entre (donnée → vue), `( )` sort (événement → classe), `[( )]` les deux. Les crochets/parenthèses oubliés sont l'erreur n°1 des débutants.
