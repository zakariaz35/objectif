<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  cards: { type: Array, default: () => [] }, // [{ q_html, a_html }]
  storageKey: { type: String, default: '' }, // pour persister l'auto-éval
})
const emit = defineEmits(['completed'])

// État par carte : 'hidden' | 'revealed' ; note : 'known' | 'review' | null
const revealed = ref(props.cards.map(() => false))
const ratings = ref(loadRatings())
let emitted = false

function loadRatings() {
  if (!props.storageKey) return props.cards.map(() => null)
  try {
    const saved = JSON.parse(localStorage.getItem('cards_' + props.storageKey) || 'null')
    if (Array.isArray(saved) && saved.length === props.cards.length) return saved
  } catch (e) {
    /* ignore */
  }
  return props.cards.map(() => null)
}
function saveRatings() {
  if (props.storageKey) {
    localStorage.setItem('cards_' + props.storageKey, JSON.stringify(ratings.value))
  }
}

const ratedCount = computed(() => ratings.value.filter((r) => r !== null).length)
const knownCount = computed(() => ratings.value.filter((r) => r === 'known').length)
const allRated = computed(() => props.cards.length > 0 && ratedCount.value === props.cards.length)

watch(allRated, (ok) => {
  if (ok && !emitted) {
    emitted = true
    emit('completed')
  }
})

function reveal(i) {
  revealed.value[i] = true
}
function rate(i, value) {
  ratings.value[i] = value
  if (!revealed.value[i]) revealed.value[i] = true
  saveRatings()
}
function resetAll() {
  revealed.value = props.cards.map(() => false)
  ratings.value = props.cards.map(() => null)
  emitted = false
  saveRatings()
}
</script>

<template>
  <div class="cards">
    <div class="head">
      <span class="count">{{ ratedCount }}/{{ cards.length }} revues · {{ knownCount }} sues</span>
      <button class="ghost" type="button" @click="resetAll">↻ Recommencer</button>
    </div>

    <div v-if="allRated" class="done">
      ✅ Chapitre auto-évalué : {{ knownCount }}/{{ cards.length }} sues.
      <template v-if="knownCount < cards.length"> Revois les cartes « à revoir » 👆</template>
    </div>

    <ol class="list">
      <li
        v-for="(c, i) in cards"
        :key="i"
        class="card"
        :class="{ known: ratings[i] === 'known', review: ratings[i] === 'review' }"
      >
        <div class="q">
          <span class="num">{{ i + 1 }}</span>
          <span v-html="c.q_html"></span>
        </div>

        <div v-if="!revealed[i]" class="reveal">
          <button class="primary" type="button" @click="reveal(i)">Révéler la réponse</button>
        </div>
        <template v-else>
          <div class="a prose" v-html="c.a_html"></div>
          <div class="rate">
            <span class="lbl">Tu savais ?</span>
            <button
              type="button"
              class="rbtn good"
              :class="{ on: ratings[i] === 'known' }"
              @click="rate(i, 'known')"
            >
              ✓ Su
            </button>
            <button
              type="button"
              class="rbtn bad"
              :class="{ on: ratings[i] === 'review' }"
              @click="rate(i, 'review')"
            >
              ↻ À revoir
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
.ghost {
  background: var(--panel);
  border: 1px solid var(--border);
  color: var(--txt);
  border-radius: 8px;
  padding: 7px 12px;
}
.ghost:hover {
  border-color: var(--accent);
}
.done {
  margin-bottom: 16px;
  color: var(--good);
  background: rgba(107, 227, 154, 0.1);
  border: 1px solid var(--good);
  border-radius: 8px;
  padding: 10px 14px;
  font-weight: 600;
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
.primary {
  background: var(--accent);
  color: #0b0d13;
  border: none;
  border-radius: 8px;
  padding: 9px 16px;
  font-weight: 700;
}
.a {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}
.rate {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}
.rate .lbl {
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
.rbtn.good.on {
  border-color: var(--good);
  background: rgba(107, 227, 154, 0.15);
  color: var(--good);
}
.rbtn.bad.on {
  border-color: var(--warn);
  background: rgba(255, 207, 107, 0.15);
  color: var(--warn);
}
</style>
