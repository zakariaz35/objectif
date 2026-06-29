<script setup>
import { ref, computed, provide, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, RouterLink, RouterView } from 'vue-router'
import api from '../lib/api'
import { setPlaygroundStack } from '../lib/playgroundContext'

const props = defineProps({ formation: String })
const route = useRoute()

const tree = ref(null)
const completed = ref(new Set())
const loading = ref(true)
const error = ref(null)

const totalLessons = computed(
  () => tree.value?.modules.reduce((n, m) => n + m.lessons.length, 0) || 0
)
const doneCount = computed(() => completed.value.size)
const percent = computed(() =>
  totalLessons.value ? Math.round((doneCount.value / totalLessons.value) * 100) : 0
)

function key(moduleSlug, lessonSlug) {
  return `${moduleSlug}/${lessonSlug}`
}
function isDone(moduleSlug, lessonSlug) {
  return completed.value.has(key(moduleSlug, lessonSlug))
}

async function toggle(moduleSlug, lessonSlug, value) {
  const k = key(moduleSlug, lessonSlug)
  const next = new Set(completed.value)
  value ? next.add(k) : next.delete(k)
  completed.value = next
  try {
    await api.toggleProgress(props.formation, moduleSlug, lessonSlug, value)
  } catch (e) {
    /* offline: keep local state */
  }
}

// Exposed to child LessonView components.
provide('progress', { isDone, toggle })

// Bumped on each load and on unmount: a stale in-flight load (formation switched
// or component left) must not write back into the shared playground context.
let reqId = 0

async function load() {
  const id = ++reqId
  loading.value = true
  error.value = null
  try {
    // Independent requests, fetched in parallel.
    const [tree2, progress] = await Promise.all([
      api.getFormation(props.formation),
      api.getProgress(props.formation),
    ])
    if (id !== reqId) return // a newer load started, or the view was left
    tree.value = tree2
    completed.value = new Set(progress.completed)
  } catch (e) {
    if (id !== reqId) return
    error.value = 'Formation introuvable.'
  } finally {
    if (id === reqId) loading.value = false
  }
}

// Keep the global playground context in sync with the loaded formation stack.
// Separating this from load() keeps the data fetch pure and co-locates the full
// lifecycle (load → update, error → clear, unmount → clear) in one watcher.
watch(tree, (t) => setPlaygroundStack(t?.stack ?? ''), { immediate: true })

const typeIcon = { lesson: '🥄', exercise: '🛠️', quiz: '🎯', flashcards: '🃏' }

// Roadmap: each module is a stage (done / current / todo) with its own progress.
const roadmap = computed(() =>
  (tree.value?.modules || []).map((m) => {
    const total = m.lessons.length
    const done = m.lessons.filter((l) => isDone(m.slug, l.slug)).length
    const next = m.lessons.find((l) => !isDone(m.slug, l.slug)) || m.lessons[0]
    return {
      slug: m.slug,
      title: m.title,
      total,
      done,
      status: total > 0 && done === total ? 'done' : done > 0 ? 'current' : 'todo',
      to: next ? `/f/${props.formation}/${m.slug}/${next.slug}` : null,
    }
  })
)

onMounted(load)
watch(() => props.formation, load)
onUnmounted(() => {
  reqId++ // invalidate any in-flight load so it won't restore the stack
  setPlaygroundStack('')
})
</script>

