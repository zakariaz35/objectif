---
title: "Exercice — traduire un test WebTestCase Symfony en test MockMvc"
type: exercise
---

## Énoncé

Voici un test fonctionnel Symfony pour la création d'un produit :

```php
<?php
// tests/Controller/ProductControllerTest.php
namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class ProductControllerTest extends WebTestCase
{
    public function testCreateProductReturns201WithCreatedProduct(): void
    {
        $client = static::createClient();

        $client->request(
            'POST',
            '/api/products',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode(['name' => 'Keyboard', 'price' => 49.90]),
        );

        $this->assertResponseStatusCodeSame(201);
        $this->assertJsonContains(['name' => 'Keyboard']);
    }

    public function testCreateProductWithBlankNameReturns400(): void
    {
        $client = static::createClient();

        $client->request(
            'POST',
            '/api/products',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode(['name' => '', 'price' => 49.90]),
        );

        $this->assertResponseStatusCodeSame(400);
    }

    public function testShowUnknownProductReturns404(): void
    {
        $client = static::createClient();

        $client->request('GET', '/api/products/999');

        $this->assertResponseStatusCodeSame(404);
    }
}
```

**Tâche** : écris l'équivalent Spring : une classe de test
`@SpringBootTest` + `@AutoConfigureMockMvc` avec les trois mêmes cas,
utilisant `MockMvc` et `jsonPath`.

<!--correction-->

## Correction

```java
// ProductControllerIntegrationTest.java
package com.example.shop.product;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ProductControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void createProductReturns201WithCreatedProduct() throws Exception {
        mockMvc.perform(post("/api/products")
                        .contentType("application/json")
                        .content("""
                                { "name": "Keyboard", "price": 49.90 }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Keyboard"));
    }

    @Test
    void createProductWithBlankNameReturns400() throws Exception {
        mockMvc.perform(post("/api/products")
                        .contentType("application/json")
                        .content("""
                                { "name": "", "price": 49.90 }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void showUnknownProductReturns404() throws Exception {
        mockMvc.perform(get("/api/products/999"))
                .andExpect(status().isNotFound());
    }
}
```

- `static::createClient()` + `$client->request(...)` devient
  `@Autowired MockMvc mockMvc` + `mockMvc.perform(post(...))` — même idée :
  simuler une requête HTTP sans serveur réseau réel.
- `assertResponseStatusCodeSame(201)` devient
  `.andExpect(status().isCreated())` — les deux frameworks proposent des
  méthodes nommées pour les statuts courants plutôt que des codes numériques
  bruts.
- `assertJsonContains(['name' => 'Keyboard'])` devient
  `.andExpect(jsonPath("$.name").value("Keyboard"))` — `jsonPath` utilise la
  syntaxe JSONPath pour cibler un champ précis, plus explicite qu'un simple
  tableau associatif de correspondance.
- Le test de validation (nom vide → `400`) fonctionne côté Spring **grâce
  à** `@Valid` + Bean Validation posés sur le DTO d'entrée (vu au module 4)
  — sans configuration supplémentaire dans le test lui-même.
