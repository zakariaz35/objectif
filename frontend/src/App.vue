<script setup>
import { defineAsyncComponent } from 'vue'
import { RouterView, RouterLink, useRouter } from 'vue-router'
import { auth } from './lib/auth'
import { theme } from './lib/theme'
import { openScratch } from './lib/scratch'
import { vuePlay, openVuePlayground } from './lib/vuePlayground'
import { pyPlay, openPythonPlayground } from './lib/pythonPlayground'
import { showVuePlayground, showJsPlayground, showPythonPlayground } from './lib/playgroundContext'
import ScratchPad from './components/ScratchPad.vue'

// Heavy (Vue SFC compiler) → loaded only when the playground is opened.
const VuePlayground = defineAsyncComponent(() => import('./components/VuePlayground.vue'))
// Heavy (Pyodide loaded from CDN inside its worker) → only mounted when relevant.
const PythonPlayground = defineAsyncComponent(() => import('./components/PythonPlayground.vue'))

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
        <svg class="logo" viewBox="0 0 32 32" aria-hidden="true">
          <circle class="ring ring1" cx="16" cy="16" r="13" />
          <circle class="ring ring2" cx="16" cy="16" r="8.5" />
          <path class="arc" d="M16 3 A13 13 0 0 1 29 16" />
          <circle class="dot" cx="16" cy="16" r="3.4" />
        </svg>
        Objectif
      </RouterLink>
      <span class="tagline">apprends · pratique · progresse</span>

      <nav class="account">
        <label class="theme" title="Thème">
          🎨
          <select :value="theme.state.current" @change="theme.set($event.target.value)">
            <option v-for="t in theme.list" :key="t.key" :value="t.key">{{ t.label }}</option>
          </select>
        </label>
        <!-- ⚠️ TEMPORARY — logo comparator. Remove once the logo is chosen. -->
        <RouterLink to="/logos" class="debug-link" title="Comparateur de logos (temporaire)">✦ Logos</RouterLink>
        <!-- ⚠️ DEBUG / personal use only — link to the accounts list. Remove if not personal. -->
        <RouterLink to="/comptes" class="debug-link" title="Debug perso : liste des comptes">⚙ Comptes</RouterLink>
        <template v-if="auth.isAuthenticated.value">
          <span class="who">👤 {{ auth.state.user?.name }}</span>
          <button class="btn-link" @click="logout">Déconnexion</button>
        </template>
        <RouterLink v-else to="/auth" class="signin">Se connecter</RouterLink>
      </nav>
    </header>
    <RouterView />

    <button v-if="showVuePlayground" class="fab fab-vue" type="button" title="Playground Vue (SFC)" @click="openVuePlayground()">Vue</button>
    <button v-if="showJsPlayground" class="fab" type="button" title="Bac à sable JS / TS" @click="openScratch('')">⌗</button>
    <button v-if="showPythonPlayground" class="fab fab-py" type="button" title="Bac à sable Python" @click="openPythonPlayground('')">🐍</button>
    <ScratchPad />
    <VuePlayground v-if="vuePlay.open" />
    <PythonPlayground v-if="pyPlay.open" />
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
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-weight: 800;
  font-size: 20px;
  color: var(--txt);
}
.brand:hover {
  text-decoration: none;
}
.logo {
  width: 26px;
  height: 26px;
}
.logo .ring {
  fill: none;
  stroke: var(--accent);
  stroke-width: 2.4;
}
.logo .ring1 {
  opacity: 0.3;
}
.logo .ring2 {
  opacity: 0.55;
}
.logo .arc {
  fill: none;
  stroke: var(--accent2);
  stroke-width: 2.6;
  stroke-linecap: round;
}
.logo .dot {
  fill: var(--accent2);
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
.fab {
  position: fixed;
  bottom: 22px;
  right: 22px;
  z-index: 50;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background: var(--accent);
  color: var(--accent-contrast);
  font-size: 22px;
  font-weight: 700;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
}
.fab:hover {
  filter: brightness(1.05);
}
.fab-vue {
  bottom: 84px;
  background: var(--accent2);
  font-size: 15px;
}
.fab-py {
  background: #3a8a5f;
}
</style>
