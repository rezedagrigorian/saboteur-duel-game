<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import exitIconSrc from '@/assets/exit-icon.svg'
import BoardGrid from '../components/board/BoardGrid.vue'
import ShadowCard from '../components/cards/ShadowCard.vue'
import MatchControlPanel from '../components/features/match/control-panel/MatchControlPanel.vue'
import RoundOverModal from '../components/features/match/RoundOverModal.vue'
import { useCardStore } from '../stores/cardStore'
import { usePlayerStore } from '../stores/playerStore'
import { initSync, stopSync } from '../services/sync'

const cardStore = useCardStore()
const playerStore = usePlayerStore()

onMounted(() => {
  playerStore.resetGame()
  initSync(playerStore.localPlayerId)
})
onUnmounted(stopSync)

</script>

<template>
  <div
    class="grid min-h-0 w-full flex-1 grid-cols-1 gap-6
           lg:grid-cols-[minmax(0,1fr)_clamp(20rem,28%,28rem)] lg:grid-rows-[minmax(0,1fr)]"
  >
    <ShadowCard v-if="cardStore.selectedCardId" />
    <BoardGrid class="min-h-0" />
    <MatchControlPanel />
  </div>
  <RouterLink
    :to="{ name: '/(lobby)' }"
    class="exit-btn"
    aria-label="Exit to lobby"
  >
    <img
      :src="exitIconSrc"
      alt=""
      class="block size-5"
    >
  </RouterLink>
  <RoundOverModal v-if="cardStore.isRoundOver" />
</template>

<style scoped>
.exit-btn {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 40;
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border: 1px solid rgba(1, 207, 207, 0.35);
  background: var(--color-grid-cell-border);
  transition:
    border-color 140ms ease,
    background 140ms ease,
    box-shadow 140ms ease;
}

.exit-btn:hover,
.exit-btn:focus-visible {
  border-color: var(--color-block-border);
  background: var(--color-cell-hover);
  box-shadow: var(--shadow-glow-focus);
}

.exit-btn:focus-visible {
  outline: 2px solid rgba(1, 207, 207, 0.75);
  outline-offset: 2px;
}
</style>
