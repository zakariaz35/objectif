---
title: "Le composant & @Component"
type: lesson
---

# Le composant : `@Component`

Un composant Angular, c'est une **classe TypeScript** décorée par `@Component`. Le décorateur attache des métadonnées (le sélecteur, le template, les styles) à la classe.

```ts
import { Component } from '@angular/core'

@Component({
  selector: 'app-greeting',        // used as <app-greeting></app-greeting>
  standalone: true,                // no NgModule needed (Angular 17+ default)
  template: `<h1>Hello, {{ name }}!</h1>`,
  styles: [`h1 { color: teal; }`],
})
export class GreetingComponent {
  name = 'Angular'
}
```

- `selector` : le nom de la balise HTML qui instancie le composant.
- `standalone: true` : le composant se suffit à lui-même (plus besoin de `NgModule`). C'est la norme depuis Angular 17.
- `template` : le HTML, inline (backticks) ou dans un fichier via `templateUrl`.
- La **classe** porte l'état (`name`) et la logique. Tout ce qui est `public` dans la classe est accessible depuis le template.

## Template inline vs fichier séparé

Pour un composant qui grossit, on sort le HTML et le CSS dans leurs propres fichiers :

```ts
@Component({
  selector: 'app-greeting',
  standalone: true,
  templateUrl: './greeting.component.html',
  styleUrl: './greeting.component.css',
})
export class GreetingComponent {
  name = 'Angular'
}
```

## Cycle de vie : `ngOnInit`

Angular appelle des **hooks** à des moments clés. Le plus courant est `ngOnInit`, exécuté une fois après l'initialisation des données du composant — l'endroit idéal pour charger des données.

```ts
import { Component, OnInit } from '@angular/core'

@Component({ /* ... */ })
export class GreetingComponent implements OnInit {
  name = ''

  ngOnInit(): void {
    // runs once, after Angular has set up the component
    this.name = 'Angular'
  }
}
```

```mermaid
flowchart LR
  A[constructor] --> B[ngOnInit]
  B --> C[rendu + interactions]
  C --> D[ngOnDestroy]
```

> **À retenir —** un composant = une **classe** + le décorateur `@Component`. Le constructeur sert à l'injection de dépendances (étape 2) ; le **chargement de données** va dans `ngOnInit`, pas dans le constructeur. Pense `standalone` par défaut.
