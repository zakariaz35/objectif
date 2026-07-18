---
title: "Exercice — Convertis ce pipeline PHP en Stream Java"
type: exercise
---

## Énoncé

> ⏱️ **Durée conseillée : ~15 min.** Un pipeline PHP classique enchaîne
> `array_filter`/`array_map`/`array_sum`. Traduis-le en un pipeline `Stream` Java
> idiomatique — une seule chaîne fluide, pas une traduction ligne à ligne.

```php
<?php

final class Order
{
    public function __construct(
        public readonly string $customer,
        public readonly float $amount,
        public readonly bool $isPaid,
    ) {}
}

$orders = [
    new Order('Alice', 120.0, true),
    new Order('Bob', 45.0, false),
    new Order('Charlie', 300.0, true),
];

$paidOrders = array_filter($orders, fn(Order $o) => $o->isPaid);
$amounts = array_map(fn(Order $o) => $o->amount, $paidOrders);
$total = array_sum($amounts);

echo $total; // 420.0
```

Contraintes :
1. Modélise `Order` avec la construction Java la plus adaptée (voir module 2).
2. Un seul pipeline `Stream` chaîné : filtrer les commandes payées, extraire les montants,
   sommer — sans variable intermédiaire pour chaque étape.
3. Utilise un stream de primitifs pour la somme finale (voir la leçon sur `IntStream`).

<!--correction-->

## Correction

```java
package com.acme.orders;

import java.util.List;

public record Order(String customer, double amount, boolean isPaid) {}

public class OrderReport {

    public static void main(String[] args) {
        List<Order> orders = List.of(
            new Order("Alice", 120.0, true),
            new Order("Bob", 45.0, false),
            new Order("Charlie", 300.0, true)
        );

        double total = orders.stream()
            .filter(Order::isPaid)              // keep only paid orders
            .mapToDouble(Order::amount)          // Stream<Order> -> DoubleStream, no boxing
            .sum();                              // terminal operation: triggers the pipeline

        System.out.println(total);   // 420.0
    }
}
```

Points clés de la traduction :

- **`record Order(...)`** : exactement le pendant Java des propriétés promues `readonly`
  de PHP — immuable, sans boilerplate.
- **Un seul pipeline chaîné** (`.filter().mapToDouble().sum()`) plutôt que trois variables
  intermédiaires (`$paidOrders`, `$amounts`, `$total`) : c'est l'idiome Java attendu,
  proche de l'esprit fonctionnel déjà présent en PHP mais poussé plus loin par le
  chaînage fluide.
- **`Order::isPaid` et `Order::amount`** comme références de méthode : pour un `record`,
  l'accesseur généré porte le nom du champ (`amount()`, pas `getAmount()`), directement
  utilisable en référence de méthode.
- **`mapToDouble()` plutôt que `map()`** : convertit le `Stream<Order>` en `DoubleStream`
  (primitifs), évitant l'autoboxing de chaque montant en objet `Double` avant de sommer.
