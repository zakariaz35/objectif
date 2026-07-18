<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../lib/api'

const { t, locale } = useI18n()

const data = ref(null)
const suivi = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    ;[data.value, suivi.value] = await Promise.all([
      api.getDashboard(),
      api.getSuivi().catch(() => null),
    ])
  } catch (e) {
    error.value = t('dashboard.loadError')
  } finally {
    loading.value = false
  }
})

const hasMastery = computed(() => (data.value?.mastery?.length || 0) + (data.value?.by_level?.length || 0) > 0)

function barClass(pct) {
  if (pct >= 75) return 'good'
  if (pct >= 50) return 'warn'
  return 'bad'
}

// --- Certifs : lien direct vers le test blanc + libellé de statut -------------
function certifLink(c) {
  return `/f/${c.formation}/${c.module}/${c.lesson}`
}
function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString(locale.value, { day: 'numeric', month: 'short' }) : ''
}

// --- Heatmap d'activité : intensité 0-4 par jour ------------------------------
const heatDays = computed(() => {
  const days = suivi.value?.activite?.days || []
  return days.map((d) => {
    const total = d.quiz + d.reviews + d.lessons + (d.candidatures || 0)
    const level = total === 0 ? 0 : total < 3 ? 1 : total < 8 ? 2 : total < 20 ? 3 : 4
    return { ...d, total, level }
  })
})
</script>

<template>
  <section class="dash">
    <RouterLink to="/explorer" class="back">{{ $t('common.backToCourses') }}</RouterLink>
    <h1>{{ $t('dashboard.title') }}</h1>

    <div v-if="loading" class="muted">{{ $t('common.loading') }}</div>
    <div v-else-if="error" class="err">{{ error }}</div>

    <template v-else>
      <div class="stats">
        <div class="stat">
          <span class="v">{{ data.latest_level || '—' }}</span>
          <span class="k">{{ $t('dashboard.statLevel') }}</span>
        </div>
        <div class="stat">
          <span class="v">🔥 {{ data.streak }}</span>
          <span class="k">{{ $t('dashboard.statStreak') }}</span>
        </div>
        <div class="stat">
          <span class="v">{{ data.lessons_completed }}</span>
          <span class="k">{{ $t('dashboard.statLessons') }}</span>
        </div>
      </div>

      <!-- Préparation aux certifications : tests blancs vs seuils réels -->
      <div v-if="suivi?.certifs?.length" class="block">
        <h2>🎯 {{ $t('suivi.certifsTitle') }}</h2>
        <p class="hint">{{ $t('suivi.certifsHint') }}</p>
        <div class="certifs">
          <RouterLink v-for="c in suivi.certifs" :key="c.exam" :to="certifLink(c)" class="certif" :class="'st-' + c.status">
            <div class="c-head">
              <b>{{ c.exam }}</b>
              <span class="c-status">{{ $t('suivi.status.' + c.status) }}</span>
            </div>
            <div class="c-body">
              <template v-if="c.last">
                <span class="c-score">{{ c.last.pct }}%</span>
                <span class="c-detail">
                  {{ $t('suivi.lastAttempt', { score: c.last.score, total: c.last.total, date: fmtDate(c.last.date) }) }}
                  <template v-if="c.best && c.best.pct !== c.last.pct"> · {{ $t('suivi.best', { pct: c.best.pct }) }}</template>
                </span>
              </template>
              <span v-else class="c-detail">{{ $t('suivi.noAttempt', { n: c.questions }) }}</span>
            </div>
            <div class="c-track">
              <div class="c-fill" :style="{ width: (c.last?.pct || 0) + '%' }"></div>
              <span class="c-seuil" :style="{ insetInlineStart: c.seuil_pct + '%' }" :title="$t('suivi.seuil', { pct: c.seuil_pct })"></span>
              <span class="c-cible" :style="{ insetInlineStart: c.cible_pct + '%' }" :title="$t('suivi.cible', { pct: c.cible_pct })"></span>
            </div>
            <div class="c-legend">
              <span>{{ $t('suivi.seuil', { pct: c.seuil_pct }) }}</span>
              <span>{{ $t('suivi.cible', { pct: c.cible_pct }) }}</span>
            </div>
          </RouterLink>
        </div>
      </div>

      <!-- Activité des 8 dernières semaines -->
      <div v-if="heatDays.length" class="block">
        <h2>📅 {{ $t('suivi.activityTitle') }}</h2>
        <p class="hint">
          {{ $t('suivi.activityWeek', suivi.activite.semaine) }}
        </p>
        <div class="heat" role="img" :aria-label="$t('suivi.activityTitle')">
          <span
            v-for="d in heatDays"
            :key="d.date"
            class="cell"
            :class="'l' + d.level"
            :title="`${d.date} — ${d.quiz} quiz · ${d.reviews} 🔁 · ${d.lessons} ✓ · ${d.candidatures || 0} 🧲`"
          ></span>
        </div>
      </div>

      <!-- Santé de la répétition espacée -->
      <div v-if="suivi?.srs?.suivies" class="block">
        <h2>🔁 {{ $t('suivi.srsTitle') }}</h2>
        <div class="stats srs">
          <RouterLink to="/reviser" class="stat stat--link" :class="{ hot: suivi.srs.en_retard }">
            <span class="v">{{ suivi.srs.en_retard }}</span>
            <span class="k">{{ $t('suivi.srsLate') }}</span>
          </RouterLink>
          <RouterLink to="/reviser" class="stat stat--link">
            <span class="v">{{ suivi.srs.dues_aujourdhui }}</span>
            <span class="k">{{ $t('suivi.srsDue') }}</span>
          </RouterLink>
          <div class="stat">
            <span class="v">{{ suivi.srs.matures }}/{{ suivi.srs.suivies }}</span>
            <span class="k">{{ $t('suivi.srsMature') }}</span>
          </div>
        </div>
      </div>

      <div v-if="!hasMastery" class="empty">
        <p>{{ $t('dashboard.emptyTitle') }}</p>
        <p class="muted">{{ $t('dashboard.emptyHint') }}</p>
      </div>

      <template v-else>
        <div v-if="data.mastery.length" class="block">
          <h2>{{ $t('dashboard.byTheme') }}</h2>
          <p class="hint">{{ $t('dashboard.byThemeHint') }}</p>
          <ul class="bars">
            <li v-for="m in data.mastery" :key="m.label">
              <div class="row">
                <span class="lbl">{{ m.label }}</span>
                <span class="frac">{{ m.correct }}/{{ m.total }} · {{ m.pct }}%</span>
              </div>
              <div class="track"><div class="fill" :class="barClass(m.pct)" :style="{ width: m.pct + '%' }"></div></div>
            </li>
          </ul>
        </div>

        <div v-if="data.by_level.length" class="block">
          <h2>{{ $t('dashboard.byLevel') }}</h2>
          <ul class="bars">
            <li v-for="m in data.by_level" :key="m.label">
              <div class="row">
                <span class="lbl">{{ m.label }}</span>
                <span class="frac">{{ m.correct }}/{{ m.total }} · {{ m.pct }}%</span>
              </div>
              <div class="track"><div class="fill" :class="barClass(m.pct)" :style="{ width: m.pct + '%' }"></div></div>
            </li>
          </ul>
        </div>
      </template>
    </template>
  </section>
