---
title: "EACCES, sudo npm install, et .npmrc"
type: lesson
---

## Le cas vécu : un dossier créé par `root`

Scénario fréquent : un conteneur Docker a démarré en tant que `root`, monté
le dossier du projet en volume, et généré `node_modules/` **appartenant à
root** sur la machine hôte. Le lendemain, en tant qu'utilisateur normal :

```bash
npm install
```

```text
npm ERR! code EACCES
npm ERR! syscall mkdir
npm ERR! path /home/hassane/projects/shop-front/node_modules/.package-lock.json.TMP
npm ERR! errno -13
npm ERR! Error: EACCES: permission denied, mkdir '/home/hassane/projects/shop-front/node_modules/.package-lock.json.TMP'
npm ERR!
npm ERR! The operation was rejected by your operating system.
npm ERR! It's possible that the file was already in use (by a text editor or antivirus),
npm ERR! or that you lack permissions to access it.
npm ERR!
npm ERR! If you believe this might be a permissions issue, please double-check the
npm ERR! permissions of the file and its containing directories.
```

`errno -13` = `EACCES` = permission refusée. La cause n'est presque jamais
npm lui-même : c'est que **certains fichiers appartiennent à un autre
utilisateur** (souvent `root`) que celui qui lance la commande.

```bash
# Confirm the diagnosis: who owns what, in this folder?
ls -la node_modules | head
```

```text
drwxr-xr-x  4 root    root    4096 Jul 12 09:11 .
drwxr-xr-x 812 root    root   32768 Jul 12 09:11 some-package
drwxr-xr-x  56 hassane hassane 4096 Jul 10 18:02 another-package
```

Le mélange de propriétaires (`root` et `hassane`) confirme le diagnostic.

## Pourquoi il ne faut JAMAIS faire `sudo npm install`

> ⚠️ **Erreur fréquente — "réflexe sudo" face à un EACCES.** `sudo npm
> install` *fait disparaître* l'erreur... en créant **encore plus** de
> fichiers appartenant à `root`. Le problème ne fait qu'empirer à chaque
> répétition, et un jour un `npm install` **sans** sudo redeviendra
> impossible sur l'ensemble du projet. Pire : `npm install` peut exécuter des
> scripts (`postinstall`) de paquets tiers — les exécuter **en root**
> multiplie le risque en cas de script malveillant (voir le module 4).

**Le vrai fix : corriger la propriété une fois, puis ne plus jamais en avoir
besoin.**

```bash
# Fix the ownership of the affected folder(s), once
sudo chown -R $(whoami):$(id -gn) node_modules

# If the npm cache itself got affected too (a common side effect):
sudo chown -R $(whoami):$(id -gn) ~/.npm
```

> **Réflexe à prendre — la vraie solution long terme.** Le problème
> structurel, c'est de laisser npm (ou un outil qui l'invoque) tourner en
> `root` sur la machine hôte. Utilise un gestionnaire de versions Node
> (`nvm`, `fnm`, `volta`) : Node et npm vivent alors entièrement dans ton
> `$HOME`, sans jamais nécessiter `sudo`, ni pour un install global ni pour
> quoi que ce soit d'autre.

## `.npmrc` : où vivent les réglages

Trois niveaux, du plus local au plus global (le plus local gagne) :

```bash
./.npmrc        # per-project (commit-able, partagé avec l'équipe)
~/.npmrc        # per-user (réglages personnels, jamais commité)
$(npm config get globalconfig)   # global (rarement modifié directement)
```

```ini
; .npmrc — example of common, useful settings
save-exact=true          ; npm install <pkg> pins the EXACT version, no ^ prefix
engine-strict=true       ; enforce the "engines" field in package.json (Node version)
registry=https://registry.npmjs.org/
; //registry.npmjs.org/:_authToken=${NPM_TOKEN}   ; CI auth, via an env var — never hardcode a token
```

> **Passerelle Composer.** `.npmrc` cumule les rôles de `composer.json`
> (`config`) et de `auth.json` : réglages de résolution, registre alternatif
> (dépôt privé — l'équivalent d'un `repositories` Composer pointant vers un
> Satis/Private Packagist), et jeton d'authentification pour la CI. Comme
> `auth.json`, un `.npmrc` contenant un token en dur ne doit **jamais** être
> commité — utilise une variable d'environnement (`${NPM_TOKEN}`), résolue au
> moment de l'exécution.

## À retenir

- `EACCES` = un fichier/dossier appartient à un **autre utilisateur**
  (souvent `root`, après un conteneur ou un `sudo` passé). Diagnostique avec
  `ls -la`, corrige avec `chown -R`, ciblé sur les dossiers concernés.
- **Jamais** `sudo npm install` : ça aggrave le problème (encore plus de
  fichiers `root`) et exécute les scripts d'installation avec des
  privilèges élevés.
- La vraie solution durable : un gestionnaire de versions Node (`nvm`,
  `fnm`, `volta`) qui garde Node/npm entièrement dans ton `$HOME`.
- `.npmrc` (projet, utilisateur, global) centralise les réglages — jamais de
  token en dur, toujours une variable d'environnement.
