---
title: "@SpringBootTest et MockMvc pour tester les contrôleurs"
type: lesson
---

## `@SpringBootTest` : démarrer le contexte complet

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
    void listReturnsAllProducts() throws Exception {
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void createReturns201WithCreatedProduct() throws Exception {
        mockMvc.perform(post("/api/products")
                        .contentType("application/json")
                        .content("""
                                { "name": "Keyboard", "price": 49.90 }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Keyboard"));
    }

    @Test
    void showUnknownProductReturns404() throws Exception {
        mockMvc.perform(get("/api/products/999"))
                .andExpect(status().isNotFound());
    }
}
```

> **Symfony → Spring.** `@SpringBootTest` correspond à `KernelTestCase` (ou
> `WebTestCase` pour un test HTTP complet) : le **contexte entier** de
> l'application démarre, avec tous les vrais beans câblés. `MockMvc`
> reproduit le rôle du `$client` de `WebTestCase` : simuler une requête HTTP
> **sans démarrer un vrai serveur réseau**, et inspecter la réponse.

| MockMvc | WebTestCase | Rôle |
|---|---|---|
| `mockMvc.perform(get("/api/products"))` | `$client->request('GET', '/api/products')` | Simuler une requête HTTP |
| `.andExpect(status().isOk())` | `$this->assertResponseIsSuccessful()` | Vérifier le statut HTTP |
| `.andExpect(jsonPath("$.name").value(...))` | `$this->assertJsonContains([...])` | Vérifier le contenu JSON |

## `@SpringBootTest` a un coût : ne pas en abuser partout

> ⚠️ **Erreur fréquente — tout tester avec `@SpringBootTest`.** Démarrer le
> **contexte entier** de l'application (tous les beans, la vraie base si
> configurée...) à chaque test ralentit fortement la suite de tests. Réserve
> `@SpringBootTest` aux tests **d'intégration** significatifs ; pour un test
> de service isolé, préfère un test unitaire pur avec Mockito (leçon
> suivante) — même arbitrage qu'entre `KernelTestCase` (lourd, réaliste) et
> un test PHPUnit pur sans kernel (léger, rapide) en Symfony.

## À retenir

- `@SpringBootTest` démarre le contexte complet — le pendant de
  `KernelTestCase`/`WebTestCase`.
- `MockMvc` simule des requêtes HTTP sans serveur réseau réel — le pendant du
  `$client` de `WebTestCase`.
- Réserve les tests `@SpringBootTest` aux scénarios d'intégration ; isole le
  reste avec des tests unitaires purs.
