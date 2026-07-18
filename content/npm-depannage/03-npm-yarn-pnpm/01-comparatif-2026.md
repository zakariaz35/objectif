---
title: "npm, yarn, pnpm : la vraie comparaison en 2026"
type: lesson
---

Trois gestionnaires cohabitent aujourd'hui dans l'écosystème JS — mais « yarn »
recouvre en réalité **deux outils très différents**, et pnpm a une
architecture à part. Voici l'état des lieux honnête, pas la légende
qui circule encore ("yarn est plus rapide", vraie il y a dix ans, plus
vraiment aujourd'hui).

## npm

Le gestionnaire **livré avec Node.js** — zéro installation supplémentaire.
Résolution stricte des peer dependencies depuis la version 7 (voir module 1),
`node_modules/` classique (aplati autant que possible, imbriqué en dernier
recours), `overrides` pour les fix chirurgicaux, `npm audit` intégré.

## Yarn classic (v1) : gelé, pas mort

> ⚠️ **Erreur fréquente — croire que "yarn" est un seul outil cohérent.**
> **Yarn classic (v1.22.x)** est **gelé** depuis plusieurs années : plus de
> nouvelles fonctionnalités, maintenance minimale. Il reste largement présent
> dans des projets legacy (et fonctionne toujours), mais **ne bloque jamais**
> sur les peer dependencies (voir l'étude de cas du module 1) — un choix de
> conception d'une autre époque, pas un avantage.

## Yarn Berry (v2, v3, v4) : une autre architecture

**Yarn Berry** (invoqué via `corepack`, configuré par `.yarnrc.yml`) est une
réécriture complète, sans rapport de comportement avec la v1 :

- **Plug'n'Play (PnP)** par défaut : pas de `node_modules/` du tout. La
  résolution se fait via un fichier généré `.pnp.cjs` et un cache de paquets
  compressés (`.yarn/cache`) — résolution **stricte** par construction
  (un paquet ne peut physiquement pas accéder à une dépendance non déclarée).
- `nodeLinker: node-modules` disponible en option, pour retrouver un
  `node_modules/` classique si l'outillage du projet l'exige encore.
- Workspaces natifs, pensés pour le monorepo dès l'origine.

## pnpm : le store partagé et les dépendances fantômes tuées dans l'œuf

**pnpm** ne duplique jamais un paquet sur le disque : chaque version d'un
paquet vit **une seule fois** dans un store global (par défaut
`~/.local/share/pnpm/store` ou équivalent selon l'OS), et chaque projet y
accède par des liens (symlinks/hardlinks). Résultat : entre plusieurs
projets utilisant `react@18.2.0`, une **seule** copie physique sur le disque.

`node_modules/` reste présent, mais **n'est pas plat** : chaque paquet ne
voit, par symlink, que ses **propres** dépendances déclarées — jamais celles
d'un paquet voisin simplement « remontées » (hoistées) dans l'arbre.

> 💡 **À retenir — les dépendances fantômes.** Avec npm/yarn classique
> (`node_modules/` aplati), un paquet peut accidentellement `require()` une
> dépendance qu'il n'a **jamais déclarée**, simplement parce qu'un autre
> paquet l'a fait remonter au même niveau. Ça fonctionne... jusqu'au jour où
> ce paquet voisin est retiré, et où l'import casse sans que rien dans TON
> `package.json` n'ait changé. pnpm rend ce scénario **structurellement
> impossible** : sans lien symbolique déclaré, le `require()` échoue
> immédiatement, à l'installation ou au premier lancement — pas six mois
> plus tard en production.

Depuis pnpm 8, les peer dependencies sont **auto-installées par défaut**
(`auto-install-peers=true`), avec une résolution aussi stricte que npm 7+ —
simplement avec des messages d'erreur différents.

## Le tableau comparatif

| | npm | Yarn classic (v1) | Yarn Berry (PnP) | pnpm |
|---|---|---|---|---|
| Résolution peer deps | stricte (npm 7+) | permissive (warning seulement) | stricte | stricte |
| Vitesse | correcte | correcte | rapide | **très rapide** (store partagé) |
| Disque (plusieurs projets) | une copie par projet | une copie par projet | cache compressé partagé | **une seule copie physique**, partagée |
| Monorepo / workspaces | supporté (basique) | limité | natif, avancé | natif, avancé |
| Dépendances fantômes | possibles (arbre aplati) | possibles | **impossibles** (PnP) | **impossibles** (non-aplati) |
| Statut 2026 | actif, par défaut | **gelé** | actif | actif, en forte croissance |

## À retenir

- « Yarn » désigne deux outils incompatibles en comportement : **classic
  (v1, gelé)** et **Berry (v2+, architecture PnP)** — ne pas les confondre.
- **pnpm** élimine les dépendances fantômes **par construction** (chaque
  paquet ne voit que ses propres dépendances déclarées) et partage un store
  unique entre tous tes projets — gain de disque et de vitesse réels.
- Les trois outils modernes (npm 7+, Yarn Berry, pnpm) appliquent désormais
  une résolution **stricte** des peer dependencies — seul yarn classic (v1)
  fait encore exception.
