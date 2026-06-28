<script setup>
import { RouterView, RouterLink, useRouter } from 'vue-router'
import { auth } from './lib/auth'
import { theme } from './lib/theme'

const router = useRouter()

async function logout() {
  await auth.logout()
  router.push('/')
}
</script>

<template>
  <div class="shell">
    <header class="topbar">
      <RouterLink to="/" class="brand">
        Formation<span>.</span>
      </RouterLink>
      <span class="tagline">apprends · pratique · progresse</span>

      <nav class="account">
        <label class="theme" title="Thème">
          🎨
          <select :value="theme.state.current" @change="theme.set($event.target.value)">
            <option v-for="t in theme.list" :key="t.key" :value="t.key">{{ t.label }}</option>
          </select>
        </label>
        <!-- ⚠️ DEBUG / perso uniquement — lien vers la liste des comptes. À retirer si non-perso. -->
        <RouterLink to="/comptes" class="debug-link" title="Debug perso : liste des comptes">⚙ Comptes</RouterLink>
        <template v-if="auth.isAuthenticated.value">
          <span class="who">👤 {{ auth.state.user?.name }}</span>
          <button class="btn-link" @click="logout">Déconnexion</button>
        </template>
        <RouterLink v-else to="/auth" class="signin">Se connecter</RouterLink>
      </nav>
    </header>
    <RouterView />
  </div>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: baseline;
  gap: 14px;
  padding: 14px 24px;
  border-bottom: 1px solid var(--border);
  background: var(--panel);
  position: sticky;
  top: 0;
  z-index: 20;
}
.brand {
  font-weight: 800;
  font-size: 20px;
  color: var(--txt);
}
.brand span {
  color: var(--accent);
}
.tagline {
  color: var(--muted);
  font-size: 13px;
}
.account {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 14px;
}
.debug-link {
  font-size: 13px;
  color: var(--muted);
}
.debug-link:hover {
  color: var(--warn);
}
.theme {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}
.theme select {
  font: inherit;
  font-size: 13px;
  background: var(--panel2);
  color: var(--txt);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 4px 6px;
  cursor: pointer;
}
.who {
  color: var(--accent2);
  font-size: 14px;
}
.signin {
  font-size: 14px;
  padding: 7px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--txt);
}
.signin:hover {
  border-color: var(--accent);
  text-decoration: none;
}
</style>
