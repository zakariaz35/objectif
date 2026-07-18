---
title: "Quiz — Opérations"
type: quiz
questions:
  - prompt: |
      Un conteneur dépasse sa `limits.cpu` de façon soutenue. Quelle est la conséquence
      directe ?
    options:
      - "Le conteneur est immédiatement tué (OOMKilled), comme pour un dépassement de limite mémoire."
      - "Le conteneur est simplement throttled (ralenti) : son usage CPU est plafonné, sans jamais être tué pour ce seul motif."
      - "Le Pod entier passe en Pending jusqu'à ce que la charge CPU redescende sous la limite."
      - "Kubernetes augmente automatiquement la limite pour éviter tout impact utilisateur."
    answer: 1
    tags: [requests-limits, cpu]
    level: debutant
    explanation: >
      CPU et mémoire ne se comportent pas pareil en cas de dépassement de limite : le
      CPU est une ressource compressible (throttling), la mémoire ne l'est pas
      (OOMKill, option 0 confondant les deux). Rien ne repasse un Pod Running en
      Pending pour ce motif (option 2 fausse), et Kubernetes n'ajuste jamais une limite
      tout seul (option 3 fausse).
  - prompt: |
      `kubectl get pod` affiche `CrashLoopBackOff` pour un Pod. La première vérification
      à faire pour orienter le diagnostic est :
    options:
      - "Relire uniquement le code source de l'application, la cause est nécessairement applicative."
      - "Consulter lastState.terminated.reason (ex. OOMKilled) avant toute autre piste : la cause peut être une limite de ressources, pas un bug."
      - "Supprimer immédiatement le Pod et en recréer un nouveau à l'identique, sans investigation préalable."
      - "Augmenter systématiquement replicas pour répartir la charge sur plus de Pods."
    answer: 1
    tags: [debug, crashloopbackoff]
    level: debutant
    explanation: >
      `CrashLoopBackOff` peut avoir des causes très diverses (bug applicatif, mais aussi
      OOMKill, échec de probe, mauvaise configuration) — `lastState.terminated.reason`
      tranche rapidement (option 1). Les autres options sautent l'étape de diagnostic
      (options 0, 2, 3), risquant de traiter le mauvais problème.
  - prompt: |
      Un Deployment n'a **aucune** `requests.cpu` définie sur ses conteneurs. Un HPA est
      créé, ciblant l'utilisation CPU à 50%. Que se passe-t-il ?
    options:
      - "Le HPA scale correctement en se basant sur l'utilisation CPU absolue en millicores, sans besoin de requests."
      - "Le HPA reste bloqué avec une cible <unknown>, car le pourcentage cible se calcule par rapport aux requests, qui n'existent pas ici."
      - "Kubernetes attribue automatiquement une requests.cpu par défaut de 100m pour permettre le calcul du HPA."
      - "Le HPA scale immédiatement au maximum (maxReplicas), par sécurité, en l'absence de référence claire."
    answer: 1
    tags: [hpa, requests]
    level: intermediaire
    explanation: >
      Le pourcentage HPA (`averageUtilization`) est toujours relatif aux `requests` du
      conteneur — sans elles, aucun calcul n'est possible (option 1). Aucune valeur par
      défaut n'est injectée automatiquement (option 2 fausse), et il n'y a pas de
      comportement de repli vers le maximum (option 3 fausse).
  - prompt: |
      Un Pod vient de redémarrer (`RESTARTS: 3`) et `kubectl logs <pod>` affiche une
      sortie vide ou peu informative. Quelle commande donne le plus de chances de
      trouver la cause du crash précédent ?
    options:
      - "kubectl logs <pod> --previous, pour lire les logs du conteneur précédent (celui qui a effectivement crashé)."
      - "kubectl get pod <pod> -o wide, pour voir sur quel node il tourne actuellement."
      - "kubectl delete pod <pod>, pour forcer une recréation propre et repartir de zéro."
      - "kubectl scale deployment --replicas=0 puis --replicas=1, pour redémarrer proprement."
    answer: 0
    tags: [debug, logs]
    level: intermediaire
    explanation: >
      Le conteneur **actuel** peut ne rien avoir loggé encore (il vient tout juste de
      redémarrer) ; `--previous` cible spécifiquement le conteneur précédent, celui qui
      a réellement échoué (option 0). Les autres commandes (1, 2, 3) ne donnent aucune
      information supplémentaire sur la cause du crash.
  - prompt: |
      Une équipe veut déployer la même application avec 1 réplique en staging et 5 en
      production, sans dupliquer entièrement le YAML du Deployment. Quel outil, intégré
      nativement à `kubectl`, répond à ce besoin sans introduire de langage de template ?
    options:
      - "Helm, avec des valeurs différentes par environnement dans un fichier values.yaml."
      - "kustomize (kubectl apply -k), via une base commune et des overlays par environnement qui patchent le nombre de répliques."
      - "Un script bash qui fait un sed sur le champ replicas avant chaque déploiement."
      - "kubectl edit, exécuté manuellement après chaque déploiement pour ajuster le nombre de répliques."
    answer: 1
    tags: [kustomize]
    level: avance
    explanation: >
      Helm (option 0) répond à un besoin voisin mais avec du templating complet et la
      notion de charts packagés — plus ambitieux que nécessaire ici, et pas "intégré
      nativement à kubectl" comme kustomize (`kubectl -k`). Un `sed` (option 2) ou un
      `kubectl edit` manuel (option 3) fonctionnent mais ne sont ni déclaratifs ni
      versionnables proprement dans Git, contrairement à un overlay kustomize.
---

Vérifie ta compréhension des ressources, de l'autoscaling et du débogage kubectl.
