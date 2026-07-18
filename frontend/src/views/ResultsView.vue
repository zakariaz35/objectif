<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../lib/api'

const { t, locale } = useI18n()

const results = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    results.value = await api.getResults()
  } catch (e) {
    error.value = t('results.loadError')
  } finally {
    loading.value = false
  }
})

// Global estimate = rounded average of each placement quiz's latest CEFR level.
const CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const globalLevel = computed(() => {
  const ranks = results.value.map((r) => CEFR.indexOf(r.latest_level)).filter((i) => i >= 0)
  if (!ranks.length) return null
  const avg = ranks.reduce((a, b) => a + b, 0) / ranks.length
  return CEFR[Math.round(avg)]
})

function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString(locale.value, { day: '2-digit', month: 'short', year: 'numeric' })
}

function pct(a) {
  return a.total ? Math.round((a.score / a.total) * 100) : 0
}

// Small hand-made SVG sparkline of the score ratio (0..100%) across attempts.
const W = 460
const H = 120
const PAD = 8
function points(attempts) {
  const n = attempts.length
  if (n === 0) return ''
  const step = n > 1 ? (W - 2 * PAD) / (n - 1) : 0
  return attempts
    .map((a, i) => {
      const x = PAD + i * step
      const y = H - PAD - (pct(a) / 100) * (H - 2 * PAD)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}
</script>

<template>
  <section class="results">
    <h1>{{ $t('results.title') }}</h1>
    <p class="sub">{{ $t('results.sub') }}</p>

    <div v-if="globalLevel" class="global">
      <span class="glabel">{{ $t('results.globalLabel') }}</span>
      <span class="gbadge">{{ globalLevel }}</span>
      <span class="gnote">{{ $t('results.globalNote', { count: results.length }) }}</span>
    </div>

    <div v-if="loading" class="muted">{{ $t('common.loading') }}</div>
    <div v-else-if="error" class="err">{{ error }}</div>
    <div v-else-if="results.length === 0" class="empty">
      <p>{{ $t('results.emptyTitle') }}</p>
      <p class="muted">{{ $t('results.emptyHint') }}</p>
    </div>

    <div v-else class="cards">
      <article v-for="r in results" :key="r.lesson_id" class="card">
        <header>
          <div>
            <h2>{{ r.title }}</h2>
            <RouterLink
              v-if="r.formation && r.module && r.lesson"
              :to="`/f/${r.formation}/${r.module}/${r.lesson}`"
              class="retry"
            >
              {{ $t('results.retake') }}
            </RouterLink>
          </div>
          <div class="level" :title="$t('results.latestLevelTitle')">{{ r.latest_level }}</div>
        </header>

        <svg class="spark" :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" role="img"
             :aria-label="$t('results.sparkAria', { count: r.attempts.length })">
          <line :x1="PAD" :y1="H - PAD" :x2="W - PAD" :y2="H - PAD" class="axis" />
          <polyline :points="points(r.attempts)" class="line" fill="none" />
          <circle
            v-for="(a, i) in r.attempts"
            :key="a.id"
            :cx="PAD + (r.attempts.length > 1 ? i * ((W - 2 * PAD) / (r.attempts.length - 1)) : 0)"
            :cy="H - PAD - (pct(a) / 100) * (H - 2 * PAD)"
            r="4"
            class="pt"
          />
        </svg>

        <table class="attempts">
          <thead>
            <tr><th>{{ $t('results.thDate') }}</th><th>{{ $t('results.thScore') }}</th><th>{{ $t('results.thPct') }}</th><th>{{ $t('results.thLevel') }}</th></tr>
          </thead>
          <tbody>
            <tr v-for="a in [...r.attempts].reverse()" :key="a.id">
              <td>{{ fmtDate(a.created_at) }}</td>
              <td>{{ a.score }} / {{ a.total }}</td>
              <td>{{ pct(a) }}%</td>
              <td><span class="tag">{{ a.level }}</span></td>
            </tr>
          </tbody>
        </table>
      </article>
    </div>
  </section>
</template>

<style scoped>
.results {
  max-width: 760px;
}
h1 {
  font-size: 26px;
  margin: 0 0 4px;
}
.sub {
  color: var(--muted);
  margin: 0 0 20px;
}
.global {
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1px solid var(--border);
  border-left: 4px solid var(--accent);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 24px;
  background: var(--panel);
}
.global .glabel {
  color: var(--muted);
  font-size: 14px;
}
.global .gbadge {
  font-size: 30px;
  font-weight: 800;
  color: var(--accent-contrast);
  background: var(--accent);
  border-radius: 12px;
  padding: 6px 16px;
  line-height: 1;
}
.global .gnote {
  color: var(--muted);
  font-size: 13px;
  margin-left: auto;
}
.muted {
  color: var(--muted);
}
.err {
  color: var(--bad);
}
.empty {
  border: 1px dashed var(--border);
  border-radius: 12px;
  padding: 28px;
  text-align: center;
}
.card {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 18px 20px;
  margin: 16px 0;
  background: var(--panel);
}
.card header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}
.card h2 {
  font-size: 18px;
  margin: 0 0 4px;
}
.retry {
  font-size: 13px;
  color: var(--accent);
}
.level {
  flex: 0 0 auto;
  font-size: 26px;
  font-weight: 800;
  color: var(--accent-contrast);
  background: var(--accent);
  border-radius: 12px;
  padding: 8px 16px;
  line-height: 1;
}
.spark {
  width: 100%;
  height: 120px;
  display: block;
  margin-bottom: 12px;
}
.spark .axis {
  stroke: var(--border);
  stroke-width: 1;
}
.spark .line {
  stroke: var(--accent);
  stroke-width: 2;
  vector-effect: non-scaling-stroke;
}
.spark .pt {
  fill: var(--accent2);
}
.attempts {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.attempts th,
.attempts td {
  text-align: left;
  padding: 7px 8px;
  border-bottom: 1px solid var(--border);
}
.attempts th {
  color: var(--muted);
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.attempts .tag {
  display: inline-block;
  background: var(--panel2);
  color: var(--accent);
  border-radius: 20px;
  padding: 2px 10px;
  font-weight: 700;
}
</style>
