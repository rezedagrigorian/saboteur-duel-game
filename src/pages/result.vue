<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import MatchStandings from '@/components/features/match/MatchStandings.vue'
import { usePlayerStore } from '@/stores/playerStore'

const playerStore = usePlayerStore()
const { players, winner } = storeToRefs(playerStore)
</script>

<template>
  <div class="result-page">
    <h1 class="title">
      Game Over
    </h1>

    <p class="verdict">
      <template v-if="winner">
        <span class="verdict-name">{{ winner.name }}</span> wins
      </template>
      <template v-else>
        Draw
      </template>
    </p>

    <MatchStandings
      class="standings"
      :players="players"
      :winner-id="winner?.id"
      total
    />

    <RouterLink
      :to="{ name: '/(lobby)' }"
      class="lobby-link"
    >
      ← Back to lobby
    </RouterLink>
  </div>
</template>

<style scoped>
.result-page {
  display: flex;
  min-height: 100%;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
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

.verdict {
  margin: 0;
  font-family: var(--font-hud);
  font-size: 1.25rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-block-border);
}

.verdict-name {
  color: var(--color-hud-text);
}

.standings {
  max-width: 26rem;
}

.lobby-link {
  font-family: var(--font-hud);
  font-size: 0.8125rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-hud-text-soft);
}

.lobby-link:hover,
.lobby-link:focus-visible {
  color: var(--color-block-border);
}
</style>
