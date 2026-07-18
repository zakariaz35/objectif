---
title: "Les manifests, bloc par bloc — déployés et vérifiés"
type: lesson
---

# Les manifests, bloc par bloc — déployés et vérifiés

Chaque bloc ci-dessous a été **appliqué sur un vrai cluster** (k3s) et vérifié
(`kubectl get`/`describe`, requêtes réelles). Rien n'est théorique : chaque commande
affichée est une sortie réellement observée.

## Bloc 0 — le namespace

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: shop
```

Tout ce qui suit est créé **dans** ce namespace (`-n shop`, ou `metadata.namespace: shop`
sur chaque objet) — regroupement logique de toute la stack (module 5).

## Bloc 1 — la base de données (StatefulSet + Secret + ConfigMap)

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
  namespace: shop
type: Opaque
stringData:
  POSTGRES_PASSWORD: change-me-in-prod
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: db-config
  namespace: shop
data:
  POSTGRES_DB: shop
  POSTGRES_USER: shop
---
# Headless Service: one stable DNS record per Pod (db-0.db.shop.svc.cluster.local),
# no load-balancing — required by StatefulSet (module 3).
apiVersion: v1
kind: Service
metadata:
  name: db
  namespace: shop
spec:
  clusterIP: None
  selector:
    app: db
  ports:
    - port: 5432
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: db
  namespace: shop
spec:
  serviceName: db
  replicas: 1
  selector:
    matchLabels:
      app: db
  template:
    metadata:
      labels:
        app: db
    spec:
      containers:
        - name: postgres
          image: postgres:16-alpine
          envFrom:
            - configMapRef:
                name: db-config
            - secretRef:
                name: db-credentials
          ports:
            - containerPort: 5432
          volumeMounts:
            - name: data
              mountPath: /var/lib/postgresql/data
              subPath: postgres   # avoids a "lost+found" directory tripping up postgres' data dir check
          readinessProbe:
            exec:
              command: ["pg_isready", "-U", "shop"]
            periodSeconds: 5
          livenessProbe:
            exec:
              command: ["pg_isready", "-U", "shop"]
            periodSeconds: 10
            initialDelaySeconds: 15
          resources:
            requests: { cpu: "100m", memory: "128Mi" }
            limits: { cpu: "500m", memory: "256Mi" }
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 1Gi
```

Vérifié en conditions réelles — une PVC dédiée est créée pour cette réplique, et une
vraie requête SQL confirme la connectivité de bout en bout, via le nom DNS stable de la
réplique :

```bash
kubectl get pvc -n shop
# data-db-0   Bound   pvc-...   1Gi   local-path

kubectl exec -n shop pg-client -- env PGPASSWORD=change-me-in-prod \
  psql -h db.shop.svc.cluster.local -U shop -d shop -c "select 1 as ok;"
#  ok
# ----
#   1
```

## Bloc 2 — l'API (Deployment + Service)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: api-config
  namespace: shop
data:
  DB_HOST: "db.shop.svc.cluster.local"
  DB_NAME: "shop"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: shop
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: traefik/whoami:latest
          args: ["--port=8080"]
          ports:
            - containerPort: 8080
          envFrom:
            - configMapRef: { name: api-config }
            - secretRef: { name: db-credentials }
          readinessProbe:
            httpGet: { path: /, port: 8080 }
            periodSeconds: 5
          livenessProbe:
            httpGet: { path: /, port: 8080 }
            periodSeconds: 10
            initialDelaySeconds: 5
          resources:
            requests: { cpu: "50m", memory: "32Mi" }
            limits: { cpu: "200m", memory: "64Mi" }
---
apiVersion: v1
kind: Service
metadata:
  name: api
  namespace: shop
spec:
  selector:
    app: api
  ports:
    - port: 80
      targetPort: 8080
```

`api` reçoit `DB_HOST`/`DB_NAME` via ConfigMap et le mot de passe via le **même** Secret
que la base — un Secret peut être référencé par plusieurs Deployments, aucune
duplication nécessaire.

## Bloc 3 — le web (Deployment + Service)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
  namespace: shop
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: web
          image: ealen/echo-server:latest
          ports:
            - containerPort: 80
          readinessProbe:
            httpGet: { path: /, port: 80 }
            periodSeconds: 5
          livenessProbe:
            httpGet: { path: /, port: 80 }
            periodSeconds: 10
            initialDelaySeconds: 5
          resources:
            requests: { cpu: "50m", memory: "32Mi" }
            limits: { cpu: "200m", memory: "64Mi" }
---
apiVersion: v1
kind: Service
metadata:
  name: web
  namespace: shop
spec:
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 80
```

