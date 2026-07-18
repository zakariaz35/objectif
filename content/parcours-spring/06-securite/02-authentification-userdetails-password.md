---
title: "Authentification : UserDetails et mots de passe"
type: lesson
---

## `UserDetails` : le contrat que Spring Security attend

```java
// AppUserDetails.java
package com.example.shop.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class AppUserDetails implements UserDetails {

    private final String username;
    private final String passwordHash;
    private final List<String> roles;

    public AppUserDetails(String username, String passwordHash, List<String> roles) {
        this.username = username;
        this.passwordHash = passwordHash;
        this.roles = roles;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .toList();
    }

    @Override
    public String getPassword() { return passwordHash; }

    @Override
    public String getUsername() { return username; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}
```

> **Symfony → Spring.** `UserDetails` correspond à l'interface
> `UserInterface` (+ `PasswordAuthenticatedUserInterface`) Symfony : le
> contrat minimal qu'une classe utilisateur doit respecter pour être
> reconnue par le système de sécurité, indépendamment de sa source
> (base de données, LDAP, API externe...).

## `UserDetailsService` : charger un utilisateur par identifiant

```java
// AppUserDetailsService.java
package com.example.shop.security;

import com.example.shop.user.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AppUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public AppUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        var user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("No user with email " + username));

        return new AppUserDetails(user.getEmail(), user.getPasswordHash(), user.getRoles());
    }
}
```

> **Symfony → Spring.** Correspondance directe avec l'implémentation d'un
> `UserProviderInterface` Symfony (`loadUserByIdentifier`) : chercher un
> utilisateur en base à partir d'un identifiant (souvent l'email) et le
> transformer en objet respectant le contrat de sécurité du framework.

## Le hachage des mots de passe : jamais en clair, jamais en `MD5`/`SHA1`

```java
// PasswordEncoderConfig.java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class PasswordEncoderConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();   // adaptive hashing, salted automatically
    }
}
```

```java
// Registering a new user
@Service
public class UserRegistrationService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    public UserRegistrationService(PasswordEncoder passwordEncoder, UserRepository userRepository) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
    }

    public User register(String email, String rawPassword) {
        String hash = passwordEncoder.encode(rawPassword);   // never store the raw password
        return userRepository.save(new User(email, hash));
    }
}
```

> **Symfony → Spring.** `PasswordEncoder` correspond au
> `PasswordHasherInterface` Symfony, câblé automatiquement via
> `password_hashers` dans `security.yaml` (généralement `bcrypt` ou
> `sodium` par défaut aussi côté Symfony) — même algorithme recommandé, même
> principe de salage automatique par le hasher.

> ⚠️ **Erreur fréquente — comparer les mots de passe soi-même.** Ne compare
> **jamais** `rawPassword.equals(storedHash)` : le hash `BCrypt` intègre un
> sel aléatoire, donc deux hachages du même mot de passe diffèrent. Utilise
> toujours `passwordEncoder.matches(rawPassword, storedHash)` — Spring
> Security le fait automatiquement lors de l'authentification.

## À retenir

- `UserDetails` = le contrat utilisateur, comme `UserInterface` Symfony ;
  `UserDetailsService` charge cet utilisateur, comme un `UserProvider`.
- `BCryptPasswordEncoder` hache et sale automatiquement — jamais de
  comparaison manuelle de mot de passe.
- Le mécanisme est presque terme à terme identique à Symfony Security, avec
  un vocabulaire différent (`UserDetails` vs `UserInterface`).
