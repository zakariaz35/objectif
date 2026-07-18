---
title: "Exercice — construire une chaîne de classes CSS (TS)"
type: exercise
exercise:
  language: ts
  starter: |
    interface BadgeProps {
      variant: 'primary' | 'danger' | 'warning'
      size: 'sm' | 'md' | 'lg'
      outlined: boolean
    }

    // Build the CSS class string you would pass to className in JSX.
    // Rules (order matters):
    //   - always start with "badge"
    //   - add "badge--<variant>" (e.g. "badge--primary")
    //   - add "badge--<size>"    (e.g. "badge--md")
    //   - add "badge--outlined"  only when outlined is true
    // Join with a single space.
    function buildClasses(props: BadgeProps): string {
      // TODO: implement
      return ''
    }
  tests:
    - name: "primary, md, non outlined"
      code: |
        const result = buildClasses({ variant: 'primary', size: 'md', outlined: false })
        console.log('result :', result)
        assertEqual(result, 'badge badge--primary badge--md', 'base case')
    - name: "danger, lg, outlined"
      code: |
        const result = buildClasses({ variant: 'danger', size: 'lg', outlined: true })
        console.log('result :', result)
        assertEqual(result, 'badge badge--danger badge--lg badge--outlined', 'outlined case')
    - name: "warning, sm, outlined"
      code: |
        assertEqual(
          buildClasses({ variant: 'warning', size: 'sm', outlined: true }),
          'badge badge--warning badge--sm badge--outlined',
          'all modifiers'
        )
---

## Énoncé

En React, `className` reçoit une **chaîne de classes CSS** assemblée dynamiquement à
partir des props du composant. Ici on isole cette logique dans une fonction pure
TypeScript — testable et lisible.

Complète `buildClasses` pour assembler la chaîne selon les règles décrites dans le
`starter`. L'**ordre** des classes est important (les tests le vérifient).

Indice : pousse les morceaux dans un tableau et rejoins avec `join(' ')`.

<!--correction-->

## Correction

```ts
function buildClasses(props: BadgeProps): string {
  const classes: string[] = ['badge']
  classes.push(`badge--${props.variant}`)
  classes.push(`badge--${props.size}`)
  if (props.outlined) classes.push('badge--outlined')
  return classes.join(' ')
}
```

On accumule les classes dans un tableau dans le bon ordre, puis on joint avec un espace.
Le typage en **unions littérales** (`'primary' | 'danger' | 'warning'`) fait que
TypeScript refuse toute valeur invalide — exactement ce qu'on voudrait dans un système
de design.
