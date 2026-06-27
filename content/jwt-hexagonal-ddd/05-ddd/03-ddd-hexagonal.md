---
title: "DDD + Hexagonal : ils s'emboîtent"
type: lesson
---

En pratique on superpose les deux : l'hexagonal donne les **couches**, le DDD remplit le **cœur** avec un modèle riche.

> **Schéma —** Trois couches, dépendances vers le centre : **Infrastructure (adapters)** [`EloquentRepository`, Clients API tiers] → **Application (use cases / orchestration)** [`ValiderCommande` qui coordonne, gère les transactions] → **Domain (le cœur DDD)** [Aggregates · Entities · Value Objects · Domain Services + interfaces Repository]. L'`EloquentRepository` *implémente* les interfaces définies dans le Domain. Le Domain est en DDD pur, zéro dépendance.

| | Hexagonal | DDD |
| --- | --- | --- |
| Répond à | *Où* mettre le code ? | *Comment* modéliser le métier ? |
| Apporte | Ports, Adapters, inversion de dépendance | Entities, VO, Aggregates, langage ubiquitaire, bounded contexts |
| Niveau | Structurel / technique | Conceptuel / métier |
| Sans l'autre ? | Oui (section 3) | Oui (mais souvent combiné) |

> **⚠ Le vrai coût du DDD —** Le DDD est **cher** : beaucoup de classes, mapping entre objets domaine et modèles Eloquent, courbe d'apprentissage de l'équipe. Il ne se justifie que si le **domaine est réellement complexe** (assurance, logistique, finance…). Pour un blog ou un CRUD, c'est de l'over-engineering : Eloquent + contrôleurs suffisent largement. **Le DDD se mérite par la complexité métier.**
