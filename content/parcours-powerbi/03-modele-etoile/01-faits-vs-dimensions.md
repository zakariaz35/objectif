---
title: "Faits vs dimensions"
type: lesson
---

# Deux familles de tables

Tu connais la théorie de l'entrepôt — on la met en pratique côté Power BI. Dans un modèle, chaque table joue l'un de deux rôles : **table de faits** ou **table de dimension**.

> **Objectif de l'étape —** organiser ses tables en **étoile** dans la vue Modèle de Power BI, avec les bonnes relations et une table de dates. C'est ce qui fait qu'une mesure DAX *fonctionne*.

## La table de faits

Elle contient les **événements mesurables** de l'activité : une ligne = un fait (une vente, une commande). Elle est **longue** (beaucoup de lignes), et porte :

- des **mesures** numériques qu'on agrège : `amount`, `quantity` ;
- des **clés étrangères** vers les dimensions : `product_id`, `customer_id`, `order_date`.

```text
Sales (fait)
| order_id | order_date | product_id | customer_id | amount | quantity |
| 1001     | 2024-03-12 | P-12       | C-007       | 1250   | 2        |
| 1002     | 2024-03-13 | P-12       | C-019       |  980   | 1        |
```

## Les tables de dimensions

Elles décrivent le **contexte** : les axes par lesquels on découpe les mesures. Elles sont **larges** (beaucoup de colonnes descriptives) mais courtes (peu de lignes), avec une **clé unique**.

```text
Products (dimension)            Customers (dimension)
| product_id | name | category | | customer_id | name  | region |
| P-12       | Laptop | Electronics | | C-007    | Alice | Paris  |
```

## La règle qui clarifie tout

> **Mesure** = ce que je veux **calculer** (`SUM(Sales[amount])`). **Dimension** = ce **par quoi je découpe** (par `category`, par `region`, par mois). « CA par catégorie » = mesure de `Sales` × dimension `Products[category]`.

Quand tu te demandes où mettre une colonne : *est-ce que je l'agrège, ou est-ce que je filtre/groupe par elle ?* Agrégée → fait. Filtre/groupe → dimension.

## Pourquoi séparer ?

On pourrait tout mettre dans une grosse table plate. Mauvaise idée :

- **redondance** : le nom de catégorie répété sur chaque ligne de vente ;
- **incohérences** : la même catégorie écrite de dix façons ;
- **lenteur** et modèle illisible.

Séparer faits et dimensions = chaque information à **un seul endroit**, relié par des clés. C'est la base de l'étoile.

## Cas concrets vente/achat

**Contexte vente** :

```text
Sales (fait)
| order_id | order_date | product_id | customer_id | store_id | amount | quantity |

Products (dimension)     Customers (dimension)       Store (dimension)
| product_id PK          | customer_id PK             | store_id PK
| name                   | full_name                  | store_name
| category               | email                      | city
| subcategory            | segment (B2B/B2C)          | region
| brand                  | region                     | country
| unit_cost              |                            |
| unit_price             |
```

**Contexte achat** :

```text
Purchases (fait)
| purchase_id | purchase_date | supplier_id | product_id | qty_ordered | unit_cost |

Suppliers (dimension)
| supplier_id PK
| supplier_name
| country_code
| lead_time_days
| payment_terms
```

## Le test pratique

Pour chaque colonne, pose-toi la question :

- « Est-ce que je vais **sommer ou moyenner** cette valeur ? » → **mesure**, dans le fait.
- « Est-ce que je vais **grouper ou filtrer** par cette valeur ? » → **dimension**.

`amount` → je le somme → fait. `category` → je filtre par elle → dimension. `order_date` → je filtre et je groupe par elle → clé dans le fait, mais aussi dans la **table de dates** (dimension).

> **À retenir —** Fait = événements à mesurer (long, peu de colonnes, plein de clés). Dimension = contexte descriptif (court, large, clé unique). On **agrège** la mesure, on **découpe** par la dimension. En cas de doute : « sommer ou grouper ? »
