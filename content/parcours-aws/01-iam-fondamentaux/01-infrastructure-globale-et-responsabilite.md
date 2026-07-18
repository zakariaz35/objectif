---
title: "Régions, AZ, edge locations & responsabilité partagée"
type: lesson
---

# L'infrastructure mondiale d'AWS

Avant IAM, EC2 ou S3, il faut comprendre **où** tourne un compte AWS. C'est un point d'examen récurrent (SAA-C03) : choisir la bonne région, comprendre pourquoi une architecture doit tenir sur plusieurs AZ, et savoir qui — d'AWS ou de toi — est responsable de quoi.

> **Repère pour un dev Symfony/Docker —** pense « région » comme un datacenter géographique complet (ex. un cluster Kubernetes multi-cloud géré par AWS), et « AZ » comme une salle serveur physiquement isolée à l'intérieur de ce datacenter, reliée aux autres salles par un réseau très rapide.

## Région, Availability Zone, Edge Location

```mermaid
flowchart TB
    subgraph W["Infrastructure mondiale AWS"]
        subgraph R1["Région eu-west-3 (Paris)"]
            AZ1["AZ eu-west-3a<br/>1+ datacenters"]
            AZ2["AZ eu-west-3b<br/>1+ datacenters"]
            AZ3["AZ eu-west-3c<br/>1+ datacenters"]
            AZ1 <-->|"liens réseau redondants<br/>faible latence"| AZ2
            AZ2 <--> AZ3
            AZ1 <--> AZ3
        end
        subgraph R2["Région us-east-1 (Virginie)"]
            AZa["AZ us-east-1a"]
            AZb["AZ us-east-1b"]
        end
        E["Edge Locations<br/>(CloudFront, Route 53)<br/>bien plus nombreuses que les régions"]
    end
    Client["Utilisateur final"] -->|contenu mis en cache,<br/>faible latence| E
```

- **Région** — une zone géographique (« eu-west-3 » = Paris, « us-east-1 » = Virginie du Nord) composée de plusieurs Availability Zones. Chaque région est **totalement indépendante** : les ressources ne sont pas répliquées automatiquement d'une région à l'autre.
- **Availability Zone (AZ)** — un ou plusieurs datacenters distincts, avec alimentation électrique, refroidissement et réseau redondants, physiquement séparés des autres AZ de la région (pour éviter qu'une inondation ou une coupure électrique n'affecte plusieurs AZ à la fois), mais reliés entre eux par un réseau privé à très faible latence.
- **Edge Location** — un point de présence utilisé par CloudFront (CDN) et Route 53 pour mettre du contenu en cache au plus près de l'utilisateur final. Il en existe **beaucoup plus** que de régions/AZ.

> 🎯 **Piège d'examen —** une architecture « hautement disponible » qui ne tient que sur **une seule AZ** n'est PAS hautement disponible, même avec 10 instances EC2 dedans : si l'AZ tombe, tout tombe. La haute disponibilité SAA-C03 = **au moins 2 AZ**.

## Comment choisir une région

Un scénario d'examen classique donne un contexte métier et demande la région la plus adaptée. Quatre critères à croiser :

| Critère | Question à se poser |
|---|---|
| **Conformité / souveraineté des données** | La loi ou le contrat client impose-t-il que les données restent dans un pays/une zone donnée (ex. RGPD → UE) ? |
| **Proximité des utilisateurs** | Où sont mes utilisateurs finaux ? Plus la région est proche, plus la latence réseau est faible. |
| **Services disponibles** | Tous les services AWS ne sont pas déployés dans toutes les régions (les nouveautés arrivent d'abord dans `us-east-1`). |
| **Coût** | Le prix d'un même service varie d'une région à l'autre (électricité, taxes locales, coûts fonciers). |

## Le modèle de responsabilité partagée

AWS et le client se partagent la sécurité — mais pas de la même façon selon le type de service.

```mermaid
flowchart TB
    subgraph AWS["Sécurité DU cloud — responsabilité AWS"]
        A1["Infrastructure physique<br/>(datacenters, matériel)"]
        A2["Réseau global<br/>(régions, AZ, edge locations)"]
        A3["Virtualisation<br/>(hyperviseur)"]
    end
    subgraph Client["Sécurité DANS le cloud — responsabilité client"]
        C1["Données (chiffrement, classification)"]
        C2["Gestion IAM (utilisateurs, policies, MFA)"]
        C3["Configuration OS, pare-feu, patchs<br/>(pour les services non managés)"]
        C4["Chiffrement en transit / au repos"]
    end
    AWS -. frontière .-> Client
```

- **AWS gère la sécurité *du* cloud** : les datacenters, le matériel, le réseau global, l'infrastructure des services managés.
- **Le client gère la sécurité *dans* le cloud** : ses données, la configuration IAM, le chiffrement, et — pour les services **non managés** — le système d'exploitation et les correctifs.

> 🎯 **Piège d'examen —** la frontière **se déplace selon le service**. Pour EC2 (IaaS, non managé) : AWS gère le hardware et l'hyperviseur, **toi** tu gères l'OS, les patchs, le pare-feu (security groups) et les données. Pour RDS (managé) : AWS gère aussi l'OS et les patchs de la base ; **toi** tu gères les données, les accès IAM et la configuration réseau (VPC/security groups). Plus un service est managé, plus AWS remonte dans la pile de responsabilité — mais **la sécurité des données et des accès reste toujours côté client**.

## À retenir

- Région = zone géographique indépendante ; AZ = datacenter isolé à l'intérieur d'une région ; Edge Location = point de cache CDN, bien plus nombreux.
- Haute disponibilité = **minimum 2 AZ**, jamais une seule.
- Choisir une région : conformité > proximité > services disponibles > coût.
- Responsabilité partagée : AWS sécurise *le* cloud (infrastructure), le client sécurise *ce qu'il met dans* le cloud (données, IAM, et OS/patchs pour les services non managés).
