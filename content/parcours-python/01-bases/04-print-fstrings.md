---
title: "print & f-strings"
type: lesson
---

# Afficher proprement avec les f-strings

`print` est ton premier outil de diagnostic. Mais pour produire des **rapports lisibles** (un KPI, une ligne de synthèse), il faut formater le texte. Les **f-strings** sont la façon moderne et idiomatique de le faire.

## `print` de base

```python
print("Hello")
print("Total:", 182.0)          # arguments separated by spaces
print("a", "b", "c", sep=" | ") # a | b | c
```

## f-strings : interpoler des variables

On préfixe la chaîne par `f` et on insère des expressions entre `{ }`.

```python
product = "notebook"
amount = 19.99

print(f"{product} costs {amount} €")
# notebook costs 19.99 €
```

On peut mettre n'importe quelle expression entre accolades :

```python
quantity = 3
print(f"Subtotal: {amount * quantity} €")   # Subtotal: 59.97 €
```

## Formater les nombres

C'est indispensable pour un rapport propre. La syntaxe est `{valeur:format}`.

```python
revenue = 12543.6789

print(f"{revenue:.2f}")        # 12543.68   → 2 decimal places
print(f"{revenue:,.2f}")       # 12,543.68  → thousands separator
print(f"{0.1875:.1%}")         # 18.8%      → pourcentage
print(f"{42:>6}")              # '    42'   → right-aligned in 6 characters
```

| Format | Effet |
|---|---|
| `:.2f` | nombre flottant, 2 décimales |
| `:,.0f` | entier avec séparateur de milliers |
| `:.1%` | pourcentage à 1 décimale |
| `:>10` / `:<10` | aligner à droite / à gauche sur 10 colonnes |

## Un mini-rapport

```python
product = "notebook"
units = 3
revenue = 59.97

print(f"{product:<12} | {units:>3} units | {revenue:>8,.2f} €")
# notebook     |   3 units |    59.97 €
```

> **À retenir —** les f-strings (`f"..."`) sont LA façon d'afficher en Python moderne. Les mini-formats (`:.2f`, `:,.0f`, `:.1%`) transforment des nombres bruts en rapports lisibles — tu t'en serviras à chaque KPI.
