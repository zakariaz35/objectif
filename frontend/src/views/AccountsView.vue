<!--
  ⚠️ DEBUG PAGE / PERSONAL USE ONLY — TO BE DELETED
  Lists all accounts (emails included), with no access control. Intentional while
  the project is personal/single-user. If the project becomes public or
  multi-user: delete this view, its route (/comptes), the link in the
  top bar, as well as the backend endpoint /api/users (see UserController).
-->
<script setup>
import { ref, onMounted } from 'vue'
import api from '../lib/api'

const users = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    users.value = await api.listUsers()
  } catch (e) {
    error.value = "Impossible de charger les comptes."
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="accounts">
    <div class="warn">
      ⚠️ Page de <b>debug perso</b> : elle expose tous les comptes. À supprimer si
      le projet devient public ou multi-utilisateurs.
    </div>

    <h1>Comptes ({{ users.length }})</h1>

    <div v-if="loading" class="muted">Chargement…</div>
    <div v-else-if="error" class="err">{{ error }}</div>
    <table v-else>
      <thead>
        <tr>
          <th>#</th>
          <th>Nom</th>
          <th>Email</th>
          <th>Créé le</th>
          <th>Leçons faites</th>
          <th>Quiz tentés</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in users" :key="u.id">
          <td>{{ u.id }}</td>
          <td>{{ u.name }}</td>
          <td>{{ u.email }}</td>
          <td>{{ u.created_at }}</td>
          <td>{{ u.completed_lessons }}</td>
          <td>{{ u.quiz_attempts }}</td>
        </tr>
      </tbody>
    </table>
  </main>
</template>

<style scoped>
.accounts {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 24px 80px;
}
.warn {
  border: 1px solid var(--warn);
  border-left: 4px solid var(--warn);
  background: rgba(255, 207, 107, 0.08);
  color: var(--warn);
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 24px;
  font-size: 14px;
}
h1 {
  margin: 0 0 20px;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
th,
td {
  border: 1px solid var(--border);
  padding: 10px 12px;
  text-align: left;
}
th {
  background: var(--panel2);
  color: var(--accent2);
}
tr:nth-child(even) td {
  background: var(--panel);
}
.muted {
  color: var(--muted);
}
.err {
  color: var(--bad);
}
</style>
