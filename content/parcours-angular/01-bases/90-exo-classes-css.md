---
title: "Exercice — construire une chaîne de classes CSS (TS)"
type: exercise
exercise:
  language: ts
  starter: |
    interface BadgeState {
      active: boolean
      disabled: boolean
      size: 'sm' | 'md' | 'lg'
    }

    // Build the CSS class string a template would bind with [ngClass].
    // Rules:
    //   - always start with "badge"
    //   - add "badge--active" when active is true
    //   - add "badge--disabled" when disabled is true
    //   - always add "badge--<size>" (e.g. "badge--md")
    // Order: badge, active, disabled, size. Join with a single space.
    function buildClasses(state: BadgeState): string {
      // TODO: implement
      return ''
    }
  tests:
    - name: "actif, taille md"
      code: |
        const state: BadgeState = { active: true, disabled: false, size: 'md' }
        const result = buildClasses(state)
        console.log('state  :', state)
        console.log('result :', result)
        assertEqual(result, 'badge badge--active badge--md', 'active + size only')
    - name: "désactivé, taille lg"
      code: |
        const result = buildClasses({ active: false, disabled: true, size: 'lg' })
        console.log('result :', result)
        assertEqual(result, 'badge badge--disabled badge--lg', 'disabled + size only')
    - name: "état neutre, taille sm"
      code: |
        assertEqual(
          buildClasses({ active: false, disabled: false, size: 'sm' }),
          'badge badge--sm',
          'only base class and size'
        )
---

## Énoncé

Dans un template Angular on écrit souvent `[ngClass]="..."` pour appliquer des classes
CSS conditionnellement. Ici, on isole cette **logique pure** dans une fonction TypeScript :
elle est testable et **réellement exécutée** (transpilée en JS).

Complète `buildClasses` pour qu'elle assemble la chaîne de classes selon les règles
décrites dans le `starter`. L'ordre des classes compte.

Indice : pousse les morceaux dans un tableau, puis `array.join(' ')`.

<!--correction-->

## Correction

```ts
function buildClasses(state: BadgeState): string {
  const classes: string[] = ['badge']
  if (state.active) classes.push('badge--active')
  if (state.disabled) classes.push('badge--disabled')
  classes.push(`badge--${state.size}`)
  return classes.join(' ')
}
```

On accumule les classes dans un tableau (l'ordre est garanti), puis on les joint avec un
espace. Le typage (`BadgeState` → `string`, `size` en union littérale) documente
l'intention et fait que l'éditeur **autocomplète** les valeurs valides de `size`.
