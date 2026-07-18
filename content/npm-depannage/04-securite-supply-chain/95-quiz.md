---
title: "Quiz — sécurité & supply chain"
type: quiz
questions:
  - prompt: |
      Sur quelle base de données `npm audit` s'appuie-t-il pour détecter les
      vulnérabilités connues ?
    options:
      - "La GitHub Advisory Database."
      - "Une base interne, propriétaire, gérée uniquement par npm, Inc."
      - "Il n'utilise aucune base : il analyse statiquement le code source de chaque dépendance."
    answer: 0
    tags: ["npm-audit", "cve"]
    level: debutant
    explanation: |
      `npm audit` compare l'arbre de dépendances installé à la GitHub
      Advisory Database. Côté Composer, l'équivalent (`composer audit`)
      s'appuie sur l'Advisory Database de Packagist — même principe, deux
      bases différentes.
  - prompt: |
      `npm audit fix` (sans `--force`) ne corrige rien pour une
      vulnérabilité transitive à plusieurs niveaux, alors qu'aucune mise à
      jour du paquet direct n'est disponible. Quelle est la meilleure
      action ?
    options:
      - "Attendre que le mainteneur du paquet direct publie une nouvelle version, sans rien faire d'autre."
      - |
        Forcer la version patchée du paquet transitif via `overrides` dans
        `package.json`, sans attendre l'amont, puis retester.
      - "Supprimer purement et simplement le paquet direct concerné du projet."
    answer: 1
    tags: ["overrides", "vulnerabilite-transitive"]
    level: avance
    explanation: |
      `overrides` force une version précise dans TOUTE l'arborescence, y
      compris pour des dépendances transitives que tu ne contrôles pas
      directement — la même technique que pour corriger un conflit de peer
      dependency (module 1), appliquée ici à un correctif de sécurité.
      Toujours retester après, l'override garantit la résolution, pas la
      compatibilité runtime.
  - prompt: |
      Que fait exactement `npm install --ignore-scripts` ?
    options:
      - |
        Il désactive l'exécution de tous les scripts de cycle de vie
        (preinstall/install/postinstall) des paquets installés — réduit le
        risque, mais peut casser des paquets qui en ont légitimement besoin
        (bindings natifs).
      - "Il ignore les erreurs de résolution de version (ERESOLVE)."
      - "Il empêche npm de mettre à jour package-lock.json."
    answer: 0
    tags: ["ignore-scripts", "postinstall", "securite"]
    level: intermediaire
    explanation: |
      Les scripts postinstall sont un vecteur d'attaque réel (exécution
      automatique de code à l'installation). `--ignore-scripts` les
      neutralise tous, sans distinction — un compromis à utiliser en audit
      ponctuel d'une dépendance inconnue, pas un réglage par défaut
      universel (certains paquets ont besoin d'un postinstall légitime,
      comme la compilation de bindings natifs).
  - prompt: |
      Qu'est-ce que le « typosquatting », dans le contexte des paquets npm ?
    options:
      - |
        Publier un paquet dont le nom ressemble volontairement à un paquet
        populaire (une faute de frappe plausible), pour piéger des
        installations accidentelles.
      - "Une technique de compression des noms de paquets pour réduire la taille du registre."
      - "Un bug d'affichage de npm qui inverse l'ordre des lettres dans certains noms de paquets."
    answer: 0
    tags: ["typosquatting", "supply-chain"]
    level: intermediaire
    explanation: |
      Un attaquant publie un paquet avec un nom très proche d'un paquet
      populaire (ex. une lettre en trop/en moins) en espérant qu'une faute
      de frappe lors d'un `npm install` l'installe à la place du bon paquet.
      Réflexe : vérifier le nom caractère par caractère avant d'ajouter une
      nouvelle dépendance, surtout copiée depuis une source non officielle.
  - prompt: |
      En quoi `npm ci` (plutôt que `npm install`) constitue-t-il aussi un
      contrôle de sécurité, au-delà de la seule performance ?
    options:
      - |
        Il installe strictement ce que décrit le lockfile déjà relu par
        l'équipe, empêchant qu'une version publiée entre-temps (même dans
        la plage semver autorisée, jamais examinée) ne s'installe
        silencieusement.
      - "Il chiffre automatiquement toutes les communications réseau pendant l'installation."
      - "Il empêche l'exécution de tout script postinstall, par défaut."
    answer: 0
    tags: ["npm-ci", "supply-chain", "securite"]
    level: avance
    explanation: |
      `npm ci` élimine le risque de « drift de supply chain » : contrairement
      à `npm install`, qui pourrait tirer une version d'une dépendance
      publiée après la dernière revue de l'équipe (mais toujours dans la
      plage semver autorisée), `npm ci` installe EXACTEMENT ce que le
      lockfile décrit, point déjà relu et validé.
  - prompt: |
      Que vérifie précisément `npm audit signatures`, par différence avec
      `npm audit` classique ?
    options:
      - |
        Que les paquets installés correspondent aux signatures/provenance
        enregistrées sur le registre npm — une détection de falsification,
        indépendante de toute CVE déjà connue.
      - "Que tous les contributeurs du projet ont signé un CLA (Contributor License Agreement)."
      - "Que le fichier package-lock.json est correctement formaté en JSON valide."
    answer: 0
    tags: ["npm-audit-signatures", "provenance"]
    level: avance
    explanation: |
      `npm audit` classique compare à une base de CVE connues. `npm audit
      signatures` (npm 9.5+) vérifie la provenance cryptographique des
      paquets installés par rapport au registre — capable de détecter une
      falsification même avant qu'une CVE ne soit officiellement publiée.
---

Six questions sur la sécurité de la chaîne de dépendances npm : la base de
vulnérabilités utilisée, le patch d'une vulnérabilité transitive via
`overrides`, le compromis `--ignore-scripts`, le typosquatting, et pourquoi
`npm ci` est aussi un contrôle de sécurité.
