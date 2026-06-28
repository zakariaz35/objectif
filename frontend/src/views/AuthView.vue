<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { auth } from '../lib/auth'

const router = useRouter()
const route = useRoute()

const mode = ref(route.query.mode === 'register' ? 'register' : 'login')
const form = reactive({ name: '', email: '', password: '' })
const error = ref(null)
const loading = ref(false)

function switchMode(m) {
  mode.value = m
  error.value = null
}

async function submit() {
  loading.value = true
  error.value = null
  try {
    if (mode.value === 'register') {
      await auth.register({ name: form.name, email: form.email, password: form.password })
    } else {
      await auth.login({ email: form.email, password: form.password })
    }
    router.push(route.query.redirect || '/')
  } catch (e) {
    const data = e.response?.data
    error.value =
      data?.errors
        ? Object.values(data.errors).flat().join(' ')
        : data?.message || 'Une erreur est survenue.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="auth">
    <div class="card">
      <div class="tabs">
        <button :class="{ on: mode === 'login' }" @click="switchMode('login')">Connexion</button>
        <button :class="{ on: mode === 'register' }" @click="switchMode('register')">Créer un compte</button>
      </div>

      <form @submit.prevent="submit">
        <label v-if="mode === 'register'">
          Nom
          <input v-model="form.name" type="text" required autocomplete="name" />
        </label>
        <label>
          Email
          <input v-model="form.email" type="email" required autocomplete="email" />
        </label>
        <label>
          Mot de passe
          <input
            v-model="form.password"
            type="password"
            required
            minlength="8"
            :autocomplete="mode === 'register' ? 'new-password' : 'current-password'"
          />
        </label>

        <p v-if="error" class="err">{{ error }}</p>

        <button class="btn btn-primary block" type="submit" :disabled="loading">
          {{ loading ? '…' : mode === 'register' ? 'Créer mon compte' : 'Se connecter' }}
        </button>
      </form>

      <p class="note">
        Ta progression anonyme actuelle sera rattachée à ton compte.
      </p>
    </div>
  </main>
</template>

<style scoped>
.auth {
  max-width: 420px;
  margin: 64px auto;
  padding: 0 20px;
}
.card {
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--panel);
  padding: 24px;
}
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}
.tabs button {
  flex: 1;
  padding: 10px;
  border: 1px solid var(--border);
  background: var(--code);
  color: var(--muted);
  border-radius: 8px;
}
.tabs button.on {
  border-color: var(--accent);
  color: var(--txt);
  background: var(--panel2);
}
form label {
  display: block;
  margin: 14px 0;
  font-size: 14px;
  color: var(--muted);
}
form input {
  display: block;
  width: 100%;
  margin-top: 6px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--code);
  color: var(--txt);
  font: inherit;
}
form input:focus {
  outline: none;
  border-color: var(--accent);
}
.block {
  width: 100%;
  margin-top: 8px;
  padding: 12px;
}
.err {
  color: var(--bad);
  font-size: 14px;
}
.note {
  color: var(--muted);
  font-size: 12px;
  margin: 16px 0 0;
  text-align: center;
}
</style>
