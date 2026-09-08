<script setup lang="ts">
import type { IPlayer } from '@/types'
import PlayerBadge from '@/components/features/match/control-panel/PlayerBadge.vue'
import DiamondCounter from '@/components/features/match/control-panel/DiamondCounter.vue'

defineProps<{
  players: IPlayer[]
  winnerId?: string
  total?: boolean
}>()
</script>

<template>
  <ul class="scores">
    <li
      v-for="player in players"
      :key="player.id"
      class="score"
      :class="{ 'is-winner': player.id === winnerId }"
    >
      <PlayerBadge
        :name="player.name"
        :color="player.color"
      />
      <DiamondCounter
        :gold="total ? player.totalGold : player.gold"
        width="7rem"
      />
    </li>
  </ul>
</template>

<style scoped>
.scores {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.score {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 0.625rem 1.25rem 0.625rem 0;
  border: 1px solid transparent;
  background: rgba(0, 0, 0, 0.14);
}

.score.is-winner {
  border-color: rgba(1, 207, 207, 0.45);
  background: var(--color-grid-cell-border);
  box-shadow: var(--shadow-glow-hint);
}
</style>
