<script setup>
import { ref, inject, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../lib/api'
import QuizPlayer from '../components/QuizPlayer.vue'

const props = defineProps({ formation: String, module: String, lesson: String })
const router = useRouter()
const { isDone, toggle } = inject('progress')

const data = ref(null)
const loading = ref(true)

const done = computed(() => isDone(props.module, props.lesson))

async function load() {
  loading.value = true
  try {
    data.value = await api.getLesson(props.formation, props.module, props.lesson)
  } finally {
    loading.value = false
  }
}

function go(nav) {
  if (nav) router.push(`/f/${props.formation}/${nav.module}/${nav.lesson}`)
}

const typeLabel = { lesson: 'Leçon', exercise: 'Exercice', quiz: 'Quiz' }

watch(() => [props.module, props.lesson], load, { immediate: true })
</script>

<template>
  <article v-if="!loading && data">
    <nav class="crumbs">
      {{ data.formation.title }} <span>/</span> {{ data.module.title }}
    </nav>

    <div class="head">
      <span class="tag" :class="data.lesson.type">{{ typeLabel[data.lesson.type] || 'Leçon' }}</span>
      <h1>{{ data.lesson.title }}</h1>
    </div>

    <div v-if="data.lesson.body_html" class="prose" v-html="data.lesson.body_html"></div>

    <QuizPlayer
      v-if="data.lesson.type === 'quiz' && data.lesson.quiz"
      :formation="props.formation"
      :module="props.module"
      :lesson="props.lesson"
      :questions="data.lesson.quiz"
      @completed="toggle(props.module, props.lesson, true)"
    />

    <details v-if="data.lesson.has_correction" class="correction">
      <summary>✅ Voir la correction</summary>
      <div class="prose" v-html="data.lesson.correction_html"></div>
    </details>

    <label class="markdone">
      <input
        type="checkbox"
        :checked="done"
        @change="toggle(props.module, props.lesson, $event.target.checked)"
      />
      Marquer comme terminé
    </label>

    <nav class="pager">
      <button :disabled="!data.prev" @click="go(data.prev)" class="prev">
        <template v-if="data.prev">← {{ data.prev.title }}</template>
        <template v-else>—</template>
      </button>
      <button :disabled="!data.next" @click="go(data.next)" class="next">
        <template v-if="data.next">{{ data.next.title }} →</template>
        <template v-else>—</template>
      </button>
    </nav>
  </article>
  <div v-else class="muted">Chargement de la leçon…</div>
</template>

<style scoped>
.crumbs {
  color: var(--muted);
  font-size: 13px;
  margin-bottom: 8px;
}
.crumbs span {
  opacity: 0.5;
  margin: 0 4px;
}
.head {
  margin-bottom: 18px;
}
.tag {
  display: inline-block;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  background: var(--panel2);
  color: var(--accent);
}
.tag.exercise {
  color: var(--accent2);
}
.tag.quiz {
  color: var(--warn);
}
.head h1 {
  margin: 10px 0 0;
  font-size: 28px;
}
.correction {
  border: 1px solid var(--border);
  border-left: 4px solid var(--good);
  border-radius: 10px;
  margin: 24px 0;
  background: var(--panel);
  overflow: hidden;
}
.correction > summary {
  cursor: pointer;
  padding: 14px 18px;
  font-weight: 600;
  color: var(--good);
  list-style: none;
}
.correction > summary::-webkit-details-marker {
  display: none;
}
.correction[open] > summary {
  border-bottom: 1px solid var(--border);
}
.correction .prose {
  padding: 4px 18px 16px;
}
.markdone {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 28px 0;
  color: var(--muted);
  cursor: pointer;
  user-select: none;
}
.markdone input {
  width: 18px;
  height: 18px;
  accent-color: var(--good);
}
.pager {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 40px;
  border-top: 1px solid var(--border);
  padding-top: 20px;
}
.pager button {
  background: var(--panel);
  border: 1px solid var(--border);
  color: var(--txt);
  border-radius: 8px;
  padding: 10px 16px;
  max-width: 48%;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pager button:hover:not(:disabled) {
  border-color: var(--accent);
}
.pager button:disabled {
  opacity: 0.35;
  cursor: default;
}
.pager .next {
  text-align: right;
}
.muted {
  color: var(--muted);
}
</style>
