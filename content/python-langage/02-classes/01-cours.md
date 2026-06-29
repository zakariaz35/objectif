---
title: "Classes & dataclasses"
type: lesson
---

## Le concept

Une **classe** est un patron qui réunit des **données** (attributs) et des **comportements** (méthodes). `__init__` est le constructeur ; `self` est l'instance courante :

```python
class CompteBancaire:
    def __init__(self, titulaire: str, solde: float = 0.0) -> None:
        self.titulaire = titulaire   # attribut d'instance
        self.solde = solde

    def deposer(self, montant: float) -> None:
        self.solde += montant
```

`__repr__` définit l'affichage lisible d'une instance (utile en debug). On crée une instance en "appelant" la classe : `c = CompteBancaire("Ada")`.

## Les dataclasses : moins de plomberie

Quand une classe ne sert qu'à **transporter des données**, écrire `__init__`, `__repr__` et `__eq__` à la main est répétitif. Le décorateur `@dataclass` les **génère pour toi** à partir des annotations :

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class Point:
    x: float
    y: float
```

- `frozen=True` rend l'instance **immuable** (toute réaffectation lève `FrozenInstanceError`).
- L'égalité `==` compare alors **par valeur** : `Point(3, 4) == Point(3, 4)` est `True`.

> **Défaut muable dans une dataclass.** Interdit d'écrire `articles: list = []` (même piège que les fonctions). Utilise `field(default_factory=list)`, qui crée une liste **neuve** par instance.

L'**héritage** permet à `CompteEpargne` de réutiliser `CompteBancaire` ; `super().__init__(...)` appelle le constructeur parent.

```python
# Méthodes spéciales courantes
class Vecteur:
    def __init__(self, x, y):
        self.x, self.y = x, y

    def __add__(self, autre):           # surcharge de l'opérateur +
        return Vecteur(self.x + autre.x, self.y + autre.y)

    def __eq__(self, autre):            # égalité par valeur
        return (self.x, self.y) == (autre.x, autre.y)

Vecteur(1, 2) + Vecteur(3, 4)   # Vecteur(4, 6)

# Attribut de classe (partagé) vs attribut d'instance (propre)
class Chien:
    espece = "Canis"          # partagé par toutes les instances
    def __init__(self, nom):
        self.nom = nom         # propre à chaque instance
```

## Bac à sable

> Ajoute une méthode retirer(montant) à CompteBancaire, ou enlève frozen=True de Point puis fais p.x = 99 pour voir la différence.

```python
# Classes & dataclasses
from dataclasses import dataclass, field

# Classe classique : __init__ pour l'état, méthodes pour le comportement
class CompteBancaire:
    def __init__(self, titulaire: str, solde: float = 0.0) -> None:
        self.titulaire = titulaire
        self.solde = solde

    def deposer(self, montant: float) -> None:
        self.solde += montant

    def __repr__(self) -> str:           # affichage lisible
        return f"CompteBancaire({self.titulaire!r}, solde={self.solde})"

c = CompteBancaire("Ada")
c.deposer(100)
c.deposer(50)
print(c)

# dataclass : __init__, __repr__ et __eq__ générés automatiquement
@dataclass(frozen=True)   # frozen => instance immuable
class Point:
    x: float
    y: float

    def distance_origine(self) -> float:
        return (self.x ** 2 + self.y ** 2) ** 0.5

p = Point(3.0, 4.0)
print("dataclass     :", p)
print("distance      :", p.distance_origine())
print("égalité valeur:", Point(3.0, 4.0) == Point(3.0, 4.0))   # True !

try:
    p.x = 99   # frozen interdit la mutation
except Exception as exc:
    print("frozen bloque :", type(exc).__name__)

# default_factory : défaut muable SÛR pour une dataclass
@dataclass
class Panier:
    articles: list[str] = field(default_factory=list)

panier = Panier()
panier.articles.append("pain")
print("default_factory:", panier)

# Héritage + super()
class CompteEpargne(CompteBancaire):
    def __init__(self, titulaire: str, taux: float) -> None:
        super().__init__(titulaire)
        self.taux = taux

    def appliquer_interets(self) -> None:
        self.solde *= (1 + self.taux)

e = CompteEpargne("Linus", 0.05)
e.deposer(1000)
e.appliquer_interets()
print("épargne       :", e, "| taux", e.taux)
```
