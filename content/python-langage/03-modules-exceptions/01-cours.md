---
title: "Modules, exceptions & gestion d'erreurs"
type: lesson
---

## Modules : réutiliser du code

Un **module** est un fichier `.py`. On en importe le contenu pour le réutiliser. Plusieurs formes :

```python
import math                  # accès via math.sqrt(...)
from math import sqrt        # accès direct à sqrt(...)
from math import pi as PI    # alias
```

La bibliothèque standard ("piles incluses") couvre énormément : `math`, `json`, `datetime`, `collections`, `itertools`, `pathlib`… Pour le reste, on installe des paquets tiers (hors de cette sandbox autoportante).

## Exceptions : échouer proprement

Une **exception** interrompt le flux normal pour signaler une erreur. On la lève avec `raise` et on la rattrape avec `try / except` :

```python
try:
    reste = retirer(100, 200)
except SoldeInsuffisant as exc:
    print("Refusé :", exc)
else:
    print("OK")          # si AUCUNE exception
finally:
    print("toujours")    # TOUJOURS, exception ou pas
```

Bonnes pratiques :

- **Crée tes propres exceptions** en héritant d'`Exception` (`class SoldeInsuffisant(Exception): ...`) : un nom métier vaut mille commentaires.
- **Attrape précis**, pas `except Exception` à l'aveugle : tu masquerais des bugs.
- **Chaîne les exceptions** avec `raise NouvelleErreur(...) from exc` pour conserver la cause d'origine (visible dans `__cause__` et la trace).

> `finally` s'exécute quoi qu'il arrive — idéal pour libérer une ressource (fichier, connexion).

```python
# Hiérarchie : on peut attraper plusieurs types
try:
    risque()
except (ValueError, KeyError) as exc:   # plusieurs types d'un coup
    print("entrée invalide :", exc)
except Exception as exc:                # filet de sécurité, en dernier
    print("imprévu :", exc)

# Le gestionnaire de contexte 'with' appelle le nettoyage tout seul
with open("fichier.txt") as f:    # f.close() garanti, même en cas d'erreur
    contenu = f.read()
```

## Bac à sable

> Ajoute un montant à la boucle (ex. 100, pile le solde), ou crée une exception MontantNegatif et lève-la si montant < 0 dans retirer().

```python
# Modules (import) + gestion d'erreurs
import math
from math import sqrt, pi as PI   # import sélectif + alias

print("math.factorial(5) =", math.factorial(5))
print("sqrt(144)         =", sqrt(144))
print("PI                =", round(PI, 4))

# Exception métier maison : on hérite d'Exception
class SoldeInsuffisant(Exception):
    """Levée quand un retrait dépasse le solde disponible."""

def retirer(solde: float, montant: float) -> float:
    if montant > solde:
        raise SoldeInsuffisant(f"Retrait de {montant} > solde de {solde}")
    return solde - montant

# try / except / else / finally
for montant in (30, 200):
    try:
        reste = retirer(100, montant)
    except SoldeInsuffisant as exc:
        print("Erreur métier  :", exc)
    else:
        print(f"OK, reste {reste}")   # exécuté SI aucune exception
    finally:
        print("   (transaction journalisée)")   # TOUJOURS exécuté

# Chaînage d'exceptions avec 'raise ... from ...'
def parser_age(texte: str) -> int:
    try:
        return int(texte)
    except ValueError as exc:
        raise ValueError(f"Age invalide : {texte!r}") from exc

try:
    parser_age("abc")
except ValueError as exc:
    print("Capturé :", exc)
    print("Cause   :", repr(exc.__cause__))
```
