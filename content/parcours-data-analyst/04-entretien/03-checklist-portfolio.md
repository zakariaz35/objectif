---
title: "Checklist entretien & présenter son portfolio"
type: lesson
---

# Checklist entretien & présenter son portfolio

Deux objectifs dans cette leçon : ne rien oublier le jour J, et **raconter ton projet
portfolio** de façon convaincante.

---

## Checklist avant l'entretien

### Technique

- [ ] Réviser `GROUP BY` / `HAVING` / `JOIN` / une fonction fenêtre (`SUM OVER`, `RANK`).
- [ ] Savoir calculer de tête : CA, marge %, évolution MoM, médiane vs moyenne.
- [ ] Avoir un exemple de « nettoyage de données » à raconter (valeurs manquantes, doublons,
      types incorrects).
- [ ] Préparer une requête SQL courte à écrire sur tableau blanc ou dans un éditeur basique
      (sans auto-complétion).

### Métier

- [ ] Pour chaque KPI que tu cites, savoir le **définir et le calculer** (pas juste le nommer).
- [ ] Préparer ta réponse à « qu'est-ce qu'un bon KPI ? » — actionnable, mesurable,
      pertinent par rapport à l'objectif.
- [ ] Avoir 2-3 exemples d'**insights** tirés de données, formulés en une phrase chacun.

### Comportemental

- [ ] Préparer la réponse à « parle-moi d'une erreur d'analyse que tu as faite » (montre
      ta capacité à apprendre).
- [ ] Connaître le secteur de l'entreprise et ses 2-3 KPI principaux (CA, NPS, taux de rétention,
      taux de conversion… selon le contexte).

---

## Pièges classiques à éviter

### En SQL

| Piège | Ce qui se passe | Bonne pratique |
|---|---|---|
| `COUNT(*)` vs `COUNT(col)` | `COUNT(*)` compte toutes les lignes ; `COUNT(col)` ignore les NULL | Savoir lequel utiliser selon le besoin |
| Diviser par zéro | `revenue / orders` plante si `orders = 0` | Protéger avec `NULLIF(orders, 0)` |
| `HAVING` sur un alias | `HAVING revenue > 1000` peut ne pas fonctionner partout | Répéter l'expression ou utiliser une sous-requête |
| Jointure mal orientée | `INNER JOIN` supprime silencieusement les lignes sans correspondance | Toujours vérifier le nombre de lignes avant/après |

### En analyse

| Piège | Exemple | Parade |
|---|---|---|
| Moyenne trompeuse | CA moyen gonflé par quelques très grosses commandes | Regarder aussi la médiane et la distribution |
| Période courte | « les ventes baissent » sur 2 semaines | Comparer sur des périodes comparables (saisonnalité) |
| Corrélation présentée comme causalité | « les promos augmentent les ventes » sans A/B test | Formuler : « associé à » plutôt que « cause » |
| KPI sans contexte | « CA = 50 000 € » | Toujours ajouter vs objectif, vs N-1, vs concurrent |

---

## Présenter le projet portfolio

Le projet `parcours-projet-ventes` est ta pièce maîtresse. Voici comment le pitcher en
**2 minutes** (structure STAR allégée).

### Structure recommandée

```
1. Contexte (15 s)  — « J'ai analysé un dataset de ventes e-commerce couvrant
                       6 mois de commandes, 4 produits, 4 régions. »

2. Problème (20 s)  — « L'objectif : répondre à 4 questions business —
                       CA total, rentabilité par catégorie, évolution mensuelle,
                       impact des remises sur la marge. »

3. Méthode (30 s)   — « J'ai nettoyé les données (doublons, types), réalisé les
                       agrégations en SQL et pandas, puis construit un dashboard
                       Power BI. »

4. Insights (40 s)  — « Deux résultats surprenants : Furniture domine le CA (48 %)
                       mais Stationery a la meilleure marge (60 %). Les remises >15 %
                       ont réduit la marge de 8 points sans augmenter le volume. »

5. Impact/suite (15 s) — « La recommandation : plafonner les remises à 10 % sur
                       Furniture et pousser la catégorie Stationery. »
```

> Ne commence pas par « j'ai fait un `GROUP BY` ». Commence par **ce que tu as découvert**.
> La méthode est secondaire ; l'insight est ce que retient l'intervieweur.

### Questions pièges sur le portfolio

**« Et si le dataset était 100× plus grand ? »**
> « La méthode reste identique — SQL et pandas scalent bien. J'ajouterais une étape
> d'optimisation (index sur `product_id`, `order_date`) et je partitionnerais par mois. »

**« Qu'est-ce que tu ferais différemment ? »**
> Prépare une vraie limite honnête : « j'aurais aimé avoir des données clients plus riches
> pour faire une analyse de cohortes, mais le dataset ne le permettait pas. »

**« Tu peux me montrer la requête SQL ? »**
> Ouvre ton projet sur GitHub ou montre ton notebook. Si tu n'as pas de dépôt : mets-le en
> place **avant** l'entretien.

---

## La semaine avant l'entretien

1. **Refais le projet de zéro** sur un dataset légèrement différent (change quelques valeurs).
   Si tu trébuches, c'est le signe que tu avais surtout suivi — et tu as encore le temps de consolider.
2. **Chronomètre** ta présentation portfolio à 2 minutes.
3. **Lis une actualité data** du secteur ciblé (e-commerce, RH, finance…) pour avoir un
   exemple concret à glisser en entretien.
4. Prépare 2 questions à poser au recruteur sur les outils utilisés, la structure des données,
   la culture de l'équipe.

---

> **À retenir** — Un entretien Data-Analyst junior teste : (1) que tu maîtrises les bases
> SQL/stats, (2) que tu penses « question métier » avant « requête », (3) que tu sais
> **communiquer un insight**. Ton portfolio sert à ancrer ces trois points sur un cas concret
> que tu connais mieux que l'intervieweur.
