<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '../lib/api'

const { locale } = useI18n()

const courses = ref([])
const due = ref([])
const dash = ref({ latest_level: null, streak: 0 })
const roadmap = ref(null) // parcours épinglé (feuille de route)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const pinnedSlug = localStorage.getItem('feuille_de_route')
    const [c, d, dashboard, r] = await Promise.all([
      api.getMyCourses().catch(() => []),
      api.getDueCards().catch(() => []),
      api.getDashboard().catch(() => ({ latest_level: null, streak: 0 })),
      pinnedSlug ? api.getParcours(pinnedSlug).catch(() => null) : Promise.resolve(null),
    ])
    courses.value = c
    due.value = d
    dash.value = dashboard
    roadmap.value = r
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
})

function resumeTo(c) {
  return c.resume ? `/f/${c.slug}/${c.resume.module}/${c.resume.lesson}` : `/f/${c.slug}`
}

// --- Feuille de route (même pondération durée que ParcoursView) -----------------
function jalonDone(e) {
  return localStorage.getItem(`parcours:${roadmap.value.slug}:${e.index}`) === 'done'
}
function stepDoneH(e) {
  if (e.type === 'formation') return (e.duree_h * (e.progress || 0)) / 100
  return jalonDone(e) ? e.duree_h : 0
}
const rmPercent = computed(() => {
  const total = roadmap.value?.total_duree_h || 0
  if (!total) return 0
  const done = roadmap.value.etapes.reduce((a, e) => a + stepDoneH(e), 0)
  return Math.round((done / total) * 100)
})
// Étape courante : la première non terminée.
const rmCurrent = computed(() =>
  roadmap.value?.etapes.find((e) =>
    e.type === 'formation' ? (e.progress || 0) < 100 : !jalonDone(e),
  ),
)
// Reprise : leçon en cours si la formation figure dans "mes cours", sinon page formation.
const rmCta = computed(() => {
  const e = rmCurrent.value
  if (!e) return null
  if (e.type !== 'formation') return { external: e.url }
  const c = courses.value.find((x) => x.slug === e.ref)
  return { to: c ? resumeTo(c) : `/f/${e.ref}` }
})
const rmForecast = computed(() => {
  const r = roadmap.value
  if (!r?.heures_par_semaine) return null
  const remaining = r.total_duree_h - r.etapes.reduce((a, e) => a + stepDoneH(e), 0)
  if (remaining <= 0) return null
  const weeks = Math.ceil(remaining / r.heures_par_semaine)
  const end = new Date(Date.now() + weeks * 7 * 86400000)
  return end.toLocaleDateString(locale.value, { day: 'numeric', month: 'long' })
})
</script>

<template>
  <main class="home">
    <header class="hero">
      <h1>{{ $t('home.title') }}</h1>
      <p>{{ $t('home.subtitle') }}</p>
    </header>

    <div v-if="loading" class="muted">{{ $t('common.loading') }}</div>
    <div v-else-if="error" class="err">{{ $t('home.loadError') }}</div>

    <template v-else>
      <!-- Feuille de route épinglée : l'essentiel en un bloc -->
      <RouterLink v-if="roadmap" :to="`/parcours/${roadmap.slug}`" class="roadmap">
        <div class="rm-head">
          <span class="rm-label">📌 {{ $t('home.roadmapLabel') }}</span>
          <h2>🧭 {{ roadmap.title }}</h2>
        </div>
        <div class="rm-bar"><div class="rm-fill" :style="{ width: rmPercent + '%' }"></div></div>
        <div class="rm-row">
          <span class="rm-pct">{{ rmPercent }}%</span>
          <span v-if="rmCurrent" class="rm-step">{{ $t('home.roadmapStep') }} : <b>{{ rmCurrent.titre }}</b></span>
          <span v-else class="rm-step rm-done">🎉 {{ $t('home.roadmapDone') }}</span>
          <span v-if="rmForecast" class="rm-eta">{{ $t('home.roadmapEta', { date: rmForecast }) }}</span>
          <component
            :is="rmCta?.external ? 'a' : 'RouterLink'"
            v-if="rmCta"
            v-bind="rmCta.external ? { href: rmCta.external, target: '_blank', rel: 'noopener' } : { to: rmCta.to }"
            class="btn btn-primary rm-cta"
            @click.stop
          >
            {{ $t('home.resume') }}
          </component>
        </div>
      </RouterLink>

      <div class="stats">
        <div class="stat">
          <span class="v">{{ dash.latest_level || '—' }}</span>
          <span class="k">{{ $t('home.level') }}</span>
        </div>
        <div class="stat">
          <span class="v">🔥 {{ dash.streak }}</span>
          <span class="k">{{ $t('home.streak') }}</span>
        </div>
        <RouterLink to="/reviser" class="stat stat--link" :class="{ hot: due.length }">
          <span class="v">{{ due.length }}</span>
          <span class="k">{{ due.length ? $t('home.dueCta', { count: due.length }) : $t('home.dueNone') }}</span>
        </RouterLink>
      </div>

      <section v-if="courses.length" class="resume">
        <h2>{{ $t('home.resumeTitle') }}</h2>
        <div class="grid">
          <article v-for="c in courses" :key="c.slug" class="card">
            <span v-if="c.stack" class="stack">{{ c.stack }}</span>
            <h3>{{ c.title }}</h3>
            <div class="bar"><div class="fill" :style="{ width: c.pct + '%' }"></div></div>
            <div class="row">
              <span class="pct">{{ c.done }}/{{ c.total }} · {{ c.pct }}%</span>
              <RouterLink :to="resumeTo(c)" class="btn btn-primary">
                {{ c.resume ? $t('home.resume') : $t('home.openCourse') }}
              </RouterLink>
            </div>
          </article>
        </div>
      </section>

      <section v-else class="empty">
        <h2>{{ $t('home.emptyTitle') }}</h2>
        <p class="muted">{{ $t('home.emptyText') }}</p>
      </section>

      <RouterLink to="/explorer" class="explore">
        <div>
          <h2>{{ $t('home.exploreTitle') }}</h2>
          <p class="muted">{{ $t('home.exploreText') }}</p>
        </div>
        <span class="explore-cta">{{ $t('home.explore') }}</span>
      </RouterLink>
    </template>
  </main>
