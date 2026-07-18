---
title: "npm audit : lire le rapport, et patcher une vulnérabilité transitive"
type: lesson
---

## Lire un rapport `npm audit`

```bash
npm audit
```

```text
# npm audit report

semver-regex  <3.1.4
Severity: high
Denial of Service in semver-regex
fix available via `npm audit fix`
node_modules/old-cli-tool/node_modules/semver-regex

json5  <1.0.2
Severity: moderate
Prototype Pollution in json5
fix available via `npm audit fix --force`
Will install webpack@5.91.0, which is a breaking change
node_modules/webpack/node_modules/json5

2 vulnerabilities (1 moderate, 1 high)
```

Chaque entrée indique : le paquet et la plage vulnérable, la **sévérité**
(`low` / `moderate` / `high` / `critical`), une description courte, et
surtout le **chemin** dans l'arbre (`node_modules/old-cli-tool/node_modules/
semver-regex`) — ce chemin te dit immédiatement si la vulnérabilité est
**directe** (chez toi) ou **transitive** (chez une dépendance d'une
dépendance).

> **Passerelle Composer.** Équivalent direct de `composer audit` (basé sur
> l'**Advisory Database de Packagist**) : `npm audit` s'appuie, lui, sur la
> **GitHub Advisory Database**. Même logique dans les deux écosystèmes : une
> vérification automatisée, à intégrer en CI, pas seulement lancée
> manuellement de temps en temps.

## `npm audit fix` : ce qu'il corrige, et ce qu'il ne peut pas

```bash
npm audit fix           # upgrades within existing semver ranges only -- never breaking
npm audit fix --force   # MAY bump a MAJOR version -- review the diff carefully before committing
npm audit --omit=dev    # only check production dependencies (skip devDependencies)
```

> ⚠️ **Erreur fréquente — lancer `npm audit fix --force` en pipeline sans
> relecture.** Le `--force` peut faire monter une dépendance de **MAJOR**,
> potentiellement breaking. En CI automatisée, préfère `npm audit fix` (sans
> `--force`) et traite les vulnérabilités qui exigeraient un breaking change
> comme une tâche **manuelle**, avec relecture du changelog du paquet
> concerné.

## Le vrai problème : la vulnérabilité transitive que le mainteneur direct n'a pas encore corrigée

Le cas fréquent : `webpack` (que tu utilises directement) dépend de `json5`
en version vulnérable — mais la dernière version de `webpack` publiée sur
npm n'a **pas encore** mis à jour cette dépendance interne. `npm audit fix`
ne peut alors rien faire : il ne touche pas aux dépendances internes d'un
paquet que tu ne contrôles pas.

**La solution : forcer la version patchée via `overrides`, sans attendre
l'amont.**

```json
{
  "name": "my-app",
  "dependencies": {
    "webpack": "^5.90.0"
  },
  "overrides": {
    "webpack": {
      "json5": "1.0.2"
    }
  }
}
```

```bash
npm install    # webpack now uses json5@1.0.2 internally, even though webpack's
               # own package.json still declares an older, vulnerable range
npm audit      # confirm: the vulnerability should now disappear from the report
```

> 💡 **À retenir.** `overrides` fonctionne pour la sécurité exactement comme
> pour un conflit de peer dependency (module 1) : il force une version
> **dans toute l'arborescence**, y compris chez des dépendances que tu n'as
> jamais installées directement. C'est l'outil qui permet de ne **jamais**
> être bloqué en attendant qu'un mainteneur tiers publie son propre patch.
> Reteste toujours après (le paquet forcé peut, en théorie, ne pas être
> parfaitement rétrocompatible avec ce que `webpack` attendait).

## `npm audit signatures` : au-delà des CVE connues

```bash
npm audit signatures
```

Depuis npm 9.5, cette commande vérifie que les paquets installés
correspondent bien aux **signatures/provenance** enregistrées sur le
registre npm — une vérification différente de `npm audit` classique (qui ne
regarde qu'une base de CVE connues). Elle détecte une falsification qu'aucune
CVE ne référence encore.

## À retenir

- `npm audit` compare l'arbre installé à la GitHub Advisory Database ;
  `npm audit fix` corrige sans casser les plages semver, `--force` peut
  casser un MAJOR — à relire, jamais à automatiser sans contrôle.
- `npm audit --omit=dev` : ne vérifie que ce qui tourne réellement en
  production.
- Une vulnérabilité **transitive** que le mainteneur direct n'a pas encore
  patchée se corrige avec `overrides` — sans attendre sa publication.
- `npm audit signatures` (npm 9.5+) vérifie la provenance des paquets,
  au-delà des seules CVE connues.
