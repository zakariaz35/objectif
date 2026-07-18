---
title: "Exercice — D'un tableau associatif PHP à une Map<K,V> typée"
type: exercise
---

## Énoncé

> ⏱️ **Durée conseillée : ~15 min.** Un tableau associatif PHP mélange volontairement des
> usages différents — exactement ce que Java refuse. Traduis-le en Java, en choisissant
> les bonnes collections typées.

```php
<?php

$inventory = [
    'apple'  => 12,
    'banana' => 0,
    'cherry' => 34,
];

$lowStockNames = [];
foreach ($inventory as $name => $quantity) {
    if ($quantity === 0) {
        $lowStockNames[] = $name; // becomes a plain list here
    }
}

// $inventory is a dictionary (name -> quantity)
// $lowStockNames is a list (just names, order matters, duplicates would be fine)
```

Contraintes :
1. Utilise le bon type Java pour `$inventory` (dictionnaire nom → quantité).
2. Utilise le bon type Java pour `$lowStockNames` (liste de noms).
3. Choisis une implémentation de `Map` qui conserve l'ordre d'insertion (comme le fait
   PHP nativement, sans y penser).

<!--correction-->

## Correction

```java
package com.acme.stock;

import java.util.LinkedHashMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class InventoryCheck {

    public static void main(String[] args) {
        // (1) LinkedHashMap: a dictionary that preserves insertion order,
        // just like PHP's associative array does by default (HashMap would NOT).
        Map<String, Integer> inventory = new LinkedHashMap<>();
        inventory.put("apple", 12);
        inventory.put("banana", 0);
        inventory.put("cherry", 34);

        // (2) ArrayList: a simple ordered list, duplicates allowed
        List<String> lowStockNames = new ArrayList<>();

        for (Map.Entry<String, Integer> entry : inventory.entrySet()) {
            if (entry.getValue() == 0) {
                lowStockNames.add(entry.getKey());
            }
        }

        System.out.println(lowStockNames);   // [banana]
    }
}
```

Points clés de la traduction :

- **`Map<String, Integer>` plutôt qu'un tableau universel** : le type de la variable
  annonce immédiatement « ceci est un dictionnaire », sans avoir à lire le `foreach`
  pour le deviner.
- **`LinkedHashMap` et non `HashMap`** : `HashMap` **ne garantit aucun ordre**
  d'itération. Comme un tableau associatif PHP conserve toujours l'ordre d'insertion par
  défaut, `LinkedHashMap` est le vrai équivalent comportemental — un piège fréquent est
  de prendre `HashMap` par réflexe et de se retrouver avec un ordre imprévisible.
- **`Map.Entry<K, V>`** : Java n'a pas de `foreach ($arr as $key => $value)` direct sur
  une `Map` — on itère sur `entrySet()`, qui expose des paires clé/valeur explicites via
  `getKey()`/`getValue()`.
- **`Integer` (wrapper) et non `int`** comme type de valeur : `Map` ne peut stocker que
  des **objets**, jamais de primitifs directement (voir la leçon sur l'autoboxing).
