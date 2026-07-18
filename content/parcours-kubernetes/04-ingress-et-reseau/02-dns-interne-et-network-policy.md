---
title: "DNS interne et NetworkPolicy : le réseau plat, par défaut, jusqu'à ce qu'on le ferme"
type: lesson
---

# DNS interne et NetworkPolicy : le réseau plat, par défaut, jusqu'à ce qu'on le ferme

Sur `docker compose`, tu joins un service par son **nom** grâce au DNS interne de
Docker (`http://api:8080`), à condition de partager le même réseau `docker compose`.
Kubernetes a un mécanisme équivalent, mais sa portée par défaut est plus large — et
c'est justement ce qu'une **NetworkPolicy** vient restreindre.

## CoreDNS : un nom, toujours le même format

Chaque Service reçoit un nom DNS interne, résolu par **CoreDNS** (qui tourne comme Pod
système du cluster) :

```
<service>.<namespace>.svc.cluster.local
```

```bash
kubectl exec curl-test -- curl -s http://api.default.svc.cluster.local
```

Depuis un Pod du **même** namespace, le nom court `api` suffit (CoreDNS complète le
`.default.svc.cluster.local` automatiquement) ; depuis un **autre** namespace, il faut
soit le nom complet, soit `api.default` (namespace explicite, domaine implicite).

> **Repère —** contrairement à `docker compose` où le partage d'un même réseau nommé
> conditionne la résolution DNS, **tout Service Kubernetes est résolvable depuis
> n'importe quel Pod du cluster**, quel que soit son namespace — la résolution DNS n'a
> **jamais** été une frontière de sécurité sur Kubernetes. C'est le rôle d'une tout
> autre ressource : la **NetworkPolicy**.

## Par défaut : un réseau plat, sans cloisonnement

Sans aucune NetworkPolicy, **tout Pod peut joindre tout autre Pod du cluster**, quel que
soit le namespace. Vérifié en conditions réelles : un pod quelconque atteint un service
`api` sans aucune restriction, avant toute NetworkPolicy :

```bash
kubectl exec curl-probe -- curl -s http://api.default.svc.cluster.local
# Hostname: api-5f7d74b6bd-tz6tp   <- reaches it, no restriction at all
```

## NetworkPolicy : deny-by-default, puis autorisations explicites

Une `NetworkPolicy` au `podSelector` vide (`{}`) s'applique à **tous** les Pods du
namespace ; sans règle `from`, elle **bloque tout le trafic entrant** — le motif
"deny-all" de base, à poser avant d'ajouter des autorisations ciblées :

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all-ingress
spec:
  podSelector: {}          # every Pod in this namespace
  policyTypes:
    - Ingress
  # no "from" rules at all => nothing is allowed in
```

Vérifié en conditions réelles : après application, la **même** requête qui passait à
l'instant est désormais bloquée — **immédiatement**, sans redémarrer le moindre Pod :

```bash
kubectl apply -f deny-all-ingress.yaml
kubectl exec curl-probe -- curl -s --max-time 3 http://api.default.svc.cluster.local
# curl: (7) Failed to connect ... Connection refused
```

> **Piège classique** — poser un `deny-all-ingress` **sans aucune règle d'autorisation**
> derrière casse **tout**, y compris le trafic légitime venant de l'ingress controller
> lui-même (module précédent) : Traefik tournant dans `kube-system` devient bloqué
> exactement comme n'importe quel autre client. Un `deny-all-ingress` n'est jamais posé
> seul en pratique — toujours accompagné d'autorisations explicites, ciblées par
> `podSelector`/`namespaceSelector`.

## Autoriser précisément ce qui doit passer

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-web-to-api
spec:
  podSelector:
    matchLabels:
      app: api               # this policy protects Pods labeled app=api
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: web        # only allow traffic FROM Pods labeled app=web
      ports:
        - port: 8080
```

Vérifié en conditions réelles, dans les deux sens :

```bash
# A Pod labeled "app: api" (matching the policy's "from") reaches "cache" — allowed
kubectl run redis-client-api --labels="app=api" -- redis-cli -h cache ping
# PONG

# An unlabeled Pod (no match on "from") gets refused — denied
kubectl run redis-client-random -- redis-cli -h cache -t 3 ping
# Could not connect to Redis at cache: Connection refused
```

> **Repère —** une NetworkPolicy sélectionne par **labels**, pas par identité de
> Deployment. N'importe quel Pod portant le bon label matche la règle `from` — un
> rappel que les labels Kubernetes sont un mécanisme de sélection générique
> (module 2), utilisé ici pour la sécurité réseau, pas uniquement pour les Services.

### Autoriser explicitement l'ingress controller (cross-namespace)

Traefik tourne dans `kube-system`, un namespace différent de tes apps — l'autoriser
demande de combiner `namespaceSelector` **et** `podSelector` :

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-ingress-controller
spec:
  podSelector:
    matchLabels:
      app: web
  policyTypes:
    - Ingress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: kube-system   # built-in label, always present
          podSelector:
            matchLabels:
              app.kubernetes.io/name: traefik
```

`kubernetes.io/metadata.name` est un label **automatiquement** posé par Kubernetes sur
chaque namespace depuis sa création — toujours disponible, sans configuration
supplémentaire, pour cibler un namespace par son nom dans un `namespaceSelector`.

## À retenir

- CoreDNS résout `<service>.<namespace>.svc.cluster.local` **depuis n'importe quel Pod du
  cluster**, quel que soit son namespace — la résolution DNS n'a jamais été une
  frontière de sécurité.
- Sans NetworkPolicy, le réseau du cluster est **plat** : tout Pod joint tout autre Pod.
- Le motif standard : un `deny-all-ingress` (`podSelector: {}`, aucune règle `from`) puis
  des autorisations **explicites**, ciblées par `podSelector` et/ou `namespaceSelector` —
  sans oublier d'autoriser l'ingress controller lui-même, sous peine de tout bloquer y
  compris le trafic public légitime.
- Une NetworkPolicy matche par **labels**, pas par identité d'objet — cohérent avec le
  mécanisme de sélection déjà vu pour les Services (module 2).
