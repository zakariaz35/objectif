---
title: "ConfigMap et Secret : configuration externalisée (et ses limites)"
type: lesson
---

# ConfigMap et Secret : configuration externalisée (et ses limites)

Avec `docker compose`, tu externalises la config via `environment:` (en dur ou via un
`.env`). Kubernetes sépare cette idée en deux objets distincts, selon la **sensibilité**
de la donnée : **ConfigMap** pour le non-sensible, **Secret** pour le reste — avec une
nuance importante que beaucoup de débutants ratent : **un Secret n'est pas chiffré par
défaut.**

## ConfigMap : configuration non sensible

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  APP_ENV: production
  APP_GREETING: "Hello from ConfigMap"
```

## Secret : même mécanique, une sémantique différente

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
stringData:                    # plain text here — Kubernetes base64-encodes it for you
  DB_PASSWORD: s3cr3t-value
```

`stringData` est un confort d'écriture : à la lecture, l'objet stocké est toujours en
`data`, encodé en **base64** :

```bash
kubectl apply -f secret.yaml
kubectl get secret app-secret -o yaml
```

```yaml
apiVersion: v1
data:
  DB_PASSWORD: czNjcjN0LXZhbHVl
kind: Secret
```

> **Piège réel —** base64 n'est **pas** du chiffrement, juste un encodage réversible en
> une commande :
>
> ```bash
> echo "czNjcjN0LXZhbHVl" | base64 -d
> # s3cr3t-value
> ```
>
> Vérifié en conditions réelles : n'importe qui ayant accès en lecture à l'objet Secret
> (via `kubectl get secret -o yaml`, ou un accès direct à `etcd` non chiffré) lit le mot
> de passe **en clair** en une commande. Un Secret protège contre l'affichage
> accidentel (`kubectl get secret` seul ne montre pas les valeurs), pas contre un accès
> avec les bonnes permissions RBAC. En production, on active le **chiffrement au repos
> d'etcd** (`EncryptionConfiguration`) et/ou on utilise un gestionnaire de secrets
> externe (Vault, AWS Secrets Manager…) — hors du périmètre débutant de ce module, mais
> à savoir : le Secret Kubernetes natif reste un **premier niveau**, pas une solution de
> bout en bout.

## Les utiliser dans un Pod

Deux façons : variables d'environnement (`envFrom`) ou fichiers montés (`volumes`).

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: config-demo
spec:
  containers:
    - name: config-demo
      image: traefik/whoami:latest
      envFrom:
        - configMapRef:
            name: app-config
        - secretRef:
            name: app-secret
```

Vérifié en conditions réelles :

```bash
kubectl exec config-demo -- env | grep -E 'APP_|DB_'
```

```
APP_ENV=production
APP_GREETING=Hello from ConfigMap
DB_PASSWORD=s3cr3t-value
```

Depuis l'intérieur du conteneur, ConfigMap et Secret sont **indiscernables** : les deux
apparaissent comme de simples variables d'environnement en clair. La différence de
traitement (chiffrement, RBAC dédié) se joue **avant**, côté cluster — pas dans le
conteneur qui les consomme.

### En volume : chaque clé devient un fichier

```yaml
    spec:
      containers:
        - name: config-demo
          image: traefik/whoami:latest
          volumeMounts:
            - name: config
              mountPath: /config
      volumes:
        - name: config
          configMap:
            name: app-config
```

```bash
kubectl exec config-demo -- ls /config
# APP_ENV  APP_GREETING
kubectl exec config-demo -- cat /config/APP_GREETING
# Hello from ConfigMap
```

Utile pour un fichier de configuration complet (ex. `nginx.conf`) plutôt que des paires
clé-valeur isolées — chaque clé du ConfigMap devient un fichier distinct dans le
répertoire monté.

> **Repère —** préfère `envFrom` pour quelques variables simples, un volume monté pour
> un vrai fichier de config (ou beaucoup de clés). Un changement de ConfigMap **monté en
> volume** se propage aux Pods existants après un court délai (sans redémarrage) ; un
> changement injecté via `envFrom` **ne se propage jamais** à un Pod déjà démarré — il
> faut un rollout (`kubectl rollout restart`) pour le prendre en compte.

## À retenir

- **ConfigMap** pour le non-sensible, **Secret** pour le reste — mais un Secret natif
  n'est encodé en base64 que par défaut, **pas chiffré** : ce n'est pas une barrière
  contre un accès avec les bonnes permissions.
- `stringData` (écriture en clair) est converti en `data` (base64) à la lecture — les
  deux objets sont manipulés de façon strictement identique dans un Pod (`envFrom` ou
  volume monté).
- Une variable injectée via `envFrom` ne se met **pas** à jour sur un Pod déjà démarré si
  le ConfigMap/Secret change ; un volume monté, si (après un court délai) — nuance à
  connaître avant de chercher un bug qui n'en est pas un.
