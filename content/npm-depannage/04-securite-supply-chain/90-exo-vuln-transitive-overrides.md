---
title: "Exercice — patcher une vulnérabilité transitive sans attendre l'amont"
type: exercise
---

> ⏱️ **Durée conseillée : ~15 min.**

## Énoncé

`npm audit` sur ton projet de production affiche :

```text
# npm audit report

minimist  <1.2.6
Severity: critical
Prototype Pollution in minimist
fix available via `npm audit fix`
node_modules/build-tool-cli/node_modules/mkdirp/node_modules/minimist

1 vulnerability (1 critical)
```

Tu lances `npm audit fix` : rien ne change, le rapport reste identique.

En creusant :

```bash
npm explain minimist
```

```text
minimist@1.2.5
node_modules/build-tool-cli/node_modules/mkdirp/node_modules/minimist
  minimist@"^1.2.5" from mkdirp@0.5.6
  node_modules/build-tool-cli/node_modules/mkdirp
    mkdirp@"^0.5.1" from build-tool-cli@3.2.0
    node_modules/build-tool-cli
      build-tool-cli@"^3.2.0" from the root project
```

Tu vérifies sur le registre npm : `build-tool-cli` n'a publié **aucune**
nouvelle version depuis 14 mois — le mainteneur ne semble plus actif.

**Questions :**

1. Pourquoi `npm audit fix` n'a rien corrigé ici ?
2. `build-tool-cli` est un **outil de développement**, jamais exécuté en
   production. Cela change-t-il l'urgence réelle du correctif ? Justifie.
3. Écris le fix qui force `minimist` à une version patchée dans toute
   l'arborescence, sans attendre `build-tool-cli`.
4. Que dois-tu vérifier **après** avoir appliqué ce fix ?

<!--correction-->

## Correction

**1. Pourquoi `npm audit fix` échoue**

`minimist` est une dépendance **transitive à trois niveaux**
(`build-tool-cli` → `mkdirp` → `minimist`). `npm audit fix` ne modifie que
ce qu'il peut résoudre en respectant les plages déclarées par les paquets
concernés — ici, ni `build-tool-cli` ni `mkdirp` n'ont publié de nouvelle
version qui embarquerait un `minimist` patché : il n'y a donc, du point de
vue de npm, **aucune mise à jour disponible** qui résoudrait le problème
dans le respect des contraintes existantes.

**2. L'urgence, en tenant compte du contexte**

Si `build-tool-cli` est réellement en `devDependencies` et n'est **jamais**
exécuté en production (juste un outil de build local/CI), le risque
d'exploitation en production est nul — mais **pas** le risque en CI/CD ou
sur les machines de développement, qui exécutent, elles, ce paquet. Une
vulnérabilité `critical` mérite un correctif rapide dans tous les cas :
l'absence de risque en production ne veut pas dire absence de risque tout
court. Vérifier avec `npm audit --omit=dev` permet de confirmer que la
vulnérabilité disparaît bien du rapport « périmètre production », sans
pour autant l'ignorer côté outillage de développement.

**3. Le fix : `overrides`, sans attendre `build-tool-cli`**

```json
{
  "name": "my-app",
  "devDependencies": {
    "build-tool-cli": "^3.2.0"
  },
  "overrides": {
    "minimist": "1.2.6"
  }
}
```

```bash
npm install    # forces EVERY instance of minimist in the tree to 1.2.6,
               # regardless of what build-tool-cli/mkdirp themselves declare
npm audit      # confirm: the critical vulnerability should be gone
```

> Ici, `overrides` cible directement `minimist` (sans imbrication sous un
> paquet précis) : cela force la version patchée **partout** où `minimist`
> apparaît dans l'arbre, peu importe par quel chemin il y est arrivé — le
> bon choix quand le paquet vulnérable est profondément transitif et que
> plusieurs chemins pourraient l'introduire.

**4. Ce qu'il faut vérifier après**

Que `build-tool-cli` fonctionne toujours correctement avec ce `minimist`
forcé : l'`override` garantit que npm **accepte** la résolution, pas que
`mkdirp`/`build-tool-cli` sont **réellement** compatibles avec cette version
précise. Relance la suite de build/CI complète avant de committer le fix,
exactement comme pour un fix de peer dependency (module 1).
