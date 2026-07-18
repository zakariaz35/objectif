<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../lib/api'

const { t } = useI18n()

const etat = ref(null)
const loading = ref(true)
const error = ref(null)
const copied = ref(false)

onMounted(async () => {
  try {
    etat.value = await api.getEtat()
  } catch (e) {
    error.value = t('etat.loadError')
  } finally {
    loading.value = false
  }
})

const json = computed(() => (etat.value ? JSON.stringify(etat.value, null, 2) : ''))

async function copy() {
  await navigator.clipboard.writeText(json.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 2500)
}

function download() {
  const blob = new Blob([json.value], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `etat-plan-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(a.href)
}
</script>

<template>
  <main class="etat">
    <RouterLink to="/plan" class="back">← {{ $t('cand.backPlan') }}</RouterLink>
    <h1>🤖 {{ $t('etat.title') }}</h1>
    <p class="intro">{{ $t('etat.intro') }}</p>

    <div v-if="loading" class="muted">{{ $t('common.loading') }}</div>
    <div v-else-if="error" class="err">{{ error }}</div>

    <template v-else>
      <div class="actions">
        <button class="btn-primary" @click="copy">{{ copied ? '✓ ' + $t('etat.copied') : $t('etat.copy') }}</button>
        <button class="btn-ghost" @click="download">{{ $t('etat.download') }}</button>
        <span class="muted small">{{ $t('etat.genere', { date: etat.genere_le }) }}</span>
      </div>

      <div v-if="etat.alertes.length" class="alertes">
        <p v-for="(a, i) in etat.alertes" :key="i" class="alerte">⚠️ {{ a }}</p>
      </div>

      <pre class="json"><code>{{ json }}</code></pre>
    </template>
  </main>
</template>

<style scoped>
.etat { max-width: 880px; margin: 0 auto; padding: 32px 24px 80px; }
.back { color: var(--muted); font-size: 14px; text-decoration: none; }
.back:hover { color: var(--accent); }
h1 { margin: 10px 0 6px; }
.intro { color: var(--muted); margin: 0 0 18px; }
.muted { color: var(--muted); }
.small { font-size: 12px; }
.err { color: var(--bad); }
.actions { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.btn-primary {
  font: inherit; font-size: 13px; cursor: pointer; border: 1px solid var(--accent);
  border-radius: 20px; padding: 5px 16px; background: var(--accent); color: var(--accent-contrast);
}
.btn-ghost {
  font: inherit; font-size: 13px; cursor: pointer; border: 1px solid var(--border);
  border-radius: 20px; padding: 4px 14px; background: var(--panel2); color: inherit;
}
.btn-ghost:hover { border-color: var(--accent); }
.alertes { margin-bottom: 14px; }
.alerte {
  margin: 6px 0; padding: 8px 14px; border-radius: 10px; font-size: 14px;
  background: color-mix(in srgb, var(--bad) 12%, var(--panel)); border: 1px solid var(--bad);
}
.json {
  background: var(--code, var(--panel2)); border: 1px solid var(--border); border-radius: 12px;
  padding: 16px; overflow-x: auto; max-height: 65vh; direction: ltr;
}
.json code { font-size: 12px; }
</style>
