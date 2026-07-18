---
title: "dependencies vs devDependencies, et la sécurité"
type: lesson
---

## `dependencies` vs `devDependencies`

```json
{
  "dependencies": {
    "express": "^4.19.0"
  },
  "devDependencies": {
    "eslint": "^9.0.0",
    "vitest": "^2.0.0"
  }
}
```

- **`dependencies`** : nécessaires pour **faire tourner** l'application en
  production (`express`, un ORM, un client HTTP...).
- **`devDependencies`** : nécessaires uniquement pendant le
  **développement** (linter, outils de test, bundler...) — jamais exécutées
  en production.

```bash
npm install                    # installs BOTH dependencies and devDependencies
npm install --omit=dev         # installs ONLY dependencies (typical for production images)
```

> **Passerelle Composer.** Correspondance directe : `dependencies` ≈
> `require`, `devDependencies` ≈ `require-dev`. Même réflexe de production :
> `composer install --no-dev` ↔ `npm install --omit=dev` — n'installer, dans
> l'image de production, que ce qui est **réellement** nécessaire à
> l'exécution (image plus légère, surface d'attaque réduite).

> ⚠️ **Erreur fréquente — mettre un paquet de production dans
> `devDependencies` par erreur.** Si un Dockerfile de production fait
> `npm install --omit=dev`, un paquet utilisé par le code applicatif mais
> déclaré (par erreur) en `devDependencies` sera **absent** en production —
> une erreur `Cannot find module` qui ne se manifeste **que** dans cet
> environnement, jamais en développement local.

## `npm audit` : détecter les vulnérabilités connues

```bash
npm audit
```

```text
# 3 vulnerabilities (1 moderate, 2 high)

lodash  <4.17.21
Severity: high
Prototype Pollution in lodash
fix available via `npm audit fix`

To address all issues, run:
  npm audit fix
```

`npm audit` compare les versions installées à une base de données de
vulnérabilités connues (CVE) et signale les paquets concernés, avec leur
sévérité.

```bash
npm audit fix          # attempts to automatically upgrade to a PATCHED version,
                        # WITHOUT breaking semver ranges already declared
npm audit fix --force  # may bump MAJOR versions too — riskier, review carefully
```

> **Passerelle Composer.** Équivalent de `composer audit` (ou d'un outil
> comme Symfony Security Checker/Roave Security Advisories) : une vérification
> **automatisée** des dépendances contre une base de vulnérabilités connues,
> à intégrer en CI plutôt qu'à lancer seulement de façon ponctuelle.

> **Réflexe à prendre.** Intègre `npm audit --audit-level=high` (ou
> équivalent) dans ta pipeline CI, pour **bloquer** un déploiement en cas de
> vulnérabilité critique nouvellement détectée — ne laisse pas cette
> vérification dépendre d'une exécution manuelle occasionnelle.

## `node_modules/` : ce que Composer ne fait pas

Contrairement à `vendor/` (Composer, un dossier plat par paquet), historique­
ment `node_modules/` pouvait imbriquer des copies multiples d'une même
dépendance à des versions différentes (chaque paquet ayant son propre
`node_modules/` interne si nécessaire) — pour résoudre des conflits de
versions entre dépendances transitives. Les versions modernes de npm
**aplatissent** autant que possible cette arborescence (une seule copie
partagée quand c'est compatible), mais gardent cette capacité d'imbrication
en dernier recours.

> 💡 **À retenir.** C'est une différence structurelle avec Composer/PSR-4,
> où un conflit de version entre deux dépendances **ne peut généralement pas
> se résoudre silencieusement** (Composer refuse l'installation si les
> contraintes sont incompatibles). npm, lui, peut installer **plusieurs
> versions différentes** d'un même paquet simultanément, imbriquées dans
> l'arborescence — une souplesse qui a aussi son revers (poids disque, plus
> difficile à raisonner).

## À retenir

- **`dependencies`** (nécessaires en production) vs **`devDependencies`**
  (outils de développement uniquement) ≈ `require`/`require-dev` Composer.
- `npm install --omit=dev` en production : n'installe que le strict
  nécessaire à l'exécution.
- `npm audit` détecte les vulnérabilités connues ; `npm audit fix` corrige ce
  qui peut l'être sans casser les plages semver déclarées — à intégrer en CI.
- `node_modules/` peut imbriquer plusieurs versions d'un même paquet
  (résolution de conflits), contrairement au modèle plus strict de Composer.
