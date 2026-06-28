<script setup>
// Encadré réutilisable. tone : note (défaut) | good | warn | bad
defineProps({ tone: { type: String, default: 'note' } })
</script>

<template>
  <div class="callout" :class="`callout--${tone}`">
    <slot />
  </div>
</template>

<style scoped>
.callout {
  border: 1px solid var(--border);
  border-left-width: 4px;
  border-radius: 10px;
  padding: 12px 16px;
  background: var(--panel);
}
.callout--note {
  border-left-color: var(--accent);
}
.callout--good {
  border-left-color: var(--good);
  color: var(--good);
}
.callout--warn {
  border-left-color: var(--warn);
  color: var(--warn);
}
.callout--bad {
  border-left-color: var(--bad);
  color: var(--bad);
}
</style>
