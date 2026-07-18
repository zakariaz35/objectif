---
title: "Exercice — deux tickets de support, deux diagnostics"
type: exercise
---

> ⏱️ **Durée conseillée : ~15 min.**

## Énoncé

Tu es d'astreinte support. Deux tickets arrivent le même jour.

**Ticket A.** La pipeline CI d'un projet échoue soudainement, alors que rien
n'a changé côté configuration CI. Le log montre :

```text
$ npm ci
npm ERR! code EUSAGE
npm ERR!
npm ERR! `npm ci` can only install packages when your package.json and
npm ERR! package-lock.json or npm-shrinkwrap.json are in sync. Please update
npm ERR! your lock file with `npm install` before continuing.
npm ERR!
npm ERR! Missing: zod@3.23.8 from lock file
```

En regardant le dernier commit sur `main` : la ligne `"zod": "^3.23.8"` a
été ajoutée à la main dans `package.json`, dans le même commit qui ajoute
son utilisation dans le code — mais `package-lock.json` n'apparaît **pas**
dans la liste des fichiers modifiés de ce commit.

**Ticket B.** Un développeur, sur sa machine, ne parvient plus à lancer
`npm install` sur un projet qu'il avait cloné il y a plusieurs mois et qu'il
a testé récemment **via Docker** (un `docker compose run app npm install`
lancé une fois, en dépannage, sans `--user`). Le message :

```text
npm ERR! code EACCES
npm ERR! syscall mkdir
npm ERR! path /home/dev/projects/api-service/node_modules/.bin
npm ERR! errno -13
```

**Questions :**

1. Pour chaque ticket, identifie la cause exacte (pas juste "ça plante").
2. Pour chaque ticket, donne la ou les commandes de correction, dans
   l'ordre.
3. Le développeur du ticket B propose : « je vais juste refaire `sudo npm
   install` pour que ça reparte ». Explique-lui, en une phrase, pourquoi
   c'est une mauvaise idée — et propose l'alternative.

<!--correction-->

## Correction

**Ticket A — lockfile désynchronisé (drift), pas un problème réseau/CI**

- **Cause** : `package.json` a été modifié à la main (ajout de `zod`) sans
  jamais relancer `npm install` en local — donc `package-lock.json` ne
  contient toujours pas `zod`. `npm ci`, volontairement strict, refuse
  d'installer tant que les deux fichiers ne sont pas cohérents (c'est
  exactement le garde-fou pour lequel `npm ci` existe).
- **Fix**, en local, puis à committer :

  ```bash
  npm install                                   # re-syncs the lock with package.json
  git add package.json package-lock.json
  git commit -m "chore: sync lockfile after adding zod"
  git push
  ```

**Ticket B — EACCES par pollution `root` via Docker**

- **Cause** : le conteneur a tourné en tant que `root` (aucun `--user`
  passé à `docker compose run`), et a écrit dans `node_modules/` monté en
  volume — ces fichiers appartiennent maintenant à `root` sur la machine
  hôte, inaccessibles en écriture pour l'utilisateur normal.
- **Fix** :

  ```bash
  # Confirm the diagnosis
  ls -la node_modules | head

  # Reclaim ownership of the affected folder(s)
  sudo chown -R $(whoami):$(id -gn) node_modules

  # If the global npm cache was touched too:
  sudo chown -R $(whoami):$(id -gn) ~/.npm
  ```

**3. Pourquoi pas `sudo npm install`, et quelle alternative**

`sudo npm install` ferait disparaître l'erreur en créant **encore plus** de
fichiers appartenant à `root` — le problème s'aggrave à chaque répétition,
jusqu'à ce que **plus rien** ne soit accessible sans sudo, et ça exécute au
passage les scripts `postinstall` de paquets tiers avec des privilèges
élevés. L'alternative durable : ne **jamais** lancer les commandes Docker
sans préciser l'utilisateur (`docker compose run --user "$(id -u):$(id -g)"
app npm install`), ou mieux, faire tourner l'image avec un utilisateur non
`root` par défaut dans le `Dockerfile`.
