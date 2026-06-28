---
title: "Quiz — Excel pour l'analyste"
type: quiz
questions:
  - prompt: |
      Pourquoi mettre ses données en **Tableau** (`Ctrl+L`) avant de calculer ?
    options:
      - "Pour la couleur uniquement"
      - "Pour avoir des références nommées qui s'étendent automatiquement aux nouvelles lignes"
      - "Parce que les TCD sont interdits sinon"
    answer: 1
    explanation: >
      Le tableau structuré donne des noms de colonnes (`Sales[amount]`), des formules
      robustes qui suivent l'ajout de lignes, et fiabilise les TCD.
  - prompt: |
      Quelle formule donne le CA de la catégorie `"Office"` **dans** la région `"Nord"` ?
    options:
      - '=SUMIFS(Sales[amount], Sales[category], "Office", Sales[region], "Nord")'
      - '=SUMIF(Sales[amount], "Office", "Nord")'
      - '=SUM(Sales[amount])'
    answer: 0
    explanation: >
      `SUMIFS` somme `amount` selon plusieurs critères (paires colonne/valeur). La colonne
      à sommer vient en premier, puis chaque condition.
  - prompt: |
      Tu veux le CA à partir d'une date saisie dans la cellule `G1`. Comment écrire le
      critère ?
    options:
      - '=SUMIFS(Sales[amount], Sales[order_date], ">=G1")'
      - '=SUMIFS(Sales[amount], Sales[order_date], ">=" & G1)'
      - '=SUMIFS(Sales[amount], Sales[order_date], G1, ">=")'
    answer: 1
    explanation: >
      Il faut **coller** l'opérateur à la valeur de la cellule avec `&` : `">=" & G1`.
      Mettre `G1` dans les guillemets le traiterait comme du texte littéral.
  - prompt: |
      Quel est l'avantage de `XLOOKUP` sur `VLOOKUP` ?
    options:
      - "Il est plus lent mais plus joli"
      - "Il désigne les colonnes par leur nom, cherche dans les deux sens et gère l'absence avec un 4ᵉ argument"
      - "Il ne fonctionne que sur une seule colonne"
    answer: 1
    explanation: >
      `XLOOKUP(clé, colonne_clé, colonne_résultat, valeur_si_absent)` ne dépend pas d'un
      numéro de colonne fragile et évite les `#N/A` grâce à son dernier argument.
  - prompt: |
      Pour ranger un `amount` dans une **tranche** de remise (table de bornes triée),
      quelle recherche utiliser ?
    options:
      - "Une recherche exacte (MATCH avec 0)"
      - "Une recherche approchée (XLOOKUP -1 ou MATCH 1) sur une table triée croissante"
      - "Un simple SUM"
    answer: 1
    explanation: >
      Une tranche est une recherche **approchée** : on prend la borne immédiatement
      inférieure. La table de bornes doit être triée par ordre croissant.
  - prompt: |
      Dans un tableau croisé dynamique, où place-t-on la **mesure** `amount` ?
    options:
      - "En Lignes"
      - "En Filtres"
      - "En Valeurs (avec une agrégation : somme, moyenne…)"
    answer: 2
    explanation: >
      Les dimensions vont en Lignes/Colonnes/Filtres ; la mesure va en Valeurs, avec une
      agrégation choisie (Somme, Moyenne, Nombre…).
  - prompt: |
      Tu veux afficher la **part** de chaque catégorie dans le CA total. Que règles-tu
      dans le TCD ?
    options:
      - "Tu changes la police"
      - "Paramètres des champs de valeurs → Afficher les valeurs → % du total général"
      - "Tu ajoutes une colonne avec SUMIFS à côté"
    answer: 1
    explanation: >
      Le TCD calcule lui-même la part via *Afficher les valeurs → % du total général* :
      pas besoin de formule annexe.
  - prompt: |
      `"Office"` et `"Office "` ne se regroupent pas ensemble dans ton TCD. Que fais-tu ?
    options:
      - "Tu ignores, c'est normal"
      - "Tu nettoies avec TRIM pour enlever l'espace superflu"
      - "Tu changes la couleur des cellules"
    answer: 1
    explanation: >
      Un espace invisible suffit à séparer deux catégories. `TRIM` supprime les espaces en
      trop ; c'est un classique du nettoyage avant analyse.
  - prompt: |
      Quelle formule calcule l'ancienneté en **années** d'un employé depuis `hire_date` ?
    options:
      - '=YEAR([@hire_date])'
      - '=DATEDIF([@hire_date], TODAY(), "Y")'
      - '=TODAY() - [@hire_date]'
    answer: 1
    explanation: >
      `DATEDIF(début, fin, "Y")` renvoie le nombre d'années entières. `TODAY() - hire_date`
      donnerait un nombre de **jours**.
  - prompt: |
      Une recherche `XLOOKUP` renvoie une valeur fausse. La cause la plus probable ?
    options:
      - "La clé est dupliquée dans la table de référence (elle renvoie la première trouvée)"
      - "Excel est cassé"
      - "Il faut redémarrer l'ordinateur"
    answer: 0
    explanation: >
      Une recherche suppose une clé **unique** côté table de référence. Un doublon fait
      renvoyer silencieusement la première occurrence : vérifie l'unicité avant de joindre.
  - prompt: |
      Tu compares deux colonnes ligne à ligne pour compter les retards
      (`actual_date > promised_date`). Quelle formule utilises-tu ?
    options:
      - "=COUNTIFS(Deliveries[actual_date], \">\" & Deliveries[promised_date])"
      - "=SUMPRODUCT((Deliveries[actual_date] > Deliveries[promised_date]) * (Deliveries[actual_date] <> \"\"))"
      - "=COUNT(Deliveries[actual_date])"
    answer: 1
    explanation: >
      `COUNTIFS` ne supporte pas la comparaison colonne-à-colonne. `SUMPRODUCT` avec une
      condition booléenne (`TRUE`/`FALSE` → `1`/`0`) est la bonne approche ici.
  - prompt: |
      `IFERROR` et `IFNA` : quelle est la différence ?
    options:
      - "Il n'y en a aucune, ce sont des synonymes"
      - "`IFNA` intercepte uniquement les erreurs `#N/A` ; `IFERROR` intercepte toutes les erreurs"
      - "`IFERROR` ne fonctionne pas avec XLOOKUP"
    answer: 1
    explanation: >
      `IFNA` cible spécifiquement les `#N/A` (clé absente dans une recherche), ce qui
      laisse remonter les vraies erreurs de formule. `IFERROR` masque **tout**, y compris
      les erreurs de logique.
  - prompt: |
      Dans un champ calculé de TCD, tu écris `= quantity * unit_price`. Qu'obtiens-tu ?
    options:
      - "La somme exacte des montants ligne à ligne (= SUMPRODUCT)"
      - "SOMME(quantity) × SOMME(unit_price) — ce qui peut être inexact"
      - "Une erreur car les champs calculés ne supportent pas la multiplication"
    answer: 1
    explanation: >
      Un champ calculé opère sur des **agrégats** : il multiplie les sommes de chaque
      colonne, pas les lignes brutes. Pour un résultat exact, crée une colonne `line_total`
      dans la table source, puis somme-la dans le TCD.
  - prompt: |
      Tu dois classer une commande dans une remise progressive (table triée croissante).
      Quel argument de `XLOOKUP` utilises-tu ?
    options:
      - "Le 3ᵉ argument (colonne de retour)"
      - "Le 5ᵉ argument à `-1` (mode approché : borne inférieure)"
      - "Le 4ᵉ argument (valeur si absent)"
    answer: 1
    explanation: >
      Le 5ᵉ argument de `XLOOKUP` contrôle le mode de correspondance. `-1` signifie
      « prends la valeur égale ou immédiatement inférieure » — parfait pour des tranches de
      remise. La table doit être triée croissante.
  - prompt: |
      Quelle formule calcule le nombre de jours **ouvrés** entre deux dates ?
    options:
      - "=[@end_date] - [@start_date]"
      - "=DATEDIF([@start_date], [@end_date], \"D\")"
      - "=NETWORKDAYS([@start_date], [@end_date])"
    answer: 2
    explanation: >
      `NETWORKDAYS` exclut les samedis et dimanches (et optionnellement les jours fériés
      fournis en troisième argument). `DATEDIF` avec `"D"` compte tous les jours
      calendaires.
---

Quelques questions pour valider tes réflexes Excel d'analyste : structurer, calculer,
rechercher, croiser, nettoyer.
