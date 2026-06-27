<script setup>
import { RouterView, RouterLink } from 'vue-router'
</script>

<template>
  <div class="shell">
    <header class="topbar">
      <RouterLink to="/" class="brand">
        Formation<span>.</span>
      </RouterLink>
      <span class="tagline">apprends · pratique · progresse</span>
    </header>
    <RouterView />
  </div>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: baseline;
  gap: 14px;
  padding: 14px 24px;
  border-bottom: 1px solid var(--border);
  background: var(--panel);
  position: sticky;
  top: 0;
  z-index: 20;
}
.brand {
  font-weight: 800;
  font-size: 20px;
  color: var(--txt);
}
.brand span {
  color: var(--accent);
}
.tagline {
  color: var(--muted);
  font-size: 13px;
}
</style>
