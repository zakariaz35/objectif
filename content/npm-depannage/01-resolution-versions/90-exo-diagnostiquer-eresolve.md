---
title: "Exercice — diagnostiquer et corriger un ERESOLVE"
type: exercise
---

> ⏱️ **Durée conseillée : ~15 min.**

## Énoncé

Tu récupères un projet existant. `npm install` échoue avec :

```text
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
npm ERR!
npm ERR! While resolving: shop-front@2.0.0
npm ERR! Found: date-fns@3.6.0
npm ERR! node_modules/date-fns
npm ERR!   date-fns@"^3.6.0" from the root project
npm ERR!
npm ERR! Could not resolve dependency:
npm ERR! peer date-fns@"^1.0.0 || ^2.0.0" from date-picker-widget@4.1.0
npm ERR! node_modules/date-picker-widget
npm ERR!   date-picker-widget@"^4.1.0" from the root project
npm ERR!
npm ERR! Fix the upstream dependency conflict, or retry
npm ERR! this command with --force or --legacy-peer-deps
npm ERR! to accept an incorrect (and potentially broken) dependency resolution.
```

Le `package.json` du projet contient :

```json
{
  "name": "shop-front",
  "version": "2.0.0",
  "dependencies": {
    "date-fns": "^3.6.0",
    "date-picker-widget": "^4.1.0"
  }
}
```

Un `npm outdated` révèle :

```text
$ npm outdated
Package             Current  Wanted  Latest  Location
date-picker-widget    4.1.0   4.1.0    4.1.0
```

(`Wanted` == `Latest` : il n'existe **aucune** version plus récente de
`date-picker-widget` — le mainteneur n'a donc, pour l'instant, pas publié de
support de `date-fns@3`.)

**Questions :**

1. Lis l'erreur : qui exige quoi, exactement ? Quelle commande utiliserais-tu
   pour confirmer, dans l'arbre installé, que `date-picker-widget` est bien
   le seul paquet en cause ?
2. Le projet est une application de production, maintenue en équipe, avec une
   CI qui exécute `npm ci`. Quel fix choisis-tu entre `--legacy-peer-deps` et
   `overrides` ? Justifie.
3. Écris le fix choisi (commande et/ou extrait de `package.json`).

<!--correction-->

## Correction

**1. Lire l'erreur et confirmer le diagnostic**

- `Found: date-fns@3.6.0` → c'est la version installée, voulue directement à
  la racine du projet.
- `Could not resolve dependency: peer date-fns@"^1.0.0 || ^2.0.0" from
  date-picker-widget@4.1.0` → `date-picker-widget` n'accepte que `date-fns`
  en version `1` ou `2`, jamais `3`.

Pour confirmer qu'aucun autre paquet n'est impliqué dans ce conflit précis :

```bash
npm explain date-picker-widget
```

qui remonterait la chaîne exacte : `date-picker-widget@"^4.1.0" from the root
project`, avec son `peer date-fns@"^1.0.0 || ^2.0.0"`.

**2. Quel fix choisir ?**

**`overrides`**, et non `--legacy-peer-deps` — pour trois raisons, propres à
ce contexte précis :

- C'est une **application de production, maintenue en équipe** : le fix doit
  être **visible et documenté** dans le `package.json` commité, pas caché
  derrière une option de commande ou un `.npmrc` que personne ne relira.
- La CI utilise `npm ci`, qui installe **strictement** ce que décrit
  `package-lock.json` — `overrides` s'y reflète naturellement une fois le
  lock régénéré ; pas besoin d'ajouter un flag particulier dans le pipeline.
- `npm outdated` a confirmé qu'**aucune mise à jour** de
  `date-picker-widget` n'existe encore : ce n'est donc pas un problème
  temporaire qu'une simple montée de version réglerait — le conflit va durer,
  et mérite un fix documenté plutôt qu'un contournement de commande à
  refaire mentalement à chaque `npm install`.

`--legacy-peer-deps` serait acceptable **uniquement** en dépannage ponctuel,
le temps de vérifier localement que `date-fns@3` fonctionne réellement avec
`date-picker-widget` — jamais comme réglage final en équipe.

**3. Le fix**

```json
{
  "name": "shop-front",
  "version": "2.0.0",
  "dependencies": {
    "date-fns": "^3.6.0",
    "date-picker-widget": "^4.1.0"
  },
  "overrides": {
    "date-picker-widget": {
      "date-fns": "$date-fns"
    }
  }
}
```

```bash
npm install    # re-resolves the tree; date-picker-widget now accepts the root's date-fns@3.6.0
```

> Après ce fix, teste manuellement les écrans qui utilisent
> `date-picker-widget` : l'`override` force npm à **accepter** la
> combinaison, il ne garantit pas que le composant fonctionne réellement avec
> `date-fns@3` s'il utilise en interne une fonction supprimée entre les deux
> versions majeures. C'est un fix de **résolution**, pas une garantie de
> **compatibilité runtime**.
