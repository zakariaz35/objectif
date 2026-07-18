---
title: "Peer dependencies et l'erreur ERESOLVE"
type: lesson
---

## Qu'est-ce qu'une peer dependency ?

Une dépendance classique (`dependencies`) dit : « installe-moi ce paquet, je
m'en sers en interne ». Une **peer dependency** dit autre chose : « je ne
m'installe pas moi-même cette dépendance, mais **toi**, l'application qui
m'utilises, tu dois **déjà** en avoir une version compatible ».

C'est typique des paquets conçus pour s'insérer dans un « hôte » unique :
un plugin ESLint qui a besoin d'ESLint, une bibliothèque de composants qui a
besoin de React ou de Vue. Le but : éviter d'installer **deux copies** d'une
bibliothèque « singleton » (deux React différents dans le même
`node_modules/` cassent les Hooks, deux ESLint différents chargent des
règles incohérentes).

```json
// ui-kit-legacy's own package.json (a dependency you installed)
{
  "name": "ui-kit-legacy",
  "version": "2.3.1",
  "peerDependencies": {
    "react": "^16.8.0 || ^17.0.0"
  }
}
```

> **Passerelle Composer.** Composer n'a pas de concept dédié équivalent : le
> plus proche serait un `require` normal côté paquet, combiné à la
> résolution globale qui, de toute façon, refuse déjà les contraintes
> incompatibles. npm, lui, a dû inventer une catégorie à part parce qu'il
> **tolère** plusieurs versions d'un même paquet dans l'arbre — sauf
> justement pour ces bibliothèques « singleton » où ça n'a pas de sens.

## Le tournant npm 7 : d'un simple avertissement à une erreur bloquante

- **Avant npm 7** (donc en npm 6 et avant) : une peer dependency non
  satisfaite ne produisait qu'un **avertissement** (`npm WARN`) — l'install
  continuait quand même.
- **Depuis npm 7** (2020, toujours en vigueur en npm 10/11) : npm
  **installe automatiquement** les peer dependencies manquantes, **et**
  **bloque** l'installation si deux paquets exigent des versions
  incompatibles d'un même peer.

C'est ce changement de comportement — pas un bug — qui fait apparaître
`ERESOLVE` dans des projets qui « marchaient très bien avant ».

## L'erreur, décortiquée

```text
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
npm ERR!
npm ERR! While resolving: my-app@1.0.0
npm ERR! Found: react@18.2.0
npm ERR! node_modules/react
npm ERR!   react@"^18.2.0" from the root project
npm ERR!
npm ERR! Could not resolve dependency:
npm ERR! peer react@"^16.8.0 || ^17.0.0" from ui-kit-legacy@2.3.1
npm ERR! node_modules/ui-kit-legacy
npm ERR!   ui-kit-legacy@"^2.3.1" from the root project
npm ERR!
npm ERR! Fix the upstream dependency conflict, or retry
npm ERR! this command with --force or --legacy-peer-deps
npm ERR! to accept an incorrect (and potentially broken) dependency resolution.
npm ERR!
npm ERR! See /home/user/.npm/_logs/2026-01-15T09_12_03_412Z-eresolve-report.txt for a full report.
```

Se lit en deux blocs, dans l'ordre :

1. **`Found:`** — ce qui est *réellement* installé (ou demandé à la racine) :
   ici `react@18.2.0`, voulu directement par `my-app`.
2. **`Could not resolve dependency:`** — ce qui *voudrait* une autre version :
   ici `ui-kit-legacy@2.3.1` exige un `peer react` en `16` ou `17`, incompatible
   avec le `18.2.0` déjà présent.

> 💡 **À retenir.** npm ne te dit jamais « c'est cassé », il te dit très
> précisément **qui** veut **quoi** — l'erreur ERESOLVE contient toujours
> assez d'information pour identifier le paquet fautif, à condition de la lire
> jusqu'au bout au lieu de la copier directement dans un moteur de recherche.

## Diagnostiquer sans deviner : `npm ls` et `npm explain`

Avant de corriger n'importe quoi, confirme le diagnostic.

```bash
# Where is react installed, and who requires which range?
npm ls react
```

```text
my-app@1.0.0
├─┬ react-dom@18.2.0
│ └── react@18.2.0 deduped
├── react@18.2.0
└─┬ ui-kit-legacy@2.3.1
  └── react@18.2.0 invalid: "^16.8.0 || ^17.0.0" from node_modules/ui-kit-legacy
```

La ligne `invalid: "..."` est explicite : `ui-kit-legacy` a bien reçu une
version de `react`, mais elle est **hors de sa plage acceptée**.

```bash
# WHY is ui-kit-legacy even in the tree, and what does it require?
npm explain ui-kit-legacy
```

```text
ui-kit-legacy@2.3.1
node_modules/ui-kit-legacy
  ui-kit-legacy@"^2.3.1" from the root project
  peer react@"^16.8.0 || ^17.0.0" from the root project
```

> **Réflexe à prendre.** `npm explain <pkg>` (alias `npm why <pkg>`, depuis
> npm 7) répond exactement à la question « pourquoi ce paquet est-il
> présent, et par quelle chaîne de dépendances ? » — c'est le premier réflexe
> avant de choisir un fix, en particulier quand le paquet en cause est une
> dépendance **transitive** que tu n'as jamais installée toi-même.

## À retenir

- Une **peer dependency** signale « j'ai besoin que TOI, l'appli hôte, aies
  déjà telle version » — pensée pour les bibliothèques singleton (React,
  ESLint...).
- **Depuis npm 7**, un conflit de peer dependency est **bloquant**
  (`ERESOLVE`), alors qu'avant npm 7 ce n'était qu'un avertissement.
- Lis l'erreur en deux temps : `Found:` (ce qui est installé) vs
  `Could not resolve dependency:` (ce qui est exigé ailleurs, et par qui).
- `npm ls <pkg>` localise le conflit dans l'arbre ; `npm explain <pkg>`
  (= `npm why`) remonte la chaîne de dépendances qui a amené le paquet là.
