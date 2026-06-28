---
title: "Exercice — churnRate & retentionRate"
type: exercise
exercise:
  language: ts
  starter: |
    // Customer churn rate: share of customers lost over a period.
    // churnRate (%) = lostCustomers / totalCustomers * 100
    // totalCustomers === 0 -> null.
    function churnRate(lostCustomers: number, totalCustomers: number): number | null {
      // TODO: implement
      return null
    }

    // Retention rate: complement of churn.
    // retentionRate (%) = 100 - churnRate
    // totalCustomers === 0 -> null.
    function retentionRate(lostCustomers: number, totalCustomers: number): number | null {
      // TODO: implement
      return null
    }

    // Monthly Recurring Revenue lost to churn.
    // churnMRR = sum of monthly amounts of churned subscriptions.
    // Returns the total, 0 if no churned subscriptions.
    type Subscription = { customerId: number; monthlyAmount: number; churned: boolean }
    function churnMRR(subscriptions: Subscription[]): number {
      // TODO: implement
      return 0
    }
  tests:
    - name: "churnRate — cas nominal"
      code: |
        const got = churnRate(50, 1000)
        console.log('churn rate %:', got)
        assertEqual(got, 5, '50 lost out of 1000 = 5%')
    - name: "churnRate — aucun départ"
      code: |
        assertEqual(churnRate(0, 500), 0, '0 churned -> 0%')
    - name: "churnRate — base nulle"
      code: |
        assertEqual(churnRate(0, 0), null, 'no customers -> null')
    - name: "retentionRate — cas nominal"
      code: |
        const got = retentionRate(50, 1000)
        console.log('retention rate %:', got)
        assertEqual(got, 95, '100 - 5% churn = 95% retention')
    - name: "retentionRate — aucun départ"
      code: |
        assertEqual(retentionRate(0, 200), 100, 'no churn -> 100% retention')
    - name: "retentionRate — base nulle"
      code: |
        assertEqual(retentionRate(0, 0), null, 'no customers -> null')
    - name: "churnMRR — calcul simple"
      code: |
        const subs = [
          { customerId: 1, monthlyAmount: 99,  churned: true  },
          { customerId: 2, monthlyAmount: 299, churned: false },
          { customerId: 3, monthlyAmount: 49,  churned: true  },
        ]
        const got = churnMRR(subs)
        console.log('churn MRR (€):', got)
        assertEqual(got, 148, '99 + 49 = 148 (only churned subscriptions)')
    - name: "churnMRR — aucun churn"
      code: |
        const subs = [
          { customerId: 10, monthlyAmount: 200, churned: false },
          { customerId: 11, monthlyAmount: 150, churned: false },
        ]
        assertEqual(churnMRR(subs), 0, 'no churned subscriptions -> 0')
    - name: "churnMRR — tableau vide"
      code: |
        assertEqual(churnMRR([]), 0, 'empty -> 0')
---

## Énoncé

Le **churn** (attrition) est un KPI clé pour toute activité à base d'abonnements ou de
clientèle récurrente : e-commerce, SaaS, télécom, assurance.

**1. `churnRate(lostCustomers, totalCustomers)`** — taux de désabonnement / attrition :

```
churn (%) = lostCustomers / totalCustomers × 100
```

Si `totalCustomers === 0` → `null`.

**2. `retentionRate(lostCustomers, totalCustomers)`** — taux de rétention :

```
retention (%) = 100 − churnRate
```

Si `totalCustomers === 0` → `null`.

**3. `churnMRR(subscriptions)`** — MRR (*Monthly Recurring Revenue*) **perdu** par
attrition. Chaque abonnement a un `monthlyAmount` et un drapeau `churned`. Somme
uniquement les abonnements `churned === true`. Renvoie `0` si aucun churn ou tableau vide.

> **Contexte métier —** un churn mensuel de 5 % signifie que, sans acquisition, la base
> client est divisée par 2 en ~14 mois. La **rétention** (95 %) est souvent plus facile à
> communiquer positivement.

<!--correction-->

## Correction

```ts
function churnRate(lostCustomers: number, totalCustomers: number): number | null {
  if (totalCustomers === 0) return null
  return (lostCustomers / totalCustomers) * 100
}

function retentionRate(lostCustomers: number, totalCustomers: number): number | null {
  const churn = churnRate(lostCustomers, totalCustomers)
  if (churn === null) return null
  return 100 - churn
}

type Subscription = { customerId: number; monthlyAmount: number; churned: boolean }

function churnMRR(subscriptions: Subscription[]): number {
  return subscriptions
    .filter(s => s.churned)
    .reduce((sum, s) => sum + s.monthlyAmount, 0)
}
```

`retentionRate` réutilise `churnRate` pour ne pas dupliquer la garde. `churnMRR` combine
un `filter` (sélectionner les churned) et un `reduce` (sommer les montants) : la logique
`filtrer → agréger` est la même qu'en SQL (`WHERE churned = true → SUM`).
