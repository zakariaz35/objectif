---
title: "Exercice — « ça marche chez moi » : deux lockfiles dans le même dépôt"
type: exercise
---

> ⏱️ **Durée conseillée : ~10 min.**

## Énoncé

Tu rejoins une équipe sur un projet existant. `git ls-files` à la racine du
dépôt montre :

```text
package.json
package-lock.json
yarn.lock
src/index.js
...
```

Un collègue t'explique : « Ah oui, moi j'utilise toujours `yarn install`,
ça marche très bien chez moi. La CI, elle, utilise `npm ci` — je crois qu'il
y a eu un souci une fois mais on a fini par débloquer en relançant le job. »

Deux semaines plus tard, la CI échoue de façon intermittente : un
`npm ci` réussit un jour, échoue le lendemain sur une erreur de résolution
différente à chaque fois — sans qu'aucun commit ne touche `package.json`.

**Questions :**

1. Pourquoi la présence simultanée de `package-lock.json` **et** `yarn.lock`
   explique, à elle seule, ce comportement erratique ?
2. Propose un plan de correction en 4 étapes, dans l'ordre.
3. Propose une mesure qui **empêche mécaniquement** la récidive (pas juste
   « en parler en réunion d'équipe »).

<!--correction-->

## Correction

**1. Pourquoi c'est instable**

`package-lock.json` (résolu par npm) et `yarn.lock` (résolu par yarn)
décrivent chacun **leur propre** vision de l'arbre de dépendances — ils ne
sont **pas** garantis de rester synchronisés dès qu'un des deux outils
tourne seul (le collègue qui lance `yarn install` régulièrement fait
évoluer `yarn.lock`, sans jamais toucher `package-lock.json`, et
inversement). La CI, en lisant `package-lock.json` avec `npm ci`, peut
récupérer une résolution différente de celle réellement testée en local avec
`yarn` — d'où des échecs qui semblent aléatoires, alors qu'ils dépendent en
réalité de **quel lockfile a été régénéré en dernier**, et par qui.

**2. Plan de correction**

```bash
# Step 1: pick ONE manager as the project standard (here: npm, since the CI already uses it)
rm -rf node_modules yarn.lock

# Step 2: make sure package-lock.json is fully in sync with the current package.json
npm install

# Step 3: verify exactly one lockfile remains tracked by git
git ls-files | grep -E 'package-lock\.json|yarn\.lock|pnpm-lock\.yaml'
# -> only package-lock.json should be listed

# Step 4: commit the cleanup
git add -A
git commit -m "chore: standardize on npm, remove yarn.lock"
```

**3. Empêcher la récidive mécaniquement**

Ajouter un script `preinstall` qui bloque tout autre gestionnaire que celui
choisi, avec `only-allow` :

```json
{
  "scripts": {
    "preinstall": "npx only-allow npm"
  }
}
```

Si le collègue tape `yarn install` par habitude, la commande **échoue**
immédiatement avec un message explicite — plutôt que de régénérer
silencieusement un `yarn.lock` qui recréerait le même problème. On peut
compléter avec le champ `"packageManager": "npm@10.x.x"` (Corepack) pour
documenter la version exacte attendue.
