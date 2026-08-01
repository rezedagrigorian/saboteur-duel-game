<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import BoardGrid from '../components/board/BoardGrid.vue'
import ShadowCard from '../components/cards/ShadowCard.vue'
import MatchControlPanel from '../components/features/match/control-panel/MatchControlPanel.vue'
import { useCardStore } from '../stores/cardStore'
import { usePlayerStore } from '../stores/playerStore'
import { initSync, stopSync } from '../services/sync'

const cardStore = useCardStore()
const playerStore = usePlayerStore()

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
</template>
