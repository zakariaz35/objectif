<!--
  ⚠️ PAGE TEMPORAIRE — comparateur de logos. À SUPPRIMER une fois le logo choisi
  (retirer cette vue, sa route /logos et le lien éventuel).
-->
<script setup>
const concepts = [
  { id: 1, name: 'Cible + arc', desc: 'Anneaux + arc de progression + centre atteint. (actuel)' },
  { id: 2, name: 'Cible pleine', desc: 'Plus gras, deux niveaux, lecture immédiate.' },
  { id: 3, name: 'Objectif photo', desc: 'Ouverture / iris de lentille — jeu de mots « objectif ».' },
  { id: 4, name: 'Cuillère + cible', desc: 'La cuillère (leçon) puise au centre de la cible.' },
  { id: 5, name: 'Monogramme O', desc: 'Le « O » d’Objectif en anneau épais + point.' },
  { id: 6, name: 'Cible + check', desc: 'Objectif validé : une coche au centre.' },
]
</script>

<template>
  <main class="logos">
    <div class="warn">⚠️ Page temporaire de choix du logo — dis-moi le numéro retenu, je finalise et je supprime cette page.</div>
    <h1>Propositions de logo — « Objectif »</h1>

    <div class="grid">
      <figure v-for="c in concepts" :key="c.id" class="card">
        <div class="big">
          <!-- 1 -->
          <svg v-if="c.id === 1" viewBox="0 0 32 32" class="mk">
            <circle class="a dim" cx="16" cy="16" r="13" />
            <circle class="a mid" cx="16" cy="16" r="8.5" />
            <path class="a2" d="M16 3 A13 13 0 0 1 29 16" stroke-linecap="round" />
            <circle class="dot" cx="16" cy="16" r="3.4" />
          </svg>
          <!-- 2 -->
          <svg v-else-if="c.id === 2" viewBox="0 0 32 32" class="mk">
            <circle class="a" cx="16" cy="16" r="12.5" stroke-width="3.2" />
            <circle class="a2 fill" cx="16" cy="16" r="5" />
          </svg>
          <!-- 3 -->
          <svg v-else-if="c.id === 3" viewBox="0 0 32 32" class="mk">
            <circle class="a" cx="16" cy="16" r="13" />
            <polygon class="a2" points="16,7 23.8,11.5 23.8,20.5 16,25 8.2,20.5 8.2,11.5" stroke-width="2" />
            <circle class="dot" cx="16" cy="16" r="2.2" />
          </svg>
          <!-- 4 -->
          <svg v-else-if="c.id === 4" viewBox="0 0 32 32" class="mk">
            <circle class="a dim" cx="16" cy="16" r="13" />
            <circle class="a mid" cx="16" cy="16" r="8" />
            <ellipse class="a2 fill" cx="16" cy="13" rx="3.6" ry="4.6" />
            <path class="a2" d="M16 17 L16 27" stroke-linecap="round" stroke-width="2.6" />
          </svg>
          <!-- 5 -->
          <svg v-else-if="c.id === 5" viewBox="0 0 32 32" class="mk">
            <circle class="a" cx="16" cy="16" r="12" stroke-width="4.2" />
            <circle class="dot" cx="16" cy="16" r="3" />
          </svg>
          <!-- 6 -->
          <svg v-else viewBox="0 0 32 32" class="mk">
            <circle class="a dim" cx="16" cy="16" r="13" />
            <circle class="a mid" cx="16" cy="16" r="8.5" />
            <path class="a2" d="M11.5 16.5 l3 3 l6 -7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.8" />
          </svg>
        </div>

        <figcaption>
          <b>#{{ c.id }} — {{ c.name }}</b>
          <span>{{ c.desc }}</span>
        </figcaption>
      </figure>
    </div>

    <p class="hint">Les couleurs suivent le thème actif (teste-les en changeant de thème 🎨 en haut).</p>
  </main>
</template>

<style scoped>
.logos {
  max-width: 960px;
  margin: 0 auto;
  padding: 28px 24px 80px;
}
.warn {
  border: 1px solid var(--warn);
  border-left: 4px solid var(--warn);
  background: var(--panel);
  color: var(--warn);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
  margin-bottom: 20px;
}
h1 {
  margin: 0 0 22px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 18px;
}
.card {
  margin: 0;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--panel);
  padding: 22px 18px 16px;
  text-align: center;
}
.big {
  display: flex;
  justify-content: center;
  margin-bottom: 14px;
}
.mk {
  width: 84px;
  height: 84px;
}
.mk .a {
  fill: none;
  stroke: var(--accent);
  stroke-width: 2.4;
}
.mk .a2 {
  fill: none;
  stroke: var(--accent2);
  stroke-width: 2.6;
}
.mk .fill {
  fill: var(--accent2);
  stroke: none;
}
.mk .dot {
  fill: var(--accent2);
}
.mk .dim {
  opacity: 0.3;
}
.mk .mid {
  opacity: 0.55;
}
figcaption {
  font-size: 13px;
  color: var(--muted);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
figcaption b {
  color: var(--txt);
  font-size: 14px;
}
.hint {
  color: var(--muted);
  font-size: 14px;
  margin-top: 22px;
}
</style>