</template>

<style scoped>
.home {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 24px 80px;
}
.hero {
  margin: 0 0 26px;
  padding: 26px 28px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--panel2), var(--panel));
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
}
.hero h1 {
  margin: 0 0 6px;
  color: var(--heading);
  font-size: 30px;
}
.hero p {
  margin: 0;
  color: var(--muted);
  font-size: 16px;
}
.muted {
  color: var(--muted);
}
.err {
  color: var(--bad);
}
.roadmap {
  display: block;
  margin-bottom: 18px;
  padding: 20px 24px;
  border: 1px solid var(--accent);
  border-radius: 16px;
  background: var(--panel2);
  color: inherit;
  text-decoration: none;
  box-shadow: var(--shadow);
  transition: transform 0.12s, box-shadow 0.12s;
}
.roadmap:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
.rm-head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.rm-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--accent);
}
.rm-head h2 {
  margin: 0;
  font-size: 20px;
}
.rm-bar {
  height: 10px;
  background: var(--panel);
  border-radius: 6px;
  overflow: hidden;
}
.rm-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent2));
  border-radius: 6px;
  transition: width 0.3s;
}
.rm-row {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 10px;
  font-size: 14px;
}
.rm-pct {
  font-weight: 800;
}
.rm-step {
  color: var(--muted);
}
.rm-step b {
  color: inherit;
}
.rm-done {
  color: var(--good);
}
.rm-eta {
  color: var(--accent2);
  font-size: 13px;
}
.rm-cta {
  margin-inline-start: auto;
  text-decoration: none;
}
.stats {
  display: flex;
  gap: 14px;
  margin-bottom: 30px;
}
.stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px 18px;
  background: var(--panel);
  color: inherit;
  text-decoration: none;
}
.stat .v {
  font-size: 26px;
  font-weight: 800;
}
.stat .k {
  color: var(--muted);
  font-size: 13px;
}
.stat--link:hover {
  border-color: var(--accent);
}
.stat--link.hot {
  border-color: var(--accent2);
}
.resume h2,
.empty h2 {
  font-size: 18px;
  margin: 0 0 14px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.card {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 18px;
  background: var(--panel);
  box-shadow: var(--shadow);
}
.card h3 {
  margin: 0 0 12px;
}
.stack {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--accent-contrast);
  background: var(--accent);
  padding: 2px 9px;
  border-radius: 20px;
  margin-bottom: 8px;
}
.bar {
  height: 8px;
  background: var(--panel2);
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 10px;
}
.fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent2));
  transition: width 0.25s;
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.pct {
  color: var(--muted);
  font-size: 13px;
}
.row .btn {
  text-decoration: none;
}
.empty {
  border: 1px dashed var(--border);
  border-radius: 12px;
  padding: 28px;
  text-align: center;
}
.explore {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 30px;
  padding: 20px 24px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--panel2);
  color: inherit;
  text-decoration: none;
  transition: border-color 0.12s, transform 0.12s;
}
.explore:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
  text-decoration: none;
}
.explore h2 {
  margin: 0 0 4px;
  font-size: 18px;
}
.explore p {
  margin: 0;
}
.explore-cta {
  flex: 0 0 auto;
  color: var(--accent);
  font-weight: 600;
}
</style>
