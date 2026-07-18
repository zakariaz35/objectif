---
title: "Le cache npm, et purger node_modules proprement"
type: lesson
---

## Le cache npm : ce qu'il contient vraiment

npm garde en cache local (par défaut `~/.npm/_cacache`, chemin exact
consultable avec `npm config get cache`) les tarballs déjà téléchargés et
leurs métadonnées — pour réinstaller sans retélécharger, voire fonctionner
partiellement hors ligne.

```bash
npm config get cache        # shows the cache folder path on this machine
npm cache verify             # checks cache integrity, reports size and item count
```

```text
$ npm cache verify
Cache verified and compressed (~/.npm/_cacache)
Content verified: 1842 (67213345 bytes)
Index entries: 2103
Finished in 1.204s
```

## Quand vider le cache — et comment

Un cache corrompu (interruption réseau pendant un téléchargement, disque
plein) peut produire des erreurs d'intégrité au moment de l'installation :

```text
npm ERR! code EINTEGRITY
npm ERR! sha512-K7EZ... integrity checksum failed when using sha512:
npm ERR! Expected: sha512-K7EZ...
npm ERR! Actual:   sha512-9fA2...
```

```bash
npm cache clean --force    # wipes the ENTIRE cache
                            # --force is required since npm 5: this command
                            # is destructive on purpose, not a routine habit
```

> ⚠️ **Erreur fréquente — vider le cache "au cas où", en réflexe
> systématique.** `npm cache clean --force` n'est **pas** l'équivalent d'un
> redémarrage qui « répare tout » : c'est un dernier recours face à une
> erreur d'intégrité précise (`EINTEGRITY`) ou une corruption avérée. Vidé
> sans raison, il ne fait que ralentir la **prochaine** installation (tout
> retélécharger) sans corriger un problème qui vient probablement d'ailleurs
> (conflit de versions, lockfile désynchronisé — voir les leçons
> précédentes).

> **Passerelle Composer.** Composer a son propre cache
> (`~/.composer/cache` ou `~/.cache/composer`), avec `composer clear-cache`
> comme équivalent direct — même logique, même prudence : à utiliser en
> dernier recours face à une erreur de téléchargement, pas en routine.

## Purger `node_modules/` proprement

Deux niveaux, du plus léger au plus radical :

```bash
# Level 1 (preferred): re-sync strictly from the lockfile
npm ci
# -- wipes node_modules AND reinstalls exactly what package-lock.json says.
# No need to manually rm anything: npm ci already does it.

# Level 2 (full reset): when even the lock is suspect, or you're chasing
# a truly weird, unreproducible bug
rm -rf node_modules package-lock.json
npm install
```

> **Réflexe à prendre.** Avant un `rm -rf node_modules` « pour repartir à
> zéro », essaie d'abord `npm ci` : dans l'écrasante majorité des cas c'est
> suffisant, plus rapide, **et** ça ne touche pas au lock (donc pas de risque
> de figer accidentellement une nouvelle version transitive que tu n'as pas
> vérifiée).

## À retenir

- Le cache npm (`~/.npm/_cacache`) accélère les réinstallations ;
  `npm cache verify` en vérifie l'intégrité, `npm cache clean --force` le
  vide entièrement — en dernier recours seulement (erreur `EINTEGRITY`
  confirmée).
- Purger `node_modules/` : préfère `npm ci` (rapide, respecte le lock) à
  `rm -rf node_modules && npm install` (plus radical, régénère le lock).
- Une erreur qui ressemble à une « corruption » cache une fois sur deux un
  vrai conflit de dépendances — vérifie avant de tout vider.