</template>

<style scoped>
.dash {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 16px 80px;
}
.back {
  color: var(--muted);
  font-size: 13px;
}
h1 {
  font-size: 26px;
  margin: 10px 0 20px;
}
.muted {
  color: var(--muted);
}
.err {
  color: var(--bad);
}
.stats {
  display: flex;
  gap: 14px;
  margin-bottom: 28px;
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
}
.stat .v {
  font-size: 26px;
  font-weight: 800;
}
.stat .k {
  color: var(--muted);
  font-size: 13px;
}
.empty {
  border: 1px dashed var(--border);
  border-radius: 12px;
  padding: 28px;
  text-align: center;
}
.block {
  margin: 26px 0;
}
.block h2 {
  font-size: 18px;
  margin: 0 0 4px;
}
.hint {
  color: var(--muted);
  font-size: 13px;
  margin: 0 0 14px;
}
.bars {
  list-style: none;
  padding: 0;
  margin: 0;
}
.bars li {
  margin: 12px 0;
}
.row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 14px;
}
.frac {
  color: var(--muted);
}
.track {
  height: 9px;
  background: var(--panel2);
  border-radius: 5px;
  overflow: hidden;
}
.fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.25s;
}
.fill.good {
  background: var(--good);
}
.fill.warn {
  background: var(--warn);
}
.fill.bad {
  background: var(--bad);
}

/* --- Certifs -------------------------------------------------------------- */
.certifs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
}
.certif {
  display: block;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--panel);
  padding: 14px 16px;
  color: inherit;
  text-decoration: none;
  transition: border-color 0.12s, transform 0.12s;
}
.certif:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
}
.certif.st-pret {
  border-color: var(--good);
}
.c-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 8px;
}
.c-status {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  padding: 2px 9px;
  border-radius: 12px;
  background: var(--panel2);
  color: var(--muted);
  white-space: nowrap;
}
.st-pret .c-status {
  background: var(--good);
  color: #fff;
}
.st-en-bonne-voie .c-status {
  background: var(--warn);
  color: #fff;
}
.c-body {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 8px;
}
.c-score {
  font-size: 24px;
  font-weight: 800;
}
.c-detail {
  font-size: 13px;
  color: var(--muted);
}
.c-track {
  position: relative;
  height: 9px;
  background: var(--panel2);
  border-radius: 5px;
}
.c-fill {
  height: 100%;
  border-radius: 5px;
  background: linear-gradient(90deg, var(--accent), var(--accent2));
  transition: width 0.25s;
}
.c-seuil,
.c-cible {
  position: absolute;
  top: -3px;
  width: 2px;
  height: 15px;
  background: var(--warn);
}
.c-cible {
  background: var(--good);
}
.c-legend {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--muted);
  margin-top: 6px;
}

/* --- Heatmap d'activité ---------------------------------------------------- */
.heat {
  display: grid;
  grid-template-rows: repeat(7, 13px);
  grid-auto-flow: column;
  grid-auto-columns: 13px;
  gap: 3px;
}
.cell {
  width: 13px;
  height: 13px;
  border-radius: 3px;
  background: var(--panel2);
}
.cell.l1 {
  background: color-mix(in srgb, var(--accent) 30%, var(--panel2));
}
.cell.l2 {
  background: color-mix(in srgb, var(--accent) 55%, var(--panel2));
}
.cell.l3 {
  background: color-mix(in srgb, var(--accent) 80%, var(--panel2));
}
.cell.l4 {
  background: var(--accent);
}

/* --- SRS ------------------------------------------------------------------- */
.stats.srs {
  margin-bottom: 0;
}
.stat--link {
  color: inherit;
  text-decoration: none;
}
.stat--link:hover {
  border-color: var(--accent);
}
.stat--link.hot {
  border-color: var(--bad);
}
</style>
