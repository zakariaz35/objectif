---
title: "Exercice — compléter une Server Action de contact"
type: exercise
---

> ⏱️ **Durée conseillée : ~15 min.**

## Énoncé

Un formulaire de contact appelle cette Server Action, actuellement incomplète :

```ts
// app/actions.ts
"use server"

export async function submitContactForm(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const message = formData.get("message") as string

  // TODO 1: validate the fields (see rules below) and return
  //         { success: false, errors: [...] } if invalid, WITHOUT calling fetch.

  await fetch("https://api.example.com/contact", {
    method: "POST",
    body: JSON.stringify({ name, email, message }),
  })

  // TODO 2: invalidate the cache of the page listing contact messages ("/admin/messages")

  // TODO 3: return { success: true } on success
}
```

```tsx
// app/contact/contact-form.tsx
import { submitContactForm } from "../actions"

export default function ContactForm() {
  return (
    <form action={submitContactForm}>
      <input name="name" placeholder="Name" />
      <input name="email" placeholder="Email" />
      <textarea name="message" placeholder="Message" />
      <button type="submit">Send</button>
    </form>
  )
}
```

En t'appuyant sur les leçons du module (data fetching, cache/`revalidatePath`, Server Actions), complète la Server Action pour :

1. **Valider** `formData` avant tout appel réseau :
   - `name` : non vide.
   - `email` : contient un `@`.
   - `message` : au moins 10 caractères.
   - Si une règle échoue, renvoyer `{ success: false, errors: [...] }` **sans jamais appeler `fetch`**.
2. Après le `POST` réussi, **invalider** le cache de la page `/admin/messages` (qui liste les messages reçus), avec l'outil approprié vu dans ce module.
3. Renvoyer `{ success: true }` si tout s'est bien passé.

<!--correction-->

## Correction

```ts
// app/actions.ts
"use server"

import { revalidatePath } from "next/cache"

type ContactResult = { success: true } | { success: false; errors: string[] }

export async function submitContactForm(formData: FormData): Promise<ContactResult> {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const message = formData.get("message") as string

  // 1. Validate BEFORE any network call — fail fast, no wasted request.
  const errors: string[] = []
  if (!name || name.trim() === "") {
    errors.push("Name is required.")
  }
  if (!email || !email.includes("@")) {
    errors.push("Email must be valid.")
  }
  if (!message || message.length < 10) {
    errors.push("Message must be at least 10 characters long.")
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  await fetch("https://api.example.com/contact", {
    method: "POST",
    body: JSON.stringify({ name, email, message }),
  })

  // 2. Invalidate the cached admin messages page so it shows the new message.
  revalidatePath("/admin/messages")

  // 3. Report success to the caller.
  return { success: true }
}
```

- **Valider avant de fetcher** : c'est le même réflexe qu'un `Form` Symfony
  (`$form->isValid()`) validé **avant** d'appeler le service métier — on
  n'exécute jamais une écriture avec des données invalides.
- `revalidatePath("/admin/messages")` : sans cet appel, la page listant les
  messages resterait périmée jusqu'à sa prochaine fenêtre de revalidation
  naturelle (ou indéfiniment si elle est en `force-cache`) — la mutation et
  l'invalidation du cache vont **toujours de pair**.
- Retourner `{ success, errors }` (plutôt que de lever une exception) permet
  au formulaire d'afficher les erreurs de validation à l'utilisateur — un
  Client Component peut lire ce retour via le hook `useActionState` de
  React, non détaillé ici pour rester minimaliste.