Vérifié en conditions réelles — les deux Services répondent, à travers le cluster
(module 2) :

```bash
kubectl exec -n shop curltest -- curl -s http://api.shop.svc.cluster.local
# Hostname: api-9678fcb6d-8xhjh   <- one of the 2 replicas, load-balanced
```

## Bloc 4 — l'Ingress (module 4 : Traefik en ingress controller)

```yaml
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: api-stripprefix
  namespace: shop
spec:
  stripPrefix:
    prefixes: ["/api"]
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: shop
  namespace: shop
  annotations:
    traefik.ingress.kubernetes.io/router.entrypoints: web
    traefik.ingress.kubernetes.io/router.middlewares: shop-api-stripprefix@kubernetescrd
spec:
  ingressClassName: traefik
  rules:
    - host: shop.k8s-course.local
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service: { name: api, port: { number: 80 } }
          - path: /
            pathType: Prefix
            backend:
              service: { name: web, port: { number: 80 } }
```

Vérifié en conditions réelles, à travers Traefik — la racine atteint `web`, `/api/*`
atteint `api` avec le préfixe retiré :

```bash
curl -H "Host: shop.k8s-course.local" http://<traefik>/api/orders
# GET /orders HTTP/1.1        <- prefix stripped before reaching the api Pod
```

## Bloc 5 — les NetworkPolicy (deny-all + autorisations explicites)

```yaml
# 1. Deny everything by default (module 4)
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: default-deny-ingress, namespace: shop }
spec:
  podSelector: {}
  policyTypes: ["Ingress"]
---
# 2. Allow the ingress controller (Traefik, in kube-system) to reach web AND api
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: allow-ingress-controller-to-web-and-api, namespace: shop }
spec:
  podSelector:
    matchExpressions:
      - { key: app, operator: In, values: ["web", "api"] }
  policyTypes: ["Ingress"]
  ingress:
    - from:
        - namespaceSelector:
            matchLabels: { kubernetes.io/metadata.name: kube-system }
          podSelector:
            matchLabels: { app.kubernetes.io/name: traefik }
---
# 3. Allow "web" to reach "api"
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: allow-web-to-api, namespace: shop }
spec:
  podSelector: { matchLabels: { app: api } }
  policyTypes: ["Ingress"]
  ingress:
    - from: [{ podSelector: { matchLabels: { app: web } } }]
      ports: [{ port: 8080 }]
---
# 4. Allow "api" to reach "db"
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: allow-api-to-db, namespace: shop }
spec:
  podSelector: { matchLabels: { app: db } }
  policyTypes: ["Ingress"]
  ingress:
    - from: [{ podSelector: { matchLabels: { app: api } } }]
      ports: [{ port: 5432 }]
```

Vérifié en conditions réelles, **après** application des 4 policies ensemble — le trafic
légitime (Ingress → web/api, api → db) continue de fonctionner, et le trafic non
autorisé est bloqué :

```bash
# Legitimate traffic through the Ingress: still 200
curl -o /dev/null -w "%{http_code}\n" -H "Host: shop.k8s-course.local" http://<traefik>/
# 200

# A random Pod (no matching label) hitting "web" directly: blocked
kubectl exec -n shop curl-blocked -- curl -s -m 4 http://web.shop.svc.cluster.local
# curl: (7) Failed to connect ... Connection refused

# pg-client (no "app: api" label) hitting "db" directly: blocked
kubectl exec -n shop pg-client -- psql -h db.shop.svc.cluster.local -U shop -c "select 1;"
# psql: error: connection ... failed: Connection refused
```

## À retenir

- Chaque bloc de ce projet **réutilise** un concept déjà vu — aucune nouveauté : c'est
  un exercice d'assemblage cohérent, exactement comme le fil rouge Traefik.
- Un Secret (`db-credentials`) peut être partagé entre plusieurs Deployments (`db` et
  `api`) sans duplication.
- Les NetworkPolicy s'empilent : `default-deny-ingress` + 3 autorisations ciblées
  donnent une stack où **seul** le trafic explicitement voulu circule — vérifié dans les
  deux sens (autorisé/bloqué), pas juste en théorie.
