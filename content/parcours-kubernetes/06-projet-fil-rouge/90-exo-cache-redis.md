---
title: "Exercice — ajouter un cache Redis, isolé par NetworkPolicy"
type: exercise
---

## Énoncé

La stack `shop` (namespace `shop`) tourne : `db` (StatefulSet Postgres), `api` et `web`
(Deployments), exposée via un Ingress Traefik, protégée par des NetworkPolicy
(`default-deny-ingress` + autorisations ciblées).

Le service `api` a besoin d'un **cache Redis**, utilisé **uniquement** par lui — ni `web`
ni aucun autre Pod du cluster ne doit pouvoir l'atteindre. Écris les manifests complets
pour :

1. Un **Deployment** `cache` (namespace `shop`, 1 réplique) utilisant l'image
   `redis:7-alpine`, avec :
   - une `readinessProbe` **et** une `livenessProbe` qui vérifient réellement que Redis
     répond (indice : `redis-cli ping`) ;
   - des `resources.requests`/`limits` raisonnables pour un cache léger (quelques
     dizaines de Mi de mémoire, une fraction de CPU).
2. Un **Service** `cache` (`ClusterIP`, port `6379`) qui expose ce Deployment.
3. Une **NetworkPolicy** qui autorise **uniquement** les Pods labellisés `app: api` à
   joindre `cache` sur le port `6379` — tout le reste doit rester bloqué (le
   `default-deny-ingress` déjà en place dans le namespace s'en charge par défaut, il
   ne manque que l'autorisation ciblée).

<!--correction-->

## Correction

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cache
  namespace: shop
spec:
  replicas: 1
  selector:
    matchLabels:
      app: cache
  template:
    metadata:
      labels:
        app: cache
    spec:
      containers:
        - name: redis
          image: redis:7-alpine
          ports:
            - containerPort: 6379
          readinessProbe:
            exec:
              command: ["redis-cli", "ping"]
            periodSeconds: 5
          livenessProbe:
            exec:
              command: ["redis-cli", "ping"]
            periodSeconds: 10
            initialDelaySeconds: 5
          resources:
            requests:
              cpu: "50m"
              memory: "32Mi"
            limits:
              cpu: "200m"
              memory: "64Mi"
---
apiVersion: v1
kind: Service
metadata:
  name: cache
  namespace: shop
spec:
  selector:
    app: cache
  ports:
    - port: 6379
      targetPort: 6379
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-api-to-cache
  namespace: shop
spec:
  podSelector:
    matchLabels:
      app: cache        # this policy protects Pods labeled app=cache
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: api   # only Pods labeled app=api may reach it
      ports:
        - port: 6379
```

Vérifié en conditions réelles sur un vrai cluster, dans les deux sens :

```bash
# A Pod labeled "app: api" reaches "cache" — allowed
kubectl run redis-client-api -n shop --labels="app=api" --image=redis:7-alpine \
  --restart=Never --command -- sh -c "sleep 3600"
kubectl exec -n shop redis-client-api -- redis-cli -h cache.shop.svc.cluster.local ping
# PONG

# A Pod without that label gets refused — denied
kubectl run redis-client-random -n shop --image=redis:7-alpine \
  --restart=Never --command -- sh -c "sleep 3600"
kubectl exec -n shop redis-client-random -- redis-cli -h cache.shop.svc.cluster.local -t 3 ping
# Could not connect to Redis at cache.shop.svc.cluster.local:6379: Connection refused
```

Points clés :

- La NetworkPolicy protège les Pods **cible** (`podSelector: { app: cache }`), et
  n'autorise que le trafic venant de Pods matchant `app: api` — c'est une sélection par
  **label**, pas par Deployment précis : n'importe quel Pod portant `app: api` passerait,
  même en dehors du Deployment `api` officiel (module 4).
- Les probes utilisent `redis-cli ping` plutôt qu'un simple `tcpSocket` : elles vérifient
  que Redis **répond réellement** à une commande, pas juste que le port TCP accepte une
  connexion.
- Sans le `default-deny-ingress` déjà posé au niveau du namespace (module 4/projet), la
  NetworkPolicy `allow-api-to-cache` seule ne bloquerait **rien** d'autre — une NetworkPolicy
  d'autorisation n'a d'effet de blocage que combinée à un deny-all préexistant sur le
  Pod ciblé.
