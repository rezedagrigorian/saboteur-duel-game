<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="lobby-page">
    <h1 class="title">
      Saboteur Duel
    </h1>

    <nav class="actions">
      <RouterLink
        :to="{ name: '/match' }"
        class="action-btn"
      >
        Match
      </RouterLink>
      <RouterLink
        :to="{ name: '/result' }"
        class="action-btn"
      >
        Result
      </RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.lobby-page {
  display: flex;
  min-height: 100%;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.75rem;
  padding: 2rem 1rem;
}

.title {
  margin: 0;
  font-family: var(--font-hud);
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-hud-text);
}

.actions {
  display: flex;
  width: 100%;
  max-width: 20rem;
  flex-direction: column;
  gap: 0.875rem;
}

.action-btn {
  padding: 0.875rem 1.5rem;
  border: 1px solid var(--color-block-border);
  background: var(--color-grid-cell-border);
  color: var(--color-hud-text);
  font-family: var(--font-hud);
  font-weight: 700;
  letter-spacing: 0.14em;
  text-align: center;
  text-decoration: none;
  text-transform: uppercase;
}

.action-btn:hover,
.action-btn:focus-visible {
  background: var(--color-cell-hover);
}
</style>
