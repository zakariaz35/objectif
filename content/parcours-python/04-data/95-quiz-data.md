---
title: "Quiz — données & pandas"
type: quiz
questions:
  - prompt: "Quelle structure de la bibliothèque standard initialise automatiquement une valeur par défaut pour les clés absentes ?"
    options:
      - "list"
      - "defaultdict"
      - "tuple"
      - "frozenset"
    answer: 1
    explanation: "`defaultdict(float)` crée une entrée à `0.0` dès qu'on accède à une clé absente — idéal pour accumuler par groupe sans `get(..., 0)`."
  - prompt: "En pandas, que renvoie une condition comme `df[\"amount\"] > 50` ?"
    options:
      - "Le DataFrame filtré"
      - "Une Series de booléens (un masque)"
      - "Le nombre de lignes correspondantes"
      - "Une erreur"
    answer: 1
    explanation: "La condition renvoie une Series de True/False. On la passe ensuite à `df[...]` pour ne garder que les lignes vraies : `df[df[\"amount\"] > 50]`."
  - prompt: "Comment combiner deux conditions « catégorie home ET montant > 50 » en pandas ?"
    options:
      - "df[df[\"category\"] == \"home\" and df[\"amount\"] > 50]"
      - "df[(df[\"category\"] == \"home\") & (df[\"amount\"] > 50)]"
      - "df[df[\"category\"] == \"home\" && df[\"amount\"] > 50]"
      - "df.filter(\"home\", 50)"
    answer: 1
    explanation: "On utilise `&` (pas `and`) et des **parenthèses** autour de chaque condition. `and`/`or` ne fonctionnent pas sur des Series."
  - prompt: "Quel appel donne le CA total par catégorie ?"
    options:
      - "df.sum(\"category\")"
      - "df.groupby(\"category\")[\"amount\"].sum()"
      - "df[\"category\"].total()"
      - "df.agg(\"category\", \"amount\")"
    answer: 1
    explanation: "`groupby(\"category\")` forme les groupes, `[\"amount\"].sum()` agrège la colonne montant pour chacun. C'est l'équivalent du `GROUP BY ... SUM(...)` SQL."
  - prompt: "Quelle méthode pandas correspond le mieux à un `Counter` (compter les occurrences d'une colonne) ?"
    options:
      - "df[\"category\"].describe()"
      - "df[\"category\"].value_counts()"
      - "df[\"category\"].sum()"
      - "df[\"category\"].unique()"
    answer: 1
    explanation: "`value_counts()` renvoie le nombre d'occurrences de chaque valeur, triées par fréquence — exactement le rôle de `Counter`. `unique()` ne donnerait que les valeurs distinctes, sans les compter."
  - prompt: "Pour enrichir `df` avec une table `labels` sur la colonne `category`, en gardant TOUTES les lignes de `df`, on écrit…"
    options:
      - "df.merge(labels, on=\"category\", how=\"inner\")"
      - "df.merge(labels, on=\"category\", how=\"left\")"
      - "df.concat(labels)"
      - "df.join(labels)"
    answer: 1
    explanation: "`how=\"left\"` conserve toutes les lignes de gauche (`df`) et y ajoute les colonnes correspondantes de `labels`. `inner` perdrait les lignes sans correspondance."
---

Quiz de synthèse sur la manipulation de données et pandas.
