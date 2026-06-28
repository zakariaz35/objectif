<script setup>
import { ref, computed, provide, onMounted, watch } from 'vue'
import { useRoute, RouterLink, RouterView } from 'vue-router'
import api from '../lib/api'

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
    /* offline : on garde l'état local */
  }
}

// Exposé aux LessonView enfants.
provide('progress', { isDone, toggle })

async function load() {
  loading.value = true
  error.value = null
  try {
    tree.value = await api.getFormation(props.formation)
    const p = await api.getProgress(props.formation)
    completed.value = new Set(p.completed)
  } catch (e) {
    error.value = 'Formation introuvable.'
  } finally {
    loading.value = false
  }
}

const typeIcon = { lesson: '🥄', exercise: '🛠️', quiz: '🎯', flashcards: '🃏' }

onMounted(load)
watch(() => props.formation, load)
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
          <h1>{{ tree.title }}</h1>
          <p class="muted">{{ tree.description }}</p>
          <p>👈 Choisis une leçon dans le sommaire pour commencer.</p>
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
</style>
