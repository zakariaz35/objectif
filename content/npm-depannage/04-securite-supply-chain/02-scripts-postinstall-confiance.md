---
title: "Scripts postinstall, confiance dans les paquets, et npm ci en CI"
type: lesson
---

## Les scripts de cycle de vie : pratiques, mais un vecteur d'attaque réel

Un paquet npm peut déclarer des scripts qui s'exécutent **automatiquement**
à l'installation :

```json
{
  "scripts": {
    "preinstall": "...",
    "install": "...",
    "postinstall": "node scripts/build-native-bindings.js"
  }
}
```

Usage légitime fréquent : compiler un module natif (liaison C++ via
`node-gyp`), générer un fichier de configuration, télécharger un binaire
propre à la plateforme. Mais **rien** n'empêche un script malveillant de
faire la même chose pour, par exemple, exfiltrer des variables
d'environnement (souvent des secrets de CI/CD) ou installer une porte
dérobée — **au moment même de `npm install`**, avant même que ton code
n'ait été exécuté une seule fois.

> ⚠️ **Erreur fréquente — sous-estimer le risque parce qu'"on n'a jamais eu
> de souci".** L'écosystème npm a connu plusieurs incidents réels de ce
> type : un paquet légitime, très largement utilisé depuis des années,
> compromis via le compte d'un mainteneur piraté (phishing, jeton volé), qui
> publie une nouvelle version injectant du code malveillant dans un script
> `postinstall`. Le paquet reste, en apparence, le même que celui que toute
> l'équipe utilise depuis toujours — c'est justement ce qui rend ces
> attaques efficaces.

## `--ignore-scripts` : un compromis, pas un réflexe automatique

```bash
npm install --ignore-scripts     # skip ALL lifecycle scripts for this install
```

```ini
; .npmrc — disable scripts for every install on this machine/CI
ignore-scripts=true
```

> **Réflexe à prendre — un compromis, pas une solution magique.**
> `--ignore-scripts` réduit la surface d'attaque, mais **casse aussi** les
> paquets qui ont **légitimement** besoin d'un `postinstall` (compilation
> native, téléchargement de binaire). Ce n'est pas un réglage à activer
> partout sans vérifier : utile en **audit ponctuel** d'une dépendance
> inconnue avant de lui faire confiance, ou dans un environnement où tu sais
> à l'avance qu'aucun script légitime n'est nécessaire.

## Faire confiance à un paquet : les signaux à vérifier

```bash
npm view <pkg>              # metadata: maintainers, repository, publish dates, versions
npm view <pkg> maintainers   # who can publish a new version?
```

Signaux d'alerte pour un paquet inconnu, avant de l'ajouter :

- **Typosquatting** : un nom presque identique à un paquet très populaire
  (`cross-env` vs `crossenv`, `event-stream` vs des variantes proches) —
  vérifie toujours le nom **caractère par caractère** avant `npm install`.
- Nombre de téléchargements hebdomadaires anormalement bas pour un paquet
  qui prétend remplacer un standard largement utilisé.
- Dépôt Git introuvable, ou très récent, sans historique cohérent avec le
  nombre de versions publiées.
- Un `postinstall` qui fait autre chose qu'une compilation/génération
  attendue (à inspecter directement dans `node_modules/<pkg>/package.json`
  et le script visé, si un doute existe).

**Télémétrie** : certains outils CLI légitimes envoient des statistiques
d'usage anonymisées par défaut (souvent désactivable via une variable
d'environnement ou un flag) — pas malveillant en soi, mais à connaître
avant de l'introduire dans un environnement sensible (données internes,
projet sous contrainte réglementaire).

## `npm ci` en CI : un contrôle de sécurité, pas juste de la performance

> 💡 **À retenir.** `npm ci` (module 2) a aussi un rôle de sécurité : en
> installant **exactement** ce que le lockfile décrit, il empêche qu'une
> nouvelle version d'une dépendance (même dans la plage semver autorisée)
> se retrouve installée **sans avoir été relue** — un `npm install` classique
> pourrait, lui, tirer une version publiée entre-temps, jamais vue par
> l'équipe. C'est ce qu'on appelle réduire le risque de **drift de supply
> chain**.

> **Passerelle Composer.** Le réflexe est identique côté PHP : `composer
> install` (piloté par `composer.lock`) plutôt qu'un `composer update`
> sauvage en CI, combiné à `composer audit` en pipeline — le principe
> commun aux deux écosystèmes reste : **déterminisme d'abord, vérification
> automatisée ensuite**.

## À retenir

- Les scripts `postinstall` s'exécutent **automatiquement**, avant même que
  ton code ne tourne — un vecteur d'attaque réel, pas théorique
  (incidents documentés de mainteneurs compromis).
- `--ignore-scripts` réduit le risque mais casse les paquets qui en ont
  légitimement besoin (bindings natifs) — à utiliser en audit ponctuel, pas
  en réglage par défaut sans vérification.
- Vérifie un paquet inconnu avant de l'ajouter : nom exact
  (typosquatting), dépôt, mainteneurs, popularité réelle (`npm view <pkg>`).
- `npm ci` en CI n'est pas qu'une question de vitesse : c'est un vrai
  contrôle contre le drift de supply chain — combine-le à `npm audit`
  (`--audit-level=high`) dans la pipeline.
