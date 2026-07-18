---
title: "Quiz — npm vs yarn vs pnpm"
type: quiz
questions:
  - prompt: |
      En 2026, quel est le statut de Yarn classic (v1) ?
    options:
      - "Il est activement développé, avec de nouvelles fonctionnalités régulières."
      - "Il est gelé : plus de nouvelles fonctionnalités, maintenance minimale — mais encore largement présent sur des projets legacy."
      - "Il a été officiellement retiré et ne fonctionne plus du tout."
    answer: 1
    tags: ["yarn", "historique"]
    level: debutant
    explanation: |
      Yarn classic (v1.22.x) est gelé depuis plusieurs années : il continue
      de fonctionner et reste présent dans de nombreux projets existants,
      mais ne reçoit plus de nouvelle fonctionnalité. Yarn Berry (v2+) est
      un projet totalement différent, activement développé.
  - prompt: |
      Qu'est-ce que le mode Plug'n'Play (PnP) de Yarn Berry change
      fondamentalement ?
    options:
      - "Il accélère uniquement le téléchargement des paquets, sans autre changement."
      - |
        Il supprime `node_modules/` : la résolution se fait via un fichier
        généré (`.pnp.cjs`) et un cache compressé, rendant les dépendances
        fantômes structurellement impossibles.
      - "Il remplace package.json par un nouveau format de fichier."
    answer: 1
    tags: ["yarn-berry", "pnp"]
    level: intermediaire
    explanation: |
      Le PnP (Plug'n'Play) élimine `node_modules/` : un paquet ne peut
      résoudre que ce qui est explicitement déclaré dans son propre
      `package.json`, via un mapping généré (`.pnp.cjs`) — impossible
      d'accéder « par accident » à une dépendance simplement hoistée par un
      paquet voisin.
  - prompt: |
      Qu'est-ce qu'une « dépendance fantôme » (phantom dependency) ?
    options:
      - |
        Un paquet qui utilise, sans jamais l'avoir déclarée dans son
        package.json, une dépendance simplement présente dans un
        node_modules/ aplati grâce à un autre paquet — qui peut casser
        silencieusement si ce voisin change.
      - "Une dépendance listée dans package.json mais jamais réellement utilisée dans le code."
      - "Un paquet supprimé du registre npm après publication."
    answer: 0
    tags: ["phantom-dependencies", "node-modules"]
    level: avance
    explanation: |
      Avec un node_modules/ aplati (npm, yarn classic), un paquet peut
      require() une dépendance qu'il n'a jamais déclarée, simplement parce
      qu'un AUTRE paquet l'a fait remonter au même niveau. Ça fonctionne
      jusqu'au jour où ce paquet voisin disparaît ou change de version — le
      bug apparaît alors sans qu'aucun changement direct de ton
      package.json ne l'explique. pnpm et Yarn PnP rendent ce cas
      impossible par construction.
  - prompt: |
      Quel est le principal avantage disque/vitesse de pnpm face à npm ou
      yarn classic ?
    options:
      - |
        pnpm stocke chaque version d'un paquet UNE SEULE FOIS dans un store
        global partagé entre tous les projets de la machine, avec des liens
        vers node_modules/, au lieu d'une copie complète par projet.
      - "pnpm ne télécharge jamais réellement les paquets, il simule leur présence."
      - "pnpm compresse systématiquement tout node_modules/ en un seul fichier zip."
    answer: 0
    tags: ["pnpm", "store", "disque"]
    level: intermediaire
    explanation: |
      Le store global de pnpm (par défaut hors du projet, partagé entre
      tous les projets de la machine) élimine la duplication : un même
      react@18.2.0 utilisé par dix projets n'existe qu'UNE fois
      physiquement sur le disque, chaque projet y accédant par lien.
  - prompt: |
      Quelle est la règle d'or à respecter absolument sur un projet, pour
      éviter les résolutions divergentes entre machines ?
    options:
      - |
        Un seul gestionnaire de paquets, un seul lockfile committé — ne
        jamais faire coexister package-lock.json et yarn.lock (ou
        pnpm-lock.yaml) dans le même dépôt.
      - "Committer les trois lockfiles (npm, yarn, pnpm) pour couvrir tous les cas."
      - "Ne jamais committer de lockfile, pour laisser chaque machine résoudre librement."
    answer: 0
    tags: ["lockfile", "yarn", "npm", "regle-or"]
    level: debutant
    explanation: |
      Deux lockfiles différents décrivent chacun leur propre résolution de
      l'arbre — sans garantie de rester synchronisés. C'est la cause typique
      du « ça marche chez moi (avec yarn), pas en CI (avec npm) » : un seul
      gestionnaire, un seul lockfile committé, point.
  - prompt: |
      À quoi sert le champ `"packageManager"` dans `package.json`, combiné
      à Corepack ?
    options:
      - |
        Il déclare et fait respecter (voire télécharge automatiquement) la
        version exacte du gestionnaire de paquets attendue pour ce projet,
        évitant qu'un collègue utilise, par erreur, un autre outil ou une
        autre version.
      - "Il liste les extensions IDE recommandées pour le projet."
      - "Il n'a aucun effet réel, c'est un champ purement informatif ignoré par les outils."
    answer: 0
    tags: ["packagemanager", "corepack"]
    level: intermediaire
    explanation: |
      Corepack (stable et activé par défaut sur les versions LTS récentes de
      Node) lit le champ `packageManager` et peut imposer, voire
      télécharger automatiquement, la version exacte déclarée — combiné à un
      script `preinstall` avec `only-allow`, ça bloque mécaniquement
      l'usage accidentel d'un autre gestionnaire.
---

Six questions sur le panorama npm/yarn/pnpm en 2026 : statut de Yarn classic,
architecture PnP, dépendances fantômes, l'avantage disque de pnpm, la règle
d'or « un seul lockfile », et le rôle de `packageManager`/Corepack.
