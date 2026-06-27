---
title: "DDD : lever la confusion et les 2 piliers"
type: lesson
---

# 4. DDD — Domain-Driven Design (structure du code)

> **D'abord, lever la confusion —** **Hexagonal ≠ DDD.** L'hexagonal organise le code en *couches* (centre vs périphérie). Le DDD s'intéresse à **comment modéliser le métier lui-même**. On les combine souvent, mais on peut faire l'un sans l'autre. La section 3 était de l'hexagonal *sans* DDD.

Le DDD (Eric Evans) part d'un constat : sur un domaine **complexe**, le plus dur n'est pas la technique, c'est de **bien modéliser la réalité métier** et de parler le même langage que les experts métier.

> **Les 2 piliers du DDD —**
>
> - **Langage ubiquitaire** : développeurs et métier utilisent **exactement les mêmes mots**, et ces mots se retrouvent **dans le code**. Si le métier dit « clôturer une facture », il y a une méthode `$facture->cloturer()`, pas un `update(['status' => 3])`.
> - **Bounded Contexts** : on découpe le grand système en **contextes délimités**, chacun avec son propre modèle. Le mot « Client » ne veut pas dire la même chose en *Facturation* et en *Support* — donc deux modèles distincts.
