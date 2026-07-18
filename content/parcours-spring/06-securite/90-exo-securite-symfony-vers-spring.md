---
title: "Exercice — traduire une configuration de sécurité Symfony en Spring Security"
type: exercise
---

## Énoncé

Voici la sécurité d'un projet Symfony : un firewall stateless, des règles
d'accès par route, et un Voter métier.

```yaml
# security.yaml
security:
    password_hashers:
        App\Entity\User: bcrypt

    firewalls:
        api:
            pattern: ^/api
            stateless: true
            provider: app_user_provider
            jwt: ~

    access_control:
        - { path: ^/api/auth, roles: PUBLIC_ACCESS }
        - { path: ^/api/admin, roles: ROLE_ADMIN }
        - { path: ^/api, roles: IS_AUTHENTICATED_FULLY }
```

```php
<?php
// src/Security/Voter/InvoiceVoter.php
namespace App\Security\Voter;

use App\Entity\Invoice;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class InvoiceVoter extends Voter
{
    protected function supports(string $attribute, mixed $subject): bool
    {
        return $attribute === 'EDIT' && $subject instanceof Invoice;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();

        if (!$user instanceof User) {
            return false;
        }

        /** @var Invoice $invoice */
        $invoice = $subject;

        return $user->hasRole('ROLE_ADMIN') || $invoice->getClientEmail() === $user->getEmail();
    }
}
```

Utilisé dans un contrôleur avec `#[IsGranted('EDIT', subject: 'invoice')]`.

**Tâche** : écris l'équivalent Spring Security :

1. Un `SecurityFilterChain` reproduisant les trois règles d'`access_control`.
2. Un bean `PasswordEncoder` (`BCryptPasswordEncoder`).
3. Un bean `InvoiceSecurity` avec une méthode `canEdit(Long invoiceId,
   Authentication authentication)` reproduisant la logique du Voter.
4. La méthode de service `updateInvoice` protégée par `@PreAuthorize`
   appelant ce bean.

<!--correction-->

## Correction

```java
// SecurityConfig.java
package com.example.shop.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthenticationFilter jwtFilter) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

```java
// InvoiceSecurity.java
package com.example.shop.billing;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("invoiceSecurity")
public class InvoiceSecurity {

    private final InvoiceRepository invoiceRepository;

    public InvoiceSecurity(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    public boolean canEdit(Long invoiceId, Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin) {
            return true;
        }

        return invoiceRepository.findById(invoiceId)
                .map(invoice -> invoice.getClientEmail().equals(authentication.getName()))
                .orElse(false);
    }
}
```

```java
// InvoiceService.java
package com.example.shop.billing;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

@Service
public class InvoiceService {

    @PreAuthorize("@invoiceSecurity.canEdit(#invoiceId, authentication)")
    public Invoice updateInvoice(Long invoiceId, UpdateInvoiceRequest request) {
        // ... update logic
        return invoiceRepository.save(/* ... */ null);
    }
}
```

- Les trois lignes d'`access_control` deviennent trois
  `.requestMatchers(...)` chaînées dans `authorizeHttpRequests` — même
  ordre, même logique de première règle qui matche.
- `password_hashers: bcrypt` devient un bean `PasswordEncoder`
  explicite — Spring ne configure pas cela par une simple ligne de YAML,
  il faut déclarer le bean toi-même.
- Le `InvoiceVoter` (méthode `voteOnAttribute`) devient un bean
  `InvoiceSecurity` avec une méthode booléenne, appelée directement depuis
  l'expression `@PreAuthorize` — même logique métier (admin OU propriétaire),
  vecteur syntaxique différent.
- `#[IsGranted('EDIT', subject: 'invoice')]` devient
  `@PreAuthorize("@invoiceSecurity.canEdit(#invoiceId, authentication)")` —
  le pont le plus direct de tout ce module.