<template>
  <div class="layout">
    <nav class="toc">
      <RouterLink to="/" class="back">← Toutes les formations</RouterLink>
      <h2 class="ftitle">{{ tree?.title }}</h2>

      <div class="progress">
        <div class="bar"><div class="fill" :style="{ width: percent + '%' }"></div></div>
        <span class="pct">{{ doneCount }}/{{ totalLessons }} · {{ percent }}%</span>
      </div>

      <template v-for="m in tree?.modules || []" :key="m.slug">
        <h3 class="mod">{{ m.title }}</h3>
        <RouterLink
          v-for="l in m.lessons"
          :key="l.slug"
          :to="`/f/${formation}/${m.slug}/${l.slug}`"
          class="lnk"
          :class="{ done: isDone(m.slug, l.slug) }"
        >
          <span class="ic">{{ isDone(m.slug, l.slug) ? '✓' : typeIcon[l.type] || '•' }}</span>
          {{ l.title }}
        </RouterLink>
      </template>
    </nav>

    <main class="content">
      <div v-if="loading" class="muted">Chargement…</div>
      <div v-else-if="error" class="err">{{ error }}</div>
      <template v-else>
        <RouterView v-if="route.params.lesson" />
        <div v-else class="welcome">
          <span v-if="tree.stack" class="stack">{{ tree.stack }}</span>
          <h1>{{ tree.title }}</h1>
          <p class="muted">{{ tree.description }}</p>

          <div class="rbar"><div class="rfill" :style="{ width: percent + '%' }"></div></div>
          <p class="rpct">Parcours : {{ doneCount }}/{{ totalLessons }} leçons · {{ percent }}%</p>

          <ol class="steps">
            <li v-for="(s, i) in roadmap" :key="s.slug" class="step" :class="s.status">
              <div class="dot">{{ s.status === 'done' ? '✓' : i + 1 }}</div>
              <div class="sbody">
                <div class="stitle">{{ s.title }}</div>
                <div class="smeta">{{ s.done }}/{{ s.total }} leçon(s)</div>
              </div>
              <RouterLink v-if="s.to" :to="s.to" class="btn btn-primary sbtn">
                {{ s.status === 'todo' ? 'Commencer' : s.status === 'done' ? 'Revoir' : 'Continuer' }}
              </RouterLink>
            </li>
          </ol>
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  max-width: 1280px;
  margin: 0 auto;
  align-items: flex-start;
}
.toc {
  position: sticky;
  top: 49px;
  align-self: flex-start;
  height: calc(100vh - 49px);
  overflow-y: auto;
  width: 280px;
  flex: 0 0 280px;
  padding: 20px 16px;
  border-right: 1px solid var(--border);
  background: var(--panel);
  font-size: 14px;
}
.back {
  color: var(--muted);
  font-size: 13px;
}
.ftitle {
  font-size: 16px;
  margin: 12px 0 14px;
}
.progress {
  margin-bottom: 18px;
}
.bar {
  height: 6px;
  background: var(--panel2);
  border-radius: 4px;
  overflow: hidden;
}
.fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent2));
  transition: width 0.25s;
}
.pct {
  font-size: 12px;
  color: var(--muted);
}
.mod {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--muted);
  margin: 18px 0 6px;
}
.lnk {
  display: flex;
  gap: 8px;
  align-items: center;
  color: var(--muted);
  padding: 6px 10px;
  border-radius: 7px;
  margin: 2px 0;
}
.lnk:hover {
  background: var(--panel2);
  color: var(--txt);
  text-decoration: none;
}
.lnk.router-link-active {
  background: var(--panel2);
  color: var(--txt);
}
.lnk.done {
  color: var(--good);
}
.lnk .ic {
  width: 18px;
  text-align: center;
  flex: 0 0 18px;
}
.content {
  flex: 1 1 auto;
  padding: 32px 48px 120px;
  max-width: 920px;
  min-width: 0;
}
.muted {
  color: var(--muted);
}
.err {
  color: var(--bad);
}

/* Roadmap (parcours) */
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
.rbar {
  height: 8px;
  background: var(--panel2);
  border-radius: 5px;
  overflow: hidden;
  margin: 18px 0 6px;
}
.rfill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent2));
  transition: width 0.25s;
}
.rpct {
  color: var(--muted);
  font-size: 14px;
  margin: 0 0 18px;
}
.steps {
  list-style: none;
  padding: 0;
  margin: 0;
}
.step {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--panel);
  margin: 10px 0;
  position: relative;
}
/* connecting line between steps */
.step:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 31px;
  top: 100%;
  height: 10px;
  width: 2px;
  background: var(--border);
}
.step.done {
  border-left: 4px solid var(--good);
}
.step.current {
  border-left: 4px solid var(--accent);
}
.dot {
  flex: 0 0 34px;
  height: 34px;
  width: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  background: var(--panel2);
  color: var(--muted);
}
.step.done .dot {
  background: var(--good);
  color: var(--accent-contrast);
}
.step.current .dot {
  background: var(--accent);
  color: var(--accent-contrast);
}
.sbody {
  flex: 1;
  min-width: 0;
}
.stitle {
  font-weight: 600;
}
.smeta {
  color: var(--muted);
  font-size: 13px;
}
.sbtn {
  flex: 0 0 auto;
  text-decoration: none;
}
.sbtn:hover {
  text-decoration: none;
}
</style>
