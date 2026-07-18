---
title: "Modules, exceptions & gestion d'erreurs"
type: lesson
---

## Modules : réutiliser du code

Un **module** est un fichier `.py`. On en importe le contenu pour le réutiliser. Plusieurs formes :

```python
import math                  # access via math.sqrt(...)
from math import sqrt        # direct access to sqrt(...)
from math import pi as PI    # alias
```

La bibliothèque standard ("piles incluses") couvre énormément : `math`, `json`, `datetime`, `collections`, `itertools`, `pathlib`… Pour le reste, on installe des paquets tiers (hors de cette sandbox autoportante).

## Exceptions : échouer proprement

Une **exception** interrompt le flux normal pour signaler une erreur. On la lève avec `raise` et on la rattrape avec `try / except` :

```python
try:
    reste = retirer(100, 200)
except SoldeInsuffisant as exc:
    print("Rejected:", exc)
else:
    print("OK")          # if NO exception occurred
finally:
    print("always")    # ALWAYS, exception or not
```

Bonnes pratiques :

- **Crée tes propres exceptions** en héritant d'`Exception` (`class SoldeInsuffisant(Exception): ...`) : un nom métier vaut mille commentaires.
- **Attrape précis**, pas `except Exception` à l'aveugle : tu masquerais des bugs.
- **Chaîne les exceptions** avec `raise NouvelleErreur(...) from exc` pour conserver la cause d'origine (visible dans `__cause__` et la trace).

> `finally` s'exécute quoi qu'il arrive — idéal pour libérer une ressource (fichier, connexion).

```python
# Hierarchy: you can catch several types
try:
    risque()
except (ValueError, KeyError) as exc:   # several types at once
    print("invalid input:", exc)
except Exception as exc:                # safety net, last resort
    print("unexpected:", exc)

# The 'with' context manager handles cleanup on its own
with open("file.txt") as f:    # f.close() guaranteed, even on error
    contenu = f.read()
```

---

## Comparaison PHP / JS → Python : modules et espaces de noms

| Concept | PHP | JavaScript (ES modules) | Python |
|---------|-----|------------------------|--------|
| Espace de noms | `namespace App\Http;` | implicite (fichier = module) | implicite (fichier = module) |
| Importer tout | `use App\Foo;` | `import Foo from './foo'` | `import math` |
| Import sélectif | `use App\Foo\Bar;` | `import { bar } from './foo'` | `from math import sqrt` |
| Alias | `use App\Foo as Bar;` | `import { fn as f }` | `import numpy as np` |
| Autoloader | PSR-4 + Composer | résolution bundler / Node | `sys.path` + `PYTHONPATH` |
| Paquets tiers | `composer require x/y` | `npm install x` | `pip install x` |
| Re-export | classe visible via namespace | `export { fn }` | tout est importable par défaut |

> En Python, **il n'y a pas de déclaration `namespace`** : le nom du fichier `.py` *est* son module. Si `monpackage/utils.py` existe, on écrit `from monpackage.utils import helper`.

---

## Piège : l'import circulaire

L'**import circulaire** survient quand `a.py` importe `b.py` et `b.py` importe `a.py`. Python exécute le fichier importé dès la première rencontre de `import` ; si ce module n'est pas encore terminé, l'import renvoie une version **partielle**, ce qui cause un `ImportError` ou un `AttributeError` silencieux.

```python
# --- a.py ---
from b import hello   # triggers execution of b.py

def greet():
    return "greet from a"

# --- b.py ---
from a import greet   # a.py is not finished yet! greet is undefined.

def hello():
    return greet()
```

**Solutions :**

```python
# Solution 1 — local import: deferred to call time, not module load time
# --- b.py ---
def hello():
    from a import greet   # only imported when hello() is actually called
    return greet()

# Solution 2 — import the module, not the name
# --- b.py ---
import a

def hello():
    return a.greet()   # a.greet is resolved at call time, not at import time

# Solution 3 — extract shared code into a third module (c.py)
# a.py and b.py both import from c.py — cycle broken
```

> Un import circulaire signale souvent un **problème de découpage** : deux modules qui s'importent mutuellement devraient partager une troisième brique commune (`c.py`).

## Bac à sable

> Ajoute un montant à la boucle (ex. 100, pile le solde), ou crée une exception MontantNegatif et lève-la si montant < 0 dans retirer().

```python
# Modules (import) + error handling
import math
from math import sqrt, pi as PI   # selective import + alias

print("math.factorial(5) =", math.factorial(5))
print("sqrt(144)         =", sqrt(144))
print("PI                =", round(PI, 4))

# Custom business exception: inherits from Exception
class SoldeInsuffisant(Exception):
    """Raised when a withdrawal exceeds the available balance."""

def retirer(solde: float, montant: float) -> float:
    if montant > solde:
        raise SoldeInsuffisant(f"Withdrawal of {montant} > balance of {solde}")
    return solde - montant

# try / except / else / finally
for montant in (30, 200):
    try:
        reste = retirer(100, montant)
    except SoldeInsuffisant as exc:
        print("Business error:", exc)
    else:
        print(f"OK, remaining {reste}")   # executed IF no exception occurred
    finally:
        print("   (transaction logged)")   # ALWAYS executed

# Exception chaining with 'raise ... from ...'
def parser_age(texte: str) -> int:
    try:
        return int(texte)
    except ValueError as exc:
        raise ValueError(f"Invalid age: {texte!r}") from exc

try:
    parser_age("abc")
except ValueError as exc:
    print("Captured:", exc)
    print("Cause   :", repr(exc.__cause__))
```
