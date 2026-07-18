<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../lib/api'
import BaseCallout from './BaseCallout.vue'

const props = defineProps({
  cards: { type: Array, default: () => [] }, // [{ q_html, a_html }]
  formation: String,
  module: String,
  lesson: String,
})
const emit = defineEmits(['completed'])
const { t } = useI18n()

// Per-card UI state. grades[i] = null | { q, interval } once reviewed.
const revealed = ref(props.cards.map(() => false))
const grades = ref(props.cards.map(() => null))
const error = ref(null)
let emitted = false

// SM-2 grade buttons (recall quality). Order: fail → easy.
const GRADES = [
  { q: 1, key: 'again', cls: 'again' },
  { q: 3, key: 'hard', cls: 'hard' },
  { q: 4, key: 'good', cls: 'good' },
  { q: 5, key: 'easy', cls: 'easy' },
]

const gradedCount = computed(() => grades.value.filter((g) => g !== null).length)
const knownCount = computed(() => grades.value.filter((g) => g && g.q >= 3).length)
const allGraded = computed(() => props.cards.length > 0 && gradedCount.value === props.cards.length)

watch(allGraded, (ok) => {
  if (ok && !emitted) {
    emitted = true
    emit('completed')
  }
})

function reveal(i) {
  revealed.value[i] = true
}

async function grade(i, q) {
  revealed.value[i] = true
  error.value = null
  try {
    const res = await api.reviewCard(props.formation, props.module, props.lesson, i, q)
    grades.value[i] = { q, interval: res.interval_days }
  } catch (e) {
    error.value = t('review.saveError')
  }
}

function nextLabel(interval) {
  if (interval <= 0) return t('flashcards.nextToday')
  if (interval === 1) return t('flashcards.nextTomorrow')
  return t('flashcards.nextDays', { n: interval })
}

function resetAll() {
  revealed.value = props.cards.map(() => false)
  grades.value = props.cards.map(() => null)
  error.value = null
  emitted = false
}
</script>

<template>
  <div class="cards">
    <div class="head">
      <span class="count">{{ $t('flashcards.progress', { graded: gradedCount, total: cards.length, known: knownCount }) }}</span>
      <button class="btn btn-ghost" type="button" @click="resetAll">{{ $t('common.retry') }}</button>
    </div>

    <BaseCallout v-if="allGraded" tone="good" class="done">
      {{ $t('flashcards.doneCallout', { known: knownCount, total: cards.length }) }}
      <RouterLink to="/reviser">{{ $t('nav.review') }}</RouterLink>.
    </BaseCallout>

    <p v-if="error" class="err">{{ error }}</p>

    <ol class="list">
      <li
        v-for="(c, i) in cards"
        :key="i"
        class="card"
        :class="{ known: grades[i] && grades[i].q >= 3, review: grades[i] && grades[i].q < 3 }"
      >
        <div class="q">
          <span class="num">{{ i + 1 }}</span>
          <span v-html="c.q_html"></span>
        </div>

        <div v-if="!revealed[i]" class="reveal">
          <button class="btn btn-primary" type="button" @click="reveal(i)">{{ $t('common.reveal') }}</button>
        </div>
        <template v-else>
          <div class="a prose" v-html="c.a_html"></div>

          <div v-if="grades[i]" class="graded">
            {{ $t('flashcards.graded', { next: nextLabel(grades[i].interval) }) }}
          </div>
          <div v-else class="rate">
            <span class="lbl">{{ $t('review.knew') }}</span>
            <button
              v-for="g in GRADES"
              :key="g.q"
              type="button"
              class="rbtn"
              :class="g.cls"
              @click="grade(i, g.q)"
            >
              {{ $t('common.grade.' + g.key) }}
            </button>
          </div>
        </template>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.cards {
  margin-top: 8px;
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.count {
  color: var(--muted);
  font-size: 14px;
}
.done {
  margin-bottom: 16px;
  font-weight: 600;
}
.err {
  color: var(--bad);
  margin-bottom: 12px;
}
.list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.card {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px 18px;
  margin: 12px 0;
  background: var(--panel);
}
.card.known {
  border-left: 3px solid var(--good);
}
.card.review {
  border-left: 3px solid var(--warn);
}
.q {
  display: flex;
  gap: 10px;
  font-weight: 600;
}
.q .num {
  flex: 0 0 24px;
  height: 24px;
  width: 24px;
  text-align: center;
  line-height: 24px;
  border-radius: 50%;
  background: var(--panel2);
  color: var(--accent);
  font-size: 13px;
}
.reveal {
  margin-top: 12px;
}
.a {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}
.rate {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
.rate .lbl {
  color: var(--muted);
  font-size: 13px;
  margin-right: 4px;
}
.graded {
  margin-top: 12px;
  color: var(--muted);
  font-size: 13px;
}
.rbtn {
  border: 1px solid var(--border);
  background: var(--code);
  color: var(--txt);
  border-radius: 8px;
  padding: 7px 14px;
}
.rbtn:hover {
  border-color: var(--accent);
}
.rbtn.again:hover {
  border-color: var(--bad);
  color: var(--bad);
}
.rbtn.hard:hover {
  border-color: var(--warn);
  color: var(--warn);
}
.rbtn.good:hover,
.rbtn.easy:hover {
  border-color: var(--good);
  color: var(--good);
}
</style>
