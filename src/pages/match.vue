<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { useCountdown } from '@vueuse/core'
import BoardGrid from '../components/board/BoardGrid.vue'
import ShadowCard from '../components/cards/ShadowCard.vue'
import MatchControlPanel from '../components/features/match/control-panel/MatchControlPanel.vue'
import { useCardStore } from '../stores/cardStore'
import { usePlayerStore } from '../stores/playerStore'
import { initSync, stopSync } from '../services/sync'
import { ROUND_RESTART_DELAY_MS } from '../game-core/constants'

const cardStore = useCardStore()
const playerStore = usePlayerStore()

const { remaining: secondsLeft, start, stop } = useCountdown(ROUND_RESTART_DELAY_MS / 1000)

watch(() => cardStore.isRoundOver, isOver => {
  if (isOver) start()
  else stop()
}, { immediate: true })

onMounted(() => initSync(playerStore.localPlayerId))
onUnmounted(stopSync)
</script>

<template>
  <div
    class="grid min-h-0 w-full flex-1 grid-cols-1 gap-6
           lg:grid-cols-[minmax(0,1fr)_clamp(20rem,28%,28rem)] lg:grid-rows-[minmax(0,1fr)]"
  >
    <ShadowCard v-if="cardStore.selectedCardId" />
    <BoardGrid class="min-h-0" />
    <!-- <RouterLink
      :to="{ name: '/(lobby)' }"
      class="text-text-link"
    >
      ← Back to lobby
    </RouterLink> -->
    <MatchControlPanel />
  </div>
  <div
    v-if="cardStore.isRoundOver"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
  >
    <div class="flex flex-col items-center gap-4 rounded-lg bg-white p-8 text-center">
      <h2 class="text-2xl font-bold">
        Round Over
      </h2>
      <p class="text-lg">
        {{ playerStore.winner ? `Winner: ${playerStore.winner.name}` : 'Draw' }}
      </p>
      <p
        v-for="player in playerStore.players"
        :key="player.id"
      >
        {{ player.name }}: {{ player.gold }}
      </p>
      <p class="text-sm opacity-70">
        New round in {{ secondsLeft }}…
      </p>
    </div>
  </div>
</template>
